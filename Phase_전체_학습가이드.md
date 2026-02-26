# 쉼표(,) 프로젝트 — Phase 0 ~ Phase 6 전체 학습 가이드

> 이 파일은 Phase별 작업 흐름을 **처음 배우는 사람도 이해할 수 있도록**
> 각 단계마다 "왜 하는가", "무엇을 하는가", "어떻게 하는가"를 설명한다.

---

## 전체 흐름 한눈에 보기

```
Phase 0  →  프론트엔드 UI 기반 정리 (색상/공통 컴포넌트/라우트)
Phase 1  →  백엔드 기반 세팅 (JWT + BCrypt + Redis + DB — Spring Security 미사용)
Phase 2  →  인증 기능 (회원가입, 로그인, 소셜로그인, 이메일 인증)
Phase 3  →  진단 기능 (설문 테스트 + 심박수 측정 → 휴식 유형 도출)
Phase 4  →  장소 / 휴식 기록 (카카오맵, 추천 로그, 장소 CRUD)
Phase 5  →  통계 / 마이페이지 / 알림 (월간 통계, 배지, 설정)
Phase 6  →  관리자 / 배포 (관리자 API, AWS EC2+RDS+S3, HTTPS)
```

---

## Phase 0 — 프론트엔드 UI 기반 정리 ✅ 완료

### 목적
> 화면마다 제각각인 색상, 버튼 스타일, 배경색을 **통일**하고
> 공통으로 쓸 컴포넌트를 미리 만들어두는 단계.
> 집을 지을 때 기초 공사와 같다.

### 작업 목록

