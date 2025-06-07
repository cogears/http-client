import HttpApi from './HttpApi.js'
import { HttpBody } from './HttpBody.js'
import HttpClient, { HttpOptions, HttpResponse } from './HttpClient.js'
import HttpAjaxClient from './impl/HttpAjaxClient.js'
export { HttpApi, HttpBody, HttpClient, HttpOptions, HttpResponse }

const httpInstance = new HttpAjaxClient()
export default function (): HttpClient {
    return httpInstance
}
