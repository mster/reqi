'use strict'

const debug = require('./debug')
const { ReqiError, header } = require('./util')
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
        reject(new ReqiError('Error: GET/ options.url is required', opts))
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
          const doRedirect = statusCode >= 300 && statusCode < 400 && header(res.headers, 'location') && options.redirect && options.redirectCount > 0
          if (doRedirect) {
            const location = header(res.headers, 'location')
            debug(`GET/ redirecting to ${location}`)

            options.redirectCount--
            options.url = location
            resolve(this.get(options))
            return
          }

          /* attempt retry */
          const doRetry = options.retryCodes.includes(+statusCode) && options.retryCount > 0 && header(res.headers, 'retry-after') <= options.maxWait
          if (doRetry) {
            const retryAfter = header(res.headers, 'retry-after')
            options.retryCount--
            if (retryAfter) {
              debug(`GET/ retrying with code ${statusCode} after ~${retryAfter}s have elapsed.`)

              /* queue retry to event loop */
              setTimeout(() => resolve(this.get(options)), retryAfter * 1e3 /* seconds to ms */)
            } else {
              debug(`GET/ retrying with code ${statusCode}`)
              resolve(this.get(options))
            }
            return
          }

          const contentType = header(res.headers, 'content-type')
          if (options.parseJSON && contentType && contentType.includes('application/json')) {
            try {
              const parsed = JSON.parse(payload.data)
              payload.data = parsed
            } catch (error) {
              reject(new ReqiError('Error: error parsing request data.', options))
            }
          }

          /* default */
          debug('GET/ resolving')
          resolve(payload)
        })
      }).on('error', err => {
        reject(new ReqiError(err, options))
      })
    })
  }

  async put (opts, data) {
    return new Promise((resolve, reject) => {
      if (!opts || !opts.uri) {
        reject(new ReqiError('Error: PUT/ options.url is required.'), opts)
      }

      let options = Object.assign(this.defaults, opts)
      options = Object.assign({
        method: 'PUT',
        // hostname: options.uri,
        headers: {
          'content-type': 'application/json'
        }
      }, options)

      // const protocol = options.uri.includes('https://') ? https : http
      const protocol = https

      const request = protocol.request(options, (res) => {
        res.setEncoding('utf8')
        const { statusCode } = res
        debug(`status code: ${statusCode}`)

        const payload = {
          statusCode,
          data: '',
          options
        }

        res.on('data', (chunk) => {
          payload.data += chunk
        })

        res.on('end', () => {
          resolve(payload)
        })
      }).on('error', err => {
        reject(new ReqiError(err, options))
      })

      request.write(data)
      request.end()
    })
  }
}

module.exports = ClientRequest
