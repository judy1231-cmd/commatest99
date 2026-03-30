#!/bin/sh
# 백엔드 URL 환경변수 주입 (기본값: docker-compose용)
BACKEND="${BACKEND_URL:-http://backend:8080}"
sed "s|__BACKEND_URL__|${BACKEND}|g" /etc/nginx/templates/default.conf > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
