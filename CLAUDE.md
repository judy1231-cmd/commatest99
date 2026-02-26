# 쉼표 (,) 프로젝트 — Claude Code 작업 가이드

> 이 파일을 먼저 전부 읽고 작업을 시작해줘.
> 프로젝트 구조, 기술 스택, 작업 규칙이 모두 담겨 있어.

---

## 🤖 Claude Code 행동 원칙

### 너의 역할
- 너는 **10년차 시니어 풀스택 개발자**야
- 항상 **클린 코드** 원칙으로 작업해줘:
  - 함수는 하나의 역할만
  - 변수/함수명은 의미 있게 (축약 금지)
  - 중복 코드 제거, 공통 로직은 분리
  - 주석은 "왜"를 설명 (무엇은 코드가 말함)
  - 단일 책임 원칙 준수

### 작업 전 승인 요청 (필수)
코드 생성/수정 전에 반드시 아래 형식으로 먼저 물어봐줘:

```
📋 작업 계획
- 생성할 파일: XxxController.java, XxxService.java ...
- 수정할 파일: Login.jsx
- 작업 내용: 회원가입 API 4세트 생성

진행할까요? (y/n)
```

승인 받은 후에 코드 작업 시작해줘.

---

## 📌 프로젝트 개요

**쉼표(,)** 는 사용자의 피로/스트레스 상태와 선호를 기반으로, 지금 가능한 휴식(활동/장소)을 추천하고 기록·개선까지 돕는 플랫폼이야.

### 핵심 가치 (멘토링 확정)
> "사용자 피로/스트레스 상태와 선호를 기반으로, 지금 가능한 휴식(활동/장소)을 추천하고 기록·개선까지 돕는 플랫폼"

### 성공 지표
- 추천 클릭률 / 저장률
- 기록 지속률 (7일 / 30일)
- 재방문율
- 스트레스 지표 전후 변화 (심박 기반)

### 핵심 사용자 여정 (멘토링 기반)
```
진단(심박+설문) → 추천/탐색 → 휴식 기록 → 통계/개선 → 커뮤니티/챌린지(2차)
```

### ⚠️ 멘토링 경고
> "화면은 많은데, 핵심 흐름(진단→추천→기록→개선)의 데이터가 얕음"
> **핵심 흐름의 데이터 품질을 먼저 완성시켜야 한다**

### MVP vs 확장 구분
**MVP (필수)**
- 인증/계정: 회원가입, 로그인, 비밀번호찾기
- 진단: 심박 측정 + 설문 테스트 → 휴식 유형 도출
- 추천/탐색: 메인 추천 카드, 휴식 지도, 유형별 상세
- 기록/개선: 휴식 기록, 월간 통계, 마이페이지
- 관리자: 로그인/대시보드, 사용자/콘텐츠 관리

**2차 MVP (선택)**
- 커뮤니티/댓글/신고
- 챌린지 참여/달성률

### 회원 식별자
- **쉼표번호**: `쉼표` + 4자리 숫자 (예: `쉼표1234`)
- varchar(12), 가입 시 자동 생성, 중복 불가

---

## 🗂 프로젝트 구조

```
comma-main/
├── frontend/          # React (포트 3000)
│   └── src/
│       ├── api/       # fetch 기반 API 유틸
│       ├── components/
│       │   ├── common/   # Button, Card, Input, Toast
│       │   ├── user/
│       │   └── admin/
│       └── pages/
│           ├── user/
│           └── admin/
└── backend/           # Spring Boot (포트 8080)
    └── src/main/java/com/comma/
        ├── domain/            # 도메인별 패키지 (멘토링 기반)
        │   ├── auth/          # 인증 도메인
        │   │   ├── controller/
        │   │   ├── service/
        │   │   └── mapper/    # MyBatis
        │   ├── user/          # 사용자 도메인
        │   │   └── model/
        │   ├── diagnosis/     # 진단 (Phase 3)
        │   ├── place/         # 장소 (Phase 4)
        │   ├── rest/          # 휴식 기록 (Phase 4)
        │   └── stats/         # 통계 (Phase 5)
        └── global/            # 공통 기능
            └── config/        # CorsConfig, JwtUtil, JwtInterceptor, WebConfig
```

