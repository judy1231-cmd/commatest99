"""
쉼표 프로젝트 — YOLO 이미지 분석 서비스
=========================================
포트: 8090
용도 1: 장소 사진 → 휴식 유형 자동 분류
용도 2: 커뮤니티/리뷰 사진 → 부적절 이미지 검증

실행 방법:
  pip install ultralytics fastapi uvicorn python-multipart requests
  uvicorn main:app --host 0.0.0.0 --port 8090 --reload
"""

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
import requests
import tempfile
import os

app = FastAPI(title="쉼표 YOLO 서비스", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# YOLOv8 모델 로드 (첫 실행 시 자동 다운로드 ~6MB)
model = YOLO("yolov8n.pt")

# ─────────────────────────────────────────────
# COCO 80개 클래스 → 쉼표 휴식 유형 매핑
# ─────────────────────────────────────────────
NATURE_CLASSES    = {"tree", "potted plant", "bird", "cat", "dog", "horse",
                     "cow", "sheep", "bench", "boat", "kite", "surfboard"}
PHYSICAL_CLASSES  = {"bicycle", "skateboard", "skis", "snowboard", "sports ball",
                     "baseball bat", "baseball glove", "tennis racket", "frisbee"}
CREATIVE_CLASSES  = {"laptop", "keyboard", "mouse", "book", "scissors",
                     "teddy bear", "cell phone"}
SOCIAL_CLASSES    = {"dining table", "wine glass", "cup", "fork", "knife",
                     "spoon", "bowl", "pizza", "sandwich", "cake", "hot dog"}
SENSORY_CLASSES   = {"couch", "bed", "vase", "clock", "tv", "remote", "hair drier",
                     "toothbrush", "umbrella"}
MENTAL_CLASSES    = {"chair", "book", "suitcase"}  # 독서/집중 환경

CATEGORY_MAP = {
    "자연적 휴식": NATURE_CLASSES,
    "신체적 휴식": PHYSICAL_CLASSES,
    "창조적 휴식": CREATIVE_CLASSES,
    "사회적 휴식": SOCIAL_CLASSES,
    "감각적 휴식": SENSORY_CLASSES,
    "정신적 휴식": MENTAL_CLASSES,
}

# 부적절 이미지 판단 기준
INAPPROPRIATE_CLASSES = {"knife", "gun", "scissors"}
MAX_PERSON_RATIO = 0.8  # 전체 감지 객체 중 person 비율이 이 이상이면 경고


def analyze_image_from_path(image_path: str) -> dict:
    results = model(image_path, verbose=False)[0]
    detected = [model.names[int(cls)] for cls in results.boxes.cls] if results.boxes else []

    # 유형 점수 계산
    scores = {cat: 0 for cat in CATEGORY_MAP}
    for obj in detected:
        for cat, classes in CATEGORY_MAP.items():
            if obj in classes:
                scores[cat] += 1

    best_category = max(scores, key=scores.get)
    best_score = scores[best_category]

    # 부적절 이미지 검증
    person_count = detected.count("person")
    person_ratio = person_count / len(detected) if detected else 0
    has_inappropriate = any(obj in INAPPROPRIATE_CLASSES for obj in detected)
    is_valid = not has_inappropriate and person_ratio < MAX_PERSON_RATIO

    return {
        "detected_objects": detected,
        "scores": scores,
        "suggested_category": best_category if best_score >= 1 else None,
        "confidence": best_score,
        "is_valid_photo": is_valid,
        "rejection_reason": (
            "부적절한 객체가 감지되었습니다." if has_inappropriate
            else "사람만 가득한 사진은 장소 사진으로 적합하지 않아요." if person_ratio >= MAX_PERSON_RATIO
            else None
        ),
    }


# ─────────────────────────────────────────────
# API 엔드포인트
# ─────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "yolo"}


class UrlRequest(BaseModel):
    url: str


@app.post("/analyze/url")
def analyze_by_url(req: UrlRequest):
    """이미지 URL로 분석 (장소 사진 → 유형 분류)"""
    try:
        response = requests.get(req.url, timeout=10)
        response.raise_for_status()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as f:
            f.write(response.content)
            tmp_path = f.name
        result = analyze_image_from_path(tmp_path)
        os.unlink(tmp_path)
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/analyze/upload")
async def analyze_by_upload(file: UploadFile = File(...)):
    """파일 업로드로 분석 (커뮤니티/리뷰 사진 검증)"""
    try:
        contents = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as f:
            f.write(contents)
            tmp_path = f.name
        result = analyze_image_from_path(tmp_path)
        os.unlink(tmp_path)
        return {"success": True, "data": result}
    except Exception as e:
        return {"success": False, "error": str(e)}
