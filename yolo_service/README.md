# 쉼표 YOLO 이미지 분석 서비스

## 개요
- 포트: **8090**
- 역할 1: 장소 사진 → 휴식 유형 자동 분류 (관리자 승인 시)
- 역할 2: 커뮤니티/리뷰 업로드 사진 → 부적절 이미지 검증

---

## 네가 해야 할 일 (최초 1회)

### 1. Python 3.9 이상 확인
```bash
python3 --version
```

### 2. 가상환경 생성 (권장)
```bash
cd yolo_service
python3 -m venv venv
source venv/bin/activate        # 맥북
# venv\Scripts\activate         # 윈도우(학원)
```

### 3. 패키지 설치
```bash
pip install -r requirements.txt
```
> 첫 실행 시 YOLOv8 모델(yolov8n.pt, 약 6MB) 자동 다운로드됨

### 4. 서버 실행
```bash
uvicorn main:app --host 0.0.0.0 --port 8090 --reload
```

---

## 서버 실행 순서 (매번 개발할 때)

```
터미널 1: cd backend && ./gradlew bootRun        (Spring Boot, 포트 8080)
터미널 2: cd yolo_service && uvicorn main:app --port 8090 --reload  (YOLO, 포트 8090)
터미널 3: cd frontend && npm start               (React, 포트 3000)
```

> YOLO 서버를 안 켜도 Spring Boot/React는 정상 동작함
> YOLO 서버가 꺼져 있으면 → 장소 유형 자동 분류/사진 검증 기능만 비활성화됨

---

## API 테스트 (Postman or curl)

### 헬스체크
```
GET http://localhost:8090/health
```

### 장소 사진 URL로 유형 분류
```
POST http://localhost:8090/analyze/url
Body (JSON): { "url": "https://example.com/place.jpg" }
```

### 업로드 파일 검증
```
POST http://localhost:8090/analyze/upload
Body (form-data): file = [이미지 파일]
```

---

## 되돌리는 법

이상하면 그냥 develop 브랜치로 돌아가면 끝:
```bash
git checkout develop
```
YOLO 서버는 안 켜면 되고, Spring Boot 연동 코드도 브랜치에만 있음.
