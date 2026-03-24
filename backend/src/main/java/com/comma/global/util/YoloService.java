package com.comma.global.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

/**
 * YOLO FastAPI 서비스 (포트 8090) 연동 유틸
 * - YOLO 서버가 꺼져 있으면 예외를 던지지 않고 null 반환 (graceful degradation)
 */
@Slf4j
@Component
public class YoloService {

    @Value("${yolo.service.url:http://localhost:8090}")
    private String yoloBaseUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 이미지 URL로 분석 — 장소 사진 유형 분류용
     * @return 추천 카테고리 key (e.g. "자연적 휴식") or null (서버 꺼짐/분류 불가)
     */
    public String classifyByUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return null;
        try {
            String body = objectMapper.writeValueAsString(Map.of("url", imageUrl));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(yoloBaseUrl + "/analyze/url"))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode root = objectMapper.readTree(response.body());

            if (root.path("success").asBoolean() && !root.path("data").path("suggested_category").isNull()) {
                return root.path("data").path("suggested_category").asText();
            }
        } catch (Exception e) {
            log.warn("YOLO 서비스 연결 실패 (장소 분류 건너뜀): {}", e.getMessage());
        }
        return null;
    }

    /**
     * 업로드 파일 검증 — 커뮤니티/리뷰 사진 검증용
     * @return true: 정상 사진 / false: 부적절하거나 서버 꺼짐(기본 허용)
     */
    public boolean validateUploadedPhoto(MultipartFile file) {
        if (file == null || file.isEmpty()) return true;
        try {
            String boundary = "----FormBoundary" + System.currentTimeMillis();
            byte[] fileBytes = file.getBytes();
            String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo.jpg";

            // multipart/form-data 직접 구성
            byte[] header = ("--" + boundary + "\r\n"
                    + "Content-Disposition: form-data; name=\"file\"; filename=\"" + filename + "\"\r\n"
                    + "Content-Type: " + file.getContentType() + "\r\n\r\n").getBytes();
            byte[] footer = ("\r\n--" + boundary + "--\r\n").getBytes();

            byte[] body = new byte[header.length + fileBytes.length + footer.length];
            System.arraycopy(header, 0, body, 0, header.length);
            System.arraycopy(fileBytes, 0, body, header.length, fileBytes.length);
            System.arraycopy(footer, 0, body, header.length + fileBytes.length, footer.length);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(yoloBaseUrl + "/analyze/upload"))
                    .timeout(Duration.ofSeconds(15))
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode root = objectMapper.readTree(response.body());

            if (root.path("success").asBoolean()) {
                return root.path("data").path("is_valid_photo").asBoolean(true);
            }
        } catch (Exception e) {
            log.warn("YOLO 서비스 연결 실패 (사진 검증 건너뜀): {}", e.getMessage());
        }
        return true; // 서버 꺼져 있으면 기본 허용
    }

    /** YOLO 서버 활성 여부 확인 */
    public boolean isAlive() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(yoloBaseUrl + "/health"))
                    .timeout(Duration.ofSeconds(2))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() == 200;
        } catch (Exception e) {
            return false;
        }
    }
}
