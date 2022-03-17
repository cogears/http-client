import { HttpBody } from './HttpBody'
import HttpClient, { HttpOptions, HttpResponse } from './HttpClient'
import HttpClientImpl from './impl'

const http: HttpClient = new HttpClientImpl()

export default class HttpApi {
    private readonly domain: string
    constructor(domain = '') {
        this.domain = domain
    }

    preRequest({ query, body, headers }: HttpOptions) {
        return { query, body, headers }
    }

    async postRequest({ status, body, headers }: HttpResponse, url: string) {
        if (status == 200) {
            const contentType = headers['content-type']
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

    async request(method: string, url: string, { query, body, headers }: HttpOptions): Promise<any> {
        if (!/^https?:\/\//i.test(url)) {
            url = this.domain + url
        }
        let options = this.preRequest({ query, body, headers })
        let response = await http.request(method, url, options)
        return await this.postRequest(response, url)
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

    static file(field: string, file: any): HttpBody {
        return http.file(field, file)
    }

}