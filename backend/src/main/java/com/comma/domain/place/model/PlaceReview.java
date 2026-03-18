package com.comma.domain.place.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceReview {

    private Long id;
    private String 쉼표번호;
    private Long placeId;
    private Integer rating;         // 1~5 별점
    private String content;
    private Boolean verified;       // 방문 인증 여부
    private LocalDateTime createdAt;

    // JOIN — users 테이블에서 채워짐
    private String nickname;
}
