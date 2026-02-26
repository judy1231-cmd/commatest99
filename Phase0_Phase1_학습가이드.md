# 쉼표(,) 프로젝트 — Phase 0 & Phase 1 상세 학습 가이드

> Phase 0과 Phase 1은 프로젝트의 **기초 공사**다.
> 이 두 단계가 제대로 잡혀있어야 Phase 2 이후 작업이 흔들리지 않는다.

---

## Phase 0 — 프론트엔드 UI 기반 정리

### 왜 Phase 0이 필요한가?
> 여러 페이지를 각자 만들다 보면 버튼 색깔이 제각각이고,
> 카드 모서리 둥글기도 다르고, 배경색도 다 달라진다.
> Phase 0에서 **공통 규칙**을 먼저 만들면 이런 문제가 없어진다.

---

### 0-1. 폴더 구조 확인

```
frontend/src/
├── api/                    ← fetch 호출 함수 모음
├── components/
│   ├── common/             ← 공통 컴포넌트 (Button, Card, Input, Toast)
│   ├── user/               ← 사용자용 컴포넌트 (UserNavbar 등)
│   └── admin/              ← 관리자용 컴포넌트
└── pages/
    ├── user/               ← 사용자 페이지
    └── admin/              ← 관리자 페이지
```

> **주석:**
> - `common/` 폴더 = 어느 페이지에서든 가져다 쓸 수 있는 범용 부품
> - `user/` vs `admin/` 분리 이유: 관리자와 일반 사용자 UI가 완전히 다름
> - 폴더 구조를 미리 잡아두면 파일 찾기가 훨씬 쉬움

---

### 0-2. Tailwind CSS 색상 설정

```js
// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],  // Tailwind가 스캔할 파일 범위
  theme: {
    extend: {
      colors: {
        // ─── 브랜드 색상 ───────────────────────────────────────
        primary: '#10b981',           // 메인 초록. 버튼, 링크, 강조에 사용
        'soft-mint': '#ECFDF5',       // 연한 민트. 배너, 카드 배경에 사용

        // ─── 텍스트 색상 ───────────────────────────────────────
        'text-main': '#334155',       // 제목, 본문 등 주요 텍스트
        'text-muted': '#64748B',      // 설명, 날짜 등 보조 텍스트

        // ─── 배경 색상 ─────────────────────────────────────────
        'background-light': '#F9F9F7', // 전체 페이지 배경 (약간 따뜻한 흰색)
      }
    }
  },
  plugins: [],
}
```

> **주석:**
> - `extend` = Tailwind 기본 색상(red, blue, gray 등)을 유지하면서 **추가**하는 옵션
> - 색상 이름에 따옴표가 있는 것('soft-mint')은 하이픈 때문 → Tailwind 규칙
> - 사용법: `className="bg-primary text-white"` → 초록 배경 + 흰 글자
> - **색상을 한 곳에서 관리** = 나중에 색상 변경 시 config 한 줄만 수정

---

### 0-3. 공통 컴포넌트 생성

#### Button.jsx

```jsx
// frontend/src/components/common/Button.jsx

// props 설명:
// - variant: 'primary'(초록) | 'outline'(테두리) | 'ghost'(투명) — 기본값: primary
// - children: 버튼 안에 들어갈 텍스트 또는 JSX
// - onClick, type, disabled, className 등 HTML button 속성도 그대로 전달

const variantStyles = {
  primary: 'bg-primary text-white hover:bg-primary/90',     // 초록 채운 버튼
  outline: 'border-2 border-primary text-primary hover:bg-soft-mint', // 테두리 버튼
  ghost:   'text-primary hover:bg-soft-mint',                // 배경 없는 텍스트 버튼
};

export default function Button({ variant = 'primary', children, className = '', ...props }) {
  return (
    <button
      className={`
        rounded-xl px-4 py-2.5 font-bold transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}    // onClick, type, disabled 등 나머지 props 전달
    >
      {children}
    </button>
  );
}