#### 1. 디자인 토큰 통일 (Tailwind 설정)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#10b981',          // 브랜드 초록색 — 버튼, 강조에 사용
        'soft-mint': '#ECFDF5',      // 연한 민트 — 배경, 카드 강조
        'text-main': '#334155',      // 본문 텍스트
        'text-muted': '#64748B',     // 보조 텍스트 (설명, 날짜 등)
        'background-light': '#F9F9F7', // 전체 페이지 배경
      }
    }
  }
}
```

> **주석:**
> - `primary` 색상을 한 곳에서 정의해두면 나중에 색상 변경 시 한 줄만 수정하면 됨
> - Tailwind의 `extend`는 기본 색상을 유지하면서 내 색상을 추가하는 옵션
> - `bg-primary`, `text-primary` 같은 클래스로 어디서든 사용 가능

#### 2. 공통 컴포넌트 생성

**Button.jsx** — 3가지 스타일 (primary / outline / ghost)
```jsx
// frontend/src/components/common/Button.jsx
// props로 variant를 받아서 스타일을 분기하는 재사용 컴포넌트
// 사용 예: <Button variant="primary" onClick={handleLogin}>로그인</Button>
```

**Card.jsx** — 정보를 담는 흰색 박스
```jsx
// frontend/src/components/common/Card.jsx
// 카드 스타일: bg-white rounded-2xl shadow-sm border border-gray-100 p-6
```

**Input.jsx** — 폼 입력 필드
```jsx
// frontend/src/components/common/Input.jsx
// h-12 px-4 rounded-xl border — 포커스 시 초록 테두리
```

**Toast.jsx** — 알림 메시지 (성공/실패/경고)
```jsx
// frontend/src/components/common/Toast.jsx
// 화면 우측 상단에 3초간 표시 후 자동 사라짐
```

> **주석:**
> - 공통 컴포넌트를 만들면 각 페이지에서 동일한 HTML을 반복 작성하지 않아도 됨
> - 버튼 스타일 바꾸고 싶을 때 Button.jsx 하나만 수정하면 전체 반영
> - `variant` props 패턴은 React에서 가장 많이 쓰는 컴포넌트 설계 방식

#### 3. 라우트 가드 (비로그인 접근 차단)

```jsx
// frontend/src/components/common/PrivateRoute.jsx
// localStorage에 token이 없으면 /login으로 리다이렉트
// <Route path="/my" element={<PrivateRoute><MyPage /></PrivateRoute>} />
```

> **주석:**
> - 로그인 없이 마이페이지, 기록 페이지에 접근하면 안 됨
> - token을 localStorage에서 꺼내서 있으면 통과, 없으면 로그인 페이지로 보냄
> - React Router v6의 `<Navigate>` 컴포넌트를 사용해 리다이렉트

#### 4. 404 페이지 & 빈 화면 처리

```jsx
// 없는 주소로 접근하면 보여줄 페이지
// App.jsx의 Routes 마지막에 <Route path="*" element={<NotFound />} /> 추가
```

---

## Phase 1 — 백엔드 기반 세팅 ✅ 완료

### 목적
> Spring Boot 프로젝트에 JWT, BCrypt(비밀번호 암호화), Redis, 이메일, DB 연결을
> **한 번에 세팅**하는 단계. 인증 기능을 만들기 전에 필수.
> ⚠️ **Spring Security는 사용하지 않는다** — 대신 HandlerInterceptor로 직접 인증 처리

### 작업 목록

#### 1. build.gradle 의존성 추가

```gradle
// backend/build.gradle
dependencies {
    // Spring Boot Web (REST API)
    implementation 'org.springframework.boot:spring-boot-starter-web'

    // JWT 토큰 생성/검증
    implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.11.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.11.5'

    // BCrypt 비밀번호 암호화 (Spring Security 없이 독립 사용)
    implementation 'org.mindrot:jbcrypt:0.4'

    // 이메일 발송 (비밀번호 재설정, 이메일 인증)
    implementation 'org.springframework.boot:spring-boot-starter-mail'

    // Redis (리프레시 토큰 저장소)
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'

    // MyBatis (DB 쿼리)
    implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.3'

    // MySQL 드라이버
    runtimeOnly 'com.mysql:mysql-connector-j'

    // Lombok
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
}
```

> **주석:**
> - `implementation` = 컴파일 + 런타임 모두 필요한 라이브러리
> - `runtimeOnly` = 실행할 때만 필요 (jjwt-impl은 내부 구현체라 런타임만)
> - `jbcrypt` = 비밀번호 BCrypt 암호화 전용 라이브러리. Spring Security 없이도 사용 가능
> - 의존성 추가 후 반드시 Gradle Reload (또는 `./gradlew build`)

#### 2. MySQL DDL 실행 (schema.sql)

```sql
-- backend/src/main/resources/schema.sql
-- 이 파일의 CREATE TABLE 문을 MySQL Workbench에서 실행

-- 핵심 테이블 순서 (외래키 때문에 순서 중요)
-- 1. users
-- 2. auth_provider, password_reset_token, email_verification
-- 3. heart_rate_measurements, survey_questions ...
-- 4. places, recommendations, rest_logs ...
```

> **주석:**
> - DDL(Data Definition Language) = 테이블 구조를 만드는 SQL
> - 외래키가 있는 테이블은 참조 대상 테이블보다 나중에 만들어야 함
> - schema.sql을 한 번 실행해두면 이후 Java 코드에서 INSERT/SELECT 가능

#### 3. CorsConfig.java 생성 (CORS 설정)

```java
// backend/src/main/java/com/comma/config/CorsConfig.java
// 프론트엔드(3000포트)에서 백엔드(8080포트)로 API 호출을 허용하는 설정
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")  // 프론트 주소 허용
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

> **주석:**
> - CORS = 브라우저가 다른 포트(3000 → 8080) 요청을 기본으로 막음 → 명시적으로 허용해야 함
> - `allowedOrigins` = 허용할 프론트 주소. 배포 시 실제 도메인으로 변경
> - `OPTIONS` 메서드 허용 필수 = 브라우저가 본 요청 전에 OPTIONS로 먼저 확인함

