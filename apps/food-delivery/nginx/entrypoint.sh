#!/bin/sh
set -e
envsubst '$LB_ALGO' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'

