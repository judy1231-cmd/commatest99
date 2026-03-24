package com.comma.domain.place.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

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
    private Boolean kakaoVerified;  // 카카오 장소 존재 확인 여부
    private String kakaoPlaceId;    // 카카오 장소 ID
    private String difficulty;      // easy / medium / hard
    private String status;          // pending / approved / rejected
    private LocalDateTime createdAt;

    // 목록 조회 시 JOIN으로 채워지는 부가 정보
    private String photoUrl;        // 대표 사진 URL
    private Integer reviewCount;    // 리뷰 수
    private Integer bookmarkCount;  // 북마크(하트) 수
    private String firstRestType;   // 대표 휴식 유형 (사진 fallback용)

    // 태그 목록 (place_tags JOIN)
    @JsonIgnore
    private String tagsStr;         // MyBatis: GROUP_CONCAT → 서비스에서 tags로 변환
    private List<String> tags;      // API 응답으로 내려가는 태그 배열

    // 휴식 유형 목록 (place_tags.rest_type 중복 없이)
    @JsonIgnore
    private String restTypesStr;    // MyBatis: GROUP_CONCAT → 서비스에서 restTypes로 변환
    private List<String> restTypes; // API 응답으로 내려가는 휴식유형 배열 (e.g. ["nature","mental"])
}
