package com.comma.domain.place.service;

import com.comma.domain.place.mapper.PlaceMapper;
import com.comma.domain.place.model.Place;
import com.comma.domain.place.model.PlacePhoto;
import com.comma.domain.place.model.PlaceReview;
import com.comma.domain.place.model.PlaceTag;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlaceSeedService {

    private final PlaceMapper placeMapper;
    private final ObjectMapper objectMapper;

    @Value("${public-data.api-key}")
    private String vworldKey;

    // 휴식 유형별 검색 키워드 목록
    private static final Map<String, List<String>> REST_TYPE_KEYWORDS = Map.of(
        "nature",    List.of("공원", "식물원", "수목원", "산책로"),
        "physical",  List.of("헬스장", "수영장", "요가원", "스포츠센터"),
        "mental",    List.of("명상센터", "사찰", "템플스테이", "힐링카페"),
        "sensory",   List.of("찜질방", "스파", "도서관"),
        "emotional", List.of("미술관", "박물관", "갤러리"),
        "social",    List.of("카페", "독립서점", "문화센터"),
        "creative",  List.of("공방", "도예원", "그림체험")
    );

    // 서울 중심 좌표 (bounding box: 서울 전역)
    private static final String BBOX = "126.7,37.4,127.2,37.7";

    @Transactional
    public Map<String, Object> seedFromVWorld() {
        int totalInserted = 0;
        int totalSkipped = 0;
        Map<String, Integer> perType = new LinkedHashMap<>();

        HttpClient client = HttpClient.newHttpClient();

        for (Map.Entry<String, List<String>> entry : REST_TYPE_KEYWORDS.entrySet()) {
            String restType = entry.getKey();
            List<String> keywords = entry.getValue();
            int typeCount = 0;

            for (String keyword : keywords) {
                try {
                    List<Map<String, Object>> fetched = fetchVWorldPOI(client, keyword);
                    for (Map<String, Object> poi : fetched) {
                        String name = (String) poi.get("name");
                        String address = (String) poi.get("address");
                        Double lat = (Double) poi.get("lat");
                        Double lng = (Double) poi.get("lng");

                        if (name == null || lat == null || lng == null) continue;

                        // 부적절한 장소 필터링 (화장실, 주차장 등)
                        if (name.contains("화장실") || name.contains("주차장") || name.contains("주차") || name.contains("화장")) {
                            totalSkipped++;
                            continue;
                        }

                        // 이미 같은 이름+주소가 있으면 스킵
                        if (placeMapper.existsByNameAndAddress(name, address != null ? address : "")) {
                            totalSkipped++;
                            continue;
                        }

                        Place place = new Place();
                        place.setName(name);
                        place.setAddress(address != null ? address : "");
                        place.setLatitude(lat);
                        place.setLongitude(lng);
                        place.setAiScore(3.0 + Math.random() * 2.0); // 3.0~5.0 랜덤 점수
                        place.setStatus("approved");
                        place.setCreatedAt(LocalDateTime.now());

                        placeMapper.insertPlace(place);

                        // place_tags 연결
                        PlaceTag tag = new PlaceTag();
                        tag.setPlaceId(place.getId());
                        tag.setTagName(keyword);
                        tag.setRestType(restType);
                        placeMapper.insertPlaceTag(tag);

                        typeCount++;
                        totalInserted++;
                    }
                } catch (Exception e) {
                    log.warn("[PlaceSeed] 키워드 '{}' 조회 실패: {}", keyword, e.getMessage());
                }
            }
            perType.put(restType, typeCount);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalInserted", totalInserted);
        result.put("totalSkipped", totalSkipped);
        result.put("perType", perType);
        log.info("[PlaceSeed] 완료 — 삽입: {}, 스킵: {}", totalInserted, totalSkipped);
        return result;
    }

    @Transactional
    public void clearAllPlaces() {
        placeMapper.deleteAllPlaceTags();
        placeMapper.deleteAllPlaces();
        log.info("[PlaceSeed] 장소 데이터 전체 삭제 완료");
    }

    @Transactional
    public int removeInappropriatePlaces() {
        placeMapper.deleteTagsByPlaceNameFilter();
        int removed = placeMapper.deleteInappropriatePlaces();
        log.info("[PlaceSeed] 부적절한 장소 {}개 삭제 완료", removed);
        return removed;
    }

    @Transactional
    public Map<String, Integer> fullCleanup() {
        // 1. 아파트·화장실·치과·택시 등 휴식 무관 장소 삭제
        placeMapper.deleteTagsByUnrelatedFilter();
        int unrelated = placeMapper.deleteUnrelatedPlaces();

        // 2. 기존 화장실·주차 필터도 함께 실행
        placeMapper.deleteTagsByPlaceNameFilter();
        int inappropriate = placeMapper.deleteInappropriatePlaces();

        // 3. 이름이 잘못된 특정 장소 삭제
        placeMapper.deleteTagsForBadNamedPlaces();
        int badNamed = placeMapper.deleteBadNamedPlaces();

        // 4. 이름 완전 중복 제거 (id 작은 것 유지)
        placeMapper.deleteTagsForDuplicates();
        int duplicates = placeMapper.deleteDuplicatesByName();

        int total = unrelated + inappropriate + badNamed + duplicates;
        log.info("[PlaceCleanup] 완료 — 휴식무관: {}, 부적절: {}, 잘못된이름: {}, 중복: {}, 합계: {}",
                 unrelated, inappropriate, badNamed, duplicates, total);

        Map<String, Integer> result = new LinkedHashMap<>();
        result.put("unrelated", unrelated);
        result.put("inappropriate", inappropriate);
        result.put("badNamed", badNamed);
        result.put("duplicates", duplicates);
        result.put("total", total);
        return result;
    }

    // ===== 사진 키워드 → Pexels URL 매핑 (검증된 URL만 사용) =====
    private static final List<String[]> PHOTO_MAP = List.of(
        // 해외 유명 자연 — Pexels (직접 확인된 URL)
        new String[]{"오로라",      "https://images.pexels.com/photos/1434608/pexels-photo-1434608.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"마추픽추",    "https://images.pexels.com/photos/2929906/pexels-photo-2929906.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"루이스",      "https://images.pexels.com/photos/2775196/pexels-photo-2775196.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"밴프",        "https://images.pexels.com/photos/2775196/pexels-photo-2775196.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"융프라우",    "https://images.pexels.com/photos/290452/pexels-photo-290452.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"피요르드",    "https://images.pexels.com/photos/1559699/pexels-photo-1559699.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"나팔리",      "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"하와이",      "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"밀포드",      "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"후지산",      "https://images.pexels.com/photos/1108701/pexels-photo-1108701.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"퀸스타운",    "https://images.pexels.com/photos/2422259/pexels-photo-2422259.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"몬세라트",    "https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"싱가포르",    "https://images.pexels.com/photos/777059/pexels-photo-777059.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"홍콩",        "https://images.pexels.com/photos/2385210/pexels-photo-2385210.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"타이베이",    "https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"방콕",        "https://images.pexels.com/photos/1031659/pexels-photo-1031659.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"도쿄",        "https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"교토",        "https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"발리",        "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"따나롯",      "https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"마카오",      "https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"뉴욕",        "https://images.pexels.com/photos/802024/pexels-photo-802024.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"파리",        "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"바르셀로나",  "https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"사그라다",    "https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"루브르",      "https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"멜버른",      "https://images.pexels.com/photos/2193300/pexels-photo-2193300.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"상하이",      "https://images.pexels.com/photos/2120058/pexels-photo-2120058.jpeg?auto=compress&cs=tinysrgb&w=800"},
        // 한국 유명 장소
        new String[]{"경복궁",      "https://images.pexels.com/photos/237211/pexels-photo-237211.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"북촌",        "https://images.pexels.com/photos/237211/pexels-photo-237211.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"성산일출봉",  "https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"한라산",      "https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"불국사",      "https://images.pexels.com/photos/1108117/pexels-photo-1108117.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"해인사",      "https://images.pexels.com/photos/1108117/pexels-photo-1108117.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"보문",        "https://images.pexels.com/photos/1574843/pexels-photo-1574843.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"보성",        "https://images.pexels.com/photos/3310691/pexels-photo-3310691.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"녹차",        "https://images.pexels.com/photos/3310691/pexels-photo-3310691.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"한강",        "https://images.pexels.com/photos/237211/pexels-photo-237211.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"서울숲",      "https://images.pexels.com/photos/1598073/pexels-photo-1598073.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"올레길",      "https://images.pexels.com/photos/1578750/pexels-photo-1578750.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"제주",        "https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"팀랩",        "https://images.pexels.com/photos/1671324/pexels-photo-1671324.jpeg?auto=compress&cs=tinysrgb&w=800"},
        // 장소 유형별
        new String[]{"대나무",      "https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"사찰",        "https://images.pexels.com/photos/1108117/pexels-photo-1108117.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"템플",        "https://images.pexels.com/photos/1108117/pexels-photo-1108117.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"힐링카페",    "https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"명상",        "https://images.pexels.com/photos/1978628/pexels-photo-1978628.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"요가",        "https://images.pexels.com/photos/1812964/pexels-photo-1812964.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"수영",        "https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"헬스",        "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"스포츠",      "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"스파",        "https://images.pexels.com/photos/3997943/pexels-photo-3997943.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"온천",        "https://images.pexels.com/photos/3997943/pexels-photo-3997943.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"찜질",        "https://images.pexels.com/photos/3997943/pexels-photo-3997943.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"미술관",      "https://images.pexels.com/photos/1674049/pexels-photo-1674049.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"갤러리",      "https://images.pexels.com/photos/1674049/pexels-photo-1674049.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"박물관",      "https://images.pexels.com/photos/1674049/pexels-photo-1674049.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"도서관",      "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"서점",        "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"공방",        "https://images.pexels.com/photos/1267363/pexels-photo-1267363.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"도예",        "https://images.pexels.com/photos/1267363/pexels-photo-1267363.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"드로잉",      "https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"루프탑",      "https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"카페",        "https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"공원",        "https://images.pexels.com/photos/1598073/pexels-photo-1598073.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"산책",        "https://images.pexels.com/photos/1598073/pexels-photo-1598073.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"식물원",      "https://images.pexels.com/photos/1407305/pexels-photo-1407305.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"수목원",      "https://images.pexels.com/photos/1407305/pexels-photo-1407305.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"숲",          "https://images.pexels.com/photos/167698/pexels-photo-167698.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"산",          "https://images.pexels.com/photos/1574843/pexels-photo-1574843.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"트레킹",      "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"등산",        "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"피크닉",      "https://images.pexels.com/photos/1208777/pexels-photo-1208777.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"벽화",        "https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=800"},
        new String[]{"야경",        "https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?auto=compress&cs=tinysrgb&w=800"}
    );

    private static final String DEFAULT_PHOTO =
        "https://images.pexels.com/photos/167698/pexels-photo-167698.jpeg?auto=compress&cs=tinysrgb&w=800";

    // 테스트 유저 쉼표번호 목록
    private static final List<String> TEST_USERS = List.of(
        "쉼표0001", "쉼표0002", "쉼표0003", "쉼표0004",
        "쉼표0005", "쉼표0006", "쉼표0007", "쉼표0008"
    );

    // 휴식 유형별 리뷰 템플릿
    private static final Map<String, List<String>> REVIEW_TEMPLATES = Map.of(
        "nature", List.of(
            "자연 속에서 정말 힐링됐어요. 공기도 맑고 경치가 너무 아름다웠습니다.",
            "바쁜 일상에서 벗어나 자연을 느낄 수 있는 최고의 장소였어요.",
            "주변 경치가 너무 아름다워서 시간 가는 줄 몰랐어요.",
            "자연 소리만 들으며 걷다 보니 머리가 맑아지는 느낌이었어요.",
            "사진 찍기에도 너무 좋은 곳이에요. 꼭 다시 오고 싶어요!"
        ),
        "physical", List.of(
            "운동 후 개운함이 최고예요. 시설도 깔끔하고 쾌적했습니다.",
            "몸을 움직이고 나니 스트레스가 풀리는 느낌이에요.",
            "전문 강사분들이 친절하게 도와주셔서 초보자도 편하게 즐길 수 있었어요.",
            "규칙적으로 오고 싶은 곳이에요. 몸도 마음도 건강해지는 곳입니다.",
            "운동하기 최적의 환경이에요. 시설 관리도 잘 되어 있어요."
        ),
        "mental", List.of(
            "마음이 고요해지는 특별한 공간이에요. 잠깐이라도 여기서 쉬고 나면 달라요.",
            "일상의 소음에서 완전히 차단되는 느낌이 들었어요. 강추합니다.",
            "명상하기에 딱 좋은 환경이에요. 차분하고 평화로운 분위기가 좋아요.",
            "복잡한 생각들이 정리되는 공간이에요. 진정한 휴식이 뭔지 알게 됐어요.",
            "여기서 한 시간 있으면 하루 치 피로가 다 풀려요. 진짜 최고예요."
        ),
        "sensory", List.of(
            "감각적으로 너무 아름다운 공간이에요. 눈과 마음이 동시에 힐링됩니다.",
            "오감이 즐거워지는 독특한 경험이었어요. 한 번쯤 꼭 와보세요.",
            "분위기 자체가 힐링이에요. 조용하고 감각적인 공간을 찾는다면 추천합니다.",
            "시간이 멈춘 것 같은 감각적인 공간이에요. 다음에 또 오고 싶어요.",
            "오랫동안 기억에 남을 특별한 경험이었습니다."
        ),
        "emotional", List.of(
            "감성 충전에 최고인 장소예요. 마음이 따뜻해지는 곳이에요.",
            "정서적으로 치유되는 느낌이에요. 복잡한 감정이 정리됐어요.",
            "혼자 와서 조용히 머물기 좋아요. 감정을 충전하고 나온 것 같아요.",
            "왜인지 모르게 눈물이 날 것 같은 감동적인 공간이에요.",
            "마음의 짐이 가벼워지는 곳이에요. 진심으로 추천드립니다."
        ),
        "social", List.of(
            "친구들이랑 같이 오기 너무 좋은 곳이에요. 즐거운 시간 보냈습니다.",
            "사람들과 함께하는 즐거움을 느낄 수 있는 곳이에요. 분위기 최고예요.",
            "소통하고 웃을 수 있는 최고의 장소예요. 다시 오고 싶어요.",
            "여럿이 오면 더 즐거운 곳이에요. 추억 만들기에 최적입니다.",
            "활기차고 따뜻한 분위기가 좋아요. 혼자 와도 외롭지 않은 곳이에요."
        ),
        "creative", List.of(
            "창작 의욕이 마구 샘솟는 공간이에요. 영감을 얻고 돌아갔어요.",
            "내 손으로 무언가를 만드는 즐거움을 느꼈어요. 완전 힐링이에요.",
            "창의력이 폭발하는 곳이에요. 일상에서 놓쳤던 감각이 깨어나는 느낌이에요.",
            "처음 해보는 활동이었는데 너무 재미있었어요. 다음에 또 올게요!",
            "완성한 작품 보고 너무 뿌듯했어요. 진짜 값진 경험이었습니다."
        )
    );

    private static final List<String> DEFAULT_REVIEWS = List.of(
        "조용하고 여유로운 공간이에요. 쉬기에 딱 좋습니다.",
        "생각보다 훨씬 좋았어요. 다음에 또 올게요!",
        "힐링 제대로 됐어요. 가까운 분들께 추천하고 싶은 곳입니다.",
        "스트레스 해소에 최고예요. 편안하고 여유로운 시간을 보냈습니다.",
        "일상에서 잠깐 벗어나기 좋은 장소예요."
    );

    @Transactional
    public Map<String, Object> seedMediaData() {
        List<Place> places = placeMapper.findAllApproved();
        List<PlaceTag> allTags = new ArrayList<>();

        // 각 place의 restType 미리 조회
        Map<Long, String> placeRestTypeMap = new HashMap<>();
        for (Place place : places) {
            List<PlaceTag> tags = placeMapper.findTagsByPlaceId(place.getId());
            if (!tags.isEmpty()) {
                placeRestTypeMap.put(place.getId(), tags.get(0).getRestType());
            }
        }

        // 기존 seed 사진 전체 삭제 후 재삽입 (URL 오류 수정 시 재실행 가능)
        placeMapper.deleteAllSeedPhotos();

        int photoAdded = 0;
        int reviewAdded = 0;
        Random random = new Random(42);

        for (Place place : places) {
            // ─ 사진 seed (항상 재삽입)
            if (true) {
                String photoUrl = resolvePhotoUrl(place.getName());
                PlacePhoto photo = new PlacePhoto();
                photo.setPlaceId(place.getId());
                photo.setPhotoUrl(photoUrl);
                photo.setSource("seed");
                placeMapper.insertPhoto(photo);
                photoAdded++;
            }

            // ─ 리뷰 seed (없는 경우만, 1~3개)
            List<PlaceReview> existingReviews = placeMapper.findReviewsByPlaceId(place.getId());
            if (existingReviews.isEmpty()) {
                String restType = placeRestTypeMap.getOrDefault(place.getId(), "");
                List<String> templates = REVIEW_TEMPLATES.getOrDefault(restType, DEFAULT_REVIEWS);
                int reviewCount = 1 + random.nextInt(3); // 1~3개

                List<String> shuffledTemplates = new ArrayList<>(templates);
                Collections.shuffle(shuffledTemplates, random);

                for (int i = 0; i < Math.min(reviewCount, shuffledTemplates.size()); i++) {
                    String user = TEST_USERS.get(random.nextInt(TEST_USERS.size()));
                    PlaceReview review = new PlaceReview();
                    review.set쉼표번호(user);
                    review.setPlaceId(place.getId());
                    review.setRating(3 + random.nextInt(3)); // 3~5점
                    review.setContent(shuffledTemplates.get(i));
                    review.setVerified(false);
                    review.setCreatedAt(LocalDateTime.now().minusDays(random.nextInt(60)));
                    placeMapper.insertReview(review);
                    reviewAdded++;
                }
            }
        }

        log.info("[PlaceSeed] 미디어 seed 완료 — 사진: {}, 리뷰: {}", photoAdded, reviewAdded);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("photoAdded", photoAdded);
        result.put("reviewAdded", reviewAdded);
        result.put("totalPlaces", places.size());
        return result;
    }

    private String resolvePhotoUrl(String name) {
        if (name == null) return DEFAULT_PHOTO;
        for (String[] entry : PHOTO_MAP) {
            if (name.contains(entry[0])) return entry[1];
        }
        return DEFAULT_PHOTO;
    }

    /**
     * VWorld POI 검색 API 호출
     * https://api.vworld.kr/req/search?service=search&request=search&version=2.0
     */
    private List<Map<String, Object>> fetchVWorldPOI(HttpClient client, String keyword) throws Exception {
        String encodedKeyword = URLEncoder.encode(keyword, StandardCharsets.UTF_8);
        String url = String.format(
            "https://api.vworld.kr/req/search?service=search&request=search&version=2.0"
            + "&crs=EPSG:4326&query=%s&type=place&size=20&bbox=%s&key=%s&format=json",
            encodedKeyword, BBOX, vworldKey
        );

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .GET()
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            log.warn("[VWorld] 응답 코드 {} — 키워드: {}", response.statusCode(), keyword);
            return Collections.emptyList();
        }

        return parseVWorldResponse(response.body());
    }

    private List<Map<String, Object>> parseVWorldResponse(String json) {
        List<Map<String, Object>> results = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode status = root.path("response").path("status");
            if (!"OK".equals(status.asText())) return results;

            // VWorld 검색 API v2: response.result.items[]
            JsonNode items = root.path("response").path("result").path("items");
            if (items.isMissingNode() || !items.isArray()) return results;

            for (JsonNode item : items) {
                String name = item.path("title").asText(null);

                // 주소: 도로명 우선, 없으면 지번
                String road = item.path("address").path("road").asText("");
                String parcel = item.path("address").path("parcel").asText("");
                String address = !road.isEmpty() ? road : parcel;

                // 좌표: point.x = 경도(lng), point.y = 위도(lat)
                String xStr = item.path("point").path("x").asText(null);
                String yStr = item.path("point").path("y").asText(null);
                if (name == null || xStr == null || yStr == null) continue;

                double lng = Double.parseDouble(xStr);
                double lat = Double.parseDouble(yStr);

                Map<String, Object> poi = new HashMap<>();
                poi.put("name", name);
                poi.put("address", address);
                poi.put("lat", lat);
                poi.put("lng", lng);
                results.add(poi);
            }
        } catch (Exception e) {
            log.warn("[VWorld] JSON 파싱 실패: {}", e.getMessage());
        }
        return results;
    }
}
