'use strict'
const tape = require('tape')

const { header } = require('../../lib/util')

const headers = {
  contentType: 'application/json',
  numeric: '10'
}

const noHeaders = {}

tape('header should return null if field is not present', function (t) {
  const actual = header(headers, 'unknown')
  const expected = null
  t.equal(actual, expected)
  t.end()
})

tape('header should return null if headers are not present', function (t) {
  const actual = header(noHeaders, 'unknown')
  const expected = null
  t.equal(actual, expected)
  t.end()
})

tape('header should return a header field if it is present', function (t) {
  const actual = header(headers, 'contentType')
  const expected = 'application/json'
  t.equal(actual, expected)
  t.end()
})

tape('header should return a Number if the field is numeric', function (t) {
  const actual = typeof header(headers, 'numeric')
  const expected = 'number'
  t.equal(actual, expected)
  t.end()
})
