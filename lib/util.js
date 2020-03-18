'use strict'

const debug = require('./debug')
const ReqiError = require('./error')
const { URL } = require('url')

function header (headers, field) {
  if (!headers || !headers[field]) {
    debug(`'${field}' field or headers not found.`)
    return null
  }

  if (headers[field] == +headers[field]) { // eslint-disable-line eqeqeq
    return Number(headers[field])
  }

  return headers[field]
}

function generateOptions (opts) {
  if (!opts.url) {
    return { ...opts, error: new ReqiError('Error: url unspecified.') }
  }

  let url
  try {
    url = new URL(opts.url)
  } catch (error) {
    return { ...opts, error: new ReqiError(error) }
  }

  const protocol = url.protocol
  const method = opts.method || 'GET' /* defaults to GET request */
  const u = opts.url
  const host = url.host
  const port = Number(url.port) || (protocol === 'https:' ? 443 : 80)
  const path = url.pathname || ''
  const headers = { ...opts.headers } || {}
  const reqCount = (opts.reqCount == null) ? { retry: 0, redirect: 0 } : opts.reqCount
  const id = 1

  const options = {
    protocol,
    method,
    url: u,
    host,
    port,
    path,
    headers,
    agent: opts.agent,
    reqCount,
    id
  }

  debug(options)

  return options
}

module.exports = {
  header,
  generateOptions
}
