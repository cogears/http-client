import { HttpBody, HttpForm, HttpJson } from './HttpBody'

type PromiseHandle = { resolve: Function, reject: Function }
export type HttpOptions = { headers?: Record<string, string>, query?: Record<string, any>, body?: HttpBody }
export type HttpResponse = { status: number, body: any, headers: Record<string, string> }

export default class HttpClient {
    private _getHandles: Record<string, PromiseHandle[]> = {}

    private releaseHandles(url: string, err: any, data?: any) {
        let promises = this._getHandles[url]
        delete this._getHandles[url]
        for (let item of promises) {
            if (err) {
                item.reject(err)
            } else {
                item.resolve(data)
            }
        }
    }

    request0(method: string, url: string, options: HttpOptions): Promise<HttpResponse> {
        throw new Error('该方法必须由子类实现')
    }

    request(method: string, url: string, { headers, query, body }: HttpOptions): Promise<HttpResponse> {
        method = method.toUpperCase()
        if (query) {
            url += (url.indexOf('?') == -1 ? '?' : '&') + HttpForm.encode(query)
        }
        return new Promise(async (resolve, reject) => {
            if (method == 'GET') {
                if (this._getHandles[url]) {
                    this._getHandles[url].push({ resolve, reject })
                    return
                } else {
                    this._getHandles[url] = [{ resolve, reject }]
                }
            }
            try {
                let response = await this.request0(method, url, { headers, query, body })
                if (method == 'GET') {
                    this.releaseHandles(url, undefined, response)
                } else {
                    resolve(response)
                }
            } catch (err) {
                if (method == 'GET') {
                    this.releaseHandles(url, err)
                } else {
                    reject(err)
                }
            }
        })
    }

    get(url: string, query?: Record<string, any>, headers?: Record<string, string>) {
        return this.request('get', url, { query, headers })
    }

    post(url: string, body?: any, query?: Record<string, any>, headers?: Record<string, string>) {
        return this.request('post', url, { body, query, headers })
    }

    text(value: string) {
        return new HttpBody(value)
    }

    json(value: any) {
        return new HttpJson(value)
    }

    form(value: any) {
        return new HttpForm(value)
    }

    file(field: string, file: any): HttpBody {
        throw new Error('该方法必须由子类实现')
    }
}