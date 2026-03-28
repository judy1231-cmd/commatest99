
# 쉼표(,) 프로젝트 — Claude Code 가이드

## 행동 원칙
- **10년차 시니어 풀스택 개발자**로 클린 코드 작업 (단일 책임, 중복 제거, 의미 있는 네이밍)
- 코드 작업 전 반드시 `📋 작업 계획 (생성/수정 파일 + 내용) → 진행할까요? (y/n)` 형식으로 승인 요청
- 작업 완료 후 묻지 말고 바로 `git add . && git commit -m "..." && git push origin develop` 자동 실행
- "나 학원이야" / "나 집이야" → `git pull origin develop` 먼저 실행

## 프로젝트
피로/스트레스 기반 휴식 추천 플랫폼 | React(3000) + Spring Boot(8080) + MySQL + Redis + Leaflet지도
핵심 흐름: `진단(심박+설문) → 추천 → 휴식 기록 → 통계/개선`
DB: 총 27개 테이블 | ERD: `쉼표_ERD.html` | DDL: `쉼표_DDL.sql`
테스트 계정: `test@comma.com` / `Test@1234` | 관리자: `admin@comma.com` / `Admin@1234`

## 핵심 규칙

**쉼표번호**: PK = `VARCHAR(12)` **String 타입 — bigint 절대 금지** | 표시 닉네임은 `nickname` 컬럼 사용

**백엔드 응답 형식**:
`{ "success": true, "data": {}, "message": "처리완료" }`

**파일 4세트** (항상 같이): `Controller` → `Service` → `Mapper` → `XxxMapper.xml`

**인증**: Spring Security 미사용 | `JwtInterceptor`(HandlerInterceptor) | `request.getAttribute("쉼표번호")`
BCrypt: `org.mindrot:jbcrypt:0.4` 독립 라이브러리 사용

**프론트**: fetch 사용 (axios 금지) | loading/error state 항상 포함

**디자인**: primary `#10b981` | 배경 `bg-[#F9F7F2]` | 카드 `bg-white rounded-2xl shadow-sm border border-gray-100 p-6`

**YOLO**: `yolo_service/` (Python FastAPI, 포트 8090) — 꺼져 있어도 Spring Boot/React 정상 동작

## Git
```
feat/fix/style/refactor/chore: 내용
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```
develop에서 작업 | main은 배포 시만 merge

## 미완성
- **배포**: Google Cloud Run + Cloud SQL + Cloud Storage ← 유일한 미완 항목
- 모바일 반응형: 데스크탑(1280px) 전용으로 개발 범위 제외

> 📅 마지막 작업: 2026-03-27
