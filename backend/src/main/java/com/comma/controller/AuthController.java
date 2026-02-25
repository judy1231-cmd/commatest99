package com.comma.controller;

import com.comma.model.User;
import com.comma.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 회원가입
     * POST /api/auth/signup
     */
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = request.get("email");
            String password = request.get("password");
            String nickname = request.get("nickname");

            // 유효성 검사
            if (email == null || email.isBlank()) {
                response.put("success", false);
                response.put("data", null);
                response.put("message", "이메일을 입력해주세요.");
                return ResponseEntity.badRequest().body(response);
            }
            if (password == null || password.length() < 8) {
                response.put("success", false);
                response.put("data", null);
                response.put("message", "비밀번호는 8자 이상이어야 합니다.");
                return ResponseEntity.badRequest().body(response);
            }
            if (nickname == null || nickname.isBlank()) {
                response.put("success", false);
                response.put("data", null);
                response.put("message", "닉네임을 입력해주세요.");
                return ResponseEntity.badRequest().body(response);
            }

            User user = authService.signup(email, password, nickname);

            response.put("success", true);
            response.put("data", user);
            response.put("message", "회원가입이 완료되었습니다.");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("data", null);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 로그인
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = request.get("email");
            String password = request.get("password");

            Map<String, Object> loginResult = authService.login(email, password);

            response.put("success", true);
            response.put("data", loginResult);
            response.put("message", "로그인 성공");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("data", null);
            response.put("message", e.getMessage());
            return ResponseEntity.status(401).body(response);
        }
    }

    /**
     * Access Token 갱신
     * POST /api/auth/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();

        try {
            String refreshToken = request.get("refreshToken");
            Map<String, String> tokenResult = authService.refresh(refreshToken);

            response.put("success", true);
            response.put("data", tokenResult);
            response.put("message", "토큰 갱신 성공");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("data", null);
            response.put("message", e.getMessage());
            return ResponseEntity.status(401).body(response);
        }
    }

    /**
     * 로그아웃
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest httpRequest) {
        Map<String, Object> response = new HashMap<>();

        String header = httpRequest.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            response.put("success", false);
            response.put("data", null);
            response.put("message", "인증 토큰이 없습니다.");
            return ResponseEntity.status(401).body(response);
        }

        try {
            String 쉼표번호 = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication().getName();

            authService.logout(쉼표번호);

            response.put("success", true);
            response.put("data", null);
            response.put("message", "로그아웃 되었습니다.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("data", null);
            response.put("message", "로그아웃 처리 중 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }
}
