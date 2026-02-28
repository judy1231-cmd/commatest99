"""
쉼표 프로젝트 — 공공데이터포털 장소 크롤링 스크립트
========================================================
학원에서 실행할 것!

사전 준비:
  pip install requests pymysql

실행 방법:
  python crawl_places.py

설정:
  아래 CONFIG 섹션에서 API_KEY, DB 비밀번호를 실제 값으로 바꿔줘.
  API_KEY = 공공데이터포털(data.go.kr) 일반 인증키 (Decoding)
"""

import requests
import pymysql
import time

# ============================================================
# ★ 여기만 수정하면 됨
# ============================================================
API_KEY  = "여기에_공공데이터포털_인증키_넣기"   # data.go.kr → 마이페이지 → 인증키
DB_HOST  = "localhost"
DB_USER  = "root"
DB_PASS  = "admin1234"
DB_NAME  = "comma_db"
# ============================================================

# 한국관광공사 TourAPI — 7가지 휴식유형별 카테고리 매핑
# contentTypeId: 12=관광지, 14=문화시설, 28=레포츠, 39=음식점
# cat1/cat2/cat3 는 한국관광공사 공식 분류 코드
CRAWL_TARGETS = [
    {
        "restType": "nature",
        "label": "자연 / 공원",
        "contentTypeId": "12",
        "cat1": "A01",          # 자연
        "areaCode": "1",        # 서울 (전국: 비워두기)
    },
    {
        "restType": "physical",
        "label": "스포츠 / 레포츠",
        "contentTypeId": "28",  # 레포츠
        "cat1": "A03",
        "areaCode": "1",
    },
    {
        "restType": "creative",
        "label": "문화시설",
        "contentTypeId": "14",  # 문화시설 (미술관, 공방 등)
        "cat1": "A02",
        "areaCode": "1",
    },
    {
        "restType": "social",
        "label": "관광지 / 커뮤니티",
        "contentTypeId": "12",
        "cat1": "A02",
        "areaCode": "1",
    },
    {
        "restType": "mental",
        "label": "사찰 / 전통",
        "contentTypeId": "12",
        "cat1": "A02",
        "cat2": "A0201",        # 역사관광지 (사찰 포함)
        "areaCode": "1",
    },
    {
        "restType": "sensory",
        "label": "온천 / 스파",
        "contentTypeId": "28",
        "cat1": "A03",
        "cat2": "A0302",        # 휴양관광지 (온천 포함)
        "areaCode": "1",
    },
    {
        "restType": "emotional",
        "label": "공원 / 힐링",
        "contentTypeId": "12",
        "cat1": "A01",
        "cat2": "A0101",        # 자연관광지 (힐링 공간)
        "areaCode": "2",        # 인천
    },
]

BASE_URL = "https://apis.data.go.kr/B551011/KorService1/areaBasedList1"


def fetch_places(target, page=1, num_of_rows=50):
    """공공데이터 TourAPI에서 장소 목록 조회"""
    params = {
        "serviceKey": API_KEY,
        "numOfRows": num_of_rows,
        "pageNo": page,
        "MobileOS": "ETC",
        "MobileApp": "쉼표",
        "_type": "json",
        "contentTypeId": target["contentTypeId"],
        "areaCode": target.get("areaCode", ""),
        "listYN": "Y",
        "arrange": "Q",         # 추천순
    }
    if "cat1" in target:
        params["cat1"] = target["cat1"]
    if "cat2" in target:
        params["cat2"] = target["cat2"]
    if "cat3" in target:
        params["cat3"] = target["cat3"]

    try:
        res = requests.get(BASE_URL, params=params, timeout=10)
        res.raise_for_status()
        body = res.json().get("response", {}).get("body", {})
        items = body.get("items", {})
        if not items:
            return []
        raw = items.get("item", [])
        return raw if isinstance(raw, list) else [raw]
    except Exception as e:
        print(f"  ⚠️  API 호출 실패: {e}")
        return []


def save_to_db(conn, items, rest_type):
    """조회한 장소를 places + place_tags 테이블에 저장"""
    saved = 0
    with conn.cursor() as cur:
        for item in items:
            name    = item.get("title", "").strip()
            address = (item.get("addr1", "") + " " + item.get("addr2", "")).strip()
            lat     = item.get("mapy")   # 위도
            lng     = item.get("mapx")   # 경도

            if not name or not lat or not lng:
                continue

            try:
                lat = float(lat)
                lng = float(lng)
            except (ValueError, TypeError):
                continue

            # places 테이블 INSERT (중복 이름+주소는 무시)
            cur.execute(
                """
                INSERT IGNORE INTO places
                  (name, address, latitude, longitude, ai_score, status, created_at)
                VALUES (%s, %s, %s, %s, %s, 'approved', NOW())
                """,
                (name, address, lat, lng, 3.5),
            )

            # 방금 INSERT한 ID 가져오기 (이미 있으면 SELECT)
            cur.execute(
                "SELECT id FROM places WHERE name = %s AND address = %s",
                (name, address),
            )
            row = cur.fetchone()
            if not row:
                continue
            place_id = row[0]

            # place_tags 테이블에 휴식유형 태그 추가
            cur.execute(
                """
                INSERT IGNORE INTO place_tags (place_id, tag_name, rest_type)
                VALUES (%s, %s, %s)
                """,
                (place_id, rest_type, rest_type),
            )
            saved += 1

    conn.commit()
    return saved


def main():
    print("=" * 50)
    print("  쉼표 공공데이터 장소 크롤링 시작")
    print("=" * 50)

    if API_KEY == "여기에_공공데이터포털_인증키_넣기":
        print("\n❌ API_KEY를 먼저 설정해줘! (파일 상단 CONFIG 섹션)")
        return

    conn = pymysql.connect(
        host=DB_HOST, user=DB_USER, password=DB_PASS,
        database=DB_NAME, charset="utf8mb4",
    )
    print("✅ DB 연결 성공\n")

    total = 0
    for target in CRAWL_TARGETS:
        print(f"📍 [{target['restType']}] {target['label']} 수집 중...")

        items = fetch_places(target, page=1, num_of_rows=50)
        if not items:
            print("  → 데이터 없음\n")
            continue

        saved = save_to_db(conn, items, target["restType"])
        total += saved
        print(f"  → {saved}개 저장 완료\n")

        time.sleep(0.3)   # API 과부하 방지

    conn.close()
    print(f"{'=' * 50}")
    print(f"  완료! 총 {total}개 장소 저장됨")
    print(f"{'=' * 50}")


if __name__ == "__main__":
    main()
