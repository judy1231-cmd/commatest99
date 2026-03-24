package com.comma.domain.community.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostPhoto {
    private Long id;
    private Long postId;
    private String photoUrl;
    private LocalDateTime createdAt;
}
