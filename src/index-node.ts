import HttpApi from './HttpApi.js'
import HttpClient from './HttpClient.js'
import HttpNodeClient from './impl/HttpNodeClient.js'
export { HttpApi }
export default function (): HttpClient {
    return new HttpNodeClient()
}
