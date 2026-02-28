package com.comma.domain.badge.mapper;

import com.comma.domain.badge.model.Badge;
import com.comma.domain.badge.model.UserBadge;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BadgeMapper {

    List<Badge> findAllBadges();

    List<UserBadge> findUserBadges(@Param("쉼표번호") String 쉼표번호);

    UserBadge findUserBadge(@Param("쉼표번호") String 쉼표번호, @Param("badgeId") Long badgeId);

    void insertUserBadge(@Param("쉼표번호") String 쉼표번호, @Param("badgeId") Long badgeId);

    // 배지 조건 확인용 — 사용자의 총 기록 수
    int countRestLogs(@Param("쉼표번호") String 쉼표번호);
}
