
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

### 작업 완료 후 자동 커밋 (필수)
코드 작업이 끝나면 **반드시 자동으로 git commit**해줘. 커밋 여부를 따로 물어보지 말고 바로 실행해:

```bash
git add .
git commit -m "feat/fix/style: 작업 내용 한 줄 요약

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

- push는 하지 마 (push는 내가 직접 할게)
- 커밋 메시지는 실제 작업 내용을 정확하게 요약해줘

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

### 핵심 사용자 여정
```
진단(심박+설문) → 추천/탐색 → 휴식 기록 → 통계/개선 → 커뮤니티/챌린지(2차)
```

### ⚠️ 멘토링 경고
> "화면은 많은데, 핵심 흐름(진단→추천→기록→개선)의 데이터가 얕음"
> **핵심 흐름의 데이터 품질을 먼저 완성시켜야 한다**

### MVP vs 2차 MVP
**MVP (필수)**
- 인증/계정: 회원가입, 로그인, 이메일인증, 비밀번호찾기
- 진단: 심박 측정 + 설문 → 휴식 유형 도출
- 추천/탐색: 메인 추천 카드, 휴식 지도, 유형별 상세
- 기록/개선: 휴식 기록, 월간 통계, 마이페이지
- 관리자: 로그인/대시보드, 사용자/콘텐츠 관리

**2차 MVP (나중에)**
- 커뮤니티/댓글/신고
- 챌린지 참여/달성률

### 회원 식별자 (현재 구조 — MVP 완성 후 개편 예정)

> ⚠️ 이상적인 설계는 BIGINT id(PK) + 쉼표번호(닉네임) 분리지만,
> 현재는 34개 FK 테이블 문제로 MVP 완료 후 리팩토링 예정

| 필드 | 값 예시 | 역할 | 변경 가능 |
|------|---------|------|----------|
| **쉼표번호** (PK) | `쉼표0001` | 내부 시스템 PK (String), 현재 구조상 고정 | ❌ |
| **username** | `test` | 로그인 아이디, 사용자에게 표시 | ❌ |
| **nickname** | `쉼표0001` | 사용자 표시 닉네임, 가입 시 쉼표번호와 동일값 자동생성 | ✅ |
| **email** | `test@comma.com` | 로그인 이메일 | ❌ |

- 쉼표번호: VARCHAR(12), **반드시 String 타입** — bigint 변환 금지
- 프론트/백엔드에서 사용자에게 보여줄 닉네임은 **nickname 컬럼** 사용
- username은 로그인 시 식별자로 사용

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
        ├── domain/               # 도메인별 패키지
        │   ├── auth/
        │   │   ├── controller/   # AuthController.java
        │   │   ├── service/      # AuthService.java
        │   │   └── mapper/       # AuthMapper.java
        │   └── user/
        │       └── model/        # User.java
        └── global/               # 공통/설정
            └── config/           # JwtUtil, JwtInterceptor, CorsConfig, WebConfig
```

---

## 🤖 YOLO 이미지 분석 서비스

> 브랜치: `feature/yolo-classification` (develop 머지 전)
> 디렉터리: `yolo_service/` (Python FastAPI, 포트 8090)

### 역할
1. **장소 사진 유형 자동 분류** — 관리자가 장소 승인 시, 첫 번째 사진을 YOLO에 보내 휴식 유형 태그 자동 등록
2. **커뮤니티/리뷰 사진 검증** — 업로드 시 부적절 이미지(무기류, 사람만 가득한 사진) 거부

### 실행 방법 (개발 시 선택)
```bash
cd yolo_service
python3 -m venv venv && source venv/bin/activate  # 최초 1회
pip install -r requirements.txt                   # 최초 1회
uvicorn main:app --host 0.0.0.0 --port 8090 --reload
```
> YOLO 서버를 켜지 않아도 Spring Boot/React는 정상 동작함 (graceful degradation)

### Spring Boot 연동 파일
- `global/util/YoloService.java` — YOLO FastAPI 연동 유틸
- `AdminService.java` — 장소 승인(approved) 시 `autoTagByYolo()` 자동 호출
- `PostService.java` — 커뮤니티 사진 업로드 시 `validateUploadedPhoto()` 호출
- `application.yml` — `yolo.service.url: ${YOLO_SERVICE_URL:http://localhost:8090}`

