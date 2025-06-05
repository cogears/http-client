import HttpApi from './HttpApi.js'
import HttpClient from './HttpClient.js'
import HttpAjaxClient from './impl/HttpAjaxClient.js'
export { HttpApi }
export default function (): HttpClient {
    return new HttpAjaxClient()
}