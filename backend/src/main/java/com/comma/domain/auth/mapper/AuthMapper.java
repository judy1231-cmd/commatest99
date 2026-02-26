package com.comma.domain.auth.mapper;

import com.comma.domain.user.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AuthMapper {

    void insertUser(User user);

    User findByEmail(@Param("email") String email);

    User findBy쉼표번호(@Param("쉼표번호") String 쉼표번호);

    int countByEmail(@Param("email") String email);

    String findMax쉼표번호();
}
