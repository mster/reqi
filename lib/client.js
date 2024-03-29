'use strict'

const ReqiError = require('./error')
const debug = require('./debug')

const { URL } = require('url')
const http = require('http')
const https = require('https')

const {
  header,
  generateOptions
} = require('./util')

class ReqiClient {
  /**
   * @param {object} initOptions The clientOptions object
   */
  constructor (initOptions) {
    /* default options */
    this.defaults = {
      redirect: false,
      retry: false,
      retryCodes: [],
      maxWait: 3, // seconds
      json: false
    }

    this.clientOptions = { ...this.defaults, ...initOptions }
  }

  /**
   * @description Send an HTTP/HTTPS request.
   * @param {object} options The requestOptions object
   * @param {object} requestBody Request payload
   */
  request (options, requestBody = null) {
    const self = this

    const requestPromise = new Promise((resolve, reject) => {
      this.aborted = false
      const requestOptions = generateOptions(options)

      if (requestOptions.error) {
        reject(requestOptions)
        return
      }

      function followRedirect (location) {
        debug(`following redirect to ${location}`)
        requestOptions.url = location
        resolve(self.request(requestOptions))
      }

      function attemptRetry (retryAfter) {
        if (retryAfter) {
          const waitMS = retryAfter * 1000 /* seconds to ms */
          debug('retrying request after wait period', waitMS)

          /* queue retry to event loop */
          setTimeout(function queueRequest () {
            debug('retry wait complete')
            resolve(self.request(requestOptions, requestBody))
          }, waitMS)
        } else {
          debug('retrying request now')
          resolve(self.request(requestOptions, requestBody))
        }
      }

      function parseBody (body) {
        debug('attempting to parse payload body')
        try {
          const parsed = JSON.parse(body)
          return parsed
        } catch (error) {
          reject(new ReqiError(error))
        }
      }

      function clientOptsCheck (opts) {
        debug('verifying client state')
        const redirect = opts.redirect
        const retry = opts.retry
        let retryCodes = opts.retryCodes
        const maxWait = opts.maxWait
        const json = opts.json

        if (typeof retryCodes === 'number') retryCodes = [retryCodes]
        if (retryCodes.constructor.name === 'Array') {
          for (const code of retryCodes) {
            if (typeof code !== 'number') return false
          }
        }
        self.clientOptions.retryCodes = retryCodes

        return (typeof redirect === 'boolean' || typeof redirect === 'number') &&
          (typeof retry === 'boolean' || typeof retry === 'number') &&
          retryCodes.constructor.name === 'Array' &&
          typeof maxWait === 'number' &&
          typeof json === 'boolean'
      }

      if (!clientOptsCheck(this.clientOptions)) {
        reject(new ReqiError('Error: client options contain invalid input'))
        return
      }

      const transport = requestOptions.protocol.includes('https:') ? https : http

      debug('making request')
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
            return
          }

          /* redirect */
          const { redirect } = self.clientOptions
          const doRedirect = statusCode >= 300 && statusCode < 400 && ((typeof redirect === 'boolean' && redirect) || redirect > requestOptions.reqCount.redirect)

          if (doRedirect) {
            requestOptions.reqCount.redirect++
            followRedirect(header(res.headers, 'location'))
            return
          }

          /* retry */
          const { retryCodes, retry, maxWait } = self.clientOptions
          const retryAfter = header(headers, 'retry-after')
          const doRetry = retryCodes.includes(statusCode) && ((typeof retry === 'boolean' && retry) || retry > requestOptions.reqCount.retry) && maxWait >= retryAfter

          if (doRetry) {
            requestOptions.reqCount.retry++
            attemptRetry(header(res.headers, 'retry-after'))
            return
          }

          /* parse body */
          const { json } = self.clientOptions
          const contentType = header(res.headers, 'content-type')
          const doParse = json && contentType && contentType.includes('application/json')

          if (doParse) {
            responseBody = parseBody(responseBody)
          }

          const response = {
            statusCode,
            headers,
            body: responseBody,
            requestOptions
          }

          debug('resolving with payload')
          resolve(response)
        })
      })

      /* @brycebaril:client-request */
      let timeouts
      if (requestOptions.timeout) {
        timeouts = setTimeout(function requestTimedOut () {
          debug('request timed out')
          req.abort()
        }, requestOptions.timeout)

        req.setTimeout(requestOptions.timeout, function socketTimedOut () {
          debug('socket timed out')
          req.abort()
        })
      }

      /* retain original abort fn */
      const originalAbort = req.abort
      req.abort = function abort () {
        /* return early if we already called abort */
        if (this.aborted) return

        debug('aborting request')

        clearTimeout(timeouts)
        this.aborted = true
        originalAbort.call(this)
      }

      req.once('error', function onceError (error) {
        debug('request error encountered')
        reject(new ReqiError(error))
      })

      req.once('timeout', function onceTimeout () {
        debug('request has timedout, calling abort')
        this.abort()
      })

      req.once('abort', function onceAbort () {
        debug('request has been aborted, calling abort')
        this.abort()
      })

      /* favor parameter payload over options body */
      if (requestBody == null) {
        requestBody = requestOptions.body
      }

      if (requestBody != null) {
        /* stream body */
        if (requestBody.pipe != null && (typeof requestBody.pipe === 'function')) {
          debug('request body is a stream')
          requestBody.pipe(req)

          /* string / buffer body */
        } else if (Buffer.isBuffer(requestBody) || typeof requestBody === 'string') {
          debug('request body is a buffer')
          req.write(requestBody)
        } else {
          /* object body */
          try {
            debug('request body is a object')
            const serialized = JSON.stringify(requestBody)
            req.write(serialized)
          } catch (error) {
            reject(new ReqiError(error, requestOptions))
            return
          }
        }
      }

      if (requestOptions.timeout) clearTimeout(timeouts)

      req.end()
    })

    return requestPromise
  }

  /**
   * @description Send a GET request
   * @param {object} options requestOptions object
   */
  async get (options) {
    return this.request(options)
  }

  /**
   * @description Send a HEAD request
   * @param {object} options requestOptions object
   */
  async head (options) {
    if (options && (typeof options === 'string' || options instanceof URL)) options = { url: options }

    return this.request({ ...options, method: 'HEAD' })
  }

  /**
   * @description Send a DELETE request
   * @param {object} options requestOptions object
   */
  async delete (options) {
    if (options && (typeof options === 'string' || options instanceof URL)) options = { url: options }

    return this.request({ ...options, method: 'DELETE' })
  }

  /**
   * @description Send a POST request
   * @param {object} options requestOptions object
   * @param {object} body Request payload
   */
  async post (options, body = null) {
    if (options && (typeof options === 'string' || options instanceof URL)) options = { url: options }

    return this.request({ ...options, method: 'POST' }, body)
  }

  /**
   * @description Send a PUT request
   * @param {object} options requestOptions object
   * @param {object} body Request payload
   */
  async put (options, body = null) {
    if (options && (typeof options === 'string' || options instanceof URL)) options = { url: options }

    return this.request({ ...options, method: 'PUT' }, body)
  }

  /**
   * @description Send a PATCH request
   * @param {object} options requestOptions object
   * @param {object} body Request payload
   */
  async patch (options, body = null) {
    if (options && (typeof options === 'string' || options instanceof URL)) options = { url: options }

    return this.request({ ...options, method: 'PATCH' }, body)
  }
}

module.exports = ReqiClient
