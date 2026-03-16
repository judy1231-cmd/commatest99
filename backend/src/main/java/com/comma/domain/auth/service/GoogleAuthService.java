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
public class GoogleAuthService {

    private final AuthMapper authMapper;
    private final JwtUtil jwtUtil;

    @Value("${google.client-id}")
    private String clientId;

    @Value("${google.client-secret}")
    private String clientSecret;

    @Value("${google.redirect-uri}")
    private String redirectUri;

    /** 구글 로그인 URL 반환 (state: 연동 대상 쉼표번호 또는 null) */
    public String getAuthorizationUrl(String state) {
        String url = "https://accounts.google.com/o/oauth2/v2/auth" +
                "?client_id=" + clientId +
                "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
                "&response_type=code" +
                "&scope=" + URLEncoder.encode("openid email profile", StandardCharsets.UTF_8) +
                "&access_type=offline";
        if (state != null) url += "&state=" + URLEncoder.encode(state, StandardCharsets.UTF_8);
        return url;
    }

    /**
     * 구글 콜백 처리
     * @return "pending:TOKEN" (신규가입) | "token:false" (기존로그인) | "token:link" (계정연동)
     */
    @Transactional
    public String handleCallback(String code, String state) throws Exception {
        String accessToken = fetchGoogleAccessToken(code);
        Map<String, String> googleUser = fetchGoogleUserInfo(accessToken);

        String providerId = googleUser.get("id");
        String nickname   = googleUser.get("name");
        String email      = googleUser.get("email");

        User existingGoogleUser = authMapper.findByProvider("google", providerId);

        // state가 있으면 기존 계정에 구글 연동
        if (state != null && !state.isBlank()) {
            String 쉼표번호 = state;
            if (existingGoogleUser != null) {
                if ("dormant".equals(existingGoogleUser.getStatus())) {
                    authMapper.deleteAuthProvider(existingGoogleUser.get쉼표번호(), "google");
                } else {
                    return jwtUtil.generateAccessToken(existingGoogleUser.get쉼표번호(), existingGoogleUser.getRole());
                }
            }
            authMapper.insertAuthProvider(쉼표번호, "google", providerId);
            User linkedUser = authMapper.findBy쉼표번호(쉼표번호);
            return jwtUtil.generateAccessToken(linkedUser.get쉼표번호(), linkedUser.getRole()) + ":link";
        }

        // 기존 구글 계정 로그인
        if (existingGoogleUser != null) {
            if ("dormant".equals(existingGoogleUser.getStatus())) {
                authMapper.deleteAuthProvider(existingGoogleUser.get쉼표번호(), "google");
            } else {
                return jwtUtil.generateAccessToken(existingGoogleUser.get쉼표번호(), existingGoogleUser.getRole()) + ":false";
            }
        }

        // 신규 가입 — pending 토큰에 구글 이메일도 포함
        String pendingToken = jwtUtil.generatePendingToken("google", providerId, nickname, email);
        return "pending:" + pendingToken;
    }

    /**
     * 가입 확인 페이지에서 "가입 완료" 클릭 시 계정 생성
     */
    @Transactional
    public String confirmPendingSignup(String pendingToken, String username) {
        io.jsonwebtoken.Claims claims = jwtUtil.extractPendingClaims(pendingToken);
        if (claims == null) {
            throw new IllegalArgumentException("유효하지 않거나 만료된 가입 토큰입니다.");
        }
        if (username == null || !username.matches("^[a-zA-Z0-9_]{4,20}$")) {
            throw new IllegalArgumentException("아이디는 영문/숫자/_만 사용 가능하고 4~20자여야 합니다.");
        }
        if (authMapper.countByUsername(username) > 0) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        String provider   = claims.get("provider", String.class);
        String providerId = claims.getSubject();
        String nickname   = claims.get("nickname", String.class);
        String email      = claims.get("email", String.class);

        User existing = authMapper.findByProvider(provider, providerId);
        if (existing != null) {
            if ("dormant".equals(existing.getStatus())) {
                authMapper.deleteAuthProvider(existing.get쉼표번호(), provider);
            } else {
                return jwtUtil.generateAccessToken(existing.get쉼표번호(), existing.getRole());
            }
        }

        User newUser = createGoogleUser(providerId, nickname, username, email);
        return jwtUtil.generateAccessToken(newUser.get쉼표번호(), newUser.getRole());
    }

    private User createGoogleUser(String providerId, String nickname, String username, String email) {
        String 쉼표번호 = generate쉼표번호();

        // 구글 이메일이 있으면 사용, 없으면 내부용 이메일 생성
        String userEmail = (email != null && !email.isBlank())
                ? email
                : "google_" + providerId + "@google.com";

        // 이메일 중복 시 내부용으로 대체
        if (authMapper.countByEmail(userEmail) > 0) {
            userEmail = "google_" + providerId + "@google.com";
        }

        User user = new User();
        user.set쉼표번호(쉼표번호);
        user.setEmail(userEmail);
        user.setPassword(BCrypt.hashpw(UUID.randomUUID().toString(), BCrypt.gensalt()));
        user.setUsername(username);
        user.setNickname(nickname != null ? nickname : 쉼표번호);
        user.setStatus("active");
        user.setEmailVerified(true);
        user.setRole("USER");

        authMapper.insertUser(user);
        authMapper.updateUserEmailVerified(쉼표번호);
        authMapper.insertAuthProvider(쉼표번호, "google", providerId);

        return user;
    }

    private String fetchGoogleAccessToken(String code) throws Exception {
        String body = "grant_type=authorization_code" +
                "&client_id=" + clientId +
                "&client_secret=" + clientSecret +
                "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
                "&code=" + code;

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://oauth2.googleapis.com/token"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        String json = response.body();
        log.debug("[구글] 토큰 응답: {}", json);

        return extractJsonField(json, "access_token");
    }

    private Map<String, String> fetchGoogleUserInfo(String accessToken) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://www.googleapis.com/oauth2/v2/userinfo"))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        String json = response.body();
        log.debug("[구글] 유저 정보: {}", json);

        Map<String, String> result = new HashMap<>();
        result.put("id", extractJsonField(json, "id"));
        result.put("email", extractJsonField(json, "email"));
        result.put("name", extractNestedField(json, "name"));

        return result;
    }

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
