import { HttpBody } from './HttpBody.js'
import HttpClient, { HttpOptions, HttpResponse } from './HttpClient.js'

export default class HttpApi {
    readonly domain: string
    constructor(domain = '') {
        this.domain = domain
    }

    preRequest(options: HttpOptions): HttpOptions {
        return options
    }

    async postRequest({ status, body, headers }: HttpResponse, url: string): Promise<any> {
        if (status >= 200 && status <= 204) {
            const contentType = headers['content-type'].toLowerCase()
            if (/application\/json/.test(contentType)) {
                body = JSON.parse(body)
            }
            return body
        } else if (status >= 301 && status <= 304 && headers.location) {
            return await this.get(headers.location)
        } else {
            throw new Error(`[http: ${status}] ` + url + '\n' + body)
        }
    }

    async request<T>(method: string, url: string, options: HttpOptions): Promise<T> {
        if (!/^https?:\/\//i.test(url)) {
            url = this.domain + url
        }
        options = this.preRequest(options)
        let response = await HttpClient.instance.request(method, url, options)
        return await this.postRequest(response, url)
    }

    jsonp<T>(url: string, query: Record<string, any>, jsonpCallback: string): Promise<T> {
        return this.request('jsonp', url, { query, jsonpCallback })
    }

    get<T>(url: string, query?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
        return this.request('get', url, { query, headers })
    }

    post<T>(url: string, body?: HttpBody, query?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
        return this.request('post', url, { query, body, headers })
    }

    put<T>(url: string, body?: HttpBody, query?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
        return this.request('put', url, { query, body, headers })
    }

    patch<T>(url: string, body?: HttpBody, query?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
        return this.request('patch', url, { query, body, headers })
    }

    delete<T>(url: string, query?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
        return this.request('delete', url, { query, headers })
    }

    static text(value: string): HttpBody {
        return HttpClient.instance.text(value)
    }

    static json(value: any): HttpBody {
        return HttpClient.instance.json(value)
    }

    static form(value: any): HttpBody {
        return HttpClient.instance.form(value)
    }

    static file(field: string, file: any, mime?: string): HttpBody {
        return HttpClient.instance.file(field, file, mime)
    }

    static fileContent(field: string, content: string, mime?: string): HttpBody {
        return HttpClient.instance.fileContent(field, content, mime)
    }
}