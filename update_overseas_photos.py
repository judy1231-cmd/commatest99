"""
해외 장소 깨진 사진 → 위키피디아 썸네일(CC 라이선스)로 교체
- 깨진 URL 패턴만 대상 (좋은 사진은 유지)
- 위키피디아 이미지: CC BY-SA 라이선스, 상업적 사용 가능
"""
import pymysql
import requests
import time
import re

DB = dict(
    host="34.64.92.18",
    user="commatest",
    password="Comma_1234",
    db="comma_db",
    charset="utf8mb4",
    ssl={"ssl": {}},
)

WIKI_HEADERS = {"User-Agent": "comma-app/1.0 (educational project)"}

# 깨진 URL 패턴
BROKEN_PATTERNS = [
    r"cfile\d*\.\w+\.daum\.net",
    r"pds\d*\.cafe\.daum\.net",
    r"t1\.daumcdn\.net/(cfile|news|brunch|keditor)",
    r"t1\.daumcdn\.net/thumb.*fname=http%3A%2F%2Ft1\.daumcdn",  # 이중래핑 깨진 thumb
]

# 장소명 → 위키피디아 검색 키워드 매핑 (한국어)
WIKI_KEYWORD_MAP = {
    470: ("오호리 공원", "ja"),          # 후쿠오카 오호리 공원
    472: ("다카오산", "ja"),             # 도쿄 다카오산
    473: ("우붓", "id"),                # 발리 우붓
    474: ("밀퍼드 사운드", "ko"),         # 뉴질랜드 → 밀퍼드로 대체
    483: ("아라시야마", "ko"),           # 교토 아라시야마
    484: ("따나롯", "ko"),              # 발리 따나롯
    513: ("기온 교토", "ko"),           # 교토 기온
    515: ("프라하 구시가지", "ko"),      # 프라하
    521: ("지우펀", "ko"),              # 타이베이 지우펀
    528: ("센트럴 파크", "ko"),         # 뉴욕 센트럴파크
    531: ("라 보케리아", "ko"),         # 바르셀로나 보케리아
    532: ("몽마르트르", "ko"),          # 파리 몽마르트르
    535: ("페더레이션 스퀘어", "ko"),    # 멜버른
    545: ("나팔리 코스트", "ko"),       # 하와이
    546: ("플롬", "ko"),               # 노르웨이 플롬
    548: ("루이스 호수", "ko"),         # 캐나다 밴프
    549: ("밀퍼드 사운드", "ko"),       # 뉴질랜드 밀포드
    551: ("마추픽추", "ko"),           # 페루
    557: ("진보초", "ko"),             # 도쿄 진보초
    562: ("부시윅", "ko"),             # 뉴욕 브루클린
    563: ("브릭레인", "ko"),           # 런던 쇼디치
    564: ("피츠로이 멜버른", "ko"),     # 멜버른 피츠로이
    565: ("마우어파크", "ko"),          # 베를린
}

def is_broken_url(url):
    if not url:
        return True
    for pattern in BROKEN_PATTERNS:
        if re.search(pattern, url):
            return True
    return False

def get_wiki_thumbnail(place_id, place_name):
    """위키피디아 검색 → 썸네일 URL 반환 (한국어 → 영어 순으로 시도)"""
    if place_id in WIKI_KEYWORD_MAP:
        keyword, lang = WIKI_KEYWORD_MAP[place_id]
        result = _fetch_wiki_thumbnail(keyword, lang)
        if result:
            return result

    # 매핑 없거나 실패 시: 장소명에서 앞 2~3 단어 추출해 한국어 위키 검색
    words = place_name.split()
    # "후쿠오카 오호리 공원 조깅로" → "오호리 공원" (앞 나라명 제외, 중간 2단어)
    if len(words) >= 3:
        keyword = " ".join(words[1:3])
        result = _fetch_wiki_thumbnail(keyword, "ko")
        if result:
            return result

    # 마지막 시도: 전체 이름으로 영어 위키 검색
    return _fetch_wiki_thumbnail(place_name, "en")


def _fetch_wiki_thumbnail(keyword, lang):
    """위키피디아 검색 후 썸네일 URL 반환"""
    try:
        # Step 1: 검색으로 페이지 타이틀 찾기
        search_url = f"https://{lang}.wikipedia.org/w/api.php"
        res = requests.get(search_url, headers=WIKI_HEADERS, params={
            "action": "query",
            "list": "search",
            "srsearch": keyword,
            "format": "json",
            "srlimit": 1,
        }, timeout=6)
        results = res.json().get("query", {}).get("search", [])
        if not results:
            return None

        title = results[0]["title"]

        # Step 2: 페이지 summary에서 썸네일 가져오기
        summary_url = f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/{requests.utils.quote(title)}"
        res2 = requests.get(summary_url, headers=WIKI_HEADERS, timeout=6)
        data = res2.json()
        thumbnail = data.get("thumbnail", {}).get("source", "")
        if thumbnail:
            # 더 큰 해상도로 교체 (320px → 800px)
            thumbnail = re.sub(r"/(\d+)px-", "/800px-", thumbnail)
            return thumbnail
        return None
    except Exception as e:
        print(f"    위키 오류({lang}/{keyword}): {e}")
        return None


def main():
    conn = pymysql.connect(**DB)
    cur = conn.cursor()

    # 해외 장소 + 현재 사진 URL 조회
    cur.execute("""
        SELECT p.id, p.name, IFNULL(pp.photo_url, '') as photo_url, pp.id as photo_row_id
        FROM places p
        LEFT JOIN place_photos pp ON pp.place_id = p.id
        WHERE p.status = 'approved'
        AND (p.address IS NULL OR p.address = ''
             OR p.address NOT REGEXP '^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충청|충북|충남|전라|전북|전남|경상|경북|경남|제주)')
        ORDER BY p.id
    """)
    places = cur.fetchall()
    print(f"해외 장소 {len(places)}개 스캔 중...\n")

    success = 0
    skipped_good = 0
    fail = 0

    for place_id, name, photo_url, photo_row_id in places:
        if not is_broken_url(photo_url):
            print(f"[{place_id}] {name} → ✅ 사진 양호, 유지")
            skipped_good += 1
            continue

        print(f"[{place_id}] {name} → 🔍 깨진 사진, 위키피디아 검색 중...", end=" ", flush=True)
        img_url = get_wiki_thumbnail(place_id, name)

        if img_url:
            if photo_row_id:
                cur.execute(
                    "UPDATE place_photos SET photo_url = %s, source = 'wikipedia' WHERE place_id = %s",
                    (img_url, place_id),
                )
            else:
                cur.execute(
                    "INSERT INTO place_photos (place_id, photo_url, source) VALUES (%s, %s, 'wikipedia')",
                    (place_id, img_url),
                )
            conn.commit()
            print(f"✅ 교체 완료")
            success += 1
        else:
            print(f"❌ 위키 사진 없음 (기존 유지)")
            fail += 1

        time.sleep(0.5)

    cur.close()
    conn.close()
    print(f"""
완료!
  ✅ 위키피디아 교체: {success}개
  ⏭️  양호 유지:      {skipped_good}개
  ❌ 교체 실패:       {fail}개
""")


if __name__ == "__main__":
    main()
