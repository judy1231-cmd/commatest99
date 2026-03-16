package com.comma.domain.auth.service;

import com.comma.domain.auth.mapper.AuthMapper;
import com.comma.domain.user.model.User;
import com.comma.global.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoAuthService {

    private final AuthMapper authMapper;
    private final JwtUtil jwtUtil;

    @Value("${kakao.client-id}")
    private String clientId;

    @Value("${kakao.client-secret}")
    private String clientSecret;

    @Value("${kakao.redirect-uri}")
    private String redirectUri;

    /** 카카오 로그인 URL 반환 */
    public String getAuthorizationUrl() {
        return "https://kauth.kakao.com/oauth/authorize" +
                "?client_id=" + clientId +
                "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
                "&response_type=code";
    }

    /**
     * 카카오 콜백 처리 — 기존 회원이면 로그인, 신규면 자동 가입 후 로그인
     * @return JWT access token
     */
    @Transactional
    public String handleCallback(String code) throws Exception {
        String accessToken = fetchKakaoAccessToken(code);
        Map<String, String> kakaoUser = fetchKakaoUserInfo(accessToken);

        String providerId = kakaoUser.get("id");
        String nickname   = kakaoUser.get("nickname");

        // 기존 소셜 계정 조회
        User user = authMapper.findByProvider("kakao", providerId);

        if (user == null) {
            // 신규 가입
            user = createKakaoUser(providerId, nickname);
        }

        return jwtUtil.generateAccessToken(user.get쉼표번호(), user.getRole());
    }

    private User createKakaoUser(String providerId, String nickname) {
        String 쉼표번호 = generate쉼표번호();

        User user = new User();
        user.set쉼표번호(쉼표번호);
        user.setEmail("kakao_" + providerId + "@kakao.com");
        user.setPassword(BCrypt.hashpw(UUID.randomUUID().toString(), BCrypt.gensalt()));
        user.setUsername("kakao_" + providerId);
        user.setNickname(nickname != null ? nickname : 쉼표번호);
        user.setStatus("active");
        user.setEmailVerified(true);
        user.setRole("USER");

        authMapper.insertUser(user);
        authMapper.updateUserEmailVerified(쉼표번호);
        authMapper.insertAuthProvider(쉼표번호, "kakao", providerId);

        return user;
    }

    private String fetchKakaoAccessToken(String code) throws Exception {
        String body = "grant_type=authorization_code" +
                "&client_id=" + clientId +
                "&client_secret=" + clientSecret +
                "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
                "&code=" + code;

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://kauth.kakao.com/oauth/token"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        String json = response.body();
        log.debug("[카카오] 토큰 응답: {}", json);

        return extractJsonField(json, "access_token");
    }

    private Map<String, String> fetchKakaoUserInfo(String accessToken) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://kapi.kakao.com/v2/user/me"))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        String json = response.body();
        log.debug("[카카오] 유저 정보: {}", json);

        Map<String, String> result = new HashMap<>();
        result.put("id", extractJsonField(json, "id"));

        // nickname: kakao_account.profile.nickname
        String nickname = extractNestedField(json, "nickname");
        result.put("nickname", nickname);

        return result;
    }

    /** 단순 JSON 문자열에서 필드 추출 (정규식 기반) */
    private String extractJsonField(String json, String field) {
        String pattern = "\"" + field + "\"\\s*:\\s*\"?([^\"\\s,}]+)\"?";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
        return m.find() ? m.group(1) : null;
    }

    private String extractNestedField(String json, String field) {
        String pattern = "\"" + field + "\"\\s*:\\s*\"([^\"]+)\"";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
        return m.find() ? m.group(1) : null;
    }

    private String generate쉼표번호() {
        String max = authMapper.findMax쉼표번호ForUser();
        int nextNum = 1;
        if (max != null && max.startsWith("쉼표")) {
            nextNum = Integer.parseInt(max.substring(2)) + 1;
        }
        if (nextNum > 8999) throw new IllegalStateException("쉼표번호 발급 한도를 초과했습니다.");
        return String.format("쉼표%04d", nextNum);
    }
}
