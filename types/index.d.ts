declare class HttpClient {
    request(method: string, url: string, options: HttpOptions): Promise<HttpResponse>
    get(url: string, query?: Record<string, any>, headers?: Record<string, string>): Promise<HttpResponse>
    post(url: string, body?: any, query?: Record<string, any>, headers?: Record<string, string>): Promise<HttpResponse>
    text(value: string): HttpBody
    json(value: any): HttpBody
    form(value: any): HttpBody
    file(field: string, file: any, mime: string): HttpBody
}

export default HttpClient
export type HttpOptions = { headers?: Record<string, string>, query?: Record<string, any>, body?: HttpBody }
export type HttpResponse = { status: number, body: any, headers: Record<string, string> }
export type HttpBody = {}

export class HttpApi {
    constructor(domain?: string)
    preRequest(options: HttpOptions): HttpOptions
    postRequest(response: HttpResponse, url: string): Promise<any>
    request(method: string, url: string, options: HttpOptions): Promise<any>
    get(url: string, query?: Record<string, any>, headers?: Record<string, string>): Promise<any>
    post(url: string, body?: HttpBody, query?: Record<string, any>, headers?: Record<string, string>): Promise<any>
    put(url: string, body?: HttpBody, query?: Record<string, any>, headers?: Record<string, string>): Promise<any>
    patch(url: string, body?: HttpBody, query?: Record<string, any>, headers?: Record<string, string>): Promise<any>
    delete(url: string, query?: Record<string, any>, headers?: Record<string, string>): Promise<any>

    static text(value: string): HttpBody
    static json(value: any): HttpBody
    static form(value: any): HttpBody
    static file(field: string, file: any): HttpBody
}
