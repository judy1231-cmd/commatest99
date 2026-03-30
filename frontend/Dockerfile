# ── 1단계: 빌드 ──────────────────────────────────────────────
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --silent

COPY . .
RUN npm run build

# ── 2단계: Nginx로 정적 파일 서빙 ─────────────────────────────
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# React 빌드 결과물 복사
COPY --from=builder /app/build .

# Nginx 설정 템플릿 복사 (BACKEND_URL 환경변수 주입용)
COPY nginx.conf /etc/nginx/templates/default.conf

# 엔트리포인트 스크립트 복사
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

CMD ["/docker-entrypoint.sh"]
