import { HttpBody } from './HttpBody'
import HttpClient, { HttpOptions, HttpResponse } from './HttpClient'
import HttpClientImpl from './impl'

const http: HttpClient = new HttpClientImpl()

export default class HttpApi {
    private readonly domain: string
    constructor(domain = '') {
        this.domain = domain
    }

    preRequest(options: HttpOptions) {
        return options
    }

    async postRequest({ status, body, headers }: HttpResponse, url: string) {
        if (status >= 200 && status <= 204) {
            const contentType = headers['content-type'].toLowerCase()
            if (/application\/json/.test(contentType)) {
                body = JSON.parse(body)
            }
            return body
        } else if (status >= 301 && status <= 304 && headers.location) {
            return await this.get(headers.location)
        } else {
            throw new Error(`[http: ${status}] ` + body)
        }
    }

    async request(method: string, url: string, options: HttpOptions): Promise<any> {
        if (!/^https?:\/\//i.test(url)) {
            url = this.domain + url
        }
        options = this.preRequest(options)
        let response = await http.request(method, url, options)
        return await this.postRequest(response, url)
    }

    jsonp(url: string, query: Record<string, any>, jsonpCallback: string) {
        return this.request('jsonp', url, { query, jsonpCallback })
    }

    get(url: string, query?: Record<string, any>, headers?: Record<string, string>) {
        return this.request('get', url, { query, headers })
    }

    post(url: string, body?: HttpBody, query?: Record<string, any>, headers?: Record<string, string>) {
        return this.request('post', url, { query, body, headers })
    }

    put(url: string, body?: HttpBody, query?: Record<string, any>, headers?: Record<string, string>) {
        return this.request('put', url, { query, body, headers })
    }

    patch(url: string, body?: HttpBody, query?: Record<string, any>, headers?: Record<string, string>) {
        return this.request('patch', url, { query, body, headers })
    }

    delete(url: string, query?: Record<string, any>, headers?: Record<string, string>) {
        return this.request('delete', url, { query, headers })
    }

    static text(value: string) {
        return http.text(value)
    }

    static json(value: any) {
        return http.json(value)
    }

    static form(value: any) {
        return http.form(value)
    }

    static file(field: string, file: any, mime?: string): HttpBody {
        return http.file(field, file, mime)
    }

    static fileContent(field: string, content: string, mime?: string): HttpBody {
        return http.fileContent(field, content, mime)
    }
}