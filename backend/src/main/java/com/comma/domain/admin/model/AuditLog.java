package com.comma.domain.admin.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    private Long id;
    private String admin쉼표번호;       // 작업을 수행한 관리자
    private String action;              // ban_user, approve_place 등
    private String targetType;          // user, place, post 등
    private String targetId;
    private LocalDateTime performedAt;
}
