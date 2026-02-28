package com.comma.domain.diagnosis.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiagnosisResult {

    private Long id;
    private String 쉼표번호;
    private Long sessionId;
    private Integer stressIndex;       // 스트레스 지수 (0~100)
    private String primaryRestType;    // 주요 추천 휴식 유형
    private String scoresJson;         // 7가지 유형별 점수 JSON
    private LocalDateTime diagnosedAt;
}
