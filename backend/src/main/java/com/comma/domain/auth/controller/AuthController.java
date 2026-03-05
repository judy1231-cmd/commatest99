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
        String username = body.get("username"); // 사용자가 직접 정하는 로그인 아이디
        String password = body.get("password");

        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.fail("이메일을 입력해주세요."));
        if (username == null || username.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.fail("아이디를 입력해주세요."));
        if (username.length() < 2 || username.length() > 20)
            return ResponseEntity.badRequest().body(ApiResponse.fail("아이디는 2~20자로 입력해주세요."));
        if (password == null || password.length() < 8)
            return ResponseEntity.badRequest().body(ApiResponse.fail("비밀번호는 8자 이상이어야 합니다."));

        try {
            User user = authService.signup(email, username, password);
            return ResponseEntity.ok(ApiResponse.ok(user, "회원가입이 완료되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // ==================== 로그인 ====================
    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@RequestBody Map<String, String> body) {
        String identifier = body.get("identifier");
        String password   = body.get("password");
        if (identifier == null || identifier.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.fail("아이디 또는 이메일을 입력해주세요."));
        if (password == null || password.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.fail("비밀번호를 입력해주세요."));

        try {
            Map<String, Object> result = authService.login(identifier.trim(), password);
            return ResponseEntity.ok(ApiResponse.ok(result, "로그인 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(ApiResponse.fail(e.getMessage()));
        }
    }

    // ==================== 토큰 갱신 ====================
    // POST /api/auth/refresh
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Map<String, String>>> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank())
            return ResponseEntity.status(401).body(ApiResponse.fail("리프레시 토큰이 없습니다."));

        try {
            Map<String, String> result = authService.refresh(refreshToken);
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

    // ==================== 닉네임 변경 ====================
    // PATCH /api/auth/me/nickname  [JWT 필요]
    @PatchMapping("/me/nickname")
    public ResponseEntity<ApiResponse<User>> updateNickname(
            HttpServletRequest request,
            @RequestBody Map<String, String> body) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        try {
            User user = authService.updateNickname(쉼표번호, body.get("nickname"));
            return ResponseEntity.ok(ApiResponse.ok(user, "닉네임이 변경되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // ==================== 아이디 중복확인 ====================
    // GET /api/auth/check/username?username=...  [공개]
    @GetMapping("/check/username")
    public ResponseEntity<ApiResponse<Void>> checkUsername(@RequestParam String username) {
        if (username == null || username.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.fail("아이디를 입력해주세요."));
        if (username.length() < 2 || username.length() > 20)
            return ResponseEntity.badRequest().body(ApiResponse.fail("아이디는 2~20자로 입력해주세요."));
        try {
            authService.checkUsernameAvailable(username);
            return ResponseEntity.ok(ApiResponse.ok("사용 가능한 아이디입니다."));
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
