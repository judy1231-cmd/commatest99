"""
카카오맵 장소 페이지 og:image로 실제 장소 대표 사진 교체
- 카카오 로컬 검색 API → 장소 ID 획득 (전체명 실패 시 앞 2단어로 재시도)
- place.map.kakao.com/m/{id} → og:image(카카오맵 등록 사진) 추출
- 장소 못 찾거나 사진 없으면 기존 사진 유지 (덮어쓰기 안 함)
"""
import pymysql
import requests
import re
import time
from urllib.parse import unquote

KAKAO_REST_API_KEY = "a48f46b4b034c13deb16fca8c2328e3a"

DB = dict(
    host="34.64.92.18",
    user="commatest",
    password="Comma_1234",
    db="comma_db",
    charset="utf8mb4",
    ssl={"ssl": {}},
)

LOCAL_HEADERS = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
PAGE_HEADERS  = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"}


def search_kakao_place(name, address=""):
    """카카오 로컬 검색 API → 장소 ID 반환.
    전체명 실패 시 앞 2단어로 재시도."""
    addr_hint = " ".join((address or "").split()[:2])
    words = name.split()

    # 시도할 쿼리 목록: 전체명 → 앞 3단어 → 앞 2단어
    queries = [name]
    if len(words) > 3:
        queries.append(" ".join(words[:3]))
    if len(words) > 2:
        queries.append(" ".join(words[:2]))

    for q in queries:
        full_query = f"{q} {addr_hint}".strip()
        try:
            res = requests.get(
                "https://dapi.kakao.com/v2/local/search/keyword.json",
                headers=LOCAL_HEADERS,
                params={"query": full_query, "size": 1},
                timeout=5,
            )
            docs = res.json().get("documents", [])
            if docs:
                return docs[0].get("id"), docs[0].get("place_name", "")
        except Exception as e:
            print(f"  로컬검색 오류: {e}")
        time.sleep(0.1)

    return None, None


def get_og_image(kakao_id):
    """카카오맵 장소 페이지에서 og:image(대표 사진) URL 추출."""
    try:
        res = requests.get(
            f"https://place.map.kakao.com/m/{kakao_id}",
            headers=PAGE_HEADERS,
            timeout=8,
        )
        if res.status_code != 200:
            return None

        match = re.search(r'"og:image"[^>]*content="([^"]+)"', res.text)
        if not match:
            return None

        raw_url = match.group(1)

        # fname 파라미터 안의 실제 원본 URL 추출
        fname_match = re.search(r'fname=([^&"]+)', raw_url)
        if fname_match:
            inner_url = unquote(fname_match.group(1))
            if "daumcdn.net/local/kakaomapPhoto" in inner_url or "kakaocdn" in inner_url:
                return inner_url

        if raw_url.startswith("//"):
            raw_url = "https:" + raw_url
        if "kakaocdn" in raw_url or "daumcdn.net/local" in raw_url:
            return raw_url

        return None
    except Exception as e:
        print(f"  페이지 오류: {e}")
        return None


def names_similar(original, matched):
    """장소명 핵심 앞 3글자가 결과 이름에 포함되면 OK."""
    a = original.replace(" ", "").lower()
    b = matched.replace(" ", "").lower()
    core = a[:3] if len(a) >= 3 else a
    return core in b or b[:3] in a


def main():
    conn = pymysql.connect(**DB)
    cur = conn.cursor()

    cur.execute("""
        SELECT p.id, p.name, IFNULL(p.address, '')
        FROM places p
        WHERE p.status = 'approved'
        ORDER BY p.id
    """)
    places = cur.fetchall()
    print(f"총 {len(places)}개 장소 처리 시작 (카카오맵 실제 장소 사진)\n")

    success = 0
    fail_no_place = 0
    fail_no_photo = 0
    skipped_mismatch = 0

    for place_id, name, address in places:
        print(f"[{place_id}] {name} ...", end=" ", flush=True)

        kakao_id, matched_name = search_kakao_place(name, address)
        if not kakao_id:
            print("❌ 장소 못 찾음 (기존 유지)")
            fail_no_place += 1
            time.sleep(0.3)
            continue

        if not names_similar(name, matched_name):
            print(f"⚠️  이름 불일치 스킵 → '{matched_name}'")
            skipped_mismatch += 1
            time.sleep(0.3)
            continue

        img_url = get_og_image(kakao_id)
        if not img_url:
            print(f"⚠️  사진 없음 (기존 유지) [{matched_name}]")
            fail_no_photo += 1
            time.sleep(0.3)
            continue

        cur.execute("SELECT id FROM place_photos WHERE place_id = %s", (place_id,))
        existing = cur.fetchone()
        if existing:
            cur.execute(
                "UPDATE place_photos SET photo_url = %s, source = 'kakaomap' WHERE place_id = %s",
                (img_url, place_id),
            )
        else:
            cur.execute(
                "INSERT INTO place_photos (place_id, photo_url, source) VALUES (%s, %s, 'kakaomap')",
                (place_id, img_url),
            )
        conn.commit()
        print(f"✅ [{matched_name}]")
        success += 1
        time.sleep(0.3)

    cur.close()
    conn.close()
    print(f"""
완료!
  ✅ 성공:         {success}개  (카카오맵 실제 사진)
  ❌ 장소 못 찾음: {fail_no_place}개  (기존 사진 유지)
  ⚠️  사진 없음:   {fail_no_photo}개  (기존 사진 유지)
  ⏭️  이름 불일치: {skipped_mismatch}개  (스킵)
""")


if __name__ == "__main__":
    main()
