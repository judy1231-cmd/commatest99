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

    // ─── 스트레스 레벨별 휴식 유형 가중치 조정값 ─────────────────────────────
    // 높음(70+): 회복형(emotional·mental·nature·sensory) 강화, 활동형(social·physical) 감소
    // 보통(40~69): 회복형 약간 강화
    // 낮음(~39): 사교·창조형 강화
    private static final Map<String, Integer> STRESS_HIGH_BOOST = Map.of(
            "emotional", 15,
            "mental",    12,
            "nature",    10,
            "sensory",    8,
            "social",   -10,
            "physical",  -8
    );
    private static final Map<String, Integer> STRESS_MID_BOOST = Map.of(
            "emotional",  5,
            "mental",     5,
            "nature",     5
    );
    private static final Map<String, Integer> STRESS_LOW_BOOST = Map.of(
            "social",    8,
            "creative",  8,
            "physical",  5
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

        // 협업 필터링 — 유사 사용자 효과 이력 조회 (최근 90일 기반)
        Map<String, Double> collabBoostMap = buildCollabBoostMap(쉼표번호);

        // 개인 최적 패턴 — 현재 요일·시간대에 이 사람에게 가장 효과적인 유형
        Map<String, Double> patternBoostMap = buildPatternBoostMap(쉼표번호, weather.hour());

        // 스트레스 레벨 계산: diagnosis.stressIndex + 최신 PSS-10 점수 결합
        int stressLevel = calcCombinedStress(diagnosis.getStressIndex(), diagnosisMapper.findLatestPssScore(쉼표번호));
        log.info("스트레스 레벨: {} (stressIndex={}, pss={})", stressLevel, diagnosis.getStressIndex(),
                diagnosisMapper.findLatestPssScore(쉼표번호));

        // 날씨·시간대 + 스트레스 + 개인 이력 + 협업 필터링 + 패턴 학습 보정이 반영된 상위 3개 유형 선정
        List<RestTypeScore> topTypes = applyWeatherBoost(scores, weather, stressLevel, personalBoostMap, collabBoostMap, patternBoostMap)
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
                rec.setCriteria(buildCriteria(typeScore, weather, stressLevel, personalBoostMap, collabBoostMap, patternBoostMap));
                rec.setClicked(false);
                rec.setSaved(false);
                rec.setRecommendedAt(LocalDateTime.now());
                recommendationMapper.insertRecommendation(rec);
            }
        }

        return recommendationMapper.findBy쉼표번호(쉼표번호);
    }

    /**
     * 날씨·시간대 + 개인 이력 + 협업 필터링 + 패턴 학습 가중치를 반영해 유형 점수를 재정렬한다.
     * 원본 RestTypeScore는 수정하지 않고 새 리스트를 반환한다.
     *
     * 보정 레이어 (아래로 갈수록 개인화 비중 높음):
     *   1. 날씨/시간대 (외부 컨텍스트)
     *   2. 개인 효과 이력 (최근 30일 내 경험)
     *   3. 협업 필터링 (유사 사용자 집단 경험)
     *   4. 개인 최적 패턴 (요일×시간대 학습)
     */
    private List<RestTypeScore> applyWeatherBoost(
            List<RestTypeScore> scores, WeatherContext weather, int stressLevel,
            Map<String, Double> personalBoostMap, Map<String, Double> collabBoostMap,
            Map<String, Double> patternBoostMap) {

        Map<String, Integer> conditionBoost = switch (weather.condition()) {
            case RAINY  -> RAINY_BOOST;
            case CLOUDY -> Map.of("nature", -10, "physical", -5);
            case CLEAR  -> CLEAR_BOOST;
        };

        Map<String, Integer> stressBoost = stressLevel >= 70 ? STRESS_HIGH_BOOST
                : stressLevel >= 40 ? STRESS_MID_BOOST
                : STRESS_LOW_BOOST;

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

            // 스트레스 레벨 보정
            boost += stressBoost.getOrDefault(copy.getRestType(), 0);

            // 개인 효과 이력 보정 (최근 30일)
            boost += personalBoostMap.getOrDefault(copy.getRestType(), 0.0).intValue();

            // 협업 필터링 보정 (유사 사용자 집단 경험, 최근 90일)
            boost += collabBoostMap.getOrDefault(copy.getRestType(), 0.0).intValue();

            // 개인 최적 패턴 보정 (이 사람의 요일×시간대 학습)
            boost += patternBoostMap.getOrDefault(copy.getRestType(), 0.0).intValue();

            copy.setScore(Math.max(0, copy.getScore() + boost));
            adjusted.add(copy);
        }

        adjusted.sort(Comparator.comparingInt(RestTypeScore::getScore).reversed());
        return adjusted;
    }

    /** stressIndex(0~100)와 PSS-10 점수(0~40)를 결합해 최종 스트레스 레벨(0~100) 반환 */
    private int calcCombinedStress(Integer stressIndex, Integer pssScore) {
        if (stressIndex == null && pssScore == null) return 0;
        if (stressIndex == null) return pssScore * 25 / 10; // 0~40 → 0~100
        if (pssScore == null) return stressIndex;
        int pssNormalized = pssScore * 100 / 40; // 0~40 → 0~100
        return (stressIndex + pssNormalized) / 2;
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
     * 협업 필터링 부스트 맵 생성
     * 유사 사용자들의 평균 감정 향상도를 점수로 변환
     *   향상도 ≥ 4 → +15pt  (강한 집단 효과)
     *   향상도 ≥ 2 → +8pt   (보통 집단 효과)
     *   향상도 < 0 → -8pt   (집단적으로 별로였던 유형)
     */
    private Map<String, Double> buildCollabBoostMap(String 쉼표번호) {
        try {
            List<Map<String, Object>> rows = recommendationMapper.findCollaborativeEffectiveness(쉼표번호);
            Map<String, Double> boostMap = new java.util.HashMap<>();
            for (Map<String, Object> row : rows) {
                String restType = (String) row.get("rest_type");
                double avgImprovement = ((Number) row.get("avg_improvement")).doubleValue();

                double boost;
                if (avgImprovement >= 4.0) {
                    boost = 15.0;
                } else if (avgImprovement >= 2.0) {
                    boost = 8.0;
                } else if (avgImprovement < 0) {
                    boost = -8.0;
                } else {
                    boost = 0.0;
                }
                boostMap.put(restType, boost);
            }
            if (!boostMap.isEmpty()) {
                log.info("협업 필터링 보정 적용: {}", boostMap);
            }
            return boostMap;
        } catch (Exception e) {
            log.warn("협업 필터링 조회 실패, 보정 생략: {}", e.getMessage());
            return Map.of();
        }
    }

    /**
     * 개인 최적 패턴 보정 맵 생성
     * 현재 요일·시간대에 이 사람에게 효과적이었던 유형을 찾아 가중치 부여
     *   1위 유형 → +12pt, 2위 → +6pt (데이터 쌓일수록 패턴 정교해짐)
     */
    private Map<String, Double> buildPatternBoostMap(String 쉼표번호, int currentHour) {
        try {
            int dayOfWeek = java.time.LocalDate.now().getDayOfWeek().getValue() % 7; // 0=일, 1=월 ... 6=토
            String timeSlot = toTimeSlot(currentHour);

            List<Map<String, Object>> rows = recommendationMapper.findBestTypeByDayAndTime(쉼표번호, dayOfWeek, timeSlot);
            Map<String, Double> boostMap = new java.util.HashMap<>();
            for (int i = 0; i < rows.size(); i++) {
                String restType = (String) rows.get(i).get("rest_type");
                boostMap.put(restType, i == 0 ? 12.0 : 6.0);
            }
            if (!boostMap.isEmpty()) {
                log.info("개인 패턴 보정 적용 ({}요일 {}): {}", dayOfWeek, timeSlot, boostMap);
            }
            return boostMap;
        } catch (Exception e) {
            log.warn("개인 패턴 조회 실패, 보정 생략: {}", e.getMessage());
            return Map.of();
        }
    }

    private String toTimeSlot(int hour) {
        if (hour >= 6  && hour <= 11) return "morning";
        if (hour >= 12 && hour <= 17) return "afternoon";
        if (hour >= 18 && hour <= 21) return "evening";
        return "night";
    }

    /**
     * 추천 기준 문자열 — recommendations.criteria 컬럼에 저장
     * 모든 보정 레이어 적용 내역을 기록 (추후 통계/디버깅에 활용)
     */
    private String buildCriteria(RestTypeScore typeScore, WeatherContext weather, int stressLevel,
                                  Map<String, Double> personalBoostMap, Map<String, Double> collabBoostMap,
                                  Map<String, Double> patternBoostMap) {
        StringBuilder sb = new StringBuilder();
        sb.append(typeScore.getRestType())
          .append(" 유형 매칭 (점수: ").append(typeScore.getScore()).append(")")
          .append(" | 날씨: ").append(weather.describe())
          .append(" | 스트레스: ").append(stressLevel >= 70 ? "높음" : stressLevel >= 40 ? "보통" : "낮음")
          .append("(").append(stressLevel).append(")");

        Double personalBoost = personalBoostMap.get(typeScore.getRestType());
        if (personalBoost != null && personalBoost != 0.0) {
            sb.append(" | 개인이력: ").append(personalBoost > 0 ? "+" : "").append(personalBoost.intValue()).append("pt");
        }

        Double collabBoost = collabBoostMap.get(typeScore.getRestType());
        if (collabBoost != null && collabBoost != 0.0) {
            sb.append(" | 협업필터: ").append(collabBoost > 0 ? "+" : "").append(collabBoost.intValue()).append("pt");
        }

        Double patternBoost = patternBoostMap.get(typeScore.getRestType());
        if (patternBoost != null && patternBoost != 0.0) {
            sb.append(" | 패턴학습: +").append(patternBoost.intValue()).append("pt");
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
