package com.comma.mapper;

import com.comma.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AuthMapper {

    // 회원가입
    void insertUser(User user);

    // 이메일로 사용자 조회 (로그인용)
    User findByEmail(@Param("email") String email);

    // 쉼표번호로 사용자 조회
    User findBy쉼표번호(@Param("쉼표번호") String 쉼표번호);

    // 이메일 중복 체크
    int countByEmail(@Param("email") String email);

    // 쉼표번호 최대값 조회 (자동생성용)
    String findMax쉼표번호();
}
