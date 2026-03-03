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

    // ==================== 진단 결과 ====================

    void insertDiagnosisResult(DiagnosisResult result);

    void insertRestTypeScore(RestTypeScore score);

    DiagnosisResult findLatestBy쉼표번호(@Param("쉼표번호") String 쉼표번호);

    List<DiagnosisResult> findAllBy쉼표번호(@Param("쉼표번호") String 쉼표번호);

    List<RestTypeScore> findScoresByDiagnosisId(@Param("diagnosisResultId") Long diagnosisResultId);
}
