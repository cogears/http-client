import fs from 'fs'
import http from 'http'
import https from 'https'
import path from 'path'
import { HttpBody } from "../HttpBody.js"
import HttpClient, { HttpOptions, HttpResponse } from "../HttpClient.js"

const MIME_TEXT = [
    /^text\//,
    /^application\/(json|xml)/
]

/** @internal */
export default class HttpNodeClient extends HttpClient {
    constructor() {
        super()
    }
    request0(method: string, url: string, { headers, body }: HttpOptions): Promise<HttpResponse> {
        if (method == 'JSONP') {
            method = 'GET'
        }
        let content = ''
        if (body) {
            if (body instanceof HttpMultipart) {
            } else {
                content = body.toString()
                headers = Object.assign({ 'Content-Type': body.contentType, 'Content-Length': Buffer.byteLength(content) }, headers)
            }
        }
        return new Promise((resolve, reject) => {
            let proxy = /^https:/i.test(url) ? https : http
            let req = proxy.request(url, { method, headers, }, res => {
                let buf: any[] = []
                let contentType = res.headers['content-type'] || ''
                let isText = MIME_TEXT.some(mime => mime.test(contentType))
                if (isText) {
                    res.setEncoding('utf8')
                }
                res.on('data', chunk => {
                    buf.push(chunk)
                })
                res.on('end', () => {
                    resolve({
                        status: res.statusCode || 0,
                        headers: res.headers as Record<string, string>,
                        body: isText ? buf.join('') : Buffer.concat(buf)
                    })
                })
            })
            req.on('error', err => {
                reject(err)
            })
            req.setTimeout(60000, () => {
                req.destroy()
                reject(new Error('请求超时'))
            })
            if (body instanceof HttpMultipart) {
                body.write(req)
            } else {
                req.end(content)
            }
        })
    }

    file(field: string, file: string, mime: string = 'application/octet-stream'): HttpBody {
        return new HttpMultipartFile(file, field, mime)
    }

    fileContent(field: string, content: string, mime: string = 'application/octet-stream'): HttpBody {
        return new HttpMultipartContent(content, field, mime)
    }
}

class HttpMultipart extends HttpBody {
    write(httpRequest: http.ClientRequest) {

    }
}

class HttpMultipartFile extends HttpMultipart {
    private readonly field: string
    constructor(file: string, field: string, mime: string) {
        super(file, mime)
        this.field = field
    }

    write(httpRequest: http.ClientRequest) {
        const stat = fs.statSync(this.content)
        const boundaryKey = Math.random().toString(16)
        const payload = `--${boundaryKey}\r\n`
            + `Content-Disposition: form-data; name="${this.field}"; filename="${path.basename(this.content)}"\r\n`
            + `Content-Type: ${this.contentType}\r\n`
            + 'Content-Transfer-Encoding: binary\r\n\r\n'
        const enddata = `\r\n--${boundaryKey}--\r\n`
        httpRequest.setHeader('Content-Type', 'multipart/form-data; boundary=' + boundaryKey)
        httpRequest.setHeader('Content-Length', Buffer.byteLength(payload) + Buffer.byteLength(enddata) + stat.size)
        httpRequest.write(payload)

        const fileStream = fs.createReadStream(this.content)
        fileStream.pipe(httpRequest, { end: false })
        fileStream.on('end', () => {
            httpRequest.end(enddata)
        })
    }
}

class HttpMultipartContent extends HttpMultipart {
    private readonly field: string
    constructor(content: string, field: string, mime: string) {
        super(content, mime)
        this.field = field
    }

    write(httpRequest: http.ClientRequest) {
        const size = Buffer.byteLength(this.content)
        const boundaryKey = Math.random().toString(16)
        const payload = `--${boundaryKey}\r\n`
            + `Content-Disposition: form-data; name="${this.field}"; filename="${this.field}"\r\n`
            + `Content-Type: ${this.contentType}\r\n`
            + 'Content-Transfer-Encoding: binary\r\n\r\n'
        const enddata = `\r\n--${boundaryKey}--\r\n`
        httpRequest.setHeader('Content-Type', 'multipart/form-data; boundary=' + boundaryKey)
        httpRequest.setHeader('Content-Length', Buffer.byteLength(payload) + Buffer.byteLength(enddata) + size)
        httpRequest.write(payload)
        httpRequest.write(this.content)
        httpRequest.end(enddata)
    }
}