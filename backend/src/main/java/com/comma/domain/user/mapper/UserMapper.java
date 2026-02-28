package com.comma.domain.user.mapper;

import com.comma.domain.user.model.User;
import com.comma.domain.user.model.UserSettings;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Map;

@Mapper
public interface UserMapper {

    User findBy쉼표번호(@Param("쉼표번호") String 쉼표번호);

    void updateNickname(@Param("쉼표번호") String 쉼표번호, @Param("nickname") String nickname);

    void updateStatus(@Param("쉼표번호") String 쉼표번호, @Param("status") String status);

    UserSettings findSettingsBy쉼표번호(@Param("쉼표번호") String 쉼표번호);

    void insertSettings(UserSettings settings);

    void updateSettings(UserSettings settings);

    int countBadges(@Param("쉼표번호") String 쉼표번호);

    // 프로필 통계: 총 기록수, 총 휴식시간(분)
    Map<String, Object> getProfileStats(@Param("쉼표번호") String 쉼표번호);
}
