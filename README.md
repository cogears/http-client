# @cogears/http-client
http client module

### api list

###### send http request
- get(url, query, headers)
- post(url, body, query, headers)
- request(method, url, {query, body, headers})

###### generate http body
- text(content)
- json(content)
- form(content)
- file(content)

###### api class
- HttpApi


### example

- simple request
```javascript
const http = request('@cogears/http-client')

let {status, body, headers} = await http.get(url)

```


- api set
```javascript
const http = require('@cogears/http-client')

class MyApi extends http.HttpApi {
    constructor() {
        super(domain)
    }

    preRequest({query, body, headers}) {
        return {query, body, headers}
    }

    async postRequest(response, url) {
        response = await super.postRequest(response, url)
        return response
    }

    doSomeRequest(){
        return this.get(apiUrl)
    }

    ...
}
```