declare module 'HttpClient' {
    import { Buffer } from 'node:buffer';
    interface HttpBody {
    }

    interface HttpOption {
        query?: Record<string, any>,
        body?: HttpBody,
        headers?: Record<string, string>,
    }

    interface HttpResponse {
        status: number,
        headers: Record<string, string>,
        body: string | Buffer,
    }
    function text(content: string): HttpBody
    function json(content: any): HttpBody
    function form(content: any): HttpBody
    function file(filepath: string, mime: string, field: string): HttpBody
    function request(method: string, url: string, options: HttpOption): Promise<HttpResponse>
    function get(url: string, query?: Record<string, any>, headers?: Record<string, string>): Promise<HttpResponse>
    function post(url: string, body?: HttpBody, query?: Record<string, any>, headers?: Record<string, string>): Promise<HttpResponse>
}

declare module 'HttpApi' {
    import { HttpBody, HttpOption, HttpResponse } from 'HttpClient';
    class HttpApi {
        constructor(domain?: string)
        preRequest(options: HttpOption): HttpOption
        postRequest(response: HttpResponse): any
        request(method: string, url: string, options: HttpOption): Promise<any>
        get(url: string, query?: Record<string, any>, headers?: Record<string, string>): Promise<any>
        post(url: string, body?: HttpBody, query?: Record<string, any>, headers?: Record<string, string>): Promise<any>
        put(url: string, body?: HttpBody, query?: Record<string, any>, headers?: Record<string, string>): Promise<any>
        patch(url: string, body?: HttpBody, query?: Record<string, any>, headers?: Record<string, string>): Promise<any>
        delete(url: string, query?: Record<string, any>, headers?: Record<string, string>): Promise<any>
    }
}

declare module '@cogears/http-client' {
    export { HttpApi } from 'HttpApi';
    export * from 'HttpClient';
    export * as default from 'HttpClient';
}