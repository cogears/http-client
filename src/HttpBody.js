module.exports = class HttpBody {
    constructor(content, contentType = 'text/plain') {
        this._content = content
        this._contentType = contentType
    }

    get content() {
        return this._content
    }

    get contentType() {
        return this._contentType
    }

    toString() {
        return this.content.toString()
    }
}
