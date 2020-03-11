[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/licenses/MIT)
[![JavaScript Style Guide: Standard](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com/ "JavaScript Standard Style")
[![Build Status](https://travis-ci.com/mster/reqi.svg?token=4xBzyUwuupupQsaATYQA&branch=master)](https://travis-ci.org/mster/reqi)

# Reqi
Reqi is a Promisified request library with built in functionality for retries, redirects, and body parsing.

# Installation
`npm install reqi --save`

# Usage
Using Reqi is like using your favorite request libraries, but with promises. Require `reqi`, instantiate a client, and *fire away*!

```javascript
const client = new require('reqi')({ json: true })
let data = await client.get('https://example.com/posts')
```

Reqi also includes convience methods for quick requests, such as `get` and `post`.

```javascript
const ReqiClient = require('reqi')

function updateStatus () {
  const client = new ReqiClient({
    retry: true,
    retryCodes: [429],
    maxWait: 3 /* seconds */
  })

  client.get('https://api.twitter.com/oauth/authorize')
    .then(prepareTweet)
    .then((tweet) => client.post('https://api.twitter.com/1.1/statuses/update', tweet))
    .catch(handleTweetErrors)
}
```

See [Options](#options) for more information regarding `clientOptions` and `requestOptions`.

# API
## new ReqiClient([clientOptions])
* `clientOptions`: `<Object>` See [clientOptions](#clientOptions)

Creates a new client with the supplied `clientOptions` overriding defaults.

## request(requestOptions[, body=null])
* `requestOptions`: `<Object>` See [requestOptions](#requestOptions)
  * `url`: `<string>` | `<URL>` A parsable WHATWG input URL, or URL class.
* `body`: `<Object>` | `<string>` | `<Buffer>` | `<stream>` An acceptable request body.

## request(url[, body=null])
* `url`: `<string>` | `<URL>` A parsable WHATWG input URL, or URL class.
* `body`: `<Object>` | `<string>` | `<Buffer>` | `<stream>` An acceptable request body.

# Options
## clientOptions
* `clientOptions`: `<Object>` 
  * `redirect`: `<boolean>` | `<number>` Controls request redirection. If a positive `number` is passed, the redirect option will delimit the maximum redirect amount. Upon being set to '`true`', all redirects will be followed.
  * `retry`: `<boolean>` | `<number>` Control request retries. If a positive `number` is passed, the retry option will delimit the maximum retry amount. Upon being set to '`true`', retry attempts will be made until a success code is recieved.
  * `retryCodes`: `number` | `<number[]>` HTTP response code(s) to retry upon i.e. `101` or `[426, 429]`.
  * `maxWait`: `<number>` The maximum number of **seconds** to wait before retrying a request. Deals primarily with rate limits.
  * `json`: `<boolean>` Enables or disables automatic request and response body parsing. If enabled, '`true`', both bodies sent and recieved by the client are serialized and parsed, respectively. 

Reqi gives you the option to control retries and redirects, as well as the ability to enable automatic body parsing. 

```javascript
const retryClient = new ReqiClient({ retry: 3, retryCodes: [429] })
```

By default, retries, redirects, and body parsing are disabled.

Client options are mutable too!
```javascript
// for example  
client.clientOptions.retry = 1
```

#### Default ReqiClient Configuration:
```javascript
this.clientOptions = {
  redirect: false,
  retry: false,
  retryCodes: [],
  maxWait: 3, // seconds
  json: false
}
```

These `clientOptions` are bound to the request client and allow for subsequent requests without reconfiguration.

## requestOptions
* `requestOptions`: `<Object>` 
  * `url`: `<string>` | `<URL>` (Required) A parsable WHATWG input URL, or URL class.

Just like what you're used to with Node Core, Reqi supports all core HTTP/HTTPS request options, with a few defaults:

* `method`: the desired HTTP request method, defaulting to '`GET`'.
* `port`: the desired HTTP host port. If no port is provided, Reqi will use either a `80` or `443` value depending on the request protocol. 

For more information on the supported `requestOptions`, consult the following Node.js documentation:

* [Core HTTP](https://nodejs.org/api/http.html#http_http_request_url_options_callback)
* [Core HTTPS](https://nodejs.org/api/https.html#https_https_request_url_options_callback)
* [Core TLS (SSL)](https://nodejs.org/api/tls.html#tls_tls_connect_options_callback) 

# Contributing
[Contributing via DCO 1.1](contributing.md).

# License
Licensed under the MIT License. See the [LICENSE](license.md) file for more details.