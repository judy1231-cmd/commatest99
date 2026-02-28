package com.comma.domain.notification.controller;

import com.comma.domain.notification.service.NotificationService;
import com.comma.global.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // GET /api/notifications?page=1&size=20  [JWT 필요]
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNotifications(
            HttpServletRequest request,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        Map<String, Object> result = notificationService.getNotifications(쉼표번호, page, size);
        return ResponseEntity.ok(ApiResponse.ok(result, "알림 조회 성공"));
    }

    // GET /api/notifications/unread-count  [JWT 필요]
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getUnreadCount(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        int count = notificationService.getUnreadCount(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("count", count), "미읽음 알림 수 조회 성공"));
    }

    // PUT /api/notifications/{id}/read  [JWT 필요]
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            HttpServletRequest request,
            @PathVariable Long id) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        notificationService.markAsRead(id, 쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok("알림을 읽음 처리했습니다."));
    }

    // PUT /api/notifications/read-all  [JWT 필요]
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        notificationService.markAllAsRead(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok("모든 알림을 읽음 처리했습니다."));
    }
}
