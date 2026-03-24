package com.comma.domain.community.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comment {
    private Long id;
    private Long postId;
    private String 쉼표번호;
    private Long parentId;
    private String content;
    private String status;
    private LocalDateTime createdAt;

    // JOIN 필드
    private String nickname;
}