---

## ⚠️ 개발 범위
- **모바일 반응형 미구현** — 데스크탑(1280px 기준) 전용으로 개발

---

## 🛠 기술 스택

| 영역 | 기술 |
|------|------|
| FE | React, Tailwind CSS, JavaScript |
| BE | Java 17, Spring Boot 3, MyBatis, JWT, Tomcat |
| DB | MySQL |
| 캐시 | Redis (리프레시토큰) |
| 배포 | Google Cloud (Cloud Run + Cloud SQL + Cloud Storage) ← 1순위 / AWS (EC2 + RDS + S3) ← 2순위 |
| 웹서버 | Nginx |
| 컨테이너 | Docker |
| AI | Claude API, YOLOv8 (ultralytics) |
| 데이터수집 | Python, BeautifulSoup, 공공데이터포털 API |
| 지도 | Leaflet (카카오맵 사용 안 함) |
| 외부 API | 카카오 OAuth2, 구글 OAuth2, 기상청 API, 공공데이터포털 API |
| 형상관리 | Git, GitHub |
| API 테스트 | Postman |
| IDE | VS Code |
| 접속 툴 | MobaXterm |
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

## 📄 페이지 목록

### 사용자 페이지
| 경로 | 파일 | 상태 | MVP |
|------|------|------|-----|
| `/` | MainDashboard.jsx | UI완성, API연결필요 | ✅ |
| `/login` | Login.jsx | ✅ API연결완료 | ✅ |
| `/signup` | Signup.jsx | ✅ API연결완료 | ✅ |
| `/signup-complete` | SignupComplete.jsx | ✅ UI완성 (API 불필요) | ✅ |
| `/password-reset` | PasswordReset.jsx | ✅ API연결완료 | ✅ |
| `/places/:id` | PlaceDetail.jsx | ✅ API연결완료 (장소상세/리뷰/북마크, Leaflet 미니지도) | ✅ |
| `/my` | MyPage.jsx | UI있음, API연결필요 | ✅ |
| `/rest-test` | RestTypeTest.jsx | ✅ API연결완료 (12문항, 진단계산) | ✅ |
| `/heartrate` | HeartRateCheck.jsx | ✅ API연결완료 (동적URL, 복사버튼, QR) | ✅ |
| `/map` | MapPage.jsx | 하드코딩, Leaflet+공공데이터포털 연동 필요 | ✅ |
| `/rest-record` | RestRecord.jsx | ✅ API연결완료 (등록/목록/월간통계) | ✅ |
| `/community` | Community.jsx | UI있음 | 2차 |
| `/community/:id` | 없음 (새로 만들기) | 미완성 | 2차 |
| `/challenge` | Challenge.jsx | 미완성 | 2차 |
| `/settings` | 없음 (새로 만들기) | 미완성 | ✅ |
| `/notifications` | 없음 (새로 만들기) | 미완성 | ✅ |
| `/rest/physical~creative` | Rest*.jsx (7개) | 디자인통일필요 | ✅ |

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

## 🗄 DB 설계 (멘토링 기반 재설계 — 총 27개 테이블)

> 📁 ERD 시각자료: `쉼표_ERD.html`
> 📁 DDL SQL: `쉼표_DDL.sql` (MySQL에서 바로 실행 가능)

### ⚠️ Seed 데이터 현황 (Google Cloud SQL에 이미 입력 완료 ✅)
```sql
-- rest_types 7개 ✅
-- badges 5개 ✅
-- survey_questions 12개 ✅ (Q1~Q7 유형별 1문항 + Q13~Q17 유형별 2번째 문항)
--   ※ Q8~Q12는 설계 불량으로 DB에서 완전 삭제됨
--   ※ 점수 계산: 같은 유형 복수 질문 → 평균값 사용 (DiagnosisService)
-- survey_choices 48개 ✅ (각 질문당 4개: 20/40/70/100점)
-- challenges 3개 ✅
-- rest_activities 21개 ✅
-- 테스트 계정 (비밀번호 전부 Test@1234 / 관리자는 Admin@1234)
--   USER: test@comma.com, test2@comma.com, apitest@comma.com
--         user4~user8@comma.com (쉼표0004~쉼표0008)
--   ADMIN: admin@comma.com (쉼표9001), admin2@comma.com (쉼표0009), admin3@comma.com (쉼표0010)
```

