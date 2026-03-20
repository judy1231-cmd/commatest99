"""
깨진 사진 URL만 골라서 교체
1순위: 카카오맵 og:image (실제 장소 사진)
2순위: 카카오 이미지 검색 (kakaocdn.net URL만 허용)
3순위: 위키피디아 (해외 장소)
좋은 사진은 절대 건드리지 않음
"""
import pymysql
import requests
import re
import time
from urllib.parse import unquote

KAKAO_REST_API_KEY = "a48f46b4b034c13deb16fca8c2328e3a"
LOCAL_HEADERS = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
PAGE_HEADERS  = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"}
WIKI_HEADERS  = {"User-Agent": "comma-app/1.0 (educational project)"}

DB = dict(
    host="34.64.92.18",
    user="commatest",
    password="Comma_1234",
    db="comma_db",
    charset="utf8mb4",
    ssl={"ssl": {}},
)

BROKEN_PATTERNS = [
    r"cfile\d*\.\w+\.daum\.net",
    r"pds\d*\.cafe\.daum\.net",
    r"t1\.daumcdn\.net/(cfile|brunch|keditor)",
    r"t1\.daumcdn\.net/news/20(0|1[0-9]|2[0-2])",  # 2022년 이전 뉴스 (오래돼서 깨짐)
    r"dthumb-phinf\.pstatic\.net",
    r"postfiles\.pstatic\.net/20(0[0-9]|1[0-4])",  # 2014년 이전 구 네이버 포스트
    r"img1\.daumcdn\.net/thumb.*fname=http%3A%2F%2Ft1",  # 이중래핑 깨진 thumb
]

def is_broken(url):
    if not url:
        return True
    for p in BROKEN_PATTERNS:
        if re.search(p, url):
            return True
    return False

# ── 1순위: 카카오맵 og:image ──────────────────────────────────────────────────
def kakaomap_photo(name, address=""):
    words = name.split()
    addr_hint = " ".join((address or "").split()[:2])
    queries = [name]
    if len(words) > 3:
        queries.append(" ".join(words[:3]))
    if len(words) > 2:
        queries.append(" ".join(words[:2]))

    kakao_id = None
    for q in queries:
        try:
            res = requests.get(
                "https://dapi.kakao.com/v2/local/search/keyword.json",
                headers=LOCAL_HEADERS,
                params={"query": f"{q} {addr_hint}".strip(), "size": 1},
                timeout=5,
            )
            docs = res.json().get("documents", [])
            if docs:
                kakao_id = docs[0].get("id")
                matched = docs[0].get("place_name", "")
                break
        except:
            pass
        time.sleep(0.1)

    if not kakao_id:
        return None

    try:
        res = requests.get(f"https://place.map.kakao.com/m/{kakao_id}", headers=PAGE_HEADERS, timeout=8)
        match = re.search(r'"og:image"[^>]*content="([^"]+)"', res.text)
        if not match:
            return None
        raw = match.group(1)
        fname = re.search(r'fname=([^&"]+)', raw)
        if fname:
            inner = unquote(fname.group(1))
            if "daumcdn.net/local/kakaomapPhoto" in inner or "kakaocdn" in inner:
                return inner
        if raw.startswith("//"):
            raw = "https:" + raw
        if "kakaocdn" in raw or "daumcdn.net/local" in raw:
            return raw
    except:
        pass
    return None

# ── 2순위: 카카오 이미지 검색 (kakaocdn.net만) ────────────────────────────────
def kakao_image(name):
    try:
        res = requests.get(
            "https://dapi.kakao.com/v2/search/image",
            headers=LOCAL_HEADERS,
            params={"query": name, "size": 10, "sort": "accuracy"},
            timeout=5,
        )
        for doc in res.json().get("documents", []):
            url = doc.get("image_url", "")
            # blog.kakaocdn.net 또는 k.kakaocdn.net만 허용 (안전한 카카오 CDN)
            if re.search(r"(blog\.kakaocdn\.net|k\.kakaocdn\.net)", url):
                return url
    except:
        pass
    return None

# ── 3순위: 위키피디아 ──────────────────────────────────────────────────────────
def wikipedia_photo(name):
    # 앞 2단어로 검색 (국가명 제외)
    words = name.split()
    keyword = " ".join(words[1:3]) if len(words) >= 3 else name
    for lang, kw in [("ko", keyword), ("en", keyword)]:
        try:
            res = requests.get(f"https://{lang}.wikipedia.org/w/api.php", headers=WIKI_HEADERS, params={
                "action": "query", "list": "search", "srsearch": kw,
                "format": "json", "srlimit": 1,
            }, timeout=6)
            results = res.json().get("query", {}).get("search", [])
            if not results:
                continue
            title = results[0]["title"]
            res2 = requests.get(
                f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/{requests.utils.quote(title)}",
                headers=WIKI_HEADERS, timeout=6
            )
            thumb = res2.json().get("thumbnail", {}).get("source", "")
            if thumb:
                return re.sub(r"/(\d+)px-", "/800px-", thumb)
        except:
            pass
        time.sleep(0.2)
    return None

def is_overseas(address):
    if not address:
        return True
    korean = r'^(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충청|충북|충남|전라|전북|전남|경상|경북|경남|제주)'
    return not re.match(korean, address)

def main():
    conn = pymysql.connect(**DB)
    cur = conn.cursor()

    cur.execute("""
        SELECT p.id, p.name, IFNULL(p.address,''), IFNULL(pp.photo_url,'')
        FROM places p
        LEFT JOIN place_photos pp ON pp.place_id = p.id
        WHERE p.status = 'approved'
        ORDER BY p.id
    """)
    places = cur.fetchall()

    broken = [(pid, name, addr, url) for pid, name, addr, url in places if is_broken(url)]
    print(f"전체 {len(places)}개 중 깨진 사진 {len(broken)}개 수정 시작\n")

    success = 0
    fail = 0

    for place_id, name, address, old_url in broken:
        print(f"[{place_id}] {name} ...", end=" ", flush=True)
        img_url = None

        # 1순위: 카카오맵 실제 사진
        if not is_overseas(address):
            img_url = kakaomap_photo(name, address)
            if img_url:
                print("🗺️  카카오맵", end=" ")

        # 2순위: 카카오 이미지 검색 (kakaocdn only)
        if not img_url:
            img_url = kakao_image(name)
            if img_url:
                print("🔍 이미지검색", end=" ")

        # 3순위: 위키피디아 (해외 또는 2순위도 실패)
        if not img_url and is_overseas(address):
            img_url = wikipedia_photo(name)
            if img_url:
                print("📖 위키", end=" ")

        if img_url:
            cur.execute("SELECT id FROM place_photos WHERE place_id = %s", (place_id,))
            if cur.fetchone():
                cur.execute("UPDATE place_photos SET photo_url = %s WHERE place_id = %s", (img_url, place_id))
            else:
                cur.execute("INSERT INTO place_photos (place_id, photo_url, source) VALUES (%s, %s, 'auto')", (place_id, img_url))
            conn.commit()
            print("✅")
            success += 1
        else:
            print("❌ 사진 없음")
            fail += 1

        time.sleep(0.4)

    cur.close()
    conn.close()
    print(f"\n완료! 성공: {success}개 / 실패: {fail}개")

if __name__ == "__main__":
    main()