// ─── 사용 예시 ────────────────────────────────────────────────
// <Button onClick={handleLogin}>로그인</Button>
// <Button variant="outline">취소</Button>
// <Button variant="ghost" type="submit">건너뛰기</Button>
// <Button disabled={loading}>{loading ? '처리 중...' : '저장'}</Button>
```

> **주석:**
> - `...props` (Spread Operator) = onClick, type, disabled 등 나머지 속성을 한 번에 전달
> - `disabled:opacity-50` = disabled 상태일 때 반투명하게 → 사용 불가 표시
> - `transition-colors duration-200` = 색상 변경이 0.2초에 걸쳐 부드럽게 일어남
> - `className = ''` 기본값 설정 = className prop 없어도 에러 안 남

---

#### Card.jsx

```jsx
// frontend/src/components/common/Card.jsx

// 정보를 담는 흰색 박스 컴포넌트
// children으로 내부 콘텐츠를 자유롭게 넣을 수 있음

export default function Card({ children, className = '' }) {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-sm border border-gray-100 p-6
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ─── 사용 예시 ────────────────────────────────────────────────
// <Card>
//   <h2>오늘의 추천</h2>
//   <p>산책하기</p>
// </Card>
//
// <Card className="p-4 hover:shadow-md cursor-pointer">  ← 기본 p-6 덮어쓰기 가능
//   클릭 가능한 카드
// </Card>
```

> **주석:**
> - `rounded-2xl` = 모서리를 크게 둥글게 (디자인 시스템 통일)
> - `shadow-sm` = 아주 살짝 그림자 → 카드가 배경에서 떠 보이는 효과
> - `border border-gray-100` = 거의 보이지 않는 연한 테두리 → 배경과 구분
> - `${className}` = 사용 시 추가 스타일 주입 가능 (p-6 → p-4 덮어쓰기 가능)

---

#### Input.jsx

```jsx
// frontend/src/components/common/Input.jsx

// 폼 입력 필드 컴포넌트
// label, error 메시지까지 포함한 완전한 입력 단위

export default function Input({
  label,        // 입력 필드 위에 표시되는 라벨
  error,        // 유효성 검사 실패 시 표시되는 에러 메시지
  id,
  className = '',
  ...props      // type, placeholder, value, onChange 등 전달
}) {
  return (
    <div className="flex flex-col gap-1.5">

      {/* 라벨 — id와 htmlFor를 연결하면 라벨 클릭 시 input에 포커스 */}
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-main">
          {label}
        </label>
      )}

      {/* 입력 필드 */}
      <input
        id={id}
        className={`
          w-full h-12 px-4 rounded-xl
          border ${error ? 'border-red-400' : 'border-gray-200'}
          bg-gray-50
          focus:ring-2 focus:ring-primary/20 focus:border-primary
          outline-none transition-colors duration-200
          ${className}
        `}
        {...props}
      />

      {/* 에러 메시지 */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

// ─── 사용 예시 ────────────────────────────────────────────────
// <Input
//   id="email"
//   label="이메일"
//   type="email"
//   placeholder="이메일을 입력하세요"
//   value={email}
//   onChange={(e) => setEmail(e.target.value)}
//   error={errors.email}  // "올바른 이메일 형식이 아닙니다" 같은 에러
// />
```

> **주석:**
> - `h-12` = 높이 48px로 고정 → 모든 입력 필드 높이 통일
> - `focus:ring-2 focus:ring-primary/20` = 포커스 시 초록 테두리 + 글로우 효과
> - `error ? 'border-red-400' : 'border-gray-200'` = 에러 시 빨간 테두리 표시
> - `outline-none` = 브라우저 기본 포커스 테두리 제거 (커스텀 ring으로 대체)

---

#### Toast.jsx

```jsx
// frontend/src/components/common/Toast.jsx

// 알림 메시지 컴포넌트 (화면 우측 상단에 잠깐 표시 후 사라짐)
// type: 'success'(초록) | 'error'(빨강) | 'warning'(노랑)

import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);    // duration 후 숨기기
      onClose?.();          // 부모에게 닫힘 알림 (옵셔널 체이닝)
    }, duration);

    return () => clearTimeout(timer);  // 컴포넌트 언마운트 시 타이머 정리
  }, [duration, onClose]);

  if (!visible) return null;  // 안 보이면 아무것도 렌더링 안 함

  const typeStyles = {
    success: 'bg-primary text-white',
    error:   'bg-red-500 text-white',
    warning: 'bg-yellow-400 text-gray-800',
  };

  return (
    // fixed = 스크롤해도 항상 같은 위치 / z-50 = 다른 요소 위에 표시
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg ${typeStyles[type]}`}>
      {message}
    </div>
  );
}

// ─── 사용 예시 ────────────────────────────────────────────────
// const [toast, setToast] = useState(null);
//
// // 성공 토스트 표시
// setToast({ message: '로그인 성공!', type: 'success' });
//
// // JSX에서
// {toast && <Toast {...toast} onClose={() => setToast(null)} />}
```

> **주석:**
> - `useEffect` + `setTimeout` = N초 뒤에 자동으로 사라지는 효과
> - `fixed top-4 right-4` = 화면 우측 상단에 고정 위치 (스크롤 영향 받지 않음)
> - `z-50` = z-index 50. 다른 요소(모달, 카드 등) 위에 항상 표시
> - `onClose?.()` = onClose props가 없어도 에러 안 남 (옵셔널 체이닝)
> - `return () => clearTimeout(timer)` = 컴포넌트가 사라질 때 타이머도 같이 정리

---

### 0-4. 라우트 가드 (PrivateRoute)

```jsx
// frontend/src/components/common/PrivateRoute.jsx

// 로그인이 필요한 페이지를 보호하는 컴포넌트
// token이 없으면 로그인 페이지로 보내고, 있으면 요청한 페이지를 보여줌

import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');  // 저장된 JWT 토큰 확인

  if (!token) {
    // 토큰 없음 = 비로그인 상태 → 로그인 페이지로 리다이렉트
    return <Navigate to="/login" replace />;
    // replace: true = 브라우저 뒤로가기 시 보호 페이지로 돌아가지 않음
  }

  return children;  // 토큰 있음 = 로그인 상태 → 요청한 페이지 표시
}

// ─── App.jsx에서 사용하는 방법 ────────────────────────────────
// import PrivateRoute from './components/common/PrivateRoute';
//
// <Route path="/my" element={
//   <PrivateRoute>
//     <MyPage />
//   </PrivateRoute>
// } />
//
// 보호할 페이지 목록:
// /my, /rest-record, /settings, /notifications, /heartrate
```

> **주석:**
> - `localStorage.getItem('token')` = 로그인 시 저장한 JWT 토큰을 꺼내옴
> - 토큰 만료 여부는 여기서 확인 안 함 → API 호출 시 401 응답으로 처리
> - `replace` = history 스택 교체. 뒤로가기 시 로그인 전 보호 페이지로 가는 무한루프 방지
> - children = PrivateRoute로 감싼 컴포넌트 (MyPage, RestRecord 등)

---

### 0-5. App.jsx 라우트 설정

```jsx
// frontend/src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/common/PrivateRoute';
// ... 페이지 imports

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ─── 비로그인도 접근 가능 ─────────────────────── */}
        <Route path="/"               element={<MainDashboard />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/signup"         element={<Signup />} />
        <Route path="/signup-complete" element={<SignupComplete />} />
        <Route path="/password-reset" element={<PasswordReset />} />

        {/* ─── 로그인 필요 (PrivateRoute로 감쌈) ──────── */}
        <Route path="/my"             element={<PrivateRoute><MyPage /></PrivateRoute>} />
        <Route path="/rest-record"    element={<PrivateRoute><RestRecord /></PrivateRoute>} />
        <Route path="/settings"       element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/notifications"  element={<PrivateRoute><Notifications /></PrivateRoute>} />

        {/* ─── 관리자 (admin role 별도 guard 필요) ─────── */}
        <Route path="/admin/login"    element={<AdminLogin />} />
        <Route path="/admin"          element={<AdminDashboard />} />

        {/* ─── 404 페이지 (항상 마지막에 위치) ───────── */}
        <Route path="*"               element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

> **주석:**
> - `path="*"` = 위에서 매칭되지 않은 모든 경로 → 반드시 맨 아래에 위치
> - BrowserRouter = URL 기반 라우팅 (해시 없이 `/my` 같은 깔끔한 URL)
> - 관리자 페이지는 로그인 외에 role=ADMIN 확인도 필요 → AdminRoute 별도 생성 권장

---

### 0-6. 페이지 배경색 통일

```jsx
// 모든 사용자 페이지 최상단에 적용할 배경색
// className="min-h-screen bg-[#F9F7F2]"

// 예시: MainDashboard.jsx
return (
  <div className="min-h-screen bg-[#F9F7F2]">
    <UserNavbar />
    <main className="max-w-md mx-auto px-4 pt-6 pb-24">
      {/* 페이지 내용 */}
    </main>
  </div>
);
```

> **주석:**
> - `min-h-screen` = 최소 높이를 화면 전체로 → 내용이 짧아도 배경이 채워짐
> - `bg-[#F9F7F2]` = Tailwind의 임의값 문법 (대괄호 안에 직접 색상 코드)
> - `max-w-md mx-auto` = 모바일 너비(448px)로 제한 + 가운데 정렬 (모바일 앱 느낌)
> - `pb-24` = 하단 패딩 96px → 네브바가 내용을 가리지 않도록

---

## Phase 1 — 백엔드 기반 세팅

### 왜 Phase 1이 필요한가?
> Spring Boot만 설치한다고 바로 API를 만들 수 없다.
> JWT, BCrypt(비밀번호 암호화), Redis, 이메일, DB 연결 등
> **기반 인프라를 한 번에 세팅**하는 단계.
> 이 단계가 없으면 Phase 2에서 인증 기능을 만들 수 없다.
>
> ⚠️ **Spring Security는 사용하지 않는다**
> 대신 순수 Spring MVC의 `HandlerInterceptor`로 JWT 인증을 직접 구현한다.

---

### 1-1. 프로젝트 구조 확인

```
backend/src/main/java/com/comma/
├── CommaApplication.java       ← Spring Boot 시작점 (@SpringBootApplication)
├── config/
│   ├── SecurityConfig.java     ← Spring Security 설정
│   ├── JwtUtil.java            ← JWT 토큰 생성/검증 유틸
│   ├── JwtAuthFilter.java      ← 모든 요청에서 JWT 검사하는 필터
│   └── CorsConfig.java         ← 프론트(3000포트) 허용 CORS 설정
├── controller/                 ← API 엔드포인트 (@RestController)
├── service/                    ← 비즈니스 로직
├── mapper/                     ← MyBatis 인터페이스 (@Mapper)
└── model/                      ← DB 테이블 매핑 Java 클래스

backend/src/main/resources/
├── application.yml             ← 공통 설정
├── application-local.yml       ← 로컬 개발 설정 (git 제외)
└── mapper/
    └── *.xml                   ← MyBatis SQL 쿼리 파일
```

---

### 1-2. build.gradle 의존성 추가

```gradle
// backend/build.gradle

dependencies {
    // ─── Spring Boot Web ──────────────────────────────────────
    implementation 'org.springframework.boot:spring-boot-starter-web'       // REST API
    // ⚠️ spring-boot-starter-security 는 사용하지 않음

    // ─── MyBatis ──────────────────────────────────────────────
    implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.3'

    // ─── DB ───────────────────────────────────────────────────
    runtimeOnly 'com.mysql:mysql-connector-j'   // MySQL JDBC 드라이버

    // ─── JWT ──────────────────────────────────────────────────
    implementation 'io.jsonwebtoken:jjwt-api:0.11.5'    // JWT API (인터페이스)
    runtimeOnly   'io.jsonwebtoken:jjwt-impl:0.11.5'    // JWT 구현체 (런타임만 필요)
    runtimeOnly   'io.jsonwebtoken:jjwt-jackson:0.11.5' // JSON 파싱 (런타임만 필요)

    // ─── BCrypt (비밀번호 암호화) ──────────────────────────────
    implementation 'org.mindrot:jbcrypt:0.4'    // Spring Security 없이 BCrypt만 사용

    // ─── Redis ────────────────────────────────────────────────
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'

    // ─── 이메일 ───────────────────────────────────────────────
    implementation 'org.springframework.boot:spring-boot-starter-mail'

    // ─── Lombok ───────────────────────────────────────────────
    compileOnly    'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'

    // ─── 테스트 ───────────────────────────────────────────────
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

> **주석:**
> - `implementation` = 컴파일 + 런타임 모두 필요
> - `runtimeOnly` = 실행할 때만 필요. jjwt-impl은 내부 구현체라 런타임만 사용
> - `jbcrypt:0.4` = BCrypt 비밀번호 암호화 전용 라이브러리. Spring Security 없이 독립 사용
>   - `BCrypt.hashpw(password, BCrypt.gensalt())` → 비밀번호 암호화
>   - `BCrypt.checkpw(입력값, DB저장값)` → 비밀번호 검증 (true/false)
> - `compileOnly` = 컴파일 때만 필요. Lombok은 코드 생성 후엔 불필요
> - 의존성 추가 후 우측 Gradle 패널 → Reload 클릭 (또는 ./gradlew build)

---

### 1-3. application.yml 설정

```yaml
# backend/src/main/resources/application.yml

spring:
  profiles:
    active: local   # 기본 프로파일: local (로컬 개발 시)

  # ─── MyBatis 설정 ─────────────────────────────────────────────
  mybatis:
    mapper-locations: classpath:mapper/*.xml          # XML 파일 위치
    configuration:
      map-underscore-to-camel-case: true              # email_verified → emailVerified 자동 변환

  # ─── 멀티파트 (파일 업로드) ────────────────────────────────────
  servlet:
    multipart:
      max-file-size: 10MB     # 파일 1개 최대 크기
      max-request-size: 30MB  # 요청 전체 최대 크기

# ─── 서버 포트 ────────────────────────────────────────────────────
server:
  port: 8080

# ─── JWT 설정 ─────────────────────────────────────────────────────
jwt:
  secret: ${JWT_SECRET}         # 환경변수에서 읽기 (또는 application-local.yml에서)
  expiration: 3600000           # 액세스 토큰 만료: 1시간 (밀리초)
  refresh-expiration: 604800000 # 리프레시 토큰 만료: 7일 (밀리초)
```

```yaml
# backend/src/main/resources/application-local.yml
# ⚠️ 이 파일은 .gitignore에 추가 — 절대 git에 올리지 말 것!

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/comma?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8
    username: root
    password: 1234       # 본인 MySQL 비밀번호

  redis:
    host: localhost
    port: 6379

  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: xxxx-xxxx-xxxx-xxxx  # Gmail 앱 비밀번호 (2차 인증 활성화 필요)
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true

jwt:
  secret: comma-project-jwt-secret-key-must-be-at-least-64-characters-long-for-hs512
```

> **주석:**
> - `profiles.active: local` = application-local.yml을 자동으로 같이 읽음
> - `map-underscore-to-camel-case: true` = DB 컬럼(snake_case) → Java 필드(camelCase) 자동 변환
> - `${JWT_SECRET}` = 환경변수 읽기. 없으면 application-local.yml의 값 사용
> - Gmail 앱 비밀번호: Google 계정 → 보안 → 2단계 인증 → 앱 비밀번호 생성

---

### 1-4. MySQL DDL 실행 (schema.sql)

```sql
-- backend/src/main/resources/schema.sql
-- MySQL Workbench에서 아래 순서로 실행

-- ① 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS comma
  CHARACTER SET utf8mb4        -- 한글, 이모지 지원
  COLLATE utf8mb4_unicode_ci;  -- 한글 정렬 지원
USE comma;

-- ② 사용자 테이블 (가장 먼저 — 다른 테이블이 FK로 참조)
CREATE TABLE users (
  쉼표번호      VARCHAR(12)  NOT NULL PRIMARY KEY,  -- '쉼표' + 4자리 숫자
  email         VARCHAR(100) NOT NULL UNIQUE,         -- 이메일 중복 불가
  password      VARCHAR(255),                         -- BCrypt 암호화 저장 (소셜 로그인은 NULL)
  nickname      VARCHAR(50)  NOT NULL,
  status        ENUM('active','dormant','banned') NOT NULL DEFAULT 'active',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  role          ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ③ 소셜 로그인 제공자 테이블
CREATE TABLE auth_provider (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  쉼표번호    VARCHAR(12)  NOT NULL,
  provider    ENUM('kakao','google') NOT NULL,
  provider_id VARCHAR(100) NOT NULL,
  FOREIGN KEY (쉼표번호) REFERENCES users(쉼표번호) ON DELETE CASCADE,
  UNIQUE KEY uq_provider (provider, provider_id)  -- 같은 소셜 계정 중복 방지
);
```

> **주석:**
> - `utf8mb4` = MySQL에서 이모지 포함 모든 유니코드 지원 (utf8은 이모지 불가)
> - `VARCHAR(12)` = 쉼표(3자) + 4자리 숫자 = 최대 7자지만 12로 여유있게
> - `ON DELETE CASCADE` = users 삭제 시 auth_provider도 자동 삭제
> - 외래키가 있는 테이블은 참조 대상 테이블보다 **나중에** CREATE TABLE 해야 함

---

### 1-5. CorsConfig.java (CORS 설정)

```java
// backend/src/main/java/com/comma/config/CorsConfig.java
// 프론트(3000포트) → 백엔드(8080포트) API 호출 허용

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

> **주석:**
> - CORS = 다른 출처(포트) 간 요청을 브라우저가 기본으로 막음 → 명시적 허용 필요
> - `OPTIONS` 메서드 허용 필수 = 브라우저가 본 요청 전에 OPTIONS로 사전 확인함
> - `allowCredentials(true)` = 쿠키/인증 헤더 포함 요청 허용
> - 배포 시 `allowedOrigins`에 실제 도메인 주소로 변경

---

### 1-6. JwtUtil.java

```java
// backend/src/main/java/com/comma/config/JwtUtil.java

@Component  // Spring Bean으로 등록 → 다른 클래스에서 @Autowired로 주입 가능
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;                // application.yml의 jwt.secret 값

    @Value("${jwt.expiration}")
    private long expiration;              // 1시간 (밀리초)

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;       // 7일 (밀리초)

    // 서명 키 생성 (HS512 알고리즘용)
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // ─── 액세스 토큰 생성 ─────────────────────────────────────────
    public String generateToken(String 쉼표번호, String role) {
        return Jwts.builder()
            .setSubject(쉼표번호)                    // 토큰 주인 (쉼표번호)
            .claim("role", role)                     // 추가 정보 (권한)
            .setIssuedAt(new Date())                 // 발급 시간
            .setExpiration(new Date(System.currentTimeMillis() + expiration)) // 만료 시간
            .signWith(getSigningKey(), SignatureAlgorithm.HS512)  // 서명
            .compact();                              // 문자열로 변환
    }

    // ─── 토큰에서 쉼표번호 꺼내기 ─────────────────────────────────
    public String get쉼표번호(String token) {
        return getClaims(token).getSubject();
    }

    // ─── 토큰 유효성 검사 ─────────────────────────────────────────
    public boolean validateToken(String token) {
        try {
            getClaims(token);  // 파싱 성공 = 유효한 토큰
            return true;
        } catch (ExpiredJwtException e) {
            return false;  // 만료된 토큰
        } catch (JwtException e) {
            return false;  // 변조된 토큰
        }
    }

    // ─── Claims 파싱 (내부용) ──────────────────────────────────────
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }
}
```

> **주석:**
> - JWT 구조: `Header.Payload.Signature` — 점(.)으로 3개 구분
> - Payload(Claims)에 쉼표번호, role, 만료시간 저장 → 서버에서 꺼내서 사용자 식별
> - `setSubject` = 토큰의 주인공 정보. 나중에 `getSubject()`로 꺼냄
> - `claim("role", role)` = 추가 정보 삽입. `get("role", String.class)`로 꺼냄
> - `HS512` = HMAC-SHA512 서명 알고리즘. secret 키로 서명하고 검증

---

### 1-7. JwtInterceptor.java (Spring Security 대신 사용)

```java
// backend/src/main/java/com/comma/config/JwtInterceptor.java
// Spring Security 없이 순수 Spring MVC HandlerInterceptor로 JWT 인증 구현

@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private static final AntPathMatcher pathMatcher = new AntPathMatcher();

    // 토큰 없이 접근 가능한 공개 경로
    private static final String[] PUBLIC_PATHS = {
            "/api/auth/**",
            "/api/places/**",
            "/api/rest-types/**",
            "/api/survey/**"
    };

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {

        // CORS preflight 요청은 무조건 통과
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getServletPath();

        // 공개 경로는 토큰 없이 통과
        for (String pattern : PUBLIC_PATHS) {
            if (pathMatcher.match(pattern, path)) {
                return true;
            }
        }

        // Authorization 헤더에서 토큰 꺼내기
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            sendError(response, 401, "로그인이 필요합니다.");
            return false;  // false = 컨트롤러 실행 중단
        }

        String token = header.substring(7);  // "Bearer " 7글자 제거

        if (!jwtUtil.isTokenValid(token)) {
            sendError(response, 401, "유효하지 않은 토큰입니다.");
            return false;
        }

        String 쉼표번호 = jwtUtil.extract쉼표번호(token);
        String role = jwtUtil.extractRole(token);

        // 관리자 경로는 ADMIN role 추가 확인
        if (pathMatcher.match("/api/admin/**", path) && !"ADMIN".equals(role)) {
            sendError(response, 403, "관리자 권한이 필요합니다.");
            return false;
        }

        // 컨트롤러에서 꺼내 쓸 수 있도록 request에 저장
        request.setAttribute("쉼표번호", 쉼표번호);  // (String) request.getAttribute("쉼표번호")
        request.setAttribute("role", role);

        return true;  // true = 컨트롤러 실행 진행
    }

    private void sendError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(
                String.format("{\"success\":false,\"data\":null,\"message\":\"%s\"}", message)
        );
    }
}
```

> **주석:**
> - `HandlerInterceptor.preHandle()` = 컨트롤러 실행 직전에 호출. true면 진행, false면 중단
> - Spring Security의 Filter와 달리 Spring MVC 레이어에서 동작 → 더 단순
> - `"Bearer " 7글자` = B-e-a-r-e-r-공백 = 7자. `substring(7)`로 토큰만 추출
> - `request.setAttribute("쉼표번호", 쉼표번호)` = 이 요청 안에서만 공유되는 임시 저장소
> - 컨트롤러에서 꺼내는 방법: `String 쉼표번호 = (String) request.getAttribute("쉼표번호");`

### 1-8. WebConfig.java (인터셉터 등록)

```java
// backend/src/main/java/com/comma/config/WebConfig.java
// JwtInterceptor를 Spring MVC에 등록

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final JwtInterceptor jwtInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor)
                .addPathPatterns("/api/**");  // /api/** 경로에만 인터셉터 적용
    }
}
```

> **주석:**
> - `WebMvcConfigurer` = Spring MVC 동작을 커스터마이징하는 인터페이스
> - `addPathPatterns("/api/**")` = /api/로 시작하는 모든 경로에만 인터셉터 적용
> - CorsConfig.java도 WebMvcConfigurer를 구현 → 둘 다 동시에 적용됨 (Spring이 자동으로 합침)

---

## Phase 0 → Phase 1 체크리스트

### Phase 0 완료 확인
- [ ] `tailwind.config.js`에 브랜드 색상 5개 추가
- [ ] `Button.jsx` — primary/outline/ghost 3종류
- [ ] `Card.jsx` — children 받는 흰색 카드
- [ ] `Input.jsx` — label, error 포함
- [ ] `Toast.jsx` — 3초 후 자동 사라짐
- [ ] `PrivateRoute.jsx` — 비로그인 접근 차단
- [ ] `App.jsx` — 라우트 설정 완료 (404 포함)
- [ ] 모든 페이지 배경색 `bg-[#F9F7F2]` 통일

### Phase 1 완료 확인
- [ ] `build.gradle` — JWT, jbcrypt, Redis, Mail 의존성 추가 후 빌드 성공 (Security 없음)
- [ ] `application.yml` — MyBatis, 서버 포트 설정
- [ ] `application-local.yml` — DB, Redis, Mail 로컬 설정 (.gitignore 등록 확인)
- [ ] MySQL `comma_db` 데이터베이스 생성 + `schema.sql` 실행
- [ ] `CorsConfig.java` — 프론트(3000포트) 허용 CORS 설정
- [ ] `JwtUtil.java` — 토큰 생성, 검증, Claims 파싱
- [ ] `JwtInterceptor.java` — 요청마다 JWT 검사 (HandlerInterceptor 기반)
- [ ] `WebConfig.java` — JwtInterceptor를 /api/** 에 등록
- [ ] Spring Boot 실행 시 에러 없이 시작 확인 (Security 자동설정 경고 없음)

---

## 자주 발생하는 오류와 해결법

### Phase 0

| 오류 | 원인 | 해결 |
|------|------|------|
| `bg-primary` 색상 안 나옴 | tailwind.config.js 수정 후 서버 재시작 안 함 | `npm start` 재시작 |
| Route 변경해도 404 | BrowserRouter가 App을 감싸지 않음 | index.js에서 `<BrowserRouter>` 확인 |
| PrivateRoute 무한루프 | Navigate replace 없이 push | `<Navigate to="/login" replace />` |

### Phase 1

| 오류 | 원인 | 해결 |
|------|------|------|
| `Could not resolve io.jsonwebtoken` | Gradle 캐시 문제 | Gradle Reload 또는 `./gradlew clean build` |
| `Could not resolve org.mindrot:jbcrypt` | Gradle 캐시 문제 | Gradle Reload 후 재시도 |
| `Failed to configure DataSource` | application-local.yml에 DB 정보 없음 | DB URL, username, password 확인 |
| `Unknown database 'comma_db'` | MySQL에 DB가 없음 | MySQL에서 `CREATE DATABASE comma_db` 실행 |
| `Access denied for user 'root'` | DB 비밀번호 틀림 | application-local.yml의 password 확인 |
| 401 응답 (모든 API) | JwtInterceptor가 토큰 차단 | 공개 경로 `PUBLIC_PATHS` 배열에 해당 경로 추가 |
| `Unable to start RedisConnectionFactory` | Redis 서버 안 켜짐 | 윈도우: 서비스에서 Redis 시작 또는 `redis-server.exe` 실행 |
