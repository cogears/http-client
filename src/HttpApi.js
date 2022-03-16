const http = require('./HttpClient')

function upperCase(headers) {
    let obj = {}
    for (let k in headers) {
        obj[k.toUpperCase()] = headers[k]
    }
    return obj
}

module.exports = class HttpApi {
    constructor(domain = '') {
        this.domain = domain
    }

    preRequest({ query, body, headers }) {
        return { query, body, headers }
    }

    async postRequest({ status, body, headers }, url) {
        if (status == 200) {
            headers = upperCase(headers)
            const contentType = headers['CONTENT-TYPE']
            if (/application\/json/.test(contentType)) {
                body = JSON.parse(body)
            }
            return body
        } else if (status == 302) {
            return await this.get(headers.location)
        } else {
            throw new Error(`[http: ${status}] ` + body)
        }
    }

    async request(method, url, { query, body, headers }) {
        const api = url
        if (!/^https?:\/\//i.test(url)) {
            url = this.domain + url
        }
        let options = this.preRequest({ query, body, headers })
        let response = await http.request(method, url, options)
        return await this.postRequest(response, api)
    }

    get(url, query, headers) {
        return this.request('get', url, { query, headers })
    }

    post(url, body, query, headers) {
        return this.request('post', url, { query, body, headers })
    }

    put(url, body, query, headers) {
        return this.request('put', url, { query, body, headers })
    }

    patch(url, body, query, headers) {
        return this.request('patch', url, { query, body, headers })
    }

    delete(url, query, headers) {
        return this.request('delete', url, { query, headers })
    }

}