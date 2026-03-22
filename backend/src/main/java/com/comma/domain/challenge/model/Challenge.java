package com.comma.domain.challenge.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Challenge {
    private Long id;
    private String title;
    private String description;
    private Integer durationDays;
    private String verificationType;   // photo | check | text
    private String badgeName;
    private Boolean isActive;
    private LocalDateTime createdAt;

    // JOIN용 — 참여자 수
    private Integer participantCount;
    // JOIN용 — 내 참여 여부
    private Boolean joinedByMe;
    // JOIN용 — 내 참여 상태
    private String myStatus;
    // JOIN용 — 내 달성 일수
    private Integer myAchievedDays;
}
