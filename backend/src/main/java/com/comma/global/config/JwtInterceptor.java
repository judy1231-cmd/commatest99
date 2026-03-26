package com.comma.global.config;

import jakarta.servlet.http.HttpServletRequest;
// 들어오는 HTTP 요청 객체. 헤더, 파라미터, URL 등을 읽을 수 있다.
import jakarta.servlet.http.HttpServletResponse;
// 나가는 HTTP 응답 객체. 상태코드, 헤더, 바디를 설정할 수 있다.
import lombok.RequiredArgsConstructor;
// final 필드들을 파라미터로 받는 생성자를 자동 생성한다. (jwtUtil 주입용)
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
// "/api/places/*" 같은 와일드카드 패턴으로 URL을 비교하는 유틸
import org.springframework.web.servlet.HandlerInterceptor;
// 컨트롤러 실행 전/후에 끼어들 수 있는 인터페이스. preHandle이 핵심.

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {
// HandlerInterceptor를 구현해서 Spring이 모든 요청에 이 클래스를 거치게 한다.

    private final JwtUtil jwtUtil;
    // JWT 검증/파싱 유틸. Spring이 자동으로 주입해 준다.

    private static final AntPathMatcher pathMatcher = new AntPathMatcher();
    // URL 패턴 매칭 유틸. 클래스 레벨에서 하나만 만든다 (static).

    private static final String[] PUBLIC_PATHS = {
    // 토큰 없이도 접근 가능한 공개 경로 목록.
    // 여기 없는 경로는 모두 JWT가 필요하다.
            "/api/auth/signup",          // 회원가입 — 로그인 전이라 토큰 없음
            "/api/auth/login",           // 로그인 — 토큰을 받기 전이라 없음
            "/api/auth/refresh",         // 토큰 갱신 — refreshToken으로 새 토큰 요청
            "/api/auth/email/verify",    // 이메일 인증 — 메일 링크 클릭 시 토큰 없음
            "/api/auth/password/reset-request", // 비번 재설정 메일 발송 — 로그인 불가 상태
            "/api/auth/password/reset",  // 비번 재설정 완료 — 메일 링크로 접근
            "/api/auth/check/username",  // 아이디 중복확인 — 가입 전
            "/api/auth/check/email",     // 이메일 중복확인 — 가입 전
            "/api/auth/kakao/login",     // 카카오 소셜 로그인 — 최초 진입
            "/api/auth/kakao/link",
            "/api/auth/kakao/callback",
            "/api/auth/kakao/confirm",
            "/api/auth/google/login",
            "/api/auth/google/link",
            "/api/auth/google/callback",
            "/api/auth/google/confirm",
            "/api/auth/naver/login",
            "/api/auth/naver/link",
            "/api/auth/naver/callback",
            "/api/auth/naver/confirm",
            "/api/places",              // 장소 목록 — 비로그인 사용자도 볼 수 있어야 함
            "/api/places/*",            // 장소 상세 (예: /api/places/1)
            "/api/places/nearby",       // 주변 장소
            "/api/places/*/reviews",    // 장소 리뷰 목록
            "/api/rest-types",          // 휴식 유형 목록
            "/api/rest-types/*/activities",
            "/api/survey/questions",    // 설문 질문 목록 — 진단 시작 전 조회
            "/api/contents",
            "/api/contents/*",
            "/api/posts",               // 커뮤니티 게시글 목록
            "/api/posts/*",
            "/api/posts/*/comments",
            "/api/posts/*/photos",
            "/api/diagnosis/measurements/device", // 워치에서 심박 전송 — 별도 인증
            "/api/user/shortcut",               // 단축어 파일 다운로드 — deviceToken으로 인증
            "/api/challenges",
            "/api/challenges/*"
    };

    @Override
    @SuppressWarnings("null")
    // getServletPath() / PUBLIC_PATHS 요소는 런타임에 null 아님 — Eclipse 정적 분석 억제
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) throws IOException {
    // 모든 API 요청이 컨트롤러에 도달하기 전에 이 메서드를 통과한다.
    // true를 반환하면 요청이 컨트롤러로 계속 진행되고,
    // false를 반환하면 요청이 여기서 차단된다.

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
            // CORS Preflight 요청 (브라우저가 실제 요청 전에 먼저 보내는 확인 요청).
            // OPTIONS 요청은 토큰 없이 항상 통과시킨다.
        }

        String path = request.getServletPath();
        // 요청된 URL 경로. 예: "/api/auth/login", "/api/rest-logs"

        boolean isPublic = false;
        for (String pattern : PUBLIC_PATHS) {
            if (pathMatcher.match(pattern, path)) {
            // AntPathMatcher로 패턴 비교. "/api/places/*"가 "/api/places/123"과 매칭된다.
                isPublic = true;
                break;
                // 하나라도 매칭되면 공개 경로로 확정. 더 볼 필요 없다.
            }
        }

        if (isPublic) {
            // 공개 경로라도 토큰이 있으면 사용자 정보를 추출해 둔다.
            // 예: 장소 상세 페이지에서 로그인한 사용자인지 알아야 북마크 여부를 표시할 수 있다.
            String authHeader = request.getHeader("Authorization");
            // HTTP 요청 헤더에서 "Authorization" 값을 읽는다.
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // "Bearer xxxxx.yyyyy.zzzzz" 형식인지 확인
                String token = authHeader.substring(7);
                // "Bearer " (7글자) 뒤의 실제 토큰 문자열만 잘라낸다.
                if (jwtUtil.isTokenValid(token)) {
                    request.setAttribute("쉼표번호", jwtUtil.extract쉼표번호(token));
                    // 토큰이 유효하면 쉼표번호를 request에 저장한다.
                    // 컨트롤러에서 request.getAttribute("쉼표번호")로 꺼낼 수 있다.
                    request.setAttribute("role", jwtUtil.extractRole(token));
                    // role도 함께 저장한다.
                }
            }
            return true;
            // 공개 경로는 인증 실패해도 통과.
        }

        // 여기서부터는 비공개 경로 처리
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            sendError(response, 401, "로그인이 필요합니다.");
            // 토큰이 아예 없으면 401 Unauthorized 반환. 로그인이 필요하다는 뜻.
            return false;
            // false 반환 → 컨트롤러로 가지 않고 여기서 요청 처리 종료.
        }

        String token = header.substring(7);
        // "Bearer " 7글자를 잘라내고 토큰 문자열만 추출

        if (!jwtUtil.isTokenValid(token)) {
            sendError(response, 401, "유효하지 않은 토큰입니다. 다시 로그인해주세요.");
            // 토큰이 만료됐거나 위변조됐으면 401 반환.
            return false;
        }

        String 쉼표번호 = jwtUtil.extract쉼표번호(token);
        String role = jwtUtil.extractRole(token);
        // 검증이 완료된 토큰에서 사용자 정보를 꺼낸다.

        if (pathMatcher.match("/api/admin/**", path) && !"ADMIN".equals(role)) {
            sendError(response, 403, "관리자 권한이 필요합니다.");
            // /api/admin/ 하위 경로인데 ADMIN이 아니면 403 Forbidden 반환.
            // 401(인증 없음)과 403(권한 없음)을 구분한다.
            return false;
        }

        request.setAttribute("쉼표번호", 쉼표번호);
        request.setAttribute("role", role);
        // 검증된 사용자 정보를 request에 저장한다.
        // 컨트롤러에서 꺼내 쓸 수 있다.

        return true;
        // 모든 검증 통과. 컨트롤러로 요청을 넘긴다.
    }

    private void sendError(HttpServletResponse response, int status, String message) throws IOException {
    // 에러 응답을 직접 작성하는 내부 메서드. 인터셉터는 Controller를 거치지 않아서 직접 써야 한다.
        response.setStatus(status);
        // HTTP 상태코드 설정 (401, 403 등)
        response.setContentType("application/json;charset=UTF-8");
        // 응답이 JSON 형식임을 브라우저/프론트에 알린다. UTF-8로 한글도 안 깨진다.
        response.getWriter().write(
                String.format("{\"success\":false,\"data\":null,\"message\":\"%s\"}", message)
                // ApiResponse 클래스를 쓰지 않고 직접 JSON 문자열을 만든다.
                // 인터셉터에서는 ObjectMapper가 없어서 직접 포맷한다.
        );
    }
}
