package com.comma.global.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    private static final AntPathMatcher pathMatcher = new AntPathMatcher();

    private static final String[] PUBLIC_PATHS = {
            "/api/auth/signup",
            "/api/auth/login",
            "/api/auth/refresh",
            "/api/auth/email/verify",
            "/api/auth/password/reset-request",
            "/api/auth/password/reset",
            "/api/auth/check/username",
            "/api/auth/check/email",
            "/api/auth/kakao/login",
            "/api/auth/kakao/callback",
            "/api/places",
            "/api/places/nearby",
            "/api/places/*/reviews",
            "/api/rest-types",
            "/api/rest-types/*/activities",
            "/api/survey/questions",
            "/api/contents",
            "/api/contents/*",
            "/api/posts",
            "/api/posts/*"
    };

    @Override
    @SuppressWarnings("null") // getServletPath() / PUBLIC_PATHS 요소는 런타임에 null 아님 — Eclipse 정적 분석 억제
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) throws IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getServletPath();

        for (String pattern : PUBLIC_PATHS) {
            if (pathMatcher.match(pattern, path)) {
                return true;
            }
        }

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            sendError(response, 401, "로그인이 필요합니다.");
            return false;
        }

        String token = header.substring(7);

        if (!jwtUtil.isTokenValid(token)) {
            sendError(response, 401, "유효하지 않은 토큰입니다. 다시 로그인해주세요.");
            return false;
        }

        String 쉼표번호 = jwtUtil.extract쉼표번호(token);
        String role = jwtUtil.extractRole(token);

        if (pathMatcher.match("/api/admin/**", path) && !"ADMIN".equals(role)) {
            sendError(response, 403, "관리자 권한이 필요합니다.");
            return false;
        }

        request.setAttribute("쉼표번호", 쉼표번호);
        request.setAttribute("role", role);

        return true;
    }

    private void sendError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(
                String.format("{\"success\":false,\"data\":null,\"message\":\"%s\"}", message)
        );
    }
}
