import { HttpBody, HttpForm, HttpJson } from './HttpBody'

type PromiseHandle = { resolve: Function, reject: Function }
export type HttpOptions = { headers?: Record<string, string>, query?: Record<string, any>, body?: HttpBody, jsonpCallback?: string }
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

    request(method: string, url: string, options: HttpOptions): Promise<HttpResponse> {
        method = method.toUpperCase()
        if (options.query) {
            url += (url.indexOf('?') == -1 ? '?' : '&') + HttpForm.encode(options.query)
        }
        return new Promise(async (resolve, reject) => {
            if (method == 'GET' || method == 'JSONP') {
                if (this._getHandles[url]) {
                    this._getHandles[url].push({ resolve, reject })
                    return
                } else {
                    this._getHandles[url] = [{ resolve, reject }]
                }
            }
            try {
                let response = await this.request0(method, url, options)
                if (method == 'GET' || method == 'JSONP') {
                    this.releaseHandles(url, undefined, response)
                } else {
                    resolve(response)
                }
            } catch (err) {
                if (method == 'GET' || method == 'JSONP') {
                    this.releaseHandles(url, err)
                } else {
                    reject(err)
                }
            }
        })
    }

    jsonp(url: string, query: Record<string, any>, jsonpCallback: string) {
        return this.request('jsonp', url, { query, jsonpCallback })
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

    file(field: string, file: any, mime?: string): HttpBody {
        throw new Error('该方法必须由子类实现')
    }

    fileContent(field: string, content: string, mime?: string): HttpBody {
        throw new Error('该方法必须由子类实现')
    }
}