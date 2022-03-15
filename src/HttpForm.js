const HttpBody = require('./HttpBody')

module.exports = class HttpForm extends HttpBody {
    constructor(content) {
        super(content, 'application/x-www-form-urlencoded')
    }

    toString() {
        return HttpForm.encode(this.content)
    }

    static encode(obj) {
        return encode(obj).join('&')
    }
}

function encode(obj, query = [], prefix = '') {
    if (typeof obj === 'object') {
        if (obj instanceof Array) {
            return encodeArray(obj, query, prefix)
        } else {
            return encodeMap(obj, query, prefix)
        }
    } else {
        return encodeValue(obj, query, prefix)
    }
}

function encodeArray(arr, query, prefix) {
    for (let i = 0; i < arr.length; i++) {
        encode(arr[i], query, `${prefix}[${i}]`)
    }
    return query
}

function encodeMap(map, query, prefix) {
    for (let k in map) {
        encode(map[k], query, prefix ? `${prefix}.${k}` : k)
    }
    return query
}

function encodeValue(value, query, prefix) {
    query.push(`${prefix}=${value}`)
    return query
}
