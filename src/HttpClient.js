const http = require('http')
const https = require('https')
const HttpBody = require('./HttpBody')
const HttpForm = require('./HttpForm')
const HttpJson = require('./HttpJson')
const HttpMultipart = require('./HttpMultipart')

const MIME_TEXT = [
    /^text\//,
    /^application\/(json|xml)/
]

module.exports = class HttpClient {
    static text(value) {
        return new HttpBody(value)
    }

    static json(value) {
        return new HttpJson(value)
    }

    static form(value) {
        return new HttpForm(value)
    }

    static file(file, mime, field) {
        return new HttpMultipart(file, mime, field)
    }

    static body(content, contentType) {
        return new HttpBody(content, contentType)
    }

    request(method, url, { headers, query, body }, responseBinary) {
        let content = ''
        if (query) {
            url += (url.indexOf('?') == -1 ? '?' : '&') + HttpForm.encode(query)
        }
        if (body) {
            if (body instanceof HttpMultipart) {
            } else {
                content = body.toString()
                headers = Object.assign({ 'Content-Type': body.contentType, 'Content-Length': Buffer.byteLength(content) }, headers)
            }
        }
        let options = new URL(url)
        options.method = method
        options.headers = headers
        return new Promise((resolve, reject) => {
            let proxy = options.protocol === 'http:' ? http : https
            let req = proxy.request(options, res => {
                let buf = []
                let isText = responseBinary ? false : MIME_TEXT.some(mime => mime.test(res.headers['content-type']))
                if (isText) {
                    res.setEncoding('utf8')
                }
                res.on('data', chunk => {
                    buf.push(chunk)
                })
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: isText ? buf.join('') : Buffer.concat(buf)
                    })
                })
            })
            req.on('error', err => {
                reject(err)
            })
            req.setTimeout(60000, () => {
                req.destroy();
                reject(new Error('timeout'))
            })
            if (body instanceof HttpMultipart) {
                body.write(req)
            } else {
                req.end(content)
            }
        })
    }

    get(api, { headers, query } = {}) {
        return this.request('GET', api, { headers, query })
    }

    post(api, { headers, query, body } = {}) {
        return this.request('POST', api, { headers, query, body })
    }

    put(api, { headers, query, body } = {}) {
        return this.request('PUT', api, { headers, query, body })
    }

    patch(api, { headers, query, body } = {}) {
        return this.request('PATCH', api, { headers, query, body })
    }

    delete(api, { headers, query } = {}) {
        return this.request('DELETE', api, { headers, query })
    }
}
