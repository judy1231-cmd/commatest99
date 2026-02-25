# 쉼표 (,) 프로젝트 — Claude Code 작업 가이드

> 이 파일을 먼저 전부 읽고 작업을 시작해줘.
> 프로젝트 구조, 기술 스택, 작업 규칙이 모두 담겨 있어.

---

## 🤖 Claude Code 행동 원칙

### 나의 역할
- 나는 **10년차 시니어 풀스택 개발자**야
- 항상 **클린 코드** 원칙으로 작업해줘:
  - 함수는 하나의 역할만
  - 변수/함수명은 의미 있게 (축약 금지)
  - 중복 코드 제거, 공통 로직은 분리
  - 주석은 "왜"를 설명 (무엇은 코드가 말함)
  - 단일 책임 원칙 준수

### 작업 전 승인 요청 (필수)
코드 작성/수정 전에 반드시 아래 형식으로 먼저 물어봐줘:

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

**쉼표(,)** 는 사용자가 자신에게 맞는 휴식 방법을 찾고, 기록하고, 커뮤니티에서 공유하는 **개인 맞춤형 웰니스 플랫폼**이야.

### 핵심 사용자 여정
```
회원가입/로그인 → 심리 진단 → 휴식 유형 확인 → 장소 탐색 → 휴식 기록 → 커뮤니티 공유 → 챌린지 참여 → 배지 획득
```

### 회원 식별자
- 일반 PK(bigint)가 아닌 **쉼표번호** 사용
- 형식: `쉼표` + 4자리 숫자 (예: `쉼표1234`)
- varchar(12), 가입 시 자동 생성, 중복 불가

---

## 🗂 프로젝트 구조

```
comma-main/
├── frontend/          # React (포트 3000)
│   └── src/
│       ├── api/
│       │   └── api.js          # fetch 기반 API 유틸
│       ├── components/
│       │   ├── common/         # Button, Card, Input, Toast
│       │   ├── user/
│       │   │   └── UserNavbar.jsx
│       │   └── admin/
│       │       ├── AdminHeader.jsx
│       │       └── AdminSidebar.jsx
│       └── pages/
│           ├── user/
│           └── admin/
└── backend/           # Spring Boot (포트 8080)
    └── src/main/java/com/comma/
        ├── controller/
        ├── service/
        ├── repository/     # JPA Repository
        ├── entity/         # JPA Entity
        ├── dto/            # Request/Response DTO
        └── config/
```

---

## 🛠 기술 스택

### 프론트엔드
| 항목 | 내용 |
|------|------|
| 프레임워크 | React |
| 언어 | JavaScript |
| 라우팅 | react-router-dom v6 |
| HTTP | fetch API (axios 사용 안함) |
| 스타일 | Tailwind CSS |

### 백엔드
| 항목 | 내용 |
|------|------|
| 프레임워크 | Spring Boot 3.2.3 |
| ORM | JPA / Hibernate |
| DB | MySQL |
| Java | 17 |
| 빌드 | Gradle |

### build.gradle 의존성
```gradle
// JPA
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'

// JWT
implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.11.5'
runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.11.5'

// 이메일
implementation 'org.springframework.boot:spring-boot-starter-mail'

// Redis
implementation 'org.springframework.boot:spring-boot-starter-data-redis'
```

---

## 🎨 디자인 시스템 (Tailwind)

```js
colors: {
  primary: '#10b981',
  'soft-mint': '#ECFDF5',
  'text-main': '#334155',
  'text-muted': '#64748B',
  'background-light': '#F9F9F7',
}
```

### 공통 컴포넌트 규칙
- **버튼**: `bg-primary text-white rounded-xl px-4 py-2.5 font-bold hover:bg-primary/90`
- **카드**: `bg-white rounded-2xl shadow-sm border border-gray-100 p-6`
- **인풋**: `w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none`
- **페이지 배경**: `min-h-screen bg-[#F9F7F2]`

---

## 📄 페이지 목록

### 사용자 페이지
| 경로 | 파일 | 상태 |
|------|------|------|
| `/` | MainDashboard.jsx | UI완성, API연결필요 |
| `/login` | Login.jsx | UI완성, API연결필요 |
| `/signup` | Signup.jsx | UI완성, API연결필요 |
| `/signup-complete` | SignupComplete.jsx | 미완성 |
| `/password-reset` | PasswordReset.jsx | 미완성 |
| `/my` | MyPage.jsx | UI있음, API연결필요 |
| `/rest-test` | RestTypeTest.jsx | 하드코딩, API연결필요 |
| `/heartrate` | HeartRateCheck.jsx | 미완성 |
| `/map` | MapPage.jsx | 하드코딩, 카카오맵미연동 |
| `/rest-record` | RestRecord.jsx | 미완성 |
| `/community` | Community.jsx | UI있음, 상세페이지없음 |
| `/challenge` | Challenge.jsx | 미완성 |
| `/rest/physical~creative` | Rest*.jsx (7개) | 디자인통일필요 |

