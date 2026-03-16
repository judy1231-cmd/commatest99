package com.comma.domain.auth.controller;

import com.comma.domain.auth.service.GoogleAuthService;
import com.comma.global.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth/google")
@RequiredArgsConstructor
public class GoogleAuthController {

    private final GoogleAuthService googleAuthService;
    private final JwtUtil jwtUtil;

    @Value("${app.front-url:http://localhost:3000}")
    private String frontUrl;

    /** GET /api/auth/google/login — 구글 로그인 페이지로 리다이렉트 */
    @GetMapping("/login")
    public ResponseEntity<Void> login() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Location", googleAuthService.getAuthorizationUrl(null));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    /** GET /api/auth/google/link?token=xxx — 기존 계정에 구글 연동 */
    @GetMapping("/link")
    public ResponseEntity<Void> link(@RequestParam String token) {
        HttpHeaders headers = new HttpHeaders();
        try {
            String 쉼표번호 = jwtUtil.extract쉼표번호(token);
            headers.add("Location", googleAuthService.getAuthorizationUrl(쉼표번호));
        } catch (Exception e) {
            log.error("[구글 연동 실패] 토큰 파싱 오류", e);
            headers.add("Location", frontUrl + "/settings/security?error=link_failed");
        }
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    /** GET /api/auth/google/callback — 구글 인가 코드 수신 후 처리 */
    @GetMapping("/callback")
    public ResponseEntity<Void> callback(
            @RequestParam String code,
            @RequestParam(required = false) String state) {
        HttpHeaders headers = new HttpHeaders();
        try {
            String result = googleAuthService.handleCallback(code, state);

            String redirect;
            if (result.startsWith("pending:")) {
                String pendingToken = result.substring("pending:".length());
                redirect = frontUrl + "/google/confirm?pendingToken=" + pendingToken;
            } else {
                String[] parts = result.split(":");
                String token = parts[0];
                String flag  = parts.length > 1 ? parts[1] : "false";

                if ("link".equals(flag)) {
                    redirect = frontUrl + "/settings/security?linked=google";
                } else {
                    redirect = frontUrl + "/oauth/callback?token=" + token;
                }
            }
            headers.add("Location", redirect);
        } catch (Exception e) {
            log.error("[구글 콜백 실패]", e);
            headers.add("Location", frontUrl + "/login?error=google_failed");
        }
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    /** POST /api/auth/google/confirm — 가입 확인 페이지에서 계정 생성 */
    @PostMapping("/confirm")
    public ResponseEntity<Map<String, Object>> confirmSignup(@RequestBody Map<String, String> body) {
        String pendingToken = body.get("pendingToken");
        String username     = body.get("username");
        try {
            String accessToken = googleAuthService.confirmPendingSignup(pendingToken, username);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", Map.of("accessToken", accessToken),
                    "message", "가입이 완료되었습니다."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "data", null,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("[구글 가입 확인 실패]", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "data", null,
                    "message", "가입 처리 중 오류가 발생했습니다."
            ));
        }
    }
}