#### 4. JwtUtil.java 생성

```java
// backend/src/main/java/com/comma/config/JwtUtil.java
// JWT 토큰 관련 유틸리티
// - generateAccessToken(쉼표번호, role): 액세스 토큰 생성 (만료: 30분)
// - generateRefreshToken(쉼표번호): 리프레시 토큰 생성 (만료: 14일)
// - isTokenValid(token): 토큰 유효성 검사 (true/false)
// - extract쉼표번호(token): 토큰에서 쉼표번호 꺼내기
// - extractRole(token): 토큰에서 role 꺼내기
```

> **주석:**
> - JWT = JSON Web Token. 사용자 정보를 암호화해서 토큰으로 만든 것
> - 토큰 구조: Header.Payload.Signature (점으로 구분)
> - Payload에 쉼표번호, role, 만료시간 저장 → 서버에서 꺼내서 사용자 식별
> - 리프레시 토큰은 Redis에 저장 → 액세스 토큰 만료 시 재발급에 사용

#### 5. JwtInterceptor.java 생성 (Spring Security 대신 사용)

```java
// backend/src/main/java/com/comma/config/JwtInterceptor.java
// HandlerInterceptor 기반 JWT 인증 처리
// Spring Security 없이 순수 Spring MVC로 인증 구현
//
// 동작 순서:
// 1. OPTIONS 요청(CORS preflight)은 무조건 통과
// 2. 공개 경로(/api/auth/**, /api/places/** 등)는 토큰 없이 통과
// 3. Authorization 헤더에서 "Bearer 토큰" 추출
// 4. 토큰 유효성 검사 → 실패 시 401 응답
// 5. /api/admin/** 경로는 role=ADMIN 추가 확인 → 실패 시 403 응답
// 6. request.setAttribute("쉼표번호", 쉼표번호) 저장
//    → 이후 컨트롤러에서 (String) request.getAttribute("쉼표번호") 로 사용
```

> **주석:**
> - HandlerInterceptor = 컨트롤러 실행 전에 먼저 실행되는 코드 (Spring MVC 순수 기능)
> - Spring Security의 Filter와 비슷하지만 Spring MVC 레이어에서 동작
> - `request.setAttribute()` = 이 요청 안에서만 공유되는 임시 저장소
> - **Spring Security를 쓰지 않으므로** `SecurityContextHolder` 같은 개념 없음

#### 6. WebConfig.java 생성 (인터셉터 등록)

```java
// backend/src/main/java/com/comma/config/WebConfig.java
// JwtInterceptor를 Spring MVC에 등록하는 설정
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/api/**");  // /api/** 경로에만 적용
    }
}
```

> **주석:**
> - `addPathPatterns("/api/**")` = /api/로 시작하는 모든 경로에 인터셉터 적용
> - 정적 파일(이미지, JS 등)은 /api/로 시작하지 않으니 인터셉터 영향 없음

---

## Phase 2 — 인증 기능

### 목적
> 회원가입, 로그인, 소셜로그인, 이메일 인증, 비밀번호 재설정을
> 실제 DB와 연동하여 완성하는 단계.

### 작업 순서

#### 1. 회원가입 API (백엔드 4세트)

```
AuthController.java   → POST /api/auth/signup
AuthService.java      → 쉼표번호 자동 생성, 비밀번호 BCrypt 암호화 (jbcrypt 라이브러리)
AuthMapper.java       → insertUser(), countByEmail(), findMax쉼표번호()
AuthMapper.xml        → INSERT INTO users SQL 작성
```

> **주석:**
> - **4세트 규칙**: Controller → Service → Mapper → XML 순서로 항상 함께 만든다
> - BCrypt = 비밀번호를 단방향 암호화. 같은 비밀번호도 매번 다른 값이 나옴 (보안)
> - `BCrypt.hashpw(password, BCrypt.gensalt())` → 암호화
> - `BCrypt.checkpw(입력값, DB저장값)` → 검증 (true/false)
> - 쉼표번호 자동생성: DB에서 가장 큰 번호 조회 → +1 → "쉼표" + 4자리로 포맷

