package com.comma.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String 쉼표번호;          // PK — "쉼표" + 4자리숫자
    private String email;
    private String password;          // BCrypt 해시
    private String nickname;
    private String status;            // active / dormant / banned
    private Boolean emailVerified;
    private String role;              // USER / ADMIN
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
