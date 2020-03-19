'use strict'

var test = require('tape')
const ReqiError = require('../../lib/error')

const {
  header,
  generateOptions
} = require('../../lib/util')

const headers = {
  contentType: 'application/json',
  numeric: '10'
}

const noHeaders = {}

test('header should return null if field is not present', function (t) {
  const actual = header(headers, 'unknown')
  const expected = null
  t.equal(actual, expected)
  t.end()
})

test('header should return null if headers are not present', function (t) {
  const actual = header(noHeaders, 'unknown')
  const expected = null
  t.equal(actual, expected)
  t.end()
})

test('header should return a header field if it is present', function (t) {
  const actual = header(headers, 'contentType')
  const expected = 'application/json'
  t.equal(actual, expected)
  t.end()
})

test('header should return a Number if the field is numeric', function (t) {
  const actual = typeof header(headers, 'numeric')
  const expected = 'number'
  t.equal(actual, expected)
  t.end()
})

test('generateOptions should return a ReqiError if requestOptions is not present', function (t) {
  const requestOptions = {}
  const actual = generateOptions(requestOptions)
  const expected = new ReqiError('Error: options.url is required.', requestOptions)
  t.deepEqual(actual, expected)
  t.end()
})

test('generateOptions should return a ReqiError is url is not present', function (t) {
  const requestOptions = {
    contentType: 'application/json'
  }
  const actual = generateOptions(requestOptions)
  const expected = new ReqiError('Error: options.url is required.', requestOptions)
  t.deepEqual(actual, expected)
  t.end()
})

test('generateOptions should return a ReqiError if url is invalid', function (t) {
  const requestOptions = {
    url: 'googlecom'
  }
  const actual = generateOptions(requestOptions)
  const expected = new ReqiError('Error: invalid url.')
  t.deepEqual(actual, expected)
  t.end()
})

test('generateOptions should return options if given valid requestOptions and addons', function (t) {
  const requestOptions = {
    url: 'https://google.com/test'
  }
  const addons = {
    method: 'GET'
  }
  const options = {
    url: 'https://google.com/test',
    method: 'GET',
    hostname: 'google.com',
    port: '',
    path: '/test',
    protocol: 'https:'
  }

  const actual = generateOptions(requestOptions, addons)
  const expected = options
  t.deepEqual(actual, expected)
  t.end()
})