#### 2. 로그인 API

```
POST /api/auth/login
→ 이메일 + 비밀번호 받음
→ DB에서 이메일로 사용자 조회
→ BCrypt.checkpw()로 비밀번호 비교
→ 일치하면 JWT 액세스 토큰(30분) + 리프레시 토큰(14일) 발급
→ 리프레시 토큰은 Redis에 저장 (key: RT:쉼표번호)
```

> **주석:**
> - `BCrypt.checkpw(입력값, DB저장값)` → true/false 반환 (jbcrypt 방식)
> - 액세스 토큰(30분) + 리프레시 토큰(14일) 두 가지 발급
> - Redis에 리프레시 토큰 저장 이유: 로그아웃 시 바로 무효화 가능

#### 3. 이메일 인증

```
회원가입 시 → 인증 이메일 발송 (UUID 토큰 포함)
GET /api/auth/verify-email?token=xxxx → 인증 완료 처리
email_verification 테이블에 토큰 저장 및 만료시간 관리
```

> **주석:**
> - UUID = 랜덤한 고유 문자열. 추측 불가능해서 이메일 인증 토큰으로 사용
> - Spring Mail로 Gmail SMTP 통해 이메일 발송
> - 토큰 만료 시간(24시간) 이후엔 인증 불가 → 재발송 기능 필요

#### 4. 카카오/구글 소셜 로그인

```
프론트: 카카오/구글 OAuth 버튼 클릭 → 소셜 서버로 이동
백엔드: /api/auth/kakao/callback → 인가코드 받음
→ 카카오 서버에 액세스 토큰 요청
→ 사용자 정보 받아옴 (이메일, 닉네임)
→ 신규 유저면 자동 회원가입, 기존 유저면 로그인
→ JWT 발급
```

> **주석:**
> - OAuth2 = 소셜 서비스에서 사용자 정보를 안전하게 가져오는 표준 방식
> - auth_provider 테이블에 소셜 계정 정보 저장 (kakao/google 구분)
> - 같은 이메일로 일반 + 소셜 계정이 있을 수 있어서 연동 처리 필요

#### 5. 프론트 연결

```jsx
// Login.jsx — fetch로 /api/auth/login 호출
// 응답의 token을 localStorage.setItem('token', token) 저장
// 이후 API 호출 시 헤더에 'Authorization': `Bearer ${token}` 포함

// Signup.jsx — fetch로 /api/auth/signup 호출
// 성공 시 /signup-complete 페이지로 이동
```

> **주석:**
> - token을 localStorage에 저장하면 브라우저를 닫아도 유지됨
> - 모든 인증이 필요한 API 요청 시 헤더에 토큰을 항상 포함해야 함
> - 토큰 만료(401 응답) 시 리프레시 토큰으로 재발급 후 재시도

#### 6. 관리자 로그인

```
POST /api/admin/auth/login
admin_users 테이블에서 권한 확인
role이 ADMIN인 경우에만 관리자 페이지 접근 허용
```

---

## Phase 3 — 진단 기능

### 목적
> 사용자가 설문에 응답하고 심박수를 측정하면
> 스트레스 지수와 휴식 유형을 계산해서 저장하는 단계.
> **이 데이터가 추천의 근거가 된다.**

### 작업 순서

#### 1. Seed 데이터 먼저 입력 (필수!)

```sql
-- survey_questions 테이블에 질문 10~15개 INSERT
-- survey_choices 테이블에 각 질문의 선택지 INSERT
-- rest_types 테이블에 7가지 휴식 유형 INSERT
-- (신체적 휴식, 정신적 휴식, 감각적 휴식, 창의적 휴식, 감정적 휴식, 사회적 휴식, 영적 휴식)
```

