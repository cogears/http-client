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

const handles = {}

function resolveHandles(url, data) {
    let promises = handles[url]
    delete handles[url]
    for (let item of promises) {
        item.resolve(data)
    }
}

function rejectHandles(url, err) {
    let promises = handles[url]
    delete handles[url]
    for (let item of promises) {
        item.reject(err)
    }
}

function text(value) {
    return new HttpBody(value)
}

function json(value) {
    return new HttpJson(value)
}

function form(value) {
    return new HttpForm(value)
}

function file(file, mime, field) {
    return new HttpMultipart(file, mime, field)
}

function request(method, url, { headers, query, body }) {
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
    method = method.toUpperCase()
    return new Promise((resolve, reject) => {
        if (method == 'GET') {
            if (handles[url]) {
                handles[url].push({ resolve, reject })
                return
            }
            handles[url] = [{ resolve, reject }]
        }
        let proxy = /^https:/i.test(url) ? https : http
        let req = proxy.request(url, { method, headers, }, res => {
            let buf = []
            let isText = MIME_TEXT.some(mime => mime.test(res.headers['content-type']))
            if (isText) {
                res.setEncoding('utf8')
            }
            res.on('data', chunk => {
                buf.push(chunk)
            })
            res.on('end', () => {
                if (method == 'GET') {
                    resolveHandles(url, {
                        status: res.statusCode,
                        headers: res.headers,
                        body: isText ? buf.join('') : Buffer.concat(buf)
                    })
                } else {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: isText ? buf.join('') : Buffer.concat(buf)
                    })
                }
            })
        })
        req.on('error', err => {
            if (method == 'GET') {
                rejectHandles(url, err)
            } else {
                reject(err)
            }
        })
        req.setTimeout(60000, () => {
            req.destroy()
            if (method == 'GET') {
                rejectHandles(new Error('timeout'))
            } else {
                reject(new Error('timeout'))
            }
        })
        if (body instanceof HttpMultipart) {
            body.write(req)
        } else {
            req.end(content)
        }
    })
}

function get(url, query, headers) {
    return request('GET', url, { headers, query })
}

function post(url, body, query, headers) {
    return request('POST', url, { headers, query, body })
}

module.exports = {
    text, json, form, file,
    get, post, request,
}