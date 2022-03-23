import { HttpBody } from '../HttpBody'
import HttpClient, { HttpOptions, HttpResponse } from '../HttpClient'

function parseHeaders(content: string) {
    let headers: Record<string, string> = {}
    let lines = content.trim().split(/[\r\n]+/)
    for (let line of lines) {
        let parts = line.split(': ')
        headers[parts[0]] = parts[1]
    }
    return headers
}

export default class HttpAjaxClient extends HttpClient {
    request0(method: string, url: string, { headers, body }: HttpOptions): Promise<HttpResponse> {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest()
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    resolve({
                        status: xhr.status,
                        body: xhr.response,
                        headers: parseHeaders(xhr.getAllResponseHeaders())
                    })
                }
            }
            xhr.onerror = function (err) {
                console.error(err)
                reject(err)
            }
            xhr.ontimeout = function () {
                xhr.abort()
                reject(new Error('请求超时'))
            }
            xhr.timeout = 60000
            // xhr.responseType = 'blob'
            xhr.open(method, url, true)
            let content = ''
            if (body) {
                if (body instanceof FileBody) {
                } else {
                    content = body.toString()
                    headers = Object.assign({ 'Content-Type': body.contentType }, headers)
                }
            }
            if (headers) {
                Object.keys(headers).forEach(key => {
                    //@ts-ignore
                    xhr.setRequestHeader(key, headers[key])
                })
            }
            if (body instanceof FileBody) {
                xhr.send(body.form)
            } else {
                xhr.send(body ? content : undefined)
            }
        })
    }

    file(field: string, file: File) {
        return new FileBody(field, file)
    }
}

class FileBody extends HttpBody {
    readonly form: FormData
    constructor(field: string, file: File) {
        super(field, '')
        this.form = new FormData()
        this.form.append(field, file)
    }
}