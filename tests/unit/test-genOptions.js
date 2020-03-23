'use strict'

const tape = require('tape')
const ReqiError = require('../../lib/error')

const { generateOptions } = require('../../lib/util')

tape('generateOptions should return a ReqiError if requestOptions is not present', function (t) {
  const requestOptions = {}
  const actual = generateOptions(requestOptions)
  const expected = { error: new ReqiError('Error: url unspecified.') }
  t.deepEqual(actual, expected)
  t.end()
})

tape('generateOptions should return a ReqiError is url is not present', function (t) {
  const requestOptions = {
    contentType: 'application/json'
  }
  const actual = generateOptions(requestOptions)
  const expected = { ...requestOptions, error: new ReqiError('Error: url unspecified.') }
  t.deepEqual(actual, expected)
  t.end()
})

tape('generateOptions should return a ReqiError if url is invalid', function (t) {
  const requestOptions = {
    url: 'googlecom'
  }
  const actual = generateOptions(requestOptions)
  const expected = { ...requestOptions, error: new ReqiError('TypeError [ERR_INVALID_URL]: Invalid URL: googlecom') }
  t.deepEqual(actual, expected)
  t.end()
})

tape('generateOptions should return options if given valid requestOptions and addons', function (t) {
  const requestOptions = {
    url: 'https://google.com/test'
  }
  const addons = {
    method: 'GET'
  }
  const options = {
    protocol: 'https:',
    method: 'GET',
    url: 'https://google.com/test',
    hostname: 'google.com',
    port: 443,
    path: '/test',
    headers: {},
    agent: undefined,
    reqCount: { retry: 0, redirect: 0 },
    id: 1
  }

  const actual = generateOptions(requestOptions, addons)
  const expected = options
  t.deepEqual(actual, expected)
  t.end()
})