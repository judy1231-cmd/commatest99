package com.comma.domain.admin.controller;

import com.comma.domain.admin.model.BlockedKeyword;
import com.comma.domain.admin.service.AdminService;
import com.comma.global.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // GET /api/admin/dashboard  [ADMIN 전용]
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        Map<String, Object> stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok(stats, "대시보드 통계 조회 성공"));
    }

    // GET /api/admin/users?keyword=&status=&page=1&size=20  [ADMIN 전용]
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Map<String, Object> result = adminService.getUsers(keyword, status, page, size);
        return ResponseEntity.ok(ApiResponse.ok(result, "사용자 목록 조회 성공"));
    }

    // PUT /api/admin/users/{쉼표번호}/status  [ADMIN 전용]
    @PutMapping("/users/{target쉼표번호}/status")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(
            HttpServletRequest request,
            @PathVariable String target쉼표번호,
            @RequestBody Map<String, String> body) {
        String admin쉼표번호 = (String) request.getAttribute("쉼표번호");
        adminService.updateUserStatus(admin쉼표번호, target쉼표번호, body.get("status"));
        return ResponseEntity.ok(ApiResponse.ok("사용자 상태가 변경되었습니다."));
    }

    // GET /api/admin/places?status=pending&page=1&size=20  [ADMIN 전용]
    @GetMapping("/places")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlaces(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Map<String, Object> result = adminService.getPlaces(status, page, size);
        return ResponseEntity.ok(ApiResponse.ok(result, "장소 목록 조회 성공"));
    }

    // PUT /api/admin/places/{id}/status  [ADMIN 전용]
    @PutMapping("/places/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updatePlaceStatus(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String admin쉼표번호 = (String) request.getAttribute("쉼표번호");
        adminService.updatePlaceStatus(admin쉼표번호, id, body.get("status"));
        return ResponseEntity.ok(ApiResponse.ok("장소 상태가 변경되었습니다."));
    }

    // GET /api/admin/analytics  [ADMIN 전용]
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        Map<String, Object> analytics = adminService.getAnalytics();
        return ResponseEntity.ok(ApiResponse.ok(analytics, "분석 데이터 조회 성공"));
    }

    // GET /api/admin/audit-logs?page=1&size=20  [ADMIN 전용]
    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAuditLogs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Map<String, Object> result = adminService.getAuditLogs(page, size);
        return ResponseEntity.ok(ApiResponse.ok(result, "감사 로그 조회 성공"));
    }

    // GET /api/admin/keywords  [ADMIN 전용]
    @GetMapping("/keywords")
    public ResponseEntity<ApiResponse<List<BlockedKeyword>>> getKeywords() {
        List<BlockedKeyword> keywords = adminService.getBlockedKeywords();
        return ResponseEntity.ok(ApiResponse.ok(keywords, "차단 키워드 조회 성공"));
    }

    // POST /api/admin/keywords  [ADMIN 전용]
    @PostMapping("/keywords")
    public ResponseEntity<ApiResponse<Void>> addKeyword(@RequestBody Map<String, String> body) {
        adminService.addBlockedKeyword(body.get("keyword"));
        return ResponseEntity.ok(ApiResponse.ok("차단 키워드가 추가되었습니다."));
    }

    // DELETE /api/admin/keywords/{id}  [ADMIN 전용]
    @DeleteMapping("/keywords/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteKeyword(@PathVariable Long id) {
        adminService.deleteBlockedKeyword(id);
        return ResponseEntity.ok(ApiResponse.ok("차단 키워드가 삭제되었습니다."));
    }
}
