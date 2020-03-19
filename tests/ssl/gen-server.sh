#!/bin/sh
set -ex

openssl genrsa -out server.key 2048

openssl req -new -key server.key -config server.cnf -out server.csr

openssl x509 -req \
  -in server.csr \
  -CA ca.crt \
  -CAkey ca.key \
  -out server.crt \
  -days 3650