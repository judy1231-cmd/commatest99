package com.comma.domain.auth.controller;

import com.comma.domain.auth.service.KakaoAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth/kakao")
@RequiredArgsConstructor
public class KakaoAuthController {

    private final KakaoAuthService kakaoAuthService;

    @Value("${app.front-url:http://localhost:3000}")
    private String frontUrl;

    /** GET /api/auth/kakao/login — 카카오 로그인 페이지로 리다이렉트 */
    @GetMapping("/login")
    public ResponseEntity<Void> login() {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Location", kakaoAuthService.getAuthorizationUrl());
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    /** GET /api/auth/kakao/callback — 카카오 인가 코드 수신 후 처리 */
    @GetMapping("/callback")
    public ResponseEntity<Void> callback(@RequestParam String code) {
        HttpHeaders headers = new HttpHeaders();
        try {
            String token = kakaoAuthService.handleCallback(code);
            headers.add("Location", frontUrl + "/oauth/callback?token=" + token);
        } catch (Exception e) {
            log.error("[카카오 로그인 실패]", e);
            headers.add("Location", frontUrl + "/login?error=kakao_failed");
        }
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}
