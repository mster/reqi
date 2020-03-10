'use strict'

const http = require('http')
const https = require('https')

const ReqiError = require('./error')
const debug = require('./debug')
const {
  header,
  generateOptions
} = require('./util')

class ClientRequest {
  constructor (initOptions) {
    /* default options */
    this.defaults = {
      redirect: false,
      redirectCount: 0,
      retryCodes: [408, 429, 503],
      retryCount: 3,
      maxWait: 15, // seconds
      parseJSON: false
    }

    if (!initOptions) initOptions = {}
    this.reqiOptions = Object.assign(this.defaults, initOptions)
  }

  async get (requestOptions) {
    return new Promise((resolve, reject) => {
      requestOptions = generateOptions(requestOptions,
        {
          method: 'GET'
        })
      if (requestOptions.error) reject(requestOptions)

      const protocol = requestOptions.protocol.includes('https:') ? https : http

      const request = protocol.request(requestOptions, (res) => {
        res.setEncoding('utf8')

        const { statusCode } = res

        const payload = {
          statusCode,
          headers: res.headers,
          body: '',
          requestOptions,
          reqiOptions: this.reqiOptions
        }

        res.on('data', (chunk) => {
          payload.body += chunk
        })
        res.on('end', () => {
          /* follow redirect */
          const doRedirect = statusCode >= 300 && statusCode < 400 &&
                             header(res.headers, 'location') &&
                             this.reqiOptions.redirect &&
                             this.reqiOptions.redirectCount > 0
          if (doRedirect) {
            const location = header(res.headers, 'location')
            debug(`GET/ redirecting to ${location}`)

            this.reqiOptions.redirectCount--
            requestOptions.url = location
            resolve(this.get(requestOptions))
            return
          }

          /* attempt retry */
          const doRetry = this.reqiOptions.retryCodes.includes(+statusCode) &&
                          this.reqiOptions.retryCount > 0 &&
                          header(res.headers, 'retry-after') <= this.reqiOptions.maxWait
          if (doRetry) {
            const retryAfter = header(res.headers, 'retry-after')
            this.reqiOptions.retryCount--

            if (retryAfter) {
              debug(`GET/ retrying with code ${statusCode} after ~${retryAfter}s have elapsed.`)

              /* queue retry to event loop */
              setTimeout(() => resolve(this.get(requestOptions)), retryAfter * 1e3 /* seconds to ms */)
            } else {
              debug(`GET/ retrying with code ${statusCode}`)
              resolve(this.get(requestOptions))
            }
            return
          }

          const contentType = header(res.headers, 'content-type')
          if (this.reqiOptions.parseJSON && contentType && contentType.includes('application/json')) {
            try {
              const parsed = JSON.parse(payload.body)
              payload.body = parsed
            } catch (error) {
              reject(new ReqiError('Error: error parsing response payload, returning unparsed payload', payload))
            }
          }

          /* default */
          debug('GET/ resolving')
          resolve(payload)
        })
      }).on('error', err => {
        reject(new ReqiError(err, requestOptions))
      })

      request.end('ok')
    })
  }

  async head (requestOptions) {
    return new Promise((resolve, reject) => {
      requestOptions = generateOptions(requestOptions,
        {
          method: 'HEAD'
        })
      if (requestOptions.error) reject(requestOptions)

      const protocol = requestOptions.protocol.includes('https:') ? https : http

      const request = protocol.request(requestOptions, (res) => {
        res.setEncoding('utf8')

        const { statusCode } = res

        const payload = {
          statusCode,
          headers: res.headers,
          requestOptions,
          reqiOptions: this.reqiOptions
        }

        res.on('data', (chunk) => {})
        res.on('end', () => {
          debug('HEAD/ resolving')
          resolve(payload)
        })
      }).on('error', err => {
        reject(new ReqiError(err, requestOptions))
      })
      request.end()
    })
  }

