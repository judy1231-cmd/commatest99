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

# Nginx 설정 복사 (SPA 라우팅 + API 프록시)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
