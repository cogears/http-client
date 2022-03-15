const fs = require('fs')
const path = require('path')
const HttpBody = require('./HttpBody')

module.exports = class HttpMultipart extends HttpBody {
    constructor(file, mime, field) {
        super(file, mime)
        this.field = field
    }

    write(httpRequest) {
        const stat = fs.statSync(this.content)
        const boundaryKey = Math.random().toString(16)
        const payload = `--${boundaryKey}\r\n`
            + `Content-Disposition: form-data; name="${this.field}"; filename="${path.basename(this.content)}"\r\n`
            + `Content-Type: ${this.contentType}\r\n`
            + 'Content-Transfer-Encoding: binary\r\n\r\n'
        const enddata = `\r\n--${boundaryKey}--\r\n`
        httpRequest.setHeader('Content-Type', 'multipart/form-data; boundary=' + boundaryKey)
        httpRequest.setHeader('Content-Length', Buffer.byteLength(payload) + Buffer.byteLength(enddata) + stat.size)
        httpRequest.write(payload)

        const fileStream = fs.createReadStream(this.content, { bufferSize: 4 * 1024 })
        fileStream.pipe(httpRequest, { end: false })
        fileStream.on('end', () => {
            httpRequest.end(enddata)
        })
    }
}
