'use strict'

const ReqiError = require('./error')
const debug = require('./debug')

const http = require('http')
const https = require('https')

const {
  header,
  generateOptions
} = require('./util')

class ReqiClient {
  constructor (initOptions) {
    this.aborted = false

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
    this.clientOptions = { ...this.defaults, ...initOptions }
  }

  request (options, requestBody = null) {
    debug(options)
    const self = this
    const requestPromise = new Promise((resolve, reject) => {
      const requestOptions = generateOptions(options)
      if (requestOptions.error) reject(requestOptions.error)

      function followRedirect (location) {
        debug(`redirecting to ${location}`)
        requestOptions.url = location
        resolve(self.request(requestOptions))
      }

      function attemptRetry (retryAfter) {
        if (retryAfter) {
          debug('retrying - queuing request')

          /* queue retry to event loop */
          setTimeout(function queueRequest () {
            resolve(self.request(requestOptions, requestBody))
          }, retryAfter * 1000 /* seconds to ms */)
        } else {
          debug('retrying')
          resolve(self.request(requestOptions, requestBody))
        }
      }

      function parseBody (body) {
        try {
          const parsed = JSON.parse(body)
          return parsed
        } catch (error) {
          reject(new ReqiError(error))
        }
      }

      const transport = requestOptions.protocol.includes('https:') ? https : http
      if (requestOptions.agent == null) requestOptions.agent = new transport.Agent(options)

      const req = transport.request(requestOptions)

      req.on('response', (res) => {
        res.setEncoding('utf8')

        const { statusCode, headers } = res

        let responseBody = ''
        res.on('data', (chunk) => {
          responseBody += chunk
        })

        res.once('end', function responseEnded () {
          if (!res.complete) {
            reject(new ReqiError('Error: response terminated before completion'))
          }

          debug(requestOptions.reqCount)

          const { redirect, redirectCount } = self.clientOptions
          const doRedirect = statusCode >= 300 && statusCode < 400 && redirect && redirectCount > requestOptions.reqCount.redirect

          if (doRedirect) {
            requestOptions.reqCount.redirect++
            followRedirect(header(res.headers, 'location'))
          }

          const { retryCodes, retryCount, maxWait } = self.clientOptions
          const retryAfter = header(headers, 'retry-after')
          const doRetry = retryCodes.includes(statusCode) && retryCount > requestOptions.reqCount.retry && maxWait >= retryAfter

          if (doRetry) {
            requestOptions.reqCount.retry++
            attemptRetry(header(res.headers, 'retry-after'))
          }

          const { parseJSON } = self.clientOptions
          const contentType = header(res.headers, 'content-type')
          const doParse = parseJSON && contentType && contentType.includes('application/json')

          if (doParse) {
            responseBody = parseBody(responseBody)
          }

          const response = {
            statusCode,
            headers,
            body: responseBody,
            requestOptions
          }

          resolve(response)
        })
      })

      req.once('error', function onceError (error) {
        debug('error making request')
        reject(new ReqiError(error))
      })

      req.once('timeout', function onceTimeout () {
        debug('request timedout')
        /* call abort */
      })

      req.once('abort', function onceAbort () {
        debug('request aborted')
        this.aborted = true
      })

      if (requestBody == null) {
        requestBody = requestOptions.body
      }

      if (requestBody != null) {
        if (requestBody.pipe != null && (typeof requestBody.pipe === 'function')) {
          debug('request body is a stream')
          requestBody.pipe(req)
        } else if (typeof requestBody === 'string' || Buffer.isBuffer(requestBody)) {
          debug('request body is a buffer')
          req.write(requestBody)
        } else {
          try {
            debug('request body is a object')
            const serialized = JSON.stringify(requestBody)
            req.write(serialized)
          } catch (error) {
            reject(new ReqiError(error, requestOptions))
          }
        }
      }

      req.end()
    })

    return requestPromise
  }

  async get (options) {
    if (options && typeof options === 'string') options = { url: options }

    return this.request(options)
  }

  async head (options) {
    if (options && typeof options === 'string') options = { url: options }

    return this.request({ ...options, method: 'HEAD' })
  }

  async delete (options) {
    if (options && typeof options === 'string') options = { url: options }

    return this.request({ ...options, method: 'DELETE' })
  }

  async post (options, body = null) {
    if (options && typeof options === 'string') options = { url: options }

    return this.request({ ...options, method: 'POST' }, body)
  }

  async put (options, body = null) {
    if (options && typeof options === 'string') options = { url: options }

    return this.request({ ...options, method: 'PUT' }, body)
  }

  async patch (options, body = null) {
    if (options && typeof options === 'string') options = { url: options }

    return this.request({ ...options, method: 'PATCH' }, body)
  }
}

module.exports = ReqiClient