### 새로 만들어야 할 페이지
| 경로 | 설명 |
|------|------|
| `/community/:id` | 게시글 상세 + 댓글 |
| `/settings` | 알림/테마 설정 |
| `/notifications` | 알림 목록 |
| `/admin/login` | 관리자 로그인 |

### 관리자 페이지
| 경로 | 파일 | 상태 |
|------|------|------|
| `/admin` | AdminDashboard.jsx | UI완성, API연결필요 |
| `/admin/users` | UserManagement.jsx | UI있음, API연결필요 |
| `/admin/places` | PlaceApproval.jsx | UI있음, API연결필요 |
| `/admin/community` | CommunityManagement.jsx | UI있음, API연결필요 |
| `/admin/challenges` | ChallengeManagement.jsx | UI있음, API연결필요 |
| `/admin/analytics` | Analytics.jsx | UI있음, API연결필요 |
| `/admin/settings` | SystemSettings.jsx | UI있음, API연결필요 |

---

## 🗄 DB 테이블 목록 (25개)

```
[사용자]
회원           - 쉼표번호(PK), 이메일, 비밀번호, 닉네임, 가입방식, 권한, 상태, 이메일인증여부
리프레시토큰   - Redis 저장 (쉼표번호 → 토큰)
회원설정       - 아이디(PK), 쉼표번호(FK), 알림설정, 테마, 스마트워치종류
알림           - 아이디(PK), 쉼표번호(FK), 유형, 제목, 내용, 읽음여부

[진단]
진단질문       - 아이디(PK), 질문내용, 카테고리, 순서, 활성여부
질문선택지     - 아이디(PK), 진단질문(FK), 선택지내용, 점수, 순서
진단결과       - 아이디(PK), 쉼표번호(FK), 검사유형, 심박수, 심박변이도, 결과JSON
휴식유형점수   - 아이디(PK), 진단결과(FK), 휴식유형(7가지), 점수(0~100), 순위

[장소]
장소           - 아이디(PK), 장소명, 주소, 위도, 경도, 휴식유형목록, 소음도, AI점수, 상태
장소사진       - 아이디(PK), 장소(FK), 사진URL, 출처
장소즐겨찾기   - 아이디(PK), 쉼표번호(FK), 장소(FK) [UNIQUE]
장소리뷰       - 아이디(PK), 쉼표번호(FK), 장소(FK), 평점, 내용, 인증여부

[휴식기록]
휴식일기       - 아이디(PK), 쉼표번호(FK), 장소(FK선택), 휴식유형, 내용, 감정점수, 기분태그

[챌린지]
챌린지         - 아이디(PK), 제목, 설명, 기간일수, 인증방식, 달성배지명
챌린지참여자   - 아이디(PK), 챌린지(FK), 쉼표번호(FK), 달성일수, 상태
챌린지인증     - 아이디(PK), 참여자(FK), 인증사진URL, 메모, 인증날짜 [하루1회]

[커뮤니티]
게시글         - 아이디(PK), 쉼표번호(FK), 장소(FK선택), 카테고리, 제목, 내용, 익명여부
댓글           - 아이디(PK), 게시글(FK), 쉼표번호(FK), 부모댓글(FK선택), 내용
게시글공감     - 게시글(FK), 쉼표번호(FK) [UNIQUE]
댓글공감       - 댓글(FK), 쉼표번호(FK) [UNIQUE]
신고           - 아이디(PK), 신고자쉼표번호(FK), 대상유형, 대상아이디, 신고사유, 처리상태

[배지]
배지정의       - 아이디(PK), 배지명, 설명, 아이콘URL, 달성조건유형
회원배지       - 쉼표번호(FK), 배지정의(FK), 획득일시 [UNIQUE]

[관리자]
관리자로그     - 아이디(PK), 관리자쉼표번호(FK), 수행액션, 대상유형, 대상아이디
차단키워드     - 아이디(PK), 키워드, 활성여부 [UNIQUE]
```

---

## 🔧 백엔드 작업 규칙 (JPA)

### API 응답 형식 (통일)
```java
// 성공
{ "success": true, "data": {...}, "message": "처리완료" }

// 실패
{ "success": false, "data": null, "message": "에러 메시지" }
```

### 파일 생성 패턴 (JPA 기준 5세트)
```
1. entity/      → Xxx.java          (@Entity, @Id, 연관관계)
2. dto/         → XxxRequestDto.java, XxxResponseDto.java
3. repository/  → XxxRepository.java (@Repository extends JpaRepository)
4. service/     → XxxService.java   (비즈니스 로직)
5. controller/  → XxxController.java (@RestController)
```