---

## 🛠 기술 스택

| 영역 | 기술 |
|------|------|
| FE | React, Tailwind CSS, JavaScript |
| BE | Java 17, Spring Boot 3, MyBatis (Spring Security 미사용) |
| DB | MySQL |
| 캐시 | Redis (리프레시토큰) |
| 배포 | AWS (EC2 + RDS + S3) |
| 웹서버 | Nginx |
| 컨테이너 | Docker |
| AI | Claude API |
| 데이터수집 | Python, BeautifulSoup, 공공데이터포털 API |
| 외부 API | 카카오맵, 카카오 OAuth2, 구글 OAuth2, 기상청 API |
| 형상관리 | Git, GitHub |
| API 테스트 | Postman |
| IDE | VS Code |
| 접속 툴 | MobaXterm (윈도우), 기본 터미널 (맥북) |
| AI 도구 | Claude Code |

---

## 🎨 디자인 시스템

```js
colors: {
  primary: '#10b981',
  'soft-mint': '#ECFDF5',
  'text-main': '#334155',
  'text-muted': '#64748B',
  'background-light': '#F9F9F7',
}
```

- **버튼**: `bg-primary text-white rounded-xl px-4 py-2.5 font-bold hover:bg-primary/90`
- **카드**: `bg-white rounded-2xl shadow-sm border border-gray-100 p-6`
- **인풋**: `w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none`
- **페이지 배경**: `min-h-screen bg-[#F9F7F2]`

---

## 🗄 DB 설계 (멘토링 기반 재설계)

### [A] 사용자/인증
```
users               - 쉼표번호(PK), 이메일(UNIQUE), 비밀번호, 닉네임, 상태(active/dormant/banned), 이메일인증여부
auth_provider       - 아이디(PK), 쉼표번호(FK), 제공자(kakao/google), 제공자ID
password_reset_token - 아이디(PK), 쉼표번호(FK), 토큰, 만료일시
email_verification  - 아이디(PK), 쉼표번호(FK), 토큰, 인증여부, 만료일시
user_settings       - 아이디(PK), 쉼표번호(FK), 알림설정, 테마
```
> ⚠️ 개인정보(이름/이메일)와 인증정보는 분리 저장

### [B] 진단 (심박 + 설문)
```
heart_rate_measurements - 아이디(PK), 쉼표번호(FK), 세션ID(FK), bpm, hrv, 측정일시, 디바이스, 신뢰도
measurement_sessions    - 아이디(PK), 쉼표번호(FK), 시작일시, 종료일시, 디바이스종류
survey_questions        - 아이디(PK), 질문내용, 카테고리, 순서, 활성여부
survey_choices          - 아이디(PK), 질문(FK), 선택지내용, 점수, 순서
survey_responses        - 아이디(PK), 쉼표번호(FK), 질문(FK), 선택지(FK), 응답일시
diagnosis_results       - 아이디(PK), 쉼표번호(FK), 세션ID(FK), 스트레스지수, 휴식유형, 점수JSON, 근거
rest_type_scores        - 아이디(PK), 진단결과(FK), 휴식유형(7가지), 점수(0~100), 순위
```
> ⚠️ "원천 데이터(측정값)" vs "산출물(진단결과)" 분리 — 재계산 가능하도록

### [C] 장소/추천/지도
```
places              - 아이디(PK), 장소명, 주소, 위도, 경도, 운영시간, AI점수, 상태(pending/approved/rejected)
place_tags          - 아이디(PK), 장소(FK), 태그명  [다대다 확장 가능]
place_photos        - 아이디(PK), 장소(FK), 사진URL, 출처
place_reviews       - 아이디(PK), 쉼표번호(FK), 장소(FK), 별점, 내용, 인증여부
place_bookmarks     - 아이디(PK), 쉼표번호(FK), 장소(FK) [UNIQUE]
recommendations     - 아이디(PK), 쉼표번호(FK), 진단결과(FK), 추천장소(FK), 추천기준, 클릭여부, 저장여부, 추천일시
```
> ⚠️ 추천 결과를 로그로 남겨야 통계/분석 화면이 진짜가 됨

