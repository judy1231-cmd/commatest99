# 쉼표(,) 프로젝트 — Google Cloud 배포 가이드

> 작성일: 2026-03-23
> 목표: Google Cloud Run (백엔드) + Firebase Hosting (프론트엔드) + Cloud SQL (MySQL) + Upstash Redis

---

## 전체 배포 구조

```
[사용자 브라우저]
       │
       ├── https://comma.web.app (프론트엔드)
       │         Firebase Hosting
       │         React 빌드 정적 파일 서빙
       │
       └── https://comma-backend-xxxx.run.app (백엔드)
                 Google Cloud Run
                 Spring Boot Docker 컨테이너
                       │
                       ├── Cloud SQL (MySQL) — DB
                       ├── Upstash Redis    — Refresh Token
                       └── Cloud Storage    — 파일 업로드
```

---

## 사전 준비 (딱 한 번만)

### 1. Google Cloud 계정 & 프로젝트

1. [console.cloud.google.com](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 → 프로젝트 ID 기록 (예: `comma-project-2026`)
3. 결제 계정 연결 (Cloud Run 무료 티어 있음, Cloud SQL은 유료)

### 2. gcloud CLI 설치 (맥북 기준)

```bash
# Homebrew로 설치
brew install --cask google-cloud-sdk

# 설치 확인
gcloud --version

# 로그인
gcloud auth login

# 프로젝트 설정 (본인 프로젝트 ID로)
gcloud config set project comma-project-2026
```

### 3. 필요한 API 활성화

```bash
gcloud services enable \
  run.googleapis.com \
  sql-component.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com
```

> 실행 후 1~2분 기다리면 활성화됨

---

## STEP 1 — Cloud SQL (MySQL) 생성

### 콘솔에서 생성 (추천)

1. GCP 콘솔 → **SQL** → **인스턴스 만들기** → **MySQL** 선택
2. 설정:
   ```
   인스턴스 ID: comma-mysql
   비밀번호: 강력한 비밀번호 (기록해두기)
   데이터베이스 버전: MySQL 8.0
   리전: asia-northeast3 (서울)
   가용성: 단일 영역 (개발/발표용, 저렴함)
   머신 유형: Shared core → 1 vCPU, 0.614 GB (가장 저렴)
   스토리지: 10GB SSD
   ```
3. **만들기** 클릭 → 생성까지 5~10분 소요

### 데이터베이스 & 사용자 생성

```bash
# 인스턴스 접속
gcloud sql connect comma-mysql --user=root --quiet

# MySQL 프롬프트에서 실행
CREATE DATABASE comma_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'commauser'@'%' IDENTIFIED BY '비밀번호_설정';
GRANT ALL PRIVILEGES ON comma_db.* TO 'commauser'@'%';
FLUSH PRIVILEGES;
EXIT;
```

### DDL 실행 (테이블 생성)

```bash
# 로컬에서 쉼표_DDL.sql 실행
gcloud sql connect comma-mysql --user=root --quiet < 쉼표_DDL.sql
```

### 인스턴스 연결 이름 확인 (나중에 필요)

```bash
gcloud sql instances describe comma-mysql --format="value(connectionName)"
# 출력 예: comma-project-2026:asia-northeast3:comma-mysql
# 이 값을 INSTANCE_CONNECTION_NAME으로 사용
```

---

## STEP 2 — Upstash Redis 생성 (무료, 5분)

> Cloud Run은 VPC 없이 외부 Redis를 쓰는 게 훨씬 쉽다.
> Upstash는 무료 플랜으로 충분하다 (10,000 req/day).

1. [console.upstash.com](https://console.upstash.com) 접속 → Google 계정으로 가입
2. **Create Database** → 이름: `comma-redis` → Region: `ap-northeast-1 (Tokyo)` → **Create**
3. 생성된 DB에서 **Endpoint** 복사 (예: `us1-xxx.upstash.io`)
4. **Password** 복사

> ⚠️ Upstash Redis는 기본 포트가 6379지만 TLS 포트 6380을 쓴다.
> application-prod.yml의 redis 설정을 아래처럼 수정해야 한다:

```yaml
# application-prod.yml에 추가 수정
spring:
  data:
    redis:
      host: ${REDIS_HOST}      # Upstash Endpoint
      port: 6380               # Upstash TLS 포트
      password: ${REDIS_PASSWORD}
      ssl:
        enabled: true
```

---

## STEP 3 — Cloud Storage 버킷 생성 (파일 업로드)

```bash
# 버킷 생성 (이름은 전 세계 유일해야 함)
gsutil mb -l asia-northeast3 gs://comma-uploads-2026

# 공개 읽기 허용 (업로드된 이미지를 누구나 볼 수 있게)
gsutil iam ch allUsers:objectViewer gs://comma-uploads-2026
```

> 현재 프로젝트는 로컬 파일 시스템(/uploads)에 저장한다.
> Cloud Run은 재시작 시 파일이 사라지기 때문에 Cloud Storage로 마이그레이션 필요.
> 발표용이라면 이 단계는 생략해도 됨.

---

## STEP 4 — 백엔드 Cloud Run 배포

### 방법 A: 소스 코드에서 직접 배포 (가장 쉬움)

```bash
cd /Users/joymin/Desktop/파이널/commatest99/backend

gcloud run deploy comma-backend \
  --source . \
  --region asia-northeast3 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080
```

> `--source .` 옵션: 소스코드를 Cloud Build로 자동 빌드 후 배포
> Dockerfile이 있으면 자동으로 사용함

### 환경변수 설정 (핵심!)

배포 후 Cloud Run 콘솔에서 **환경변수** 탭에 아래 값들을 설정한다:

```
INSTANCE_CONNECTION_NAME = comma-project-2026:asia-northeast3:comma-mysql
DB_NAME                  = comma_db
DB_USERNAME              = commauser
DB_PASSWORD              = (Cloud SQL에서 설정한 비밀번호)

REDIS_HOST               = (Upstash Endpoint, 예: us1-xxx.upstash.io)
REDIS_PASSWORD           = (Upstash Password)

JWT_SECRET               = (32자 이상 랜덤 문자열, 예: openssl rand -base64 32 로 생성)

MAIL_USERNAME            = (Gmail 주소)
MAIL_PASSWORD            = (Gmail 앱 비밀번호)

CLAUDE_API_KEY           = (Anthropic API 키)

KAKAO_CLIENT_ID          = (카카오 REST API 키)
KAKAO_CLIENT_SECRET      = (카카오 Client Secret)
GOOGLE_CLIENT_ID         = (구글 OAuth 클라이언트 ID)
GOOGLE_CLIENT_SECRET     = (구글 OAuth 클라이언트 Secret)

APP_BASE_URL             = https://comma-backend-xxxx.run.app
APP_FRONT_URL            = https://comma.web.app
```

> JWT_SECRET 생성:
> ```bash
> openssl rand -base64 32
> # 출력 예: 8J7mK2xP9vL4nQ1rT6wY3zA5bC0dE8fG
> ```

### Cloud SQL 연결 권한 부여

```bash
# Cloud Run 서비스 계정에 Cloud SQL 접근 권한 부여
PROJECT_ID=$(gcloud config get-value project)
SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/cloudsql.client"
```

### Cloud Run에서 Cloud SQL 연결 추가

```bash
gcloud run services update comma-backend \
  --region asia-northeast3 \
  --add-cloudsql-instances comma-project-2026:asia-northeast3:comma-mysql
```

### 배포 확인

```bash
# 배포된 URL 확인
gcloud run services describe comma-backend \
  --region asia-northeast3 \
  --format="value(status.url)"

# 헬스체크
curl https://comma-backend-xxxx.run.app/api/rest-types
# {"success":true,"data":[...],"message":"조회 성공"} 가 나오면 성공
```

---

## STEP 5 — 프론트엔드 Firebase Hosting 배포

### Firebase CLI 설치

```bash
npm install -g firebase-tools

# Firebase 로그인 (Google 계정)
firebase login

# 프로젝트 초기화
cd /Users/joymin/Desktop/파이널/commatest99/frontend
firebase init hosting
```

`firebase init hosting` 실행 시 선택:
```
? Which Firebase project? → comma-project-2026 선택 (또는 새 프로젝트)
? What do you want to use as your public directory? → build
? Configure as a single-page app? → Yes (중요! React Router 때문)
? Set up automatic builds with GitHub? → No
? File build/index.html already exists. Overwrite? → No
```

### 백엔드 URL 환경변수 설정

```bash
# .env.production 파일 생성
echo "REACT_APP_API_URL=https://comma-backend-xxxx.run.app" > .env.production
```

> ⚠️ 현재 코드는 fetch('/api/...') 상대경로를 쓴다.
> 프론트가 Firebase Hosting이면 백엔드가 다른 도메인이라서
> 절대경로로 바꾸거나 Firebase Hosting의 리라이트 규칙을 써야 한다.

**방법: firebase.json 리라이트 규칙 (추천)**

```json
// firebase.json
{
  "hosting": {
    "public": "build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "comma-backend",
          "region": "asia-northeast3"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

> 이 설정으로 `/api/**` 요청을 Cloud Run으로 자동 프록시한다.
> fetch('/api/auth/login') 코드 수정 없이 그대로 동작한다.

### 빌드 & 배포

```bash
cd /Users/joymin/Desktop/파이널/commatest99/frontend

# React 프로덕션 빌드
npm run build

# Firebase 배포
firebase deploy --only hosting
```

배포 완료 후:
```
Hosting URL: https://comma-project-2026.web.app
```

---

## STEP 6 — 배포 후 필수 설정 변경

### 6-1. CORS 도메인 추가

```java
// backend/src/main/java/com/comma/global/config/CorsConfig.java
.allowedOrigins(
    "http://localhost:3000",
    "http://localhost:5173",
    "https://comma-project-2026.web.app",   // ← 추가
    "https://comma-project-2026.firebaseapp.com" // ← 추가
)
```

변경 후 재배포:
```bash
cd backend
gcloud run deploy comma-backend --source . --region asia-northeast3
```

### 6-2. 카카오 소셜 로그인 콜백 URL 변경

1. [developers.kakao.com](https://developers.kakao.com) → 내 애플리케이션
2. **앱 설정** → **플랫폼** → **Web** → 사이트 도메인에 추가:
   ```
   https://comma-project-2026.web.app
   ```
3. **카카오 로그인** → **Redirect URI** 추가:
   ```
   https://comma-backend-xxxx.run.app/api/auth/kakao/callback
   ```

### 6-3. 구글 소셜 로그인 콜백 URL 변경

1. [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services** → **사용자 인증 정보**
2. OAuth 2.0 클라이언트 ID 클릭
3. **승인된 리디렉션 URI** 추가:
   ```
   https://comma-backend-xxxx.run.app/api/auth/google/callback
   ```

### 6-4. 이메일 인증 링크 확인

`application-prod.yml`의 `APP_BASE_URL`이 Cloud Run URL로 설정돼 있으면 자동으로 올바른 링크가 생성된다.

---

## STEP 7 — 최종 확인 체크리스트

```
□ Cloud SQL 접속 → 테이블 27개 생성됨
□ Seed 데이터 입력됨 (rest_types 7개, badges 5개, survey_questions 12개)
□ 백엔드 헬스체크: GET /api/rest-types → 200 OK
□ 회원가입 → 이메일 인증 메일 수신
□ 로그인 → localStorage에 accessToken 저장됨
□ 카카오 로그인 → 콜백 URL 정상 작동
□ 장소 목록 → 지도에 핀 표시
□ 관리자 로그인 (admin@comma.com / Admin@1234)
□ 휴식 기록 등록 → 월간 통계 반영
```

---

## 비용 예상 (월간)

| 서비스 | 스펙 | 예상 비용 |
|--------|------|-------:|
| Cloud Run | 무료 티어 (200만 req/월) | **$0** |
| Cloud SQL | Shared core, 10GB | **$7~15** |
| Firebase Hosting | 무료 티어 (1GB/월) | **$0** |
| Upstash Redis | 무료 티어 | **$0** |
| Cloud Storage | 무료 티어 (5GB) | **$0** |
| **합계** | | **$7~15/월** |

> 발표 후 바로 Cloud SQL 인스턴스를 **중지**하면 스토리지 비용만 발생 (~$1/월).
> 완전히 끄려면 인스턴스 **삭제**.

---

## 자주 발생하는 오류

### 오류 1: Cloud SQL 연결 실패
```
com.zaxxer.hikari.pool.HikariPool - Exception during pool initialization
```
**해결:** Cloud Run 서비스에 Cloud SQL 인스턴스가 연결됐는지 확인
```bash
gcloud run services describe comma-backend --region asia-northeast3 | grep cloudsql
```

### 오류 2: 환경변수 누락
```
java.lang.IllegalStateException: Could not resolve placeholder 'JWT_SECRET'
```
**해결:** Cloud Run 콘솔 → 서비스 → 편집 → 환경변수 탭에서 누락된 값 추가

### 오류 3: CORS 오류 (브라우저 콘솔)
```
Access to fetch at 'https://...' has been blocked by CORS policy
```
**해결:** CorsConfig.java에 프론트 도메인 추가 후 재배포

### 오류 4: 소셜 로그인 redirect_uri_mismatch
```
Error 400: redirect_uri_mismatch
```
**해결:** 카카오/구글 개발자 콘솔에서 콜백 URL을 배포 도메인으로 업데이트

### 오류 5: Redis SSL 연결 오류 (Upstash)
```
io.lettuce.core.RedisConnectionException: Unable to connect to localhost:6379
```
**해결:** application-prod.yml에 ssl.enabled: true와 port: 6380 설정 확인

---

## 재배포 방법 (코드 수정 후)

```bash
# 백엔드만 수정했을 때
cd /Users/joymin/Desktop/파이널/commatest99/backend
gcloud run deploy comma-backend --source . --region asia-northeast3

# 프론트만 수정했을 때
cd /Users/joymin/Desktop/파이널/commatest99/frontend
npm run build
firebase deploy --only hosting

# 둘 다 수정했을 때 → 순서대로 실행
```

---

*관련 파일: `코드_설계_이유.md`, `backend/Dockerfile`, `frontend/Dockerfile`, `application-prod.yml`*
