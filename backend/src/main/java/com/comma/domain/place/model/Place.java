package com.comma.domain.place.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Place {

    private Long id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String operatingHours;
    private Double aiScore;
    private String status;          // pending / approved / rejected
    private LocalDateTime createdAt;

    // 목록 조회 시 JOIN으로 채워지는 부가 정보
    private String photoUrl;        // 대표 사진 URL
    private Integer reviewCount;    // 리뷰 수
    private Integer bookmarkCount;  // 북마크(하트) 수
    private String firstRestType;   // 대표 휴식 유형 (사진 fallback용)
}