> **주석:**
> - Seed 데이터 = 서비스가 동작하기 위해 미리 넣어둬야 하는 기본 데이터
> - 질문 데이터 없으면 설문 화면이 텅 빔 → 다른 기능 개발 전에 반드시 먼저!
> - 7가지 휴식 유형은 Dr. Saundra Dalton-Smith의 분류 기반

#### 2. 설문 API (백엔드 4세트)

```
GET  /api/survey/questions       → 전체 질문 + 선택지 목록 조회
POST /api/survey/responses       → 사용자 응답 저장
POST /api/survey/diagnose        → 응답 기반 점수 계산 + diagnosis_results 저장

SurveyController.java
SurveyService.java    → 응답별 점수 합산, 휴식 유형 1~3위 도출
SurveyMapper.java
SurveyMapper.xml
```

> **주석:**
> - 점수 계산: 각 선택지에 있는 score 값을 유형별로 합산
> - 가장 높은 점수의 휴식 유형 = 현재 가장 필요한 휴식 = 추천의 기준
> - diagnosis_results에 저장해야 나중에 추천/통계에서 활용 가능

#### 3. 심박수 측정 API

```
POST /api/heartrate/session/start  → 측정 세션 시작 (measurement_sessions INSERT)
POST /api/heartrate/measure        → 측정값 저장 (heart_rate_measurements INSERT)
POST /api/heartrate/session/end    → 세션 종료 + 평균 BPM 계산

HeartRateController.java
HeartRateService.java  → BPM 평균, HRV 계산, 스트레스 지수 도출
```

> **주석:**
> - BPM(Beats Per Minute) = 분당 심박수. 높을수록 스트레스 상태
> - HRV(Heart Rate Variability) = 심박 변동성. 낮을수록 스트레스 상태
> - 스트레스 지수 = BPM과 HRV를 조합한 0~100 점수로 환산
> - 원천 데이터(측정값)와 산출물(진단결과)을 별도 테이블에 저장해야 재계산 가능

#### 4. 프론트 연결

```jsx
// RestTypeTest.jsx — 하드코딩 데이터 제거, /api/survey/questions로 교체
// HeartRateCheck.jsx — 심박 측정 UI + 세션 API 연결
// 진단 완료 후 diagnosis_results ID를 localStorage에 저장 (추천에 사용)
```

---

## Phase 4 — 장소 / 휴식 기록

### 목적
> 추천 장소를 지도에 보여주고, 사용자가 실제 휴식을 기록하는 단계.
> **추천 로그를 반드시 저장해야 통계가 살아난다.**

### 작업 순서

#### 1. 공공데이터 크롤링 (Python)

```python
# scripts/crawl_places.py
# 공공데이터포털 API로 공원, 도서관, 카페 데이터 수집
# BeautifulSoup으로 HTML 파싱 후 places 테이블에 INSERT
# 최소 100개 이상 Seed 데이터 확보 필요
```

> **주석:**
> - 장소 데이터 없으면 지도 화면과 추천 기능이 텅 빔 → 크롤링 먼저!
> - 공공데이터포털(data.go.kr)에서 API 키 발급 필요
> - 위도/경도 데이터가 있어야 카카오맵에 핀 표시 가능

#### 2. 장소 API (백엔드 4세트)

```
GET  /api/places              → 전체 장소 목록 (필터: 유형, 거리, 태그)
GET  /api/places/{id}         → 장소 상세
POST /api/places/{id}/bookmark → 북마크 추가/제거
GET  /api/places/nearby        → 현재 위치 기반 주변 장소

PlaceController.java
PlaceService.java
PlaceMapper.java
PlaceMapper.xml
```

