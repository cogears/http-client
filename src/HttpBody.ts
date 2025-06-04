export class HttpBody {
    /** @internal */
    private readonly _content: any
    /** @internal */
    private readonly _contentType: string
    constructor(content: any, contentType: string = 'text/plain') {
        this._content = content
        this._contentType = contentType
    }

    get content() {
        return this._content
    }

    get contentType() {
        return this._contentType
    }

    toString(): string {
        return this.content.toString()
    }
}

export class HttpJson extends HttpBody {
    constructor(content: any) {
        super(content, 'application/json')
    }

    toString() {
        return JSON.stringify(this.content)
    }
}

export class HttpForm extends HttpBody {
    constructor(content: any) {
        super(content, 'application/x-www-form-urlencoded')
    }

    toString() {
        return HttpForm.encode(this.content)
    }

    static encode(obj: any) {
        return HttpForm.encodeObj(obj).join('&')
    }

    static encodeObj(obj: any, query: string[] = [], prefix: string = '') {
        if (typeof obj === 'object') {
            if (obj instanceof Array) {
                return HttpForm.encodeArray(obj, query, prefix)
            } else {
                return HttpForm.encodeMap(obj, query, prefix)
            }
        } else {
            return HttpForm.encodeValue(obj, query, prefix)
        }
    }

    static encodeArray(arr: Array<any>, query: string[], prefix: string) {
        for (let i = 0; i < arr.length; i++) {
            HttpForm.encodeObj(arr[i], query, `${prefix}[${i}]`)
        }
        return query
    }

    static encodeMap(map: any, query: string[], prefix: string) {
        for (let k in map) {
            HttpForm.encodeObj(map[k], query, prefix ? `${prefix}.${k}` : k)
        }
        return query
    }

    static encodeValue(value: any, query: string[], prefix: string) {
        query.push(`${prefix}=${value}`)
        return query
    }
}
