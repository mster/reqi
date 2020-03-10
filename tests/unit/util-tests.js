'use strict'

var test = require('tape')
var debug = require('../../lib/debug')
const ReqiError = require('../../lib/error')

const {
  header,
  generateOptions
} = require('../../lib/util')

const headers = {
  contentType: 'application/json',
  numeric: '10'
}

test('header should return null if field is not present', function (t) {
  t.equal(header(headers, 'unknown'), null)
  t.end()
})

test('header should return null if headers are not present', function (t) {
  const noHeaders = {}
  t.equal(header(noHeaders, 'unknown'), null)
  t.end()
})

test('header should return a header field if it is present', function (t) {
  t.equal(header(headers, 'contentType'), 'application/json')
  t.end()
})

test('header should return a Number if the field is numeric', function (t) {
  t.equal(typeof header(headers, 'numeric'), 'number')
  t.end()
})