> **주석:**
> - 거리 필터: 사용자 현재 위치(위도/경도)에서 반경 N km 이내만 조회
> - Haversine 공식으로 두 좌표 사이 거리 계산 (SQL에서 처리)
> - 북마크는 place_bookmarks 테이블 (쉼표번호 + 장소 ID UNIQUE 제약)

#### 3. 카카오맵 연동 (프론트)

```jsx
// MapPage.jsx
// 1. kakao.maps SDK 스크립트 로드 (index.html에 추가)
// 2. /api/places/nearby 호출로 장소 목록 받기
// 3. 각 장소의 위도/경도로 지도에 마커(핀) 표시
// 4. 마커 클릭 시 장소 상세 정보 팝업
```

> **주석:**
> - 카카오 Developers에서 JavaScript 앱키 발급 필요
> - 지도 로딩 전에 "위치 권한" 팝업이 뜸 → navigator.geolocation으로 현재 위치 받기
> - 마커에 커스텀 이미지 사용 가능 (쉼표 브랜드 핀 아이콘)

#### 4. 추천 API + 로그 저장 (중요!)

```
POST /api/recommendations       → 진단결과 기반 장소 추천 + recommendations 테이블에 저장
PUT  /api/recommendations/{id}/click  → 추천 클릭 시 clicked=true 업데이트
PUT  /api/recommendations/{id}/save   → 저장 시 saved=true 업데이트
```

> **주석:**
> - **추천 로그를 반드시 저장해야 한다!** (멘토링 경고 사항)
> - recommendations 테이블에 어떤 기준으로 추천했는지 저장 → 나중에 개선 가능
> - 클릭률/저장률이 서비스의 핵심 성공 지표

#### 5. 휴식 기록 API (백엔드 4세트)

```
POST /api/rest-logs             → 휴식 기록 생성
GET  /api/rest-logs             → 내 기록 목록 (날짜 필터)
PUT  /api/rest-logs/{id}        → 기록 수정
DELETE /api/rest-logs/{id}      → 기록 삭제 (soft delete — deleted_at 업데이트)

RestLogController.java
RestLogService.java
RestLogMapper.java
RestLogMapper.xml
```

> **주석:**
> - Soft Delete = 실제로 삭제하지 않고 deleted_at에 시간을 기록
> - 나중에 통계에서 삭제된 기록을 제외해야 하므로 WHERE deleted_at IS NULL 조건 필수
> - 감정 점수(1~5)와 기분 태그(상쾌함/편안함/뿌듯함 등)를 같이 저장

#### 6. S3 이미지 업로드

```java
// 장소 사진, 프로필 이미지 업로드
// AWS SDK로 S3 버킷에 파일 업로드
// 업로드 완료 후 URL을 DB에 저장
// application.yml에 AWS 키 설정 필요
```

---

## Phase 5 — 통계 / 마이페이지 / 알림

### 목적
> 쌓인 휴식 기록을 분석해서 월간 통계를 보여주고,
> 마이페이지와 알림, 설정 기능을 완성하는 단계.

### 작업 순서

#### 1. 월간 통계 API

```
GET /api/stats/monthly?year=2024&month=3  → 월간 통계 조회

통계 데이터:
- 이번 달 총 휴식 시간
- 유형별 비율 (도넛 차트용 JSON)
- 일별 기록 횟수 (캘린더 히트맵용)
- 평균 감정 점수
- 가장 많이 한 휴식 유형
```

> **주석:**
> - monthly_stats 집계 테이블에 미리 계산된 값 저장 → 매번 집계 쿼리 실행 방지
> - 매일 자정 배치 작업(Scheduler)으로 전날 데이터 집계
> - 또는 기록 저장/수정/삭제 시마다 monthly_stats 업데이트

#### 2. 배치 스케줄러 (월간 통계 집계)

```java
// backend/src/main/java/com/comma/scheduler/StatsScheduler.java
@Scheduled(cron = "0 0 0 * * *")  // 매일 자정 실행
public void aggregateMonthlyStats() {
    // 전날 rest_logs 집계 → monthly_stats 업데이트
}
```

