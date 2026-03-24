package com.comma.domain.admin.controller;

import com.comma.global.util.AnalyticsService;
import com.comma.global.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    // POST /api/analytics/track  — 비로그인도 허용 (JWT 선택적)
    @PostMapping("/track")
    public ResponseEntity<ApiResponse<Void>> track(
            HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        String commaNo = (String) request.getAttribute("쉼표번호"); // null이면 비로그인
        String eventType = (String) body.get("eventType");
        if (eventType == null || eventType.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("eventType 필수"));
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) body.getOrDefault("data", Map.of());
        analyticsService.track(commaNo, eventType, data);
        return ResponseEntity.ok(ApiResponse.ok(null, "ok"));
    }
}
