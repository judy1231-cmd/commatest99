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
public class NaverAuthService {

    private final AuthMapper authMapper;
    private final JwtUtil jwtUtil;

    @Value("${naver.client-id}")
    private String clientId;

    @Value("${naver.client-secret}")
    private String clientSecret;

    @Value("${naver.redirect-uri}")
    private String redirectUri;

    /**
     * 네이버 로그인 URL 반환
     * state: 쉼표번호이면 계정 연동, null이면 일반 로그인 (CSRF용 UUID 사용)
     */
    public String getAuthorizationUrl(String 쉼표번호) {
        // 네이버는 state 필수 (ASCII only) — 연동 시 link_{번호}, 일반 로그인 시 랜덤 UUID
        String state = (쉼표번호 != null)
                ? "link_" + 쉼표번호.replaceAll("[^0-9]", "")  // "쉼표0001" → "link_0001"
                : UUID.randomUUID().toString();
        return "https://nid.naver.com/oauth2.0/authorize" +
                "?client_id=" + clientId +
                "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
                "&response_type=code" +
                "&state=" + URLEncoder.encode(state, StandardCharsets.UTF_8);
    }

    /**
     * 네이버 콜백 처리
     * @return "pending:TOKEN" (신규가입) | "token:false" (기존로그인) | "token:link" (계정연동)
     */
    @Transactional
    public String handleCallback(String code, String state) throws Exception {
        String accessToken = fetchNaverAccessToken(code, state);
        Map<String, String> naverUser = fetchNaverUserInfo(accessToken);

        String providerId = naverUser.get("id");
        String nickname   = naverUser.get("nickname");
        String email      = naverUser.get("email");

        User existingNaverUser = authMapper.findByProvider("naver", providerId);

        // state가 "link_{번호}" 형식이면 계정 연동 (예: link_0001 → 쉼표0001)
        if (state != null && state.startsWith("link_")) {
            String 연동쉼표번호 = "쉼표" + state.substring("link_".length());
            if (existingNaverUser != null) {
                if ("dormant".equals(existingNaverUser.getStatus())) {
                    authMapper.deleteAuthProvider(existingNaverUser.get쉼표번호(), "naver");
                } else {
                    return jwtUtil.generateAccessToken(existingNaverUser.get쉼표번호(), existingNaverUser.getRole());
                }
            }
            authMapper.insertAuthProvider(연동쉼표번호, "naver", providerId);
            User linkedUser = authMapper.findBy쉼표번호(연동쉼표번호);
            return jwtUtil.generateAccessToken(linkedUser.get쉼표번호(), linkedUser.getRole()) + ":link";
        }

        // 기존 네이버 계정 로그인
        if (existingNaverUser != null) {
            if ("dormant".equals(existingNaverUser.getStatus())) {
                authMapper.deleteAuthProvider(existingNaverUser.get쉼표번호(), "naver");
            } else {
                return jwtUtil.generateAccessToken(existingNaverUser.get쉼표번호(), existingNaverUser.getRole()) + ":false";
            }
        }

        // 신규 가입 — pending 토큰
        String pendingToken = jwtUtil.generatePendingToken("naver", providerId, nickname, email);
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

        User newUser = createNaverUser(providerId, nickname, username, email);
        return jwtUtil.generateAccessToken(newUser.get쉼표번호(), newUser.getRole());
    }

    private User createNaverUser(String providerId, String nickname, String username, String email) {
        String 쉼표번호 = generate쉼표번호();

        String userEmail = (email != null && !email.isBlank()) ? email : "naver_" + providerId + "@naver.com";
        if (authMapper.countByEmail(userEmail) > 0) {
            userEmail = "naver_" + providerId + "@naver.com";
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
        authMapper.insertAuthProvider(쉼표번호, "naver", providerId);

        return user;
    }

    private String fetchNaverAccessToken(String code, String state) throws Exception {
        String body = "grant_type=authorization_code" +
                "&client_id=" + clientId +
                "&client_secret=" + clientSecret +
                "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
                "&code=" + code +
                "&state=" + URLEncoder.encode(state != null ? state : "", StandardCharsets.UTF_8);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://nid.naver.com/oauth2.0/token"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        String json = response.body();
        log.debug("[네이버] 토큰 응답: {}", json);

        return extractJsonField(json, "access_token");
    }

    private Map<String, String> fetchNaverUserInfo(String accessToken) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://openapi.naver.com/v1/nid/me"))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        String json = response.body();
        log.debug("[네이버] 유저 정보: {}", json);

        // 네이버 응답: {"resultcode":"00","message":"success","response":{"id":"...","email":"...","nickname":"..."}}
        Map<String, String> result = new HashMap<>();
        result.put("id",       extractNestedField(json, "id"));
        result.put("email",    extractNestedField(json, "email"));
        result.put("nickname", extractNestedField(json, "nickname"));

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
        return m.find() ? unescapeUnicode(m.group(1)) : null;
    }

    /** JSON 유니코드 이스케이프 시퀀스를 실제 문자로 변환 */
    private String unescapeUnicode(String s) {
        if (s == null) return null;
        java.util.regex.Matcher m = java.util.regex.Pattern
                .compile("\\\\u([0-9a-fA-F]{4})")
                .matcher(s);
        StringBuffer sb = new StringBuffer();
        while (m.find()) {
            m.appendReplacement(sb, String.valueOf((char) Integer.parseInt(m.group(1), 16)));
        }
        m.appendTail(sb);
        return sb.toString();
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
