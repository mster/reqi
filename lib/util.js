'use strict'

const { URL } = require('url')
const crypto = require('crypto')

const debug = require('./debug')
const ReqiError = require('./error')

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
  if (!opts || !opts.url) {
    return { ...opts, error: new ReqiError('Error: url unspecified.') }
  }

  let url = opts.url
  if (typeof opts.url === 'string') {
    try {
      url = new URL(opts.url)
    } catch (error) {
      return { ...opts, error: new ReqiError(error) }
    }
  }

  const protocol = url.protocol
  const method = opts.method || 'GET' /* defaults to GET */
  const u = opts.url
  const hostname = url.hostname
  const port = Number(url.port) || (protocol === 'https:' ? 443 : 80)
  const path = url.pathname || ''
  const headers = { ...opts.headers } || {}
  const reqCount = (opts.reqCount == null) ? { retry: 0, redirect: 0 } : opts.reqCount
  const id = opts.id || crypto.randomBytes(3).toString('hex')

  if (url.username || opts.username) {
    const user = (opts.username ? opts.username : (url.username ? url.username : ''))
    const pass = (opts.password ? opts.password : (url.password ? url.password : ''))
    const userinfo = `${user}:${pass}`
    if (user.length + pass.length > 0) {
      const base64 = Buffer.from(userinfo).toString('base64')
      headers.Authorization = `Basic ${base64}`
    }
  }

  const options = {
    ...opts,
    protocol,
    method,
    url: u,
    hostname,
    port,
    path,
    headers,
    agent: opts.agent,
    reqCount,
    id
  }

  return options
}

module.exports = {
  header,
  generateOptions
}
