package com.comma.domain.badge.controller;

import com.comma.domain.badge.model.UserBadge;
import com.comma.domain.badge.service.BadgeService;
import com.comma.global.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    // GET /api/badges  [JWT 필요] — 전체 배지 + 획득 여부
    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllBadges(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        List<Map<String, Object>> badges = badgeService.getAllBadgesWithStatus(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok(badges, "배지 목록 조회 성공"));
    }

    // GET /api/badges/my  [JWT 필요] — 내가 획득한 배지만
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<UserBadge>>> getMyBadges(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        List<UserBadge> badges = badgeService.getMyBadges(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok(badges, "내 배지 조회 성공"));
    }
}