  async post (requestOptions, data) {
    return new Promise((resolve, reject) => {
      requestOptions = generateOptions(requestOptions,
        {
          method: 'POST'
        })
      if (requestOptions.error) reject(requestOptions)

      const protocol = requestOptions.protocol.includes('https:') ? https : http

      const request = protocol.request(requestOptions, (res) => {
        res.setEncoding('utf8')

        const { statusCode } = res

        const payload = {
          statusCode,
          headers: res.headers,
          body: '',
          requestOptions,
          reqiOptions: this.reqiOptions
        }

        res.on('data', (chunk) => {
          payload.body += chunk
        })

        res.on('end', () => {
          debug('POST/ resolving')
          const contentType = header(res.headers, 'content-type')
          if (this.reqiOptions.parseJSON && contentType && contentType.includes('application/json')) {
            try {
              const parsed = JSON.parse(payload.body)
              payload.body = parsed
            } catch (error) {
              reject(new ReqiError('Error: error parsing response payload, returning unparsed payload'), payload)
            }
          }
          resolve(payload)
        })
      }).on('error', err => {
        reject(new ReqiError(err, requestOptions))
      })

      request.write(data)
      request.end()
    })
  }

  async put (requestOptions, data) {
    return new Promise((resolve, reject) => {
      requestOptions = generateOptions(requestOptions,
        {
          method: 'PUT'
        })
      if (requestOptions.error) reject(requestOptions)

      const protocol = requestOptions.protocol.includes('https:') ? https : http

      const request = protocol.request(requestOptions, (res) => {
        res.setEncoding('utf8')

        const { statusCode } = res

        const payload = {
          statusCode,
          headers: res.headers,
          body: '',
          requestOptions,
          reqiOptions: this.reqiOptions
        }

        res.on('data', (chunk) => {
          payload.body += chunk
        })

        res.on('end', () => {
          debug('PUT/ resolving')
          const contentType = header(res.headers, 'content-type')
          if (this.reqiOptions.parseJSON && contentType && contentType.includes('application/json')) {
            try {
              const parsed = JSON.parse(payload.body)
              payload.body = parsed
            } catch (error) {
              debug(error)
              reject(new ReqiError('Error: error parsing response payload, returning unparsed payload'), payload)
            }
          }
          resolve(payload)
        })
      }).on('error', err => {
        reject(new ReqiError(err, requestOptions))
      })

      request.write(data)
      request.end()
    })
  }

  async patch (requestOptions, data) {
    return new Promise((resolve, reject) => {
      requestOptions = generateOptions(requestOptions,
        {
          method: 'PATCH'
        })
      if (requestOptions.error) reject(new ReqiError('Error: invalid options.', requestOptions))

      const protocol = requestOptions.protocol.includes('https:') ? https : http

      const request = protocol.request(requestOptions, (res) => {
        res.setEncoding('utf8')

        const { statusCode } = res

        const payload = {
          statusCode,
          headers: res.headers,
          body: '',
          requestOptions,
          reqiOptions: this.reqiOptions
        }

        res.on('data', (chunk) => {
          payload.body += chunk
        })

        res.on('end', () => {
          debug('PATCH/ resolving')
          const contentType = header(res.headers, 'content-type')
          if (this.reqiOptions.parseJSON && contentType && contentType.includes('application/json')) {
            try {
              const parsed = JSON.parse(payload.body)
              payload.body = parsed
            } catch (error) {
              reject(new ReqiError('Error: error parsing response payload, returning unparsed payload'), payload)
            }
          }
          resolve(payload)
        })
      }).on('error', (error) => {
        reject(new ReqiError(error, requestOptions))
      })

      request.write(data)
      request.end()
    })
  }

  async delete (requestOptions, data) {
    return new Promise((resolve, reject) => {
      requestOptions = generateOptions(requestOptions,
        {
          method: 'DELETE'
        })
      if (requestOptions.error) reject(new ReqiError('Error: invalid options.', requestOptions))

      const protocol = requestOptions.protocol.includes('https:') ? https : http

      const request = protocol.request(requestOptions, (res) => {
        res.setEncoding('utf8')

        const { statusCode } = res

        const payload = {
          statusCode,
          headers: res.headers,
          body: '',
          requestOptions,
          reqiOptions: this.reqiOptions
        }

        res.on('data', (chunk) => {
          payload.body += chunk
        })

        res.on('end', () => {
          debug('DELETE/ resolving')
          const contentType = header(res.headers, 'content-type')
          if (this.reqiOptions.parseJSON && contentType && contentType.includes('application/json')) {
            try {
              const parsed = JSON.parse(payload.body)
              payload.body = parsed
            } catch (error) {
              reject(new ReqiError('Error: error parsing response payload, returning unparsed payload'), payload)
            }
          }
          resolve(payload)
        })
      }).on('error', (error) => {
        reject(new ReqiError(error, requestOptions))
      })

      request.write(data)
      request.end()
    })
  }
}

module.exports = ClientRequest
