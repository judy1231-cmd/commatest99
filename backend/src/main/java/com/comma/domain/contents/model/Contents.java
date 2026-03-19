package com.comma.domain.contents.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contents {
    private Long id;
    private String category;   // physical, mental, sensory, emotional, social, nature, creative
    private String title;
    private String summary;
    private String body;
    private Integer duration;  // 소요 시간 (분)
    private String difficulty; // easy, medium, hard
    private String imageUrl;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Integer likeCount;
    private Integer reviewCount;
    private Boolean liked; // 현재 로그인 사용자의 좋아요 여부
}