### 핵심 데이터 흐름
```
users → measurement_sessions → diagnosis_results → recommendations → rest_logs → monthly_stats
```

### [A] 사용자 / 인증 (5개)
```
users                - 쉼표번호(PK/VARCHAR12), username(UNIQUE/로그인ID), 이메일(UNIQUE), 비밀번호, nickname(표시닉네임/변경가능), 상태(active/dormant/banned), 이메일인증여부, 권한(USER/ADMIN)
auth_provider        - 아이디(PK), 쉼표번호(FK), 제공자(kakao/google), 제공자ID(UNIQUE)
email_verification   - 아이디(PK), 쉼표번호(FK), 토큰, 인증여부, 만료일시
password_reset_token - 아이디(PK), 쉼표번호(FK), 토큰, 만료일시, 사용여부
user_settings        - 아이디(PK), 쉼표번호(FK/UNIQUE), 알림설정JSON, 테마, 스마트워치종류
```

### [B] 진단 — 심박 + 설문 (7개)
```
measurement_sessions      - 아이디(PK), 쉼표번호(FK), 시작일시, 종료일시, 디바이스종류, 신뢰도
heart_rate_measurements   - 아이디(PK), 세션ID(FK), 쉼표번호(FK), bpm, hrv, 측정일시  ← 원천데이터
survey_questions          - 아이디(PK), 질문내용, 카테고리, 순서, 활성여부
survey_choices            - 아이디(PK), 질문ID(FK), 선택지내용, 점수, 순서
survey_responses          - 아이디(PK), 쉼표번호(FK), 질문ID(FK), 선택지ID(FK), 응답일시  ← 원천데이터
diagnosis_results         - 아이디(PK), 쉼표번호(FK), 세션ID(FK), 스트레스지수, 주요휴식유형, 점수JSON  ← 산출물
rest_type_scores          - 아이디(PK), 진단결과ID(FK), 휴식유형(ENUM 7가지), 점수(0~100), 순위
```
> ⚠️ 원천데이터(측정값/응답) vs 산출물(진단결과) 분리 — 재계산 가능하도록

### [C] 장소 / 추천 / 지도 (6개)
```
places           - 아이디(PK), 장소명, 주소, 위도, 경도, 운영시간, AI점수, 상태(pending/approved/rejected)
place_tags       - 아이디(PK), 장소ID(FK), 태그명, 휴식유형  ← 다대다 확장 가능
place_photos     - 아이디(PK), 장소ID(FK), 사진URL, 출처
place_reviews    - 아이디(PK), 쉼표번호(FK), 장소ID(FK), 별점(1~5), 내용, 인증여부
place_bookmarks  - 아이디(PK), 쉼표번호(FK), 장소ID(FK)  [UNIQUE: 쉼표번호+장소ID]
recommendations  - 아이디(PK), 쉼표번호(FK), 진단결과ID(FK), 장소ID(FK), 추천기준, 클릭여부, 저장여부, 추천일시
```
> ⚠️ recommendations 반드시 저장 — 이게 없으면 통계/분석 화면이 가짜가 됨

### [D] 휴식 기록 — 핵심 도메인 (4개)
```
rest_types      - 아이디(PK), 유형명, 설명, 아이콘, 색상코드  ← Seed 7개 필수
rest_activities - 아이디(PK), 휴식유형ID(FK), 활동명, 가이드내용, 소요시간_분
rest_logs       - 아이디(PK), 쉼표번호(FK), 휴식유형ID(FK), 장소ID(FK/nullable), 시작시간, 종료시간, 메모, 감정점수_전(1~10), 감정점수_후(1~10), 기분태그JSON, 삭제여부(soft delete)
monthly_stats   - 아이디(PK), 쉼표번호(FK), 년월(UNIQUE+쉼표번호), 총휴식시간_분, 유형별비율JSON, 평균감정점수, 기록횟수
```
> ⚠️ rest_logs 인덱스: (쉼표번호), (시작시간), (쉼표번호+시작시간) 복합 인덱스 필수

