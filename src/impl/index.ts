import HttpAjaxClient from "./HttpAjaxClient"

const isBrowser = function () {
    try {
        window.document
        return true
    } catch (e) {
        return false
    }
}

const HttpClient = isBrowser() ? HttpAjaxClient : eval('require("./HttpNodeClient").default')

export default HttpClient