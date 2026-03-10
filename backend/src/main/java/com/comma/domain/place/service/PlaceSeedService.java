package com.comma.domain.place.service;

import com.comma.domain.place.mapper.PlaceMapper;
import com.comma.domain.place.model.Place;
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
