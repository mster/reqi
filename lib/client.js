'use strict'

const https = require('https')
const http = require('http')

class ClientRequest {
  constructor (opts) {
    /* default options */
    this.defaults = Object.assign({
      redirect: false,
      redirectCount: 0,
      retryCodes: [],
      parseJSON: true
    }, opts)
  }

  async get (opts) {
    return new Promise((resolve, reject) => {
      if (!opts || !opts.url) {
        reject(new Error('options.url is required for GET/'))
      }

      const options = Object.assign(this.defaults, opts)

      const protocol = options.url.includes('https://') ? https : http
      protocol.get(options.url, (res) => {
        res.setEncoding('utf8')
        const { statusCode } = res

        const payload = {
          statusCode,
          data: ''
        }

        res.on('data', (chunk) => {
          payload.data += chunk
        })
        res.on('end', () => {
          /* follow redirect */
          const doRedirect = statusCode >= 300 && res.headers.location && options.redirect && options.redirectCount > 0
          if (doRedirect) {
            const location = res.headers.location

            options.redirectCount--
            options.url = location
            return resolve(this.get(options))
          }

          return resolve(payload)
        })
      }).on('error', err => {
        return reject(new Error(err))
      })
    })
  }
}

module.exports = ClientRequest
