package com.comma.domain.badge.service;

import com.comma.domain.badge.mapper.BadgeMapper;
import com.comma.domain.badge.model.Badge;
import com.comma.domain.badge.model.UserBadge;
import com.comma.domain.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeMapper badgeMapper;
    private final NotificationService notificationService;

    /**
     * 전체 배지 목록 + 사용자의 획득 여부를 함께 반환
     * 프론트에서 "획득한 배지는 컬러, 미획득은 회색"으로 표시 가능
     */
    public List<Map<String, Object>> getAllBadgesWithStatus(String 쉼표번호) {
        List<Badge> allBadges = badgeMapper.findAllBadges();
        List<UserBadge> userBadges = badgeMapper.findUserBadges(쉼표번호);

        Set<Long> earnedIds = userBadges.stream()
                .map(UserBadge::getBadgeId)
                .collect(Collectors.toSet());

        return allBadges.stream().map(badge -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("badge", badge);
            entry.put("earned", earnedIds.contains(badge.getId()));
            return entry;
        }).toList();
    }

    public List<UserBadge> getMyBadges(String 쉼표번호) {
        return badgeMapper.findUserBadges(쉼표번호);
    }

    /**
     * 배지 수여 — 중복 수여 방지
     */
    @Transactional
    public void awardBadge(String 쉼표번호, Long badgeId) {
        UserBadge existing = badgeMapper.findUserBadge(쉼표번호, badgeId);
        if (existing != null) return; // 이미 획득한 배지

        badgeMapper.insertUserBadge(쉼표번호, badgeId);

        // 배지 획득 알림 발송
        List<Badge> allBadges = badgeMapper.findAllBadges();
        allBadges.stream()
                .filter(b -> b.getId().equals(badgeId))
                .findFirst()
                .ifPresent(badge ->
                    notificationService.createNotification(
                            쉼표번호, "badge",
                            "배지를 획득했어요!",
                            badge.getBadgeName() + " 배지를 획득했습니다."
                    )
                );
    }

    /**
     * 조건 확인 후 자동 배지 수여
     * — 휴식 기록 후 호출하여 조건 달성 시 자동 수여
     */
    @Transactional
    public void checkAndAwardBadges(String 쉼표번호) {
        int logCount = badgeMapper.countRestLogs(쉼표번호);

        // 첫 기록 배지 (ID: 1)
        if (logCount >= 1) awardBadge(쉼표번호, 1L);

        // 10개 기록 달성 (ID: 2)
        if (logCount >= 10) awardBadge(쉼표번호, 2L);

        // 30개 기록 달성 (ID: 3)
        if (logCount >= 30) awardBadge(쉼표번호, 3L);

        // 50개 기록 달성 (ID: 4)
        if (logCount >= 50) awardBadge(쉼표번호, 4L);

        // 100개 기록 달성 (ID: 5)
        if (logCount >= 100) awardBadge(쉼표번호, 5L);
    }
}
