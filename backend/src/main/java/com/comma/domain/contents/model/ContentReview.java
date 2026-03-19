package com.comma.domain.contents.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContentReview {
    private Long id;
    private String 쉼표번호;
    private Long contentId;
    private Integer rating;
    private String body;
    private LocalDateTime createdAt;
    private String nickname; // JOIN으로 조회
}
