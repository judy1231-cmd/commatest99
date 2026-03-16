package com.comma.domain.auth.controller;

import com.comma.domain.auth.service.KakaoAuthService;
import com.comma.global.config.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth/kakao")
@RequiredArgsConstructor
public class KakaoAuthController {

    private final KakaoAuthService kakaoAuthService;
    private final JwtUtil jwtUtil;

    @Value("${app.front-url:http://localhost:3000}")
    private String frontUrl;

    /** GET /api/auth/kakao/login — 카카오 로그인 페이지로 리다이렉트 */
    @GetMapping("/login")
    public ResponseEntity<Void> login() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Location", kakaoAuthService.getAuthorizationUrl(null));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    /**
     * GET /api/auth/kakao/link?token=xxx — 기존 계정에 카카오 연동
     * 쿼리파라미터로 JWT 받아서 쉼표번호 추출 후 state에 실어 카카오로 리다이렉트
     */
    @GetMapping("/link")
    public ResponseEntity<Void> link(@RequestParam String token) {
        HttpHeaders headers = new HttpHeaders();
        try {
            String 쉼표번호 = jwtUtil.extract쉼표번호(token);
            headers.add("Location", kakaoAuthService.getAuthorizationUrl(쉼표번호));
        } catch (Exception e) {
            log.error("[카카오 연동 실패] 토큰 파싱 오류", e);
            headers.add("Location", frontUrl + "/settings/security?error=link_failed");
        }
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    /** GET /api/auth/kakao/callback — 카카오 인가 코드 수신 후 처리 */
    @GetMapping("/callback")
    public ResponseEntity<Void> callback(
            @RequestParam String code,
            @RequestParam(required = false) String state) {
        HttpHeaders headers = new HttpHeaders();
        try {
            String result = kakaoAuthService.handleCallback(code, state);

            String redirect;
            if (result.startsWith("pending:")) {
                // 신규 가입 — 확인 페이지로 이동
                String pendingToken = result.substring("pending:".length());
                redirect = frontUrl + "/kakao/confirm?pendingToken=" + pendingToken;
            } else {
                String[] parts = result.split(":");
                String token = parts[0];
                String flag  = parts.length > 1 ? parts[1] : "false";

                if ("link".equals(flag)) {
                    redirect = frontUrl + "/settings/security?linked=kakao";
                } else {
                    redirect = frontUrl + "/oauth/callback?token=" + token;
                }
            }
            headers.add("Location", redirect);
        } catch (Exception e) {
            log.error("[카카오 콜백 실패]", e);
            headers.add("Location", frontUrl + "/login?error=kakao_failed");
        }
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    /**
     * POST /api/auth/kakao/confirm — 가입 확인 페이지에서 "가입 완료" 클릭 시 계정 생성
     * Body: { "pendingToken": "xxx" }
     */
    @PostMapping("/confirm")
    public ResponseEntity<Map<String, Object>> confirmSignup(@RequestBody Map<String, String> body) {
        String pendingToken = body.get("pendingToken");
        String username     = body.get("username");
        try {
            String accessToken = kakaoAuthService.confirmPendingSignup(pendingToken, username);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", Map.of("accessToken", accessToken),
                    "message", "가입이 완료되었습니다."
            ));
        } catch (IllegalArgumentException e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("data", null);
            err.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        } catch (Exception e) {
            log.error("[카카오 가입 확인 실패]", e);
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("data", null);
            err.put("message", "가입 처리 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(err);
        }
    }
}