### [E] 커뮤니티 / 챌린지 — 2차 MVP (7개)
```
posts                   - 아이디(PK), 쉼표번호(FK), 카테고리, 제목, 내용, 익명여부, status(visible/hidden/deleted)
comments                - 아이디(PK), 게시글ID(FK), 쉼표번호(FK), 부모댓글ID(FK/nullable), 내용, status
post_likes              - 게시글ID(FK)+쉼표번호(FK) [복합PK]
reports                 - 아이디(PK), 신고자쉼표번호(FK), 대상유형(post/comment), 대상ID, 신고사유, 처리상태
challenges              - 아이디(PK), 제목, 설명, 기간일수, 인증방식(photo/check/text), 달성배지ID(FK)
challenge_participants  - 아이디(PK), 챌린지ID(FK), 쉼표번호(FK), 달성일수, 상태  [UNIQUE: 챌린지ID+쉼표번호]
challenge_progress      - 아이디(PK), 참여자ID(FK), 인증사진URL, 메모, 인증날짜  [UNIQUE: 참여자ID+인증날짜 → 하루1회]
```

### [F] 관리자 / 운영 / 통계 (6개)
```
audit_logs        - 아이디(PK), 관리자쉼표번호(FK), 수행액션, 대상유형, 대상ID, 수행일시
analytics_events  - 아이디(PK), 쉼표번호(FK/nullable), 이벤트유형, 이벤트데이터JSON, 발생일시
badges            - 아이디(PK), 배지명, 설명, 아이콘URL, 달성조건유형  ← Seed 5개 포함
user_badges       - 쉼표번호(FK)+배지ID(FK) [복합PK]
notifications     - 아이디(PK), 쉼표번호(FK), 유형, 제목, 내용, 읽음여부
blocked_keywords  - 아이디(PK), 키워드(UNIQUE), 활성여부
```

---

## 🔧 백엔드 작업 규칙 (MyBatis)

### API 응답 형식
```java
// 성공
{ "success": true, "data": {...}, "message": "처리완료" }
// 실패
{ "success": false, "data": null, "message": "에러 메시지" }
```

### 파일 생성 패턴 (4세트 항상 같이)
```
1. domain/{도메인}/controller/ → XxxController.java   (@RestController)
2. domain/{도메인}/service/    → XxxService.java      (비즈니스 로직)
3. domain/{도메인}/mapper/     → XxxMapper.java       (@Mapper 인터페이스)
4. resources/mapper/{도메인}/  → XxxMapper.xml        (SQL 쿼리)
```

### model 규칙
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String 쉼표번호;  // PK — String 타입, bigint 절대 아님 (MVP 후 id BIGINT로 개편 예정)
    private String email;
}
```

### build.gradle 의존성
```gradle
implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.11.5'
runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.11.5'
implementation 'org.springframework.boot:spring-boot-starter-mail'
implementation 'org.springframework.boot:spring-boot-starter-data-redis'
implementation 'org.mindrot:jbcrypt:0.4'   // Spring Security 대신 BCrypt 직접 사용
```

### Spring Security 미사용 — JWT 인증 방식
- Spring Security 완전 미사용
- `HandlerInterceptor` (JwtInterceptor) 기반으로 JWT 인증 구현
- `request.getAttribute("쉼표번호")` 로 인증된 사용자 정보 획득
- BCrypt는 `org.mindrot:jbcrypt:0.4` 독립 라이브러리 사용

---

## ⚛️ 프론트엔드 작업 규칙

### API 호출 (fetch 사용, axios 사용 안 함)
```js
// ✅ 이렇게
const res = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
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
  const res = await fetch('/api/rest-logs');
  const data = await res.json();
  setLogs(data.data);
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
# 반드시 먼저 실행 후 변경된 파일 목록 알려줘
git pull origin develop
```

### 작업 끝날 때 (자동 실행)
```bash
git add .
git commit -m "feat: 작업내용"
git push origin develop
```

### Google Cloud 접속 (1순위)
```bash
# Cloud Run 배포
gcloud run deploy comma-backend --source . --region asia-northeast3