### Entity 규칙
```java
@Entity
@Table(name = "회원")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class 회원 {

    @Id
    @Column(name = "쉼표번호", length = 12)
    private String 쉼표번호;   // PK → String 타입, bigint 아님

    @Column(nullable = false, unique = true)
    private String 이메일;

    // 생성자는 정적 팩토리 메서드 사용
    public static 회원 create(String 쉼표번호, String 이메일, ...) {
        회원 member = new 회원();
        member.쉼표번호 = 쉼표번호;
        member.이메일 = 이메일;
        return member;
    }
}
```

### JWT 관련
```gradle
implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.11.5'
runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.11.5'
```

---

## ⚛️ 프론트엔드 작업 규칙

### API 호출 (fetch 사용, axios 사용 안함)
```js
// ✅ 이렇게 해줘
const res = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await res.json();

// ❌ axios 쓰지 말
import axios from 'axios';
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

### 인증 토큰 처리
```js
// 요청 시 토큰 첨부
const res = await fetch('/api/...', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 🔄 환경 동기화 — 집(맥북) ↔ 학원(윈도우)

민정씨는 두 곳에서 작업해:
- **학원**: 윈도우 PC + MobaXterm (AWS EC2 접속)
- **집**: 맥북 + 기본 터미널 (AWS EC2 접속)

### "나 학원이야" 또는 "나 집이야" 라고 하면
```bash
# 반드시 먼저 실행
git pull origin develop
# pull 후 변경된 파일 목록 알려줘
```

### 작업 끝날 때 (자동 실행)
```bash
git add .
git commit -m "feat: 작업내용"
git push origin develop
```

### ⚠️ 충돌났을 때
```bash
git status
# 해결 후
git add .
git commit -m "fix: 충돌 해결"
git push origin develop
```

---

## 💻 개발 환경

### 맥북 (집)
```bash
cd frontend && npm start       # http://localhost:3000
cd backend && ./gradlew bootRun # http://localhost:8080
```

### 윈도우 (학원)
```bash
cd frontend && npm start
cd backend && gradlew.bat bootRun
```

### AWS EC2 접속
```bash
# 맥북 (터미널)
ssh -i ~/.ssh/comma-key.pem ec2-user@[EC2 IP]

# 윈도우 (MobaXterm)
# Session → SSH → EC2 IP 입력, .pem 키 등록
```

### 환경변수 (.env) — git에 올리지 말 것
```
REACT_APP_KAKAO_MAP_KEY=카카오맵API키
REACT_APP_API_URL=http://localhost:8080
```

```yaml
# application-local.yml (gitignore)
spring.datasource.password=실제비밀번호
jwt.secret=시크릿키
claude.api.key=클로드API키
kakao.client-secret=카카오시크릿
```

---

## 📋 작업 우선순위 (Phase별)

### Phase 0 — 프론트 정리 (지금 당장)
1. 배경색 `bg-[#F9F7F2]` 전체 통일
2. `components/common/` → Button, Card, Input, Toast 생성
3. 비로그인 라우트 가드, 404 페이지, 빈화면 처리

### Phase 1 — 백엔드 기반 (JPA)
1. build.gradle JPA 의존성 추가
2. Entity 25개 클래스 생성 + 연관관계 매핑
3. application.yml JPA 설정 (ddl-auto: validate)

### Phase 2~6 — BE 먼저 → FE 연결 순서

---

## ⚠️ 주의사항

1. **쉼표번호는 String** → @Id 타입 String, bigint 변환 금지
2. **관리자 페이지 role guard 필수** → 현재 인증 없이 접근 가능 (보안 위험)
3. **Seed 데이터 먼저** → 진단질문 없으면 화면 텅 빔
4. **공통 컴포넌트 먼저** → 새 UI 전에 `components/common/` 확인
5. **fetch 사용** → axios 쓰지 말 것

---

## 🚀 Git 규칙 (필수관리)

```bash
feat: 회원가입 API 연결
fix: 로그인 토큰 저장 버그 수정
style: 메인 대시보드 디자인 통일
refactor: 하드코딩 데이터 API로 교체
chore: JPA 의존성 추가
```

- 브랜치: `main` (배포) / `develop` (개발) / `feature/기능명`
- **develop에서 작업** → main은 배포 시만 merge
- 작업 완료 후 항상 `git add → commit → push` 자동 실행

---

## 💬 자주 쓰는 작업 요청 예시

```
"나 학원이야" → git pull 먼저 실행
"나 집이야"   → git pull 먼저 실행

"회원가입 API JPA 5세트 만들어줘 (Entity, DTO, Repository, Service, Controller)"
"Signup.jsx 하드코딩 제거하고 fetch로 실제 API 연결해줘"
"공통 Button.jsx 컴포넌트 만들어줘 — primary/outline/ghost 3종류"
"RestRecord.jsx 완성해줘 — 일기 작성 폼, 감정 슬라이더, 기분 태그 포함"
"community/:id 게시글 상세 페이지 새로 만들어줘"
```
