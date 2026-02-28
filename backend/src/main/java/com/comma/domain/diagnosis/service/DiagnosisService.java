package com.comma.domain.diagnosis.service;

import com.comma.domain.diagnosis.mapper.DiagnosisMapper;
import com.comma.domain.diagnosis.model.*;
import com.comma.domain.survey.mapper.SurveyMapper;
import com.comma.domain.survey.model.SurveyChoice;
import com.comma.domain.survey.model.SurveyQuestion;
import com.comma.domain.survey.model.SurveyResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DiagnosisService {

    private final DiagnosisMapper diagnosisMapper;
    private final SurveyMapper surveyMapper;

    // ==================== 심박 측정 ====================

    @Transactional
    public MeasurementSession startSession(String 쉼표번호, String deviceType) {
        MeasurementSession session = new MeasurementSession();
        session.set쉼표번호(쉼표번호);
        session.setStartedAt(LocalDateTime.now());
        session.setDeviceType(deviceType);
        diagnosisMapper.insertSession(session);
        return session;
    }

    @Transactional
    public void endSession(Long sessionId, String 쉼표번호) {
        MeasurementSession session = diagnosisMapper.findSessionById(sessionId);
        if (session == null) throw new IllegalArgumentException("존재하지 않는 측정 세션입니다.");
        if (!session.get쉼표번호().equals(쉼표번호)) throw new IllegalArgumentException("접근 권한이 없습니다.");

        // 측정 데이터 수 기반으로 신뢰도 산출 — 30개 이상이면 1.0
        List<HeartRateMeasurement> measurements = diagnosisMapper.findMeasurementsBySessionId(sessionId);
        double reliability = Math.min(1.0, measurements.size() / 30.0);

        diagnosisMapper.updateSessionEnd(sessionId, LocalDateTime.now(), reliability);
    }

    @Transactional
    public void saveMeasurement(Long sessionId, String 쉼표번호, Integer bpm, Double hrv) {
        MeasurementSession session = diagnosisMapper.findSessionById(sessionId);
        if (session == null) throw new IllegalArgumentException("존재하지 않는 측정 세션입니다.");
        if (!session.get쉼표번호().equals(쉼표번호)) throw new IllegalArgumentException("접근 권한이 없습니다.");

        HeartRateMeasurement measurement = new HeartRateMeasurement();
        measurement.setSessionId(sessionId);
        measurement.set쉼표번호(쉼표번호);
        measurement.setBpm(bpm);
        measurement.setHrv(hrv);
        measurement.setMeasuredAt(LocalDateTime.now());
        diagnosisMapper.insertMeasurement(measurement);
    }

    public Map<String, Object> getSession(Long sessionId, String 쉼표번호) {
        MeasurementSession session = diagnosisMapper.findSessionById(sessionId);
        if (session == null) throw new IllegalArgumentException("존재하지 않는 측정 세션입니다.");
        if (!session.get쉼표번호().equals(쉼표번호)) throw new IllegalArgumentException("접근 권한이 없습니다.");

        List<HeartRateMeasurement> measurements = diagnosisMapper.findMeasurementsBySessionId(sessionId);

        Map<String, Object> result = new HashMap<>();
        result.put("session", session);
        result.put("measurements", measurements);
        return result;
    }

    // ==================== 진단 계산 ====================

    // 선택지의 score 값 → 휴식유형 매핑 (시나리오형 설문 기준)
    private static final Map<Integer, String> SCORE_TO_TYPE = Map.of(
            1, "physical", 2, "mental", 3, "sensory",
            4, "emotional", 5, "social", 6, "nature", 7, "creative"
    );

    private static final String[] REST_TYPES = {
            "physical", "mental", "sensory", "emotional", "social", "nature", "creative"
    };

    /**
     * 시나리오 기반 설문 + 심박 데이터를 종합하여 진단 결과 생성
     *
     * 점수 계산 방식:
     * 1) 선택지의 score 값(1~7)이 휴식유형 ID를 의미
     * 2) 각 유형이 선택된 횟수를 세고, 전체 응답 수 대비 비율로 환산 (0~100)
     * 3) 심박 데이터가 있으면 스트레스 보정 (높은 심박 = 높은 스트레스)
     */
    @Transactional
    public DiagnosisResult calculateDiagnosis(String 쉼표번호, Long sessionId) {
        List<SurveyResponse> responses = surveyMapper.findResponsesBy쉼표번호(쉼표번호);
        if (responses.isEmpty()) {
            throw new IllegalArgumentException("설문 응답 데이터가 없습니다. 설문을 먼저 완료해주세요.");
        }

        // Step 1: 각 응답에서 선택지의 score(유형ID)를 읽어서 빈도 집계
        Map<String, Integer> typeFrequency = new HashMap<>();
        for (String type : REST_TYPES) {
            typeFrequency.put(type, 0);
        }

        int validResponses = 0;
        for (SurveyResponse response : responses) {
            List<SurveyChoice> choices = surveyMapper.findChoicesByQuestionId(response.getQuestionId());
            SurveyChoice selected = choices.stream()
                    .filter(c -> c.getId().equals(response.getChoiceId()))
                    .findFirst()
                    .orElse(null);

            if (selected != null) {
                String mappedType = SCORE_TO_TYPE.get(selected.getScore());
                if (mappedType != null) {
                    typeFrequency.merge(mappedType, 1, Integer::sum);
                    validResponses++;
                }
            }
        }

        if (validResponses == 0) {
            throw new IllegalArgumentException("유효한 설문 응답이 없습니다.");
        }

        // Step 2: 빈도 → 0~100 점수 환산 (가장 많이 선택된 유형 = 100점 기준)
        int maxFrequency = typeFrequency.values().stream().max(Integer::compareTo).orElse(1);
        Map<String, Integer> typeScores = new HashMap<>();

        for (String type : REST_TYPES) {
            int frequency = typeFrequency.get(type);
            // 최다 선택 유형이 100점, 나머지는 비례 환산
            int score = maxFrequency > 0 ? Math.round((float) frequency / maxFrequency * 100) : 0;
            typeScores.put(type, score);
        }

        // Step 3: 심박 데이터로 스트레스 지수 보정
        int stressIndex = calculateStressIndex(sessionId, typeScores);

        // Step 4: 가장 높은 점수의 휴식유형 = 주요 유형
        String primaryType = typeScores.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("mental");

        // Step 5: 진단 결과 저장
        DiagnosisResult result = new DiagnosisResult();
        result.set쉼표번호(쉼표번호);
        result.setSessionId(sessionId);
        result.setStressIndex(stressIndex);
        result.setPrimaryRestType(primaryType);
        result.setScoresJson(mapToJson(typeScores));
        result.setDiagnosedAt(LocalDateTime.now());
        diagnosisMapper.insertDiagnosisResult(result);

        // Step 6: 유형별 점수를 순위와 함께 저장
        List<Map.Entry<String, Integer>> sorted = typeScores.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .toList();

        for (int i = 0; i < sorted.size(); i++) {
            RestTypeScore score = new RestTypeScore();
            score.setDiagnosisResultId(result.getId());
            score.setRestType(sorted.get(i).getKey());
            score.setScore(sorted.get(i).getValue());
            score.setRanking(i + 1);
            diagnosisMapper.insertRestTypeScore(score);
        }

        return result;
    }

    /**
     * 스트레스 지수 산출:
     * - 심박 세션이 있으면 → 평균 BPM 기반 (60~100 → 0~100)
     * - 없으면 → 설문 점수 분산도 기반 (유형 편중 = 높은 스트레스)
     */
    private int calculateStressIndex(Long sessionId, Map<String, Integer> typeScores) {
        // 심박 데이터가 있으면 BPM 기반 스트레스
        if (sessionId != null) {
            List<HeartRateMeasurement> measurements = diagnosisMapper.findMeasurementsBySessionId(sessionId);
            if (!measurements.isEmpty()) {
                double avgBpm = measurements.stream()
                        .mapToInt(HeartRateMeasurement::getBpm)
                        .average()
                        .orElse(70);
                // BPM 60~100 → 스트레스 0~100 으로 매핑
                return (int) Math.min(100, Math.max(0, (avgBpm - 60) * 2.5));
            }
        }

        // 심박 없으면 설문 점수의 최댓값 기반 (편중도가 높을수록 높은 스트레스)
        int maxScore = typeScores.values().stream().max(Integer::compareTo).orElse(50);
        int avgScore = (int) typeScores.values().stream().mapToInt(Integer::intValue).average().orElse(50);
        // 편차가 클수록 (특정 유형에 쏠릴수록) 스트레스가 높다고 판단
        return Math.min(100, maxScore - avgScore + 40);
    }

    public DiagnosisResult getLatestDiagnosis(String 쉼표번호) {
        DiagnosisResult result = diagnosisMapper.findLatestBy쉼표번호(쉼표번호);
        if (result == null) throw new IllegalArgumentException("진단 결과가 없습니다. 설문을 먼저 완료해주세요.");
        return result;
    }

    public List<Map<String, Object>> getDiagnosisHistory(String 쉼표번호) {
        List<DiagnosisResult> results = diagnosisMapper.findAllBy쉼표번호(쉼표번호);
        return results.stream().map(result -> {
            List<RestTypeScore> scores = diagnosisMapper.findScoresByDiagnosisId(result.getId());
            Map<String, Object> entry = new HashMap<>();
            entry.put("diagnosis", result);
            entry.put("scores", scores);
            return entry;
        }).toList();
    }

    // JSON 문자열 수동 생성 — 외부 라이브러리 의존 없이
    private String mapToJson(Map<String, Integer> map) {
        StringBuilder sb = new StringBuilder("{");
        int i = 0;
        for (Map.Entry<String, Integer> entry : map.entrySet()) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(entry.getKey()).append("\":").append(entry.getValue());
            i++;
        }
        sb.append("}");
        return sb.toString();
    }
}