> **주석:**
> - `@Scheduled` = 정해진 시간에 자동으로 실행되는 코드
> - cron 표현식: "초 분 시 일 월 요일" 순서
> - "0 0 0 * * *" = 매일 0시 0분 0초 실행

#### 3. 마이페이지 API

```
GET  /api/users/me              → 내 정보 조회 (닉네임, 쉼표번호, 가입일, 배지)
PUT  /api/users/me              → 닉네임/프로필 이미지 수정
GET  /api/users/me/stats        → 내 휴식 통계 요약
GET  /api/users/me/badges       → 내가 획득한 배지 목록
```

> **주석:**
> - 비밀번호 변경은 별도 API (현재 비밀번호 확인 후 변경)
> - 프로필 이미지는 S3에 업로드 후 URL을 DB에 저장

#### 4. 배지 자동 지급 로직

```java
// 배지 지급 트리거:
// - "첫 기록" 배지: 첫 번째 rest_log 저장 시
// - "7일 연속" 배지: 7일 연속 기록 확인 시
// - "30회 기록" 배지: rest_log 30개 달성 시
// badges 테이블의 달성조건유형으로 자동 판별
```

> **주석:**
> - 배지 지급은 기록 저장 API 내부에서 조건 체크 후 user_badges INSERT
> - 중복 지급 방지: user_badges에 UNIQUE(쉼표번호, 배지ID) 제약

#### 5. 알림 API

```
GET  /api/notifications         → 알림 목록 (읽음/안읽음 구분)
PUT  /api/notifications/{id}/read → 읽음 처리
DELETE /api/notifications/read-all → 전체 읽음 처리
```

#### 6. 설정 페이지 (신규 파일 생성)

```jsx
// frontend/src/pages/user/Settings.jsx
// - 알림 설정 (이메일/앱 알림 on/off)
// - 비밀번호 변경
// - 회원 탈퇴
// - 테마 설정 (라이트/다크)
```

#### 7. MyPage.jsx API 연결

```jsx
// /api/users/me 로 내 정보 불러오기
// /api/stats/monthly 로 통계 차트 데이터 불러오기
// recharts 또는 chart.js로 도넛 차트, 캘린더 히트맵 구현
```

---

## Phase 6 — 관리자 / 배포

### 목적
> 관리자 기능을 완성하고, AWS에 실제 배포하는 단계.
> 서비스가 인터넷에서 접근 가능해지는 마지막 단계.

### 작업 순서

#### 1. 관리자 API 전체

```
관리자 대시보드: GET /api/admin/stats
사용자 관리:     GET /api/admin/users, PUT /api/admin/users/{id}/status
장소 승인:       GET /api/admin/places/pending, PUT /api/admin/places/{id}/approve
커뮤니티 관리:   GET /api/admin/posts, PUT /api/admin/posts/{id}/hide
```

