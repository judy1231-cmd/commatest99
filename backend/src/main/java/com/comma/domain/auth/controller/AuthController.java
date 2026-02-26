package com.comma.domain.auth.controller;

import com.comma.domain.auth.service.AuthService;
import com.comma.domain.user.model.User;
import com.comma.global.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ==================== 회원가입 ====================
    // POST /api/auth/signup
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<User>> signup(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");
        String nickname = body.get("nickname");

        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.fail("이메일을 입력해주세요."));
        if (password == null || password.length() < 8)
            return ResponseEntity.badRequest().body(ApiResponse.fail("비밀번호는 8자 이상이어야 합니다."));
        if (nickname == null || nickname.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.fail("닉네임을 입력해주세요."));

        try {
            User user = authService.signup(email, password, nickname);
            return ResponseEntity.ok(ApiResponse.ok(user, "회원가입이 완료되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // ==================== 로그인 ====================
    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@RequestBody Map<String, String> body) {
        try {
            Map<String, Object> result = authService.login(body.get("email"), body.get("password"));
            return ResponseEntity.ok(ApiResponse.ok(result, "로그인 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(ApiResponse.fail(e.getMessage()));
        }
    }

    // ==================== 토큰 갱신 ====================
    // POST /api/auth/refresh
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Map<String, String>>> refresh(@RequestBody Map<String, String> body) {
        try {
            Map<String, String> result = authService.refresh(body.get("refreshToken"));
            return ResponseEntity.ok(ApiResponse.ok(result, "토큰 갱신 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(ApiResponse.fail(e.getMessage()));
        }
    }

    // ==================== 로그아웃 ====================
    // POST /api/auth/logout  [JWT 필요]
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        authService.logout(쉼표번호);
        return ResponseEntity.ok(ApiResponse.ok("로그아웃 되었습니다."));
    }

    // ==================== 내 정보 조회 ====================
    // GET /api/auth/me  [JWT 필요]
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> me(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            User user = authService.getMe(쉼표번호);
            return ResponseEntity.ok(ApiResponse.ok(user, "조회 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.fail(e.getMessage()));
        }
    }

    // ==================== 이메일 인증 ====================
    // POST /api/auth/email/send  [JWT 필요]
    @PostMapping("/email/send")
    public ResponseEntity<ApiResponse<Void>> sendVerificationEmail(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            authService.sendVerificationEmail(쉼표번호);
            return ResponseEntity.ok(ApiResponse.ok("인증 메일이 발송되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // GET /api/auth/email/verify?token=...  [공개]
    @GetMapping("/email/verify")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String token) {
        try {
            authService.verifyEmail(token);
            return ResponseEntity.ok(ApiResponse.ok("이메일 인증이 완료되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // ==================== 비밀번호 재설정 ====================
    // POST /api/auth/password/reset-request  [공개]
    @PostMapping("/password/reset-request")
    public ResponseEntity<ApiResponse<Void>> sendPasswordResetEmail(@RequestBody Map<String, String> body) {
        authService.sendPasswordResetEmail(body.get("email"));
        // 보안상 이메일 존재 여부와 무관하게 동일 응답
        return ResponseEntity.ok(ApiResponse.ok("비밀번호 재설정 메일이 발송되었습니다."));
    }

    // POST /api/auth/password/reset  [공개]
    @PostMapping("/password/reset")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody Map<String, String> body) {
        try {
            authService.resetPassword(body.get("token"), body.get("newPassword"));
            return ResponseEntity.ok(ApiResponse.ok("비밀번호가 재설정되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }
}