# Cloud SQL 접속 (Cloud SQL Auth Proxy)
./cloud-sql-proxy [PROJECT_ID]:[REGION]:[INSTANCE_NAME]
```

### AWS EC2 접속 (2순위 — 미사용 시 생략)
```bash
# MobaXterm (윈도우/맥북 둘 다)
# Session → SSH → EC2 IP 입력 + .pem 키 등록
```

### 환경변수 (.env) — git에 올리지 말 것
```yaml
# application-local.yml (gitignore에 추가)
spring.datasource.password=실제비밀번호
jwt.secret=시크릿키
claude.api.key=클로드API키
kakao.client-secret=카카오시크릿
spring.mail.password=지메일앱비밀번호
```

---

## ⚠️ 주의사항

1. **핵심 흐름 먼저** — 진단→추천→기록→개선 데이터 품질 우선
2. **쉼표번호는 현재 PK(String)** — bigint 변환 절대 금지 / 사용자 표시 닉네임은 **nickname 컬럼** 사용
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
- 미완성 4페이지 완성, Rest 유형 7페이지 통일

### Phase 1 — 백엔드 기반 ✅ 완료
- 도메인별 패키지 구조 적용 (domain/ + global/)
- Spring Security 제거 → HandlerInterceptor(JwtInterceptor) 기반 인증
- MySQL DDL 실행 (`쉼표_DDL.sql`)
- MyBatis 설정, CorsConfig, .env 관리
- **Postman 컬렉션 세팅**

### Phase 2 — 인증 ✅ 완료
- 쉼표번호 자동생성, 회원가입/로그인 API ✅
- JWT 인증 (HandlerInterceptor 기반, Spring Security 미사용) ✅
- Signup.jsx / Login.jsx API 연결 ✅
- 카카오/구글 OAuth2, 이메일 인증, 비밀번호 재설정 → 미완

### Phase 3 — 진단 ✅ 완료
- survey_questions Seed 12문항 입력 ✅
- 설문 질문/응답 API, 점수 계산 로직 (유형별 평균) ✅
- 심박수 측정 세션 API, diagnosis_results 저장 ✅
- RestTypeTest.jsx API 연결 ✅
- HeartRateCheck.jsx API 연결 + 동적 URL ✅
- Apple Watch (단축어), Galaxy Watch (Google Fit API) → 다음 세션

### Phase 4 — 장소 / 기록 (진행 중)
- rest_logs CRUD, RestRecord.jsx 완성 ✅
- StatsMapper.xml year_month 버그 수정 ✅
- Galaxy Watch → 준비 중 UI 처리 완료 ✅ (HeartRateCheck.jsx)
- place_photos DB 사진 교체 완료 ✅ (나팔리 코스트 트레일 place_id=545)
- YOLO 이미지 분석 서비스 연동 ✅ (feature/yolo-classification 브랜치)
- **공공데이터 크롤링 실행 (장소 Seed)** → 미완
- 장소 CRUD, Leaflet 지도 + 공공데이터포털 API 연동 → 미완
- recommendations 저장 로직 → 미완

> 📅 마지막 작업: 2026-03-22

### Phase 5 — 통계 / 마이페이지 / 알림
- monthly_stats 집계 로직
- MyPage.jsx API 연결 (통계 차트)
- 알림 API, 설정 페이지
- 배지 자동 지급 로직
- 검색/페이지네이션

### Phase 6 — 관리자 / 배포
- 관리자 API 전체, audit_logs
- Postman 전체 테스트
- HTTPS (Let's Encrypt), Nginx 설정
- Google Cloud Run + Cloud SQL + Cloud Storage 배포 (1순위)
- 모바일 반응형, UI 폴리시

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
"rest_logs 테이블 기반으로 월간 통계 API 만들어줘"
"recommendations 테이블에 추천 로그 저장하는 로직 만들어줘"
"measurement_sessions 기반으로 심박 측정 시작/종료 API 만들어줘"
"공통 Button.jsx 컴포넌트 만들어줘 — primary/outline/ghost 3종류"
```
