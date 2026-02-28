package com.comma.domain.user.service;

import com.comma.domain.user.mapper.UserMapper;
import com.comma.domain.user.model.User;
import com.comma.domain.user.model.UserSettings;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;

    /**
     * 프로필 상세 — 사용자 정보 + 통계(총 기록수, 총 휴식시간) + 배지 수
     */
    public Map<String, Object> getProfile(String 쉼표번호) {
        User user = userMapper.findBy쉼표번호(쉼표번호);
        if (user == null) throw new IllegalArgumentException("존재하지 않는 계정입니다.");
        user.setPassword(null);

        Map<String, Object> profileStats = userMapper.getProfileStats(쉼표번호);
        int badgeCount = userMapper.countBadges(쉼표번호);

        Map<String, Object> result = new HashMap<>();
        result.put("user", user);
        result.put("stats", profileStats);
        result.put("badgeCount", badgeCount);
        return result;
    }

    @Transactional
    public void updateProfile(String 쉼표번호, String nickname) {
        if (nickname == null || nickname.isBlank()) {
            throw new IllegalArgumentException("닉네임을 입력해주세요.");
        }
        userMapper.updateNickname(쉼표번호, nickname.trim());
    }

    public UserSettings getSettings(String 쉼표번호) {
        UserSettings settings = userMapper.findSettingsBy쉼표번호(쉼표번호);
        if (settings == null) {
            // 설정이 없으면 기본값 반환
            settings = new UserSettings();
            settings.set쉼표번호(쉼표번호);
            settings.setTheme("light");
            settings.setNotificationSettingsJson("{\"push\":true,\"email\":true}");
        }
        return settings;
    }

    /**
     * 설정 저장 — 없으면 INSERT, 있으면 UPDATE (UPSERT 패턴)
     */
    @Transactional
    public void updateSettings(String 쉼표번호, UserSettings settings) {
        settings.set쉼표번호(쉼표번호);
        UserSettings existing = userMapper.findSettingsBy쉼표번호(쉼표번호);

        if (existing == null) {
            userMapper.insertSettings(settings);
        } else {
            settings.setId(existing.getId());
            userMapper.updateSettings(settings);
        }
    }

    /**
     * 회원 탈퇴 — 실제 삭제 대신 status를 'dormant'로 변경 (soft delete)
     * 일정 기간 후 복구 요청 가능하도록
     */
    @Transactional
    public void deleteAccount(String 쉼표번호) {
        userMapper.updateStatus(쉼표번호, "dormant");
    }
}
