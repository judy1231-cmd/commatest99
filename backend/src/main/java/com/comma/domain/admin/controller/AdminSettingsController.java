package com.comma.domain.admin.controller;

import com.comma.domain.admin.service.AdminSettingsService;
import com.comma.global.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final AdminSettingsService adminSettingsService;

    // GET /api/admin/settings  [ADMIN 전용]
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> getSettings() {
        Map<String, String> settings = adminSettingsService.getSettings();
        return ResponseEntity.ok(ApiResponse.ok(settings, "설정 조회 성공"));
    }

    // PUT /api/admin/settings  [ADMIN 전용]
    @PutMapping
    public ResponseEntity<ApiResponse<Void>> saveSettings(@RequestBody Map<String, String> settings) {
        adminSettingsService.saveSettings(settings);
        return ResponseEntity.ok(ApiResponse.ok(null, "설정이 저장되었습니다."));
    }
}