### [D] 휴식 기록 (핵심 도메인)
```
rest_types          - 아이디(PK), 유형명(신체/정신/감각 등), 설명, 아이콘
rest_activities     - 아이디(PK), 휴식유형(FK), 활동명, 가이드내용
rest_logs           - 아이디(PK), 쉼표번호(FK), 휴식유형(FK), 장소(FK선택), 시작시간, 종료시간, 메모, 감정점수, 기분태그, 삭제여부(soft delete)
monthly_stats       - 아이디(PK), 쉼표번호(FK), 년월, 총휴식시간, 유형별비율JSON, 평균감정점수  [집계 테이블]
```
> ⚠️ 날짜/시간대 인덱스 필수. 월간 통계 도넛 차트를 위한 집계 테이블 또는 배치 설계 결정 필요

### [E] 커뮤니티/챌린지 (2차 MVP)
```
posts               - 아이디(PK), 쉼표번호(FK), 카테고리, 제목, 내용, 익명여부, status(visible/hidden/deleted)
comments            - 아이디(PK), 게시글(FK), 쉼표번호(FK), 부모댓글(FK선택), 내용, status
post_likes          - 게시글(FK), 쉼표번호(FK) [UNIQUE]
reports             - 아이디(PK), 신고자(FK), 대상유형, 대상아이디, 신고사유, 처리상태
challenges          - 아이디(PK), 제목, 설명, 기간일수, 인증방식, 달성배지명
challenge_participants - 아이디(PK), 챌린지(FK), 쉼표번호(FK), 달성일수, 상태
challenge_progress  - 아이디(PK), 참여자(FK), 인증사진URL, 메모, 인증날짜 [하루1회]
```
> ⚠️ 신고/숨김(관리자 관리)까지 고려해 status 필드 필수

### [F] 관리자/운영/통계
```
admin_users         - 아이디(PK), 쉼표번호(FK), 권한레벨
audit_logs          - 아이디(PK), 관리자(FK), 수행액션, 대상유형, 대상아이디, 수행일시
analytics_events    - 아이디(PK), 쉼표번호(FK), 이벤트유형, 이벤트데이터JSON, 발생일시
blocked_keywords    - 아이디(PK), 키워드, 활성여부 [UNIQUE]
badges              - 아이디(PK), 배지명, 설명, 아이콘URL, 달성조건유형
user_badges         - 쉼표번호(FK), 배지(FK), 획득일시 [UNIQUE]
notifications       - 아이디(PK), 쉼표번호(FK), 유형, 제목, 내용, 읽음여부
```

---

## 📄 페이지 목록

### 사용자 페이지
| 경로 | 파일 | 상태 | MVP |
|------|------|------|-----|
| `/` | MainDashboard.jsx | UI완성, API연결필요 | ✅ |
| `/login` | Login.jsx | UI완성, API연결필요 | ✅ |
| `/signup` | Signup.jsx | UI완성, API연결필요 | ✅ |
| `/signup-complete` | SignupComplete.jsx | 미완성 | ✅ |
| `/password-reset` | PasswordReset.jsx | 미완성 | ✅ |
| `/my` | MyPage.jsx | UI있음, API연결필요 | ✅ |
| `/rest-test` | RestTypeTest.jsx | 하드코딩, API연결필요 | ✅ |
| `/heartrate` | HeartRateCheck.jsx | 미완성 | ✅ |
| `/map` | MapPage.jsx | 하드코딩, 카카오맵미연동 | ✅ |
| `/rest-record` | RestRecord.jsx | 미완성 | ✅ |
| `/settings` | 없음 (새로 만들기) | 미완성 | ✅ |
| `/notifications` | 없음 (새로 만들기) | 미완성 | ✅ |
| `/rest/physical~creative` | Rest*.jsx (7개) | 디자인통일필요 | ✅ |
| `/community` | Community.jsx | UI있음 | 2차 |
| `/community/:id` | 없음 (새로 만들기) | 미완성 | 2차 |
| `/challenge` | Challenge.jsx | 미완성 | 2차 |

