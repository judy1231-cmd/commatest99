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

    // JOIN — places 테이블에서 채워짐
    private String placeName;
    private String placeAddress;
    private Double placeLatitude;
    private Double placeLongitude;
    private String placePhotoUrl;
    private Integer placeReviewCount;
    private Integer placeBookmarkCount;
    private String placeFirstRestType;
    private String placeDifficulty;     // easy / medium / hard
}
