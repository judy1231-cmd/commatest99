package com.comma.domain.user.controller;

import com.comma.domain.user.model.UserSettings;
import com.comma.domain.user.service.UserService;
import com.comma.global.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /api/user/profile  [JWT 필요]
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            Map<String, Object> profile = userService.getProfile(쉼표번호);
            return ResponseEntity.ok(ApiResponse.ok(profile, "프로필 조회 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.fail(e.getMessage()));
        }
    }

    // PUT /api/user/profile  [JWT 필요]
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Void>> updateProfile(
            HttpServletRequest request,
            @RequestBody Map<String, String> body) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            userService.updateProfile(쉼표번호, body.get("nickname"));
            return ResponseEntity.ok(ApiResponse.ok("프로필이 수정되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // GET /api/user/settings  [JWT 필요]
    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<UserSettings>> getSettings(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        UserSettings settings = userService.getSettings(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok(settings, "설정 조회 성공"));
    }

    // PUT /api/user/settings  [JWT 필요]
    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<Void>> updateSettings(
            HttpServletRequest request,
            @RequestBody UserSettings settings) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        userService.updateSettings(쉼표번호, settings);
        return ResponseEntity.ok(ApiResponse.ok("설정이 저장되었습니다."));
    }

    // DELETE /api/user/account  [JWT 필요]
    @DeleteMapping("/account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        userService.deleteAccount(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok("회원 탈퇴가 처리되었습니다."));
    }
}
