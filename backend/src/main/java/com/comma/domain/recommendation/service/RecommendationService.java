package com.comma.domain.recommendation.service;

import com.comma.domain.diagnosis.mapper.DiagnosisMapper;
import com.comma.domain.diagnosis.model.DiagnosisResult;
import com.comma.domain.diagnosis.model.RestTypeScore;
import com.comma.domain.place.mapper.PlaceMapper;
import com.comma.domain.place.model.Place;
import com.comma.domain.recommendation.mapper.RecommendationMapper;
import com.comma.domain.recommendation.model.Recommendation;
import com.comma.global.util.WeatherService;
import com.comma.global.util.WeatherService.WeatherContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RecommendationMapper recommendationMapper;
    private final DiagnosisMapper diagnosisMapper;
    private final PlaceMapper placeMapper;
    private final WeatherService weatherService;

    // ─── 날씨별 휴식 유형 가중치 조정값 ───────────────────────────────────────
    // 양수: 해당 날씨에 이 유형을 더 추천 / 음수: 덜 추천
    // 진단 점수(0~100)에 더해져 최종 정렬에 사용됨
    private static final Map<String, Integer> RAINY_BOOST  = Map.of(
            "sensory",   15,   // 감각적: 카페·공방 등 실내
            "creative",  15,   // 창조적: 실내 집중
            "mental",    10,   // 정신적: 독서·명상
            "social",    5,    // 사회적: 실내 만남
            "nature",    -20,  // 자연적: 비 오면 부적절
            "physical",  -20   // 신체적: 야외 활동 부적절
    );

    private static final Map<String, Integer> CLEAR_BOOST  = Map.of(
            "nature",    15,   // 자연적: 공원·산
            "physical",  10,   // 신체적: 야외 운동
            "social",    5     // 사회적: 야외 만남
    );

    private static final Map<String, Integer> EVENING_BOOST = Map.of(
            "social",    20,   // 저녁엔 사회적 휴식 강하게 부스트
            "sensory",   10    // 카페·분위기 있는 공간
    );

    /**
     * 진단 결과 기반 추천 생성 (날씨·시간대 보정 포함)
     *
     * @param lat 사용자 현재 위도 (null 이면 서울 기본값)
     * @param lng 사용자 현재 경도 (null 이면 서울 기본값)
     */
    @Transactional
    public List<Recommendation> createRecommendations(
            String 쉼표번호, Long diagnosisResultId, Double lat, Double lng) {

        DiagnosisResult diagnosis = diagnosisMapper.findLatestBy쉼표번호(쉼표번호);
        if (diagnosis == null) {
            throw new IllegalArgumentException("진단 결과가 없습니다. 설문을 먼저 완료해주세요.");
        }

        List<RestTypeScore> scores = diagnosisMapper.findScoresByDiagnosisId(diagnosisResultId);
        if (scores.isEmpty()) {
            throw new IllegalArgumentException("휴식유형 점수가 없습니다.");
        }

        // 날씨 컨텍스트 조회
        WeatherContext weather = (lat != null && lng != null)
                ? weatherService.fetchWeatherContext(lat, lng)
                : weatherService.fetchDefaultWeatherContext();
        log.info("추천 생성 - 날씨 컨텍스트: {}", weather.describe());

        // 개인 효과 이력 조회 (최근 30일 기록 기반)
        Map<String, Double> personalBoostMap = buildPersonalBoostMap(쉼표번호);

        // 날씨·시간대 + 개인 효과 이력 보정이 반영된 상위 3개 유형 선정
        List<RestTypeScore> topTypes = applyWeatherBoost(scores, weather, personalBoostMap)
                .stream()
                .limit(3)
                .toList();

        // 각 유형별 장소 매칭 후 추천 저장
        for (RestTypeScore typeScore : topTypes) {
            List<Place> matchedPlaces = placeMapper.findPlaces(null, typeScore.getRestType(), 0, 3);
            for (Place place : matchedPlaces) {
                Recommendation rec = new Recommendation();
                rec.set쉼표번호(쉼표번호);
                rec.setDiagnosisResultId(diagnosisResultId);
                rec.setPlaceId(place.getId());
                rec.setCriteria(buildCriteria(typeScore, weather, personalBoostMap));
                rec.setClicked(false);
                rec.setSaved(false);
                rec.setRecommendedAt(LocalDateTime.now());
                recommendationMapper.insertRecommendation(rec);
            }
        }

        return recommendationMapper.findBy쉼표번호(쉼표번호);
    }

    /**
     * 날씨·시간대 + 개인 효과 이력 가중치를 반영해 유형 점수를 재정렬한다.
     * 원본 RestTypeScore는 수정하지 않고 새 리스트를 반환한다.
     */
    private List<RestTypeScore> applyWeatherBoost(
            List<RestTypeScore> scores, WeatherContext weather, Map<String, Double> personalBoostMap) {

        Map<String, Integer> conditionBoost = switch (weather.condition()) {
            case RAINY  -> RAINY_BOOST;
            case CLOUDY -> Map.of("nature", -10, "physical", -5);
            case CLEAR  -> CLEAR_BOOST;
        };

        List<RestTypeScore> adjusted = new ArrayList<>();
        for (RestTypeScore original : scores) {
            RestTypeScore copy = new RestTypeScore(
                    original.getId(),
                    original.getDiagnosisResultId(),
                    original.getRestType(),
                    original.getScore(),
                    original.getRanking()
            );

            // 날씨 보정
            int boost = conditionBoost.getOrDefault(copy.getRestType(), 0);

            // 저녁 시간대 보정
            if (weather.isEvening()) {
                boost += EVENING_BOOST.getOrDefault(copy.getRestType(), 0);
            }

            // 개인 효과 이력 보정 (최근 30일 기록 기반)
            boost += personalBoostMap.getOrDefault(copy.getRestType(), 0.0).intValue();

            copy.setScore(Math.max(0, copy.getScore() + boost));
            adjusted.add(copy);
        }

        adjusted.sort(Comparator.comparingInt(RestTypeScore::getScore).reversed());
        return adjusted;
    }

    /**
     * 최근 30일 휴식 기록에서 유형별 감정 향상도를 조회해 가중치 맵으로 변환한다.
     * 향상도 ≥ 5 → +20pt, ≥ 3 → +10pt, < 0 → -10pt
     * 기록이 없거나 조회 실패 시 빈 맵 반환 (추천 흐름에 영향 없음)
     */
    private Map<String, Double> buildPersonalBoostMap(String 쉼표번호) {
        try {
            List<Map<String, Object>> effectiveness = recommendationMapper.findPersonalEffectiveness(쉼표번호);
            Map<String, Double> boostMap = new java.util.HashMap<>();
            for (Map<String, Object> row : effectiveness) {
                String restType = (String) row.get("rest_type");
                double avgImprovement = ((Number) row.get("avg_improvement")).doubleValue();

                double boost;
                if (avgImprovement >= 5.0) {
                    boost = 20.0;
                } else if (avgImprovement >= 3.0) {
                    boost = 10.0;
                } else if (avgImprovement < 0) {
                    boost = -10.0;
                } else {
                    boost = 0.0;
                }
                boostMap.put(restType, boost);
            }
            if (!boostMap.isEmpty()) {
                log.info("개인 효과 이력 보정 적용: {}", boostMap);
            }
            return boostMap;
        } catch (Exception e) {
            log.warn("개인 효과 이력 조회 실패, 보정 생략: {}", e.getMessage());
            return Map.of();
        }
    }

    /**
     * 추천 기준 문자열 — recommendations.criteria 컬럼에 저장
     * 날씨 + 개인 이력 적용 여부를 기록해 통계 화면에서 "왜 추천됐나" 설명에 활용
     */
    private String buildCriteria(RestTypeScore typeScore, WeatherContext weather, Map<String, Double> personalBoostMap) {
        StringBuilder sb = new StringBuilder();
        sb.append(typeScore.getRestType())
          .append(" 유형 매칭 (점수: ").append(typeScore.getScore()).append(")")
          .append(" | 날씨: ").append(weather.describe());

        Double personalBoost = personalBoostMap.get(typeScore.getRestType());
        if (personalBoost != null && personalBoost != 0.0) {
            sb.append(" | 개인이력: ").append(personalBoost > 0 ? "+" : "").append(personalBoost.intValue()).append("pt");
        }
        return sb.toString();
    }

    // ─── 기존 메서드 (하위 호환) ───────────────────────────────────────────

    public List<Recommendation> getMyRecommendations(String 쉼표번호) {
        return recommendationMapper.findBy쉼표번호(쉼표번호);
    }

    public List<Recommendation> getHistory(String 쉼표번호) {
        return recommendationMapper.findHistoryBy쉼표번호(쉼표번호);
    }

    @Transactional
    public void markClicked(Long id, String 쉼표번호) {
        Recommendation rec = recommendationMapper.findById(id);
        if (rec == null) throw new IllegalArgumentException("존재하지 않는 추천입니다.");
        if (!rec.get쉼표번호().equals(쉼표번호)) throw new IllegalArgumentException("접근 권한이 없습니다.");
        recommendationMapper.updateClicked(id);
    }

    @Transactional
    public boolean toggleSaved(Long id, String 쉼표번호) {
        Recommendation rec = recommendationMapper.findById(id);
        if (rec == null) throw new IllegalArgumentException("존재하지 않는 추천입니다.");
        if (!rec.get쉼표번호().equals(쉼표번호)) throw new IllegalArgumentException("접근 권한이 없습니다.");
        boolean newSaved = !Boolean.TRUE.equals(rec.getSaved());
        recommendationMapper.updateSaved(id, newSaved);
        return newSaved;
    }
}
