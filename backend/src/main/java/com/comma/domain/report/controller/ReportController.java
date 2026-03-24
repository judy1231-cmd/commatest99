package com.comma.domain.report.controller;

import com.comma.domain.report.service.ReportService;
import com.comma.global.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    // POST /api/reports  [JWT 필요]
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> submitReport(
            HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        String reporterId = (String) request.getAttribute("쉼표번호");
        String targetType = (String) body.get("targetType");
        Long targetId = Long.valueOf(body.get("targetId").toString());
        String reason = (String) body.getOrDefault("reason", "기타");
        try {
            reportService.submitReport(reporterId, targetType, targetId, reason);
            return ResponseEntity.ok(ApiResponse.ok("신고가 접수되었어요."));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(ApiResponse.fail(e.getMessage()));
        }
    }

    // GET /api/admin/reports  [ADMIN]
    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReports(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Map<String, Object> result = reportService.getReports(status, page, size);
        return ResponseEntity.ok(ApiResponse.ok(result, "신고 목록 조회 성공"));
    }

    // PUT /api/admin/reports/{id}/status  [ADMIN]
    @PutMapping("/admin/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        reportService.updateStatus(id, body.get("status"));
        return ResponseEntity.ok(ApiResponse.ok("처리 상태가 변경되었어요."));
    }
}
