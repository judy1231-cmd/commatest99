package com.comma.domain.challenge.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChallengeParticipant {
    private Long id;
    private Long challengeId;
    private String 쉼표번호;
    private Integer achievedDays;
    private String status;           // ongoing | completed | failed
    private LocalDateTime joinedAt;
}
