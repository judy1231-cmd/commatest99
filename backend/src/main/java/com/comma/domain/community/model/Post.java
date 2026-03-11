package com.comma.domain.community.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {
    private Long id;
    private String 쉼표번호;
    private String category;   // 신체적 휴식, 정신적 휴식 등
    private String title;
    private String content;
    private boolean anonymous;
    private String status;     // visible / hidden / deleted
    private LocalDateTime createdAt;

    // 조회 시 JOIN 필드
    private String nickname;
    private int likeCount;
    private int commentCount;
    private boolean likedByMe;
}
