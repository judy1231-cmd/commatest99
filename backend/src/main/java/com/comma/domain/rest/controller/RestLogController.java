package com.comma.domain.rest.controller;

import com.comma.domain.rest.model.RestActivity;
import com.comma.domain.rest.model.RestLog;
import com.comma.domain.rest.model.RestType;
import com.comma.domain.rest.service.RestLogService;
import com.comma.global.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class RestLogController {

    private final RestLogService restLogService;

    // ==================== 휴식 유형 (공개) ====================

    // GET /api/rest-types
    @GetMapping("/api/rest-types")
    public ResponseEntity<ApiResponse<List<RestType>>> getRestTypes() {
        List<RestType> types = restLogService.getRestTypes();
        return ResponseEntity.ok(ApiResponse.ok(types, "휴식 유형 조회 성공"));
    }

    // GET /api/rest-types/{id}/activities
    @GetMapping("/api/rest-types/{id}/activities")
    public ResponseEntity<ApiResponse<List<RestActivity>>> getActivities(@PathVariable Long id) {
        List<RestActivity> activities = restLogService.getActivities(id);
        return ResponseEntity.ok(ApiResponse.ok(activities, "활동 목록 조회 성공"));
    }

    // ==================== 휴식 기록 [JWT 필요] ====================

    // POST /api/rest-logs
    @PostMapping("/api/rest-logs")
    public ResponseEntity<ApiResponse<RestLog>> createRestLog(
            HttpServletRequest request,
            @RequestBody RestLog restLog) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        RestLog created = restLogService.createRestLog(쉼표번호, restLog);
        return ResponseEntity.ok(ApiResponse.ok(created, "휴식 기록이 저장되었습니다."));
    }

    // GET /api/rest-logs?page=1&size=10
    @GetMapping("/api/rest-logs")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyRestLogs(
            HttpServletRequest request,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        Map<String, Object> result = restLogService.getMyRestLogs(쉼표번호, page, size);
        return ResponseEntity.ok(ApiResponse.ok(result, "기록 목록 조회 성공"));
    }

    // GET /api/rest-logs/{id}
    @GetMapping("/api/rest-logs/{id}")
    public ResponseEntity<ApiResponse<RestLog>> getRestLogDetail(
            HttpServletRequest request,
            @PathVariable Long id) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            RestLog log = restLogService.getRestLogDetail(id, 쉼표번호);
            return ResponseEntity.ok(ApiResponse.ok(log, "기록 상세 조회 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.fail(e.getMessage()));
        }
    }

    // PUT /api/rest-logs/{id}
    @PutMapping("/api/rest-logs/{id}")
    public ResponseEntity<ApiResponse<Void>> updateRestLog(
            HttpServletRequest request,
            @PathVariable Long id,
            @RequestBody RestLog restLog) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            restLogService.updateRestLog(id, 쉼표번호, restLog);
            return ResponseEntity.ok(ApiResponse.ok("기록이 수정되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // DELETE /api/rest-logs/{id}
    @DeleteMapping("/api/rest-logs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRestLog(
            HttpServletRequest request,
            @PathVariable Long id) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            restLogService.deleteRestLog(id, 쉼표번호);
            return ResponseEntity.ok(ApiResponse.ok("기록이 삭제되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // ==================== 콘텐츠 (공개 — rest_activities 기반) ====================

    // GET /api/contents?category=physical
    @GetMapping("/api/contents")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getContents(
            @RequestParam(required = false) String category) {
        List<Map<String, Object>> contents = restLogService.getContents(category);
        Map<String, Object> result = Map.of("contents", contents, "total", contents.size());
        return ResponseEntity.ok(ApiResponse.ok(result, "콘텐츠 목록 조회 성공"));
    }

    // GET /api/contents/{id}
    @GetMapping("/api/contents/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getContentDetail(@PathVariable Long id) {
        Map<String, Object> content = restLogService.getContentById(id);
        if (content == null) return ResponseEntity.ok(ApiResponse.fail("콘텐츠를 찾을 수 없습니다."));
        return ResponseEntity.ok(ApiResponse.ok(content, "콘텐츠 조회 성공"));
    }
}
