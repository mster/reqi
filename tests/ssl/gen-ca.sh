#!/bin/sh
set -ex

echo 01 > ca.srl

# generate CA private key.
openssl genrsa -out ca.key 2048

# generate a self signed cert for CA
openssl req -new -x509 -nodes -key ca.key -config ca.cnf -out ca.crt