### 관리자 페이지
| 경로 | 파일 | 상태 |
|------|------|------|
| `/admin/login` | 없음 (새로 만들기) | 미완성 |
| `/admin` | AdminDashboard.jsx | UI완성, API연결필요 |
| `/admin/users` | UserManagement.jsx | UI있음, API연결필요 |
| `/admin/places` | PlaceApproval.jsx | UI있음, API연결필요 |
| `/admin/community` | CommunityManagement.jsx | UI있음, API연결필요 |
| `/admin/challenges` | ChallengeManagement.jsx | UI있음, API연결필요 |
| `/admin/analytics` | Analytics.jsx | UI있음, API연결필요 |
| `/admin/settings` | SystemSettings.jsx | UI있음, API연결필요 |

---

## 🔧 백엔드 작업 규칙 (MyBatis)

### API 응답 형식
```java
// 성공
{ "success": true, "data": {...}, "message": "처리완료" }
// 실패
{ "success": false, "data": null, "message": "에러 메시지" }
```

### 파일 생성 패턴 (4세트 항상 같이, 도메인별 패키지)
```
domain/{도메인명}/controller/ → XxxController.java   (@RestController)
domain/{도메인명}/service/    → XxxService.java      (비즈니스 로직)
domain/{도메인명}/mapper/     → XxxMapper.java       (@Mapper 인터페이스)
resources/mapper/{도메인명}/  → XxxMapper.xml        (SQL 쿼리)

예시 (auth 도메인):
  com.comma.domain.auth.controller.AuthController
  com.comma.domain.auth.service.AuthService
  com.comma.domain.auth.mapper.AuthMapper
  resources/mapper/auth/AuthMapper.xml

공통 기능:
  com.comma.global.config.*  (JwtUtil, JwtInterceptor, CorsConfig, WebConfig)
  com.comma.domain.user.model.User  (사용자 모델)
```

### model 규칙
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String 쉼표번호;  // PK — String 타입, bigint 아님
    private String email;
}
```
- **쉼표번호는 String** — bigint 변환 금지
- `map-underscore-to-camel-case: true` 설정 사용 중

### JWT 의존성
```gradle
implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.11.5'
runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.11.5'
implementation 'org.springframework.boot:spring-boot-starter-mail'
implementation 'org.springframework.boot:spring-boot-starter-data-redis'
```

---

## ⚛️ 프론트엔드 작업 규칙

### API 호출 (fetch 사용, axios 사용 안 함)
```js
// ✅ 이렇게
const res = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json',
             'Authorization': `Bearer ${localStorage.getItem('token')}` },
  body: JSON.stringify({ email, password })
});
const data = await res.json();

