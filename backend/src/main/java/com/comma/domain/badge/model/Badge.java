package com.comma.domain.badge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Badge {

    private Long id;
    private String badgeName;
    private String description;
    private String iconUrl;
    private String achievementType;     // first_log, streak_7, total_30 등
}
