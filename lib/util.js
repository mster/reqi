'use strict'

const { URL } = require('url')
const crypto = require('crypto')
const http = require('http')
const https = require('https')

const debug = require('./debug')
const ReqiError = require('./error')

const SUPPORTED_HTTP_OPTS = [
  'agent',
  'auth',
  'createConnection',
  'defaultPort',
  'family',
  'headers',
  'insecureHTTPParser',
  'localAddress',
  'lookup',
  'maxHeaderSize',
  'protocol',
  'setHost',
  'socketPath',
  'timeout'
]
const SUPPORTED_HTTPS_OPTS = [
  'ca',
  'cert',
  'ciphers',
  'clientCertEngine',
  'crl',
  'dhparam',
  'ecdhCurve',
  'honorCipherOrder',
  'key',
  'passphrase',
  'pfx',
  'rejectUnauthorized',
  'secureOptions',
  'secureProtocol',
  'servername',
  'sessionIdContext'
]
const SUPPORTED_AGENT_OPTS = [
  'keepAlive',
  'keepAliveMsecs',
  'maxSockets',
  'maxFreeSockets',
  'timeout'
]

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
  // check if opts is string or URL
  if (opts && (typeof opts === 'string' || opts instanceof URL)) {
    opts = { url: opts }
  }

  // check if opts is usable
  if (!opts || !opts.url) {
    return new ReqiError('Error: Invalid or undefined url.', opts)
  }

  // prepare url
  let url
  try {
    url = new URL(opts.url)
  } catch (error) {
    return new ReqiError(error)
  }

  const reqCount = (opts.reqCount == null) ? { retry: 0, redirect: 0 } : opts.reqCount
  const id = opts.id || crypto.randomBytes(3).toString('hex')

  const headers = { ...opts.headers } || {}

  if (url.username || opts.username) {
    const user = (opts.username ? opts.username : (url.username ? url.username : ''))
    const pass = (opts.password ? opts.password : (url.password ? url.password : ''))
    const userinfo = `${user}:${pass}`
    if (user.length + pass.length > 0) {
      const base64 = Buffer.from(userinfo).toString('base64')
      headers.Authorization = `Basic ${base64}`
    }
  }

  const protocol = url.protocol
  const transport = protocol.includes('https:') ? https : http
  const agent = (opts.agent == null ? new transport.Agent() : opts.agent)

  if (agent !== false && agent !== undefined && !(agent instanceof transport.Agent)) {
    return new ReqiError('The "options.agent" property must be one of type Agent-like Object, undefined, or false.')
  }

  const options = {
    protocol,
    method: (opts.method || 'GET'),
    url: opts.url,
    hostname: url.hostname,
    port: (Number(url.port) || (protocol === 'https:' ? 443 : 80)),
    path: (url.pathname || ''),
    headers,
    agent,
    reqCount,
    id
  }

  for (const key of SUPPORTED_HTTP_OPTS) {
    if (opts[key]) options[key] = opts[key]
  }

  if (protocol === 'https:') {
    for (const key of SUPPORTED_HTTPS_OPTS) {
      if (opts[key]) options[key] = opts[key]
    }
  }

  for (const key of SUPPORTED_AGENT_OPTS) {
    if (opts[key]) options.agent.options[key] = opts[key]
  }

  return options
}

module.exports = {
  header,
  generateOptions
}