> **주석:**
> - 모든 /api/admin/** API는 role=ADMIN 인 경우에만 접근 허용
> - @PreAuthorize("hasRole('ADMIN')") 어노테이션으로 접근 제어
> - audit_logs 테이블에 관리자의 모든 행동 기록 (언제, 누가, 무엇을)

#### 2. Postman 전체 테스트

```
1. Postman에서 Collection 생성
2. Phase 2~5에서 만든 모든 API 엔드포인트 등록
3. 환경변수로 base_url, token 관리
4. 각 API 요청/응답 검증
5. 성공/실패 케이스 모두 테스트
```

> **주석:**
> - 배포 전에 모든 API가 정상 동작하는지 확인하는 과정
> - Postman Collection을 팀원과 공유하면 협업 시 API 문서 역할도 함

#### 3. Nginx 설정

```nginx
# /etc/nginx/sites-available/comma
server {
    listen 80;
    server_name your-domain.com;

    # 프론트엔드 (React 빌드 결과물)
    location / {
        root /var/www/comma/frontend/build;
        try_files $uri /index.html;  # React Router 지원
    }

    # 백엔드 API 프록시
    location /api/ {
        proxy_pass http://localhost:8080;
    }
}
```

> **주석:**
> - Nginx = 웹서버. 프론트(3000포트)와 백엔드(8080포트)를 80포트 하나로 통합
> - `try_files $uri /index.html` = React Router의 클라이언트 사이드 라우팅 지원
> - `/api/` 요청은 Spring Boot로 프록시 → 프론트에서 포트 신경 안 써도 됨

#### 4. HTTPS 설정 (Let's Encrypt)

```bash
# EC2에서 실행
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# 90일마다 자동 갱신
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

> **주석:**
> - HTTPS = HTTP에 SSL 암호화 추가. 카카오/구글 OAuth2는 HTTPS 필수
> - Let's Encrypt = 무료 SSL 인증서 발급 서비스
> - 90일 만료이므로 cron으로 자동 갱신 설정 필수

#### 5. AWS 배포

```bash
# 1. EC2에 Java 17, Node.js, Nginx 설치
sudo apt update
sudo apt install -y openjdk-17-jdk nodejs npm nginx

# 2. RDS MySQL 생성 후 schema.sql 실행
# AWS Console → RDS → MySQL 8.0 인스턴스 생성

# 3. 프론트엔드 빌드 & 업로드
npm run build  # React 빌드
scp -r build/* ec2-user@EC2_IP:/var/www/comma/frontend/

# 4. 백엔드 JAR 빌드 & 실행
./gradlew build -x test
scp build/libs/comma-0.0.1-SNAPSHOT.jar ec2-user@EC2_IP:~/
ssh ec2-user@EC2_IP "java -jar comma-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod &"

# 5. S3 버킷 생성 (이미지 업로드용)
# AWS Console → S3 → 버킷 생성 → 퍼블릭 읽기 허용
```

> **주석:**
> - EC2 = 가상 서버. 여기에 백엔드 JAR과 프론트 빌드 파일 올림
> - RDS = 관리형 MySQL. 직접 MySQL 설치/관리 불필요
> - S3 = 파일 저장소. 이미지, 파일 업로드에 사용
> - `--spring.profiles.active=prod` = 운영 환경 설정 파일(application-prod.yml) 사용

#### 6. 환경변수 관리

```yaml
# application-prod.yml (EC2 서버에만 존재, git에 올리지 말 것!)
spring:
  datasource:
    url: jdbc:mysql://RDS_ENDPOINT:3306/comma
    username: comma_user
    password: [실제비밀번호]
  redis:
    host: [Redis 엔드포인트]
jwt:
  secret: [64자 이상 랜덤 문자열]
cloud:
  aws:
    credentials:
      access-key: [AWS Access Key]
      secret-key: [AWS Secret Key]
```

> **주석:**
> - .env 파일은 절대 git에 올리지 말 것 (.gitignore에 추가)
> - EC2 서버에 직접 파일 생성하거나 AWS Secrets Manager 사용 권장
> - 실수로 올라갔다면 즉시 키 교체 (깃허브가 자동으로 감지하기도 함)

---

## 핵심 원칙 정리

```
1. 핵심 흐름 먼저     진단→추천→기록→개선 데이터 품질 우선
2. Seed 데이터 먼저   rest_types 7개, survey_questions 없으면 화면 텅 빔
3. 추천 로그 저장     recommendations 테이블 기록해야 통계가 살아남
4. 쉼표번호는 String  bigint 변환 절대 금지
5. 4세트 규칙         Controller + Service + Mapper + XML 항상 같이
6. fetch 사용         axios 쓰지 말 것
7. 커뮤니티/챌린지    Phase 7 (2차 MVP) — MVP 완성 후에 작업
```
