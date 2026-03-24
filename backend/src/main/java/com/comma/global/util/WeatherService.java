package com.comma.global.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalTime;
import java.util.Set;

/**
 * Open-Meteo 무료 날씨 API 연동 (API 키 불필요)
 * - 날씨/시간대 정보를 RecommendationService에 제공
 * - 서버 오류 시 CLEAR 조건으로 fallback (추천 흐름에 영향 없음)
 */
@Slf4j
@Component
public class WeatherService {

    // 기상청 API 연동 전 임시 기본 좌표: 서울 시청
    private static final double DEFAULT_LAT = 37.5665;
    private static final double DEFAULT_LNG = 126.9780;

    // WMO 날씨 코드 → 실내 선호 여부
    private static final Set<Integer> RAINY_CODES = Set.of(
            51, 53, 55, 61, 63, 65, 71, 73, 75, 77,
            80, 81, 82, 85, 86, 95, 96, 99
    );
    private static final Set<Integer> CLOUDY_CODES = Set.of(2, 3, 45, 48);

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public enum Condition { CLEAR, CLOUDY, RAINY }

    /**
     * 날씨 컨텍스트 — 추천 로직에서 사용할 정보 묶음
     */
    public record WeatherContext(
            Condition condition,
            boolean isDay,
            int hour,
            double temperatureCelsius
    ) {
        /** 실내 환경을 선호해야 하는 날씨인지 */
        public boolean prefersIndoor() {
            return condition == Condition.RAINY || condition == Condition.CLOUDY;
        }

        /** 저녁 시간대 (18~22시) — 사회적 휴식 부스트 */
        public boolean isEvening() {
            return hour >= 18 && hour < 22;
        }

        /** 날씨 설명 (criteria 필드에 기록용) */
        public String describe() {
            String cond = switch (condition) {
                case CLEAR  -> "맑음";
                case CLOUDY -> "흐림";
                case RAINY  -> "비/눈";
            };
            String timeOfDay = isEvening() ? "저녁" : (isDay ? "낮" : "밤");
            return cond + " / " + timeOfDay + " / " + String.format("%.0f", temperatureCelsius) + "°C";
        }
    }

    /**
     * 현재 날씨 조회 — 위치 기반
     */
    public WeatherContext fetchWeatherContext(double lat, double lng) {
        String url = String.format(
                "https://api.open-meteo.com/v1/forecast?latitude=%.4f&longitude=%.4f"
                        + "&current=temperature_2m,weathercode,is_day&timezone=Asia%%2FSeoul",
                lat, lng
        );
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode current = objectMapper.readTree(response.body()).path("current");

            int weatherCode = current.path("weathercode").asInt(0);
            boolean isDay = current.path("is_day").asInt(1) == 1;
            double temperature = current.path("temperature_2m").asDouble(20.0);
            int hour = LocalTime.now().getHour();

            Condition condition;
            if (RAINY_CODES.contains(weatherCode)) {
                condition = Condition.RAINY;
            } else if (CLOUDY_CODES.contains(weatherCode)) {
                condition = Condition.CLOUDY;
            } else {
                condition = Condition.CLEAR;
            }

            return new WeatherContext(condition, isDay, hour, temperature);

        } catch (Exception e) {
            log.warn("날씨 API 호출 실패, 기본값(맑음) 사용: {}", e.getMessage());
            return defaultContext();
        }
    }

    /**
     * 서울 기준 날씨 조회 (위치 미제공 시)
     */
    public WeatherContext fetchDefaultWeatherContext() {
        return fetchWeatherContext(DEFAULT_LAT, DEFAULT_LNG);
    }

    private WeatherContext defaultContext() {
        int hour = LocalTime.now().getHour();
        boolean isDay = hour >= 6 && hour < 20;
        return new WeatherContext(Condition.CLEAR, isDay, hour, 20.0);
    }
}
