package com.comma.global.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

/**
 * 카카오 로컬 API로 장소 존재 여부를 확인한다.
 * 장소 등록(pending) 시 자동 호출 → 관리자가 승인 판단 시 참고
 */
@Slf4j
@Service
public class KakaoPlaceService {

    private static final String KAKAO_LOCAL_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

    @Value("${kakao.client-id}")
    private String kakaoRestApiKey;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 장소명 + 주소로 카카오에서 검색해 존재 여부와 장소 ID를 반환한다.
     * @return [kakaoPlaceId, null] — 찾으면 ID, 못 찾으면 null
     */
    public String verify(String placeName, String address) {
        try {
            String query = URLEncoder.encode(placeName + " " + address, StandardCharsets.UTF_8);
            String url = KAKAO_LOCAL_URL + "?query=" + query + "&size=1";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "KakaoAK " + kakaoRestApiKey)
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.warn("카카오 API 응답 오류: status={}", response.statusCode());
                return null;
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode documents = root.path("documents");

            if (documents.isEmpty()) return null;

            JsonNode first = documents.get(0);
            String foundName = first.path("place_name").asText("");
            String placeId   = first.path("id").asText(null);

            // 장소명이 어느 정도 일치해야 확인으로 처리
            if (isSimilar(placeName, foundName)) {
                log.info("카카오 장소 확인: '{}' → kakao_id={}", placeName, placeId);
                return placeId;
            }

            log.info("카카오 검색 결과 불일치: 검색='{}', 결과='{}'", placeName, foundName);
            return null;

        } catch (Exception e) {
            log.warn("카카오 장소 확인 실패: {}", e.getMessage());
            return null;
        }
    }

    // 장소명 유사도 체크 — 검색어가 결과에 포함되거나 결과가 검색어를 포함하면 일치로 판단
    private boolean isSimilar(String query, String result) {
        if (query == null || result == null) return false;
        String q = query.replaceAll("\\s", "").toLowerCase();
        String r = result.replaceAll("\\s", "").toLowerCase();
        return r.contains(q) || q.contains(r);
    }
}
