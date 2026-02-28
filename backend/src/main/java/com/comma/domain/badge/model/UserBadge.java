package com.comma.domain.badge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserBadge {

    private String 쉼표번호;
    private Long badgeId;
    private LocalDateTime earnedAt;
}
