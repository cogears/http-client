const HttpBody = require('./HttpBody')

module.exports = class HttpJson extends HttpBody {
    constructor(content) {
        super(content, 'application/json')
    }

    toString() {
        return JSON.stringify(this.content)
    }
}
