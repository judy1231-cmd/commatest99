package com.comma.domain.report.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    private Long id;
    private String reporterId;      // 신고자 쉼표번호
    private String reporterNickname;
    private String targetType;      // post | comment
    private Long targetId;
    private String reason;
    private String status;          // pending | resolved | dismissed
    private LocalDateTime createdAt;
}
