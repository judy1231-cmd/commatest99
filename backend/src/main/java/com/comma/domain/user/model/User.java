package com.comma.domain.user.model;
// 이 파일이 속한 패키지 경로를 선언한다. Java는 폴더 구조와 패키지명이 일치해야 한다.

import lombok.AllArgsConstructor;
// Lombok: 모든 필드를 인자로 받는 생성자를 자동 생성해 주는 어노테이션 import
import lombok.Data;
// Lombok: getter, setter, toString, equals, hashCode를 자동 생성해 주는 어노테이션 import
import lombok.NoArgsConstructor;
// Lombok: 인자 없는 기본 생성자를 자동 생성해 주는 어노테이션 import

import java.time.LocalDateTime;
// Java 8+ 날짜/시간 타입. DB의 DATETIME 컬럼과 매핑된다.

@Data
// getter/setter/toString/equals/hashCode를 Lombok이 자동 생성한다.
// user.get쉼표번호(), user.set쉼표번호() 등을 직접 안 써도 된다.
@NoArgsConstructor
// new User() 처럼 인자 없이 객체를 만들 수 있다. MyBatis가 ResultSet을 객체로 변환할 때 이 생성자를 사용한다.
@AllArgsConstructor
// new User(쉼표번호, email, ...) 처럼 모든 필드를 한 번에 넣어 객체를 만들 수 있다.
public class User {

    private String 쉼표번호;
    // PK. "쉼표0001" 형태. VARCHAR(12). String 고정 — bigint로 바꾸면 안 된다.
    // 현재 구조상 34개 테이블이 이 값을 FK로 참조한다.

    private String email;
    // 로그인에 쓸 수 있는 이메일. users 테이블에서 UNIQUE 제약이 걸려 있다.

    private String password;
    // BCrypt로 해시된 비밀번호. API 응답에는 반드시 null로 세팅하고 내보낸다.

    private String username;
    // 사용자가 직접 정하는 로그인 아이디 (예: "joymin"). UNIQUE 제약.

    private String nickname;
    // 화면에 표시되는 이름. 가입 시 쉼표번호와 동일값으로 자동 설정되지만, 나중에 변경 가능.

    private String profileImage;
    // 프로필 사진 URL. 없으면 null (프론트에서 첫 글자 아바타로 fallback).

    private String status;
    // 계정 상태: "active"(정상), "dormant"(탈퇴), "banned"(정지)

    private Boolean emailVerified;
    // 이메일 인증 완료 여부. DB 컬럼명은 email_verified (tinyint 0/1).
    // MyBatis의 underscore-to-camelCase 설정이 자동으로 emailVerified로 매핑한다.

    private String role;
    // 권한: "USER" 또는 "ADMIN". JWT에도 함께 담아서 API 인가에 사용한다.

    private LocalDateTime createdAt;
    // 가입일시. DB 컬럼명 created_at → createdAt 자동 매핑.

    private LocalDateTime updatedAt;
    // 마지막 수정일시. DB 컬럼명 updated_at → updatedAt 자동 매핑.
}
