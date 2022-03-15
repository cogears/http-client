declare module 'http-client' {
    import { Buffer } from 'buffer';
    interface HttpBody {
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
    function request(method: string, url: string, options: { headers: Record<string, string>, query: Record<string, any>, body: HttpBody }): Promise<HttpResponse>
    function get(url: string, query?: Record<string, any>, headers?: Record<string, string>): Promise<HttpResponse>
    function post(url: string, body?: HttpBody, query?: Record<string, any>, headers?: Record<string, string>): Promise<HttpResponse>
}

declare module '@cogears/http-client' {
    export * from 'http-client';
    export * as default from 'http-client';
}