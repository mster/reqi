'use strict'

const http = require('http')
const https = require('https')

const ReqiError = require('./error')
const debug = require('./debug')

const {
  header,
  generateOptions
} = require('./util')

const REQUIRES_DATA = [
  'PUT',
  'POST',
  'PATCH'
]

class ReqiClient {
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
    this.reqiOptions = { ...this.defaults, ...initOptions }
  }

  request (requestOptions, data = null) {
    const requestPromise = new Promise((resolve, reject) => {
      requestOptions = generateOptions(requestOptions)

      if (requestOptions.error) reject(requestOptions.error)

      const payload = {
        statusCode: null,
        headers: {},
        body: '',
        requestOptions,
        reqiOptions: this.reqiOptions
      }

      const protocol = requestOptions.protocol.includes('https') ? https : http

      const req = protocol.request(requestOptions, (res) => {
        res.setEncoding('utf8')
        payload.statusCode = res.statusCode

        if (res.headers) payload.headers = { ...payload.headers, ...res.headers }

        res.on('data', (chunk) => {
          payload.body += chunk
        })
        res.on('end', () => {
          if (!res.complete) {
            reject(new ReqiError('Error: response terminated before completion'))
          }

          const location = header(res.headers, 'location')
          const doRedirect = payload.statusCode >= 300 &&
                             payload.statusCode < 400 &&
                             location != null && this.reqiOptions.redirect &&
                             this.reqiOptions.redirectCount > 0
          if (doRedirect) {
            debug(`GET/ redirecting to ${location}`)

            this.reqiOptions.redirectCount--
            requestOptions.url = location
            resolve(this.request(requestOptions))
            return
          }

          const doRetry = this.reqiOptions.retryCodes.includes(+payload.statusCode) &&
                          this.reqiOptions.retryCount > 0 &&
                          header(res.headers, 'retry-after') <= this.reqiOptions.maxWait
          if (doRetry) {
            const retryAfter = header(res.headers, 'retry-after')
            this.reqiOptions.retryCount--

            if (retryAfter) {
              debug(`GET/ retrying with code ${payload.statusCode} after ~${retryAfter}s have elapsed.`)

              /* queue retry to event loop */
              setTimeout(() => resolve(this.request(requestOptions, data)), retryAfter * 1e3 /* seconds to ms */)
            } else {
              debug(`GET/ retrying with code ${payload.statusCode}`)
              resolve(this.request(requestOptions, data))
            }
            return
          }

          const contentType = header(res.headers, 'content-type')
          const doParse = this.reqiOptions.parseJSON &&
                          contentType &&
                          contentType.includes('application/json')
          if (doParse) {
            try {
              const parsed = JSON.parse(payload.body)
              payload.body = parsed
            } catch (error) {
              reject(new ReqiError('Error: error parsing response payload, returning unparsed payload', payload))
            }
          }

          resolve(payload)
        })
      }).on('error', (error) => {
        reject(error)
      })

      if (data && REQUIRES_DATA.indexOf(requestOptions.method) > 0) {
        req.write(data)
      }

      req.end()
    })

    return requestPromise
  }

  async get (requestOptions) {
    return this.request({ ...requestOptions, method: 'GET' })
  }

  async head (requestOptions) {
    return this.request({ ...requestOptions, method: 'HEAD' })
  }

  async post (requestOptions, data) {
    return this.request({ ...requestOptions, method: 'POST' }, data)
  }

  async put (requestOptions, data) {
    return this.request({ ...requestOptions, method: 'PUT' }, data)
  }

  async patch (requestOptions, data) {
    return this.request({ ...requestOptions, method: 'PATCH' }, data)
  }

  async delete (requestOptions) {
    return this.request({ ...requestOptions, method: 'DELETE' })
  }
}

module.exports = ReqiClient
