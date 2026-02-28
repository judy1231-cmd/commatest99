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

    /**
     * 설문 응답 + 심박 데이터를 종합하여 진단 결과를 생성
     * 7가지 휴식유형 점수를 계산하고 가장 높은 유형을 주요 휴식유형으로 설정
     */
    @Transactional
    public DiagnosisResult calculateDiagnosis(String 쉼표번호, Long sessionId) {
        List<SurveyResponse> responses = surveyMapper.findResponsesBy쉼표번호(쉼표번호);
        if (responses.isEmpty()) {
            throw new IllegalArgumentException("설문 응답 데이터가 없습니다. 설문을 먼저 완료해주세요.");
        }

        // 카테고리별 점수 집계 — 각 응답의 선택지 점수를 합산
        Map<String, Integer> categoryScores = new HashMap<>();
        for (SurveyResponse response : responses) {
            List<SurveyChoice> choices = surveyMapper.findChoicesByQuestionId(response.getQuestionId());
            SurveyChoice selected = choices.stream()
                    .filter(c -> c.getId().equals(response.getChoiceId()))
                    .findFirst()
                    .orElse(null);

            if (selected != null) {
                SurveyQuestion question = surveyMapper.findActiveQuestions().stream()
                        .filter(q -> q.getId().equals(response.getQuestionId()))
                        .findFirst()
                        .orElse(null);

                if (question != null) {
                    categoryScores.merge(question.getCategory(), selected.getScore(), Integer::sum);
                }
            }
        }

        // 7가지 휴식유형 점수 산출 — 카테고리 점수를 유형에 매핑
        String[] restTypes = {"physical", "mental", "sensory", "emotional", "social", "nature", "creative"};
        Map<String, Integer> typeScores = new HashMap<>();
        int totalScore = 0;

        for (String type : restTypes) {
            int score = categoryScores.getOrDefault(type, 50); // 데이터 없으면 기본 50점
            typeScores.put(type, Math.min(100, Math.max(0, score)));
            totalScore += typeScores.get(type);
        }

        // 스트레스 지수 — 전체 점수 평균의 역수 개념 (점수가 높을수록 그 휴식이 필요)
        int stressIndex = Math.min(100, totalScore / restTypes.length);

        // 가장 높은 점수의 휴식유형을 주요 유형으로 결정
        String primaryType = typeScores.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("mental");

        // 진단 결과 저장
        DiagnosisResult result = new DiagnosisResult();
        result.set쉼표번호(쉼표번호);
        result.setSessionId(sessionId);
        result.setStressIndex(stressIndex);
        result.setPrimaryRestType(primaryType);
        result.setScoresJson(mapToJson(typeScores));
        result.setDiagnosedAt(LocalDateTime.now());
        diagnosisMapper.insertDiagnosisResult(result);

        // 유형별 점수를 순위와 함께 저장
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
