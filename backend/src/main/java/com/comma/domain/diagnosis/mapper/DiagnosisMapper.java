package com.comma.domain.diagnosis.mapper;

import com.comma.domain.diagnosis.model.DiagnosisResult;
import com.comma.domain.diagnosis.model.HeartRateMeasurement;
import com.comma.domain.diagnosis.model.MeasurementSession;
import com.comma.domain.diagnosis.model.RestTypeScore;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface DiagnosisMapper {

    // ==================== 심박 측정 세션 ====================

    void insertSession(MeasurementSession session);

    void updateSessionEnd(@Param("id") Long id,
                          @Param("endedAt") LocalDateTime endedAt,
                          @Param("reliability") Double reliability);

    MeasurementSession findSessionById(@Param("id") Long id);

    // ==================== 심박 데이터 ====================

    void insertMeasurement(HeartRateMeasurement measurement);

    List<HeartRateMeasurement> findMeasurementsBySessionId(@Param("sessionId") Long sessionId);

    HeartRateMeasurement findLatestMeasurementBySessionId(@Param("sessionId") Long sessionId);

    // 사용자의 가장 최근 활성(종료되지 않은) 세션 조회 — iPhone 단축어용
    MeasurementSession findLatestActiveSessionBy쉼표번호(@Param("쉼표번호") String 쉼표번호);

    // ==================== 진단 결과 ====================

    void insertDiagnosisResult(DiagnosisResult result);

    void insertRestTypeScore(RestTypeScore score);

    DiagnosisResult findLatestBy쉼표번호(@Param("쉼표번호") String 쉼표번호);

    List<DiagnosisResult> findAllBy쉼표번호(@Param("쉼표번호") String 쉼표번호);

    List<RestTypeScore> findScoresByDiagnosisId(@Param("diagnosisResultId") Long diagnosisResultId);

    /** 가장 최근 PSS-10 점수 조회 (pss-survey 세션 중 pss_score가 있는 것) */
    Integer findLatestPssScore(@Param("쉼표번호") String 쉼표번호);

    /**
     * 스트레스 패턴 감지용 — 스트레스 지수 평균이 기준 이상인 사용자 목록 조회
     * 최근 N회 진단 기준, 중복 알림 방지를 위해 24시간 내 stress 알림이 없는 사용자만 반환
     */
    List<String> findHighStressUsers(@Param("minAvgStress") int minAvgStress,
                                     @Param("recentCount") int recentCount);
}
