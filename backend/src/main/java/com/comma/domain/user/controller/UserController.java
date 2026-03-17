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

    // PATCH /api/auth/me/nickname  [JWT 필요] — MyPage.jsx 호환용
    @PatchMapping("/nickname")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateNickname(
            HttpServletRequest request,
            @RequestBody Map<String, String> body) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        String nickname = body.get("nickname");
        if (nickname == null || nickname.isBlank() || nickname.length() < 2 || nickname.length() > 20) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("닉네임은 2~20자로 입력해주세요."));
        }
        try {
            userService.updateProfile(쉼표번호, nickname.trim());
            Map<String, Object> data = new java.util.HashMap<>();
            data.put("쉼표번호", 쉼표번호);
            data.put("nickname", nickname.trim());
            return ResponseEntity.ok(ApiResponse.ok(data, "닉네임이 변경되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // POST /api/user/device-token  [JWT 필요] — 애플워치 단축어 연동용 토큰 발급 (이미 있으면 기존 토큰 반환)
    @PostMapping("/device-token")
    public ResponseEntity<ApiResponse<Map<String, String>>> issueDeviceToken(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        String token = userService.issueDeviceToken(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("deviceToken", token), "디바이스 토큰이 발급되었습니다."));
    }

    // POST /api/user/device-token/reissue  [JWT 필요] — 토큰 재발급 (기존 토큰 무효화)
    @PostMapping("/device-token/reissue")
    public ResponseEntity<ApiResponse<Map<String, String>>> reissueDeviceToken(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        String token = userService.reissueDeviceToken(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("deviceToken", token), "디바이스 토큰이 재발급되었습니다."));
    }

    // DELETE /api/user/account  [JWT 필요]
    @DeleteMapping("/account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        userService.deleteAccount(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok("회원 탈퇴가 처리되었습니다."));
    }
}