// ❌ axios 쓰지 마
```

### 로딩 & 에러 처리 (항상 포함)
```jsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
try {
  setLoading(true);
  const res = await fetch('/api/posts');
  const data = await res.json();
  setPosts(data.data);
} catch (e) {
  setError('데이터를 불러오지 못했어요.');
} finally {
  setLoading(false);
}
```

---

## 🔄 환경 동기화 — 집(맥북) ↔ 학원(윈도우)

### "나 학원이야" 또는 "나 집이야" 라고 하면
```bash
git pull origin develop
# pull 후 변경된 파일 목록 알려줘
```

### 작업 끝날 때 (자동 실행)
```bash
git add .
git commit -m "feat: 작업내용"
git push origin develop
```

### AWS EC2 접속
```bash
# 맥북
ssh -i ~/.ssh/comma-key.pem ec2-user@[EC2 IP]
# 윈도우: MobaXterm → Session → SSH → EC2 IP + .pem 키 등록
```

### 환경변수 (.env) — git에 올리지 말 것
```yaml
# application-local.yml
spring.datasource.password=실제비밀번호
jwt.secret=시크릿키
claude.api.key=클로드API키
kakao.client-secret=카카오시크릿
spring.mail.password=지메일앱비밀번호
```

---

## ⚠️ 주의사항

1. **핵심 흐름 먼저** — 진단→추천→기록→개선 데이터 품질 우선
2. **쉼표번호는 String** — bigint 변환 절대 금지
3. **Seed 데이터 먼저** — rest_types 7개, badges 5개 없으면 화면 텅 빔
4. **추천 로그 반드시 저장** — recommendations 테이블 기록해야 통계 살아남
5. **원천데이터 vs 산출물 분리** — 심박/응답(원천) ↔ 진단결과(산출물)
6. **관리자 role guard 필수** — 현재 인증 없이 접근 가능 (보안 위험)
7. **fetch 사용** — axios 쓰지 말 것
8. **커뮤니티/챌린지는 2차 MVP** — MVP 완성 후에 작업

---

## 🚀 Git 규칙 (형상관리)

```bash
feat: 회원가입 API 연결
fix: 로그인 토큰 버그 수정
style: 메인 대시보드 디자인 통일
refactor: 하드코딩 데이터 API로 교체
chore: MyBatis 의존성 추가
```

- 브랜치: `main` (배포) / `develop` (개발) / `feature/기능명`
- **develop에서 작업** — main은 배포 시만 merge

---

## 📋 작업 우선순위 (Phase별)

### Phase 0 — 프론트 정리 ✅ 완료
- 배경색/색상 통일, 공통 컴포넌트 (Button, Card, Input, Toast)
- 404 페이지, 빈화면 처리, 비로그인 라우트 가드

### Phase 1 — 백엔드 기반 ✅ 완료
- Spring Security + JWT + Redis + Mail 의존성 추가
- MySQL DDL 실행 (`schema.sql`)
- SecurityConfig, JwtUtil, JwtAuthFilter 생성

### Phase 2 — 인증
- 쉼표번호 자동생성, 회원가입/로그인 API (4세트)
- JWT 필터 연결, 카카오/구글 OAuth2
- 이메일 인증, 비밀번호 재설정
- 관리자 로그인, Signup.jsx / Login.jsx API 연결

### Phase 3 — 진단
- **survey_questions Seed 데이터 입력 (먼저!)**
- 설문 질문/응답 API, 점수 계산 로직
- 심박수 측정 세션 API, diagnosis_results 저장
- RestTypeTest.jsx API 연결

### Phase 4 — 장소 / 기록
- **공공데이터 크롤링 실행 (장소 Seed)**
- 장소 CRUD, 카카오맵 연동
- rest_logs CRUD, RestRecord.jsx 완성
- recommendations 저장 로직, 이미지 업로드 (S3)

### Phase 5 — 통계 / 마이페이지 / 알림
- monthly_stats 집계 로직
- MyPage.jsx API 연결 (통계 차트)
- 알림 API, 설정 페이지
- 배지 자동 지급 로직

### Phase 6 — 관리자 / 배포
- 관리자 API 전체, audit_logs
- Postman 전체 테스트
- HTTPS (Let's Encrypt), Nginx 설정
- AWS EC2 + RDS + S3 배포

### Phase 7 — 2차 MVP (시간 여유 있을 때)
- 커뮤니티 게시글/댓글/공감/신고
- 챌린지 참여/인증
- analytics_events 이벤트 로깅

---

## 💬 자주 쓰는 작업 요청 예시

```
"나 학원이야" / "나 집이야" → git pull 먼저 실행

"회원가입 API 4세트 만들어줘 (Controller, Service, Mapper, XML)"
"Signup.jsx 하드코딩 제거하고 fetch로 실제 API 연결해줘"
"공통 Button.jsx 컴포넌트 만들어줘 — primary/outline/ghost 3종류"
"rest_logs 테이블 기반으로 월간 통계 API 만들어줘"
"recommendations 테이블에 추천 로그 저장하는 로직 만들어줘"
"measurement_sessions 기반으로 심박 측정 시작/종료 API 만들어줘"
```
