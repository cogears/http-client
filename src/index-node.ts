import HttpApi from './HttpApi.js'
import { HttpBody } from './HttpBody.js'
import HttpClient, { HttpOptions, HttpResponse } from './HttpClient.js'
import HttpNodeClient from './impl/HttpNodeClient.js'
export { HttpApi, HttpBody, HttpClient, HttpOptions, HttpResponse }
export default function (): HttpClient {
    return new HttpNodeClient()
}
