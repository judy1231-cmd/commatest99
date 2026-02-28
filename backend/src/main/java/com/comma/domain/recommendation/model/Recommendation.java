package com.comma.domain.recommendation.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Recommendation {

    private Long id;
    private String 쉼표번호;
    private Long diagnosisResultId;
    private Long placeId;
    private String criteria;            // 추천 기준 설명
    private Boolean clicked;
    private Boolean saved;
    private LocalDateTime recommendedAt;
}
