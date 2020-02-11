'use strict'

const debug = require('./debug')
const { ReqiError } = require('./util')
const https = require('https')
const http = require('http')

class ClientRequest {
  constructor (opts) {
    /* default options */
    this.defaults = Object.assign({
      redirect: false,
      redirectCount: 0,
      retryCodes: [408, 429, 503],
      retryCount: 3,
      maxWait: 15, // seconds
      parseJSON: true
    }, opts)
  }

  async get (opts) {
    return new Promise((resolve, reject) => {
      if (!opts || !opts.uri) {
        reject(new ReqiError('Error: options.url is required for GET/', opts))
      }

      const options = Object.assign(this.defaults, opts)

      const protocol = options.uri.includes('https://') ? https : http
      protocol.get(options.uri, (res) => {
        res.setEncoding('utf8')
        const { statusCode } = res

        const payload = {
          statusCode,
          data: '',
          options
        }

        res.on('data', (chunk) => {
          payload.data += chunk
        })
        res.on('end', () => {
          /* follow redirect */
          const doRedirect = statusCode >= 300 && statusCode < 400 && res.headers.location && options.redirect && options.redirectCount > 0

          if (doRedirect) {
            debug(`redirecting GET/ to ${res.headers.location}`)

            const location = res.headers.location

            options.redirectCount--
            options.url = location
            resolve(this.get(options))
            return
          }

          /* attempt retry */
          const doRetry = options.retryCodes.includes(+statusCode) && options.retryCount > 0 && res.headers['retry-after'] <= options.maxWait
          if (doRetry) {
            options.retryCount--
            if (res.headers['retry-after']) {
              debug(`retrying GET/ with code ${statusCode} after ~${res.headers['retry-after']}s have elapsed.`)
              setTimeout(() => resolve(this.get(options)), options.maxWait * 1e3 /* seconds to ms */)
            } else {
              debug(`retrying GET/ with code ${statusCode}`)
              resolve(this.get(options))
            }

            return
          }

          /* default */
          debug('resolving GET/')
          resolve(payload)
        })
      }).on('error', err => {
        reject(new ReqiError(err, options))
      })
    })
  }
}

module.exports = ClientRequest
