import { HttpBody } from '../HttpBody.js'
import HttpClient, { HttpOptions, HttpResponse } from '../HttpClient.js'

function parseHeaders(content: string) {
    let headers: Record<string, string> = {}
    let lines = content.trim().split(/[\r\n]+/)
    for (let line of lines) {
        let parts = line.split(': ')
        headers[parts[0]] = parts[1]
    }
    return headers
}

let seed = 0
/** @internal */
export default class HttpAjaxClient extends HttpClient {
    constructor() {
        super()
    }
    /** @internal */
    private doJsonp(url: string, jsonpCallback: string): Promise<HttpResponse> {
        const jsonp = 'jcb' + seed++;
        url = url + (url.indexOf('?') == -1 ? '?' : '&') + `${jsonpCallback}=${jsonp}`
        return new Promise(resolve => {
            let request = document.createElement('script');
            request.src = url;
            //@ts-ignore
            window[jsonp] = (data: any) => {
                //@ts-ignore
                delete window[jsonp];
                document.getElementsByTagName('head')[0].removeChild(request);
                resolve({ status: 200, body: data, headers: {} });
            }
            document.getElementsByTagName('head')[0].appendChild(request);
        })
    }

    request0(method: string, url: string, { headers, body, jsonpCallback }: HttpOptions): Promise<HttpResponse> {
        if (method == 'JSONP' && jsonpCallback) {
            return this.doJsonp(url, jsonpCallback)
        }
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest()
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    resolve({
                        status: xhr.status,
                        body: xhr.response,
                        headers: parseHeaders(xhr.getAllResponseHeaders())
                    })
                }
            }
            xhr.onerror = function (err) {
                console.error(err)
                reject(err)
            }
            xhr.ontimeout = function () {
                xhr.abort()
                reject(new Error('请求超时'))
            }
            xhr.timeout = 60000
            // xhr.responseType = 'blob'
            xhr.open(method, url, true)
            let content = ''
            if (body) {
                if (body instanceof FileBody) {
                } else {
                    content = body.toString()
                    headers = Object.assign({ 'Content-Type': body.contentType }, headers)
                }
            }
            if (headers) {
                Object.keys(headers).forEach(key => {
                    //@ts-ignore
                    xhr.setRequestHeader(key, headers[key])
                })
            }
            if (body instanceof FileBody) {
                xhr.send(body.form)
            } else {
                xhr.send(body ? content : undefined)
            }
        })
    }

    file(field: string, file: File, mime: string = 'application/octet-stream'): HttpBody {
        return new FileBody(field, file, mime)
    }

    fileContent(field: string, content: string, mime: string = 'application/octet-stream'): HttpBody {
        return new FileBody(field, content, mime)
    }
}

class FileBody extends HttpBody {
    readonly form: FormData
    constructor(field: string, file: File | string, mime: string) {
        super(field, mime)
        this.form = new FormData()
        this.form.append(field, file)
    }
}