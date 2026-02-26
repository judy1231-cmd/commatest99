package com.comma.domain.user.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    private String 쉼표번호;         // PK — "쉼표" + 4자리 숫자 (예: 쉼표0001), String 타입 고정
    private String email;
    private String password;         // BCrypt 암호화된 비밀번호 (응답 시 null 처리)
    private String nickname;
    private String status;           // active / dormant / banned
    private Boolean emailVerified;
    private String role;             // USER / ADMIN
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
