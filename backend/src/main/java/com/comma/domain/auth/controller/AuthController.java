package com.comma.domain.auth.controller;

import com.comma.domain.auth.service.AuthService;
import com.comma.domain.user.model.User;
import com.comma.global.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
// HttpServletRequest: JwtInterceptor가 request.setAttribute()로 저장한 값을 꺼낼 때 사용.
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
// HTTP 응답 헤더를 다루는 클래스. 이메일 인증 후 리다이렉트 헤더 설정에 사용.
import org.springframework.http.HttpStatus;
// HTTP 상태코드 상수. HttpStatus.FOUND = 302 리다이렉트.
import org.springframework.http.ResponseEntity;
// HTTP 응답 전체(상태코드 + 헤더 + 바디)를 담는 래퍼
import org.springframework.web.bind.annotation.*;
// @RestController, @RequestMapping, @PostMapping, @GetMapping 등 웹 어노테이션 모음

import java.util.Map;

@RestController
// 이 클래스의 모든 메서드 반환값이 JSON으로 직렬화된다.
// @Controller + @ResponseBody 의 합성 어노테이션.
@RequestMapping("/api/auth")
// 이 클래스의 모든 메서드는 "/api/auth" 로 시작하는 URL에서 처리된다.
@RequiredArgsConstructor
// final 필드 생성자 자동 생성 (의존성 주입용)
public class AuthController {

    @Value("${app.front-url:http://localhost:3000}")
    private String frontUrl;
    // 이메일 인증 완료 후 리다이렉트할 프론트 URL.
    // 배포 시 application-prod.yml에서 실제 도메인으로 설정.

    private final AuthService authService;
    // 실제 비즈니스 로직 담당. Controller는 요청/응답만 처리하고 로직은 Service에 위임.
    private final com.comma.domain.auth.mapper.AuthMapper authMapper;
    // 소셜 provider 목록 조회에만 직접 사용. Service를 거치지 않는 단순 조회라서 직접 호출.

    // ==================== 회원가입 ====================
    // POST /api/auth/signup
    @PostMapping("/signup")
    // HTTP POST /api/auth/signup 요청을 이 메서드가 처리한다.
    public ResponseEntity<ApiResponse<User>> signup(@RequestBody Map<String, String> body) {
    // @RequestBody: 요청 바디의 JSON을 Map으로 자동 변환한다.
    // ResponseEntity<ApiResponse<User>>: HTTP 상태코드까지 포함한 응답 타입.
        String email    = body.get("email");
        String username = body.get("username"); // 사용자가 직접 정하는 로그인 아이디
        String password = body.get("password");
        // Map에서 각 필드를 꺼낸다.

        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.fail("이메일을 입력해주세요."));
            // 400 Bad Request 응답. 프론트에서 검증하더라도 백엔드에서도 반드시 검증한다.
        if (username == null || username.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.fail("아이디를 입력해주세요."));
        if (username.length() < 2 || username.length() > 20)
            return ResponseEntity.badRequest().body(ApiResponse.fail("아이디는 2~20자로 입력해주세요."));
        if (password == null || password.length() < 8)
            return ResponseEntity.badRequest().body(ApiResponse.fail("비밀번호는 8자 이상이어야 합니다."));

        try {
            User user = authService.signup(email, username, password);
            return ResponseEntity.ok(ApiResponse.ok(user, "회원가입이 완료되었습니다."));
            // 200 OK + 생성된 User 객체 반환
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
            // Service에서 던진 "이미 사용 중인 이메일" 같은 메시지를 그대로 응답한다.
        }
    }

    // ==================== 로그인 ====================
    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@RequestBody Map<String, String> body) {
        String identifier = body.get("identifier");
        // 이메일 또는 username. 프론트에서 한 필드로 받는다.
        String password   = body.get("password");
        if (identifier == null || identifier.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.fail("아이디 또는 이메일을 입력해주세요."));
        if (password == null || password.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.fail("비밀번호를 입력해주세요."));

        try {
            Map<String, Object> result = authService.login(identifier.trim(), password);
            // result에는 accessToken, refreshToken, user가 담겨있다.
            return ResponseEntity.ok(ApiResponse.ok(result, "로그인 성공"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(ApiResponse.fail(e.getMessage()));
            // 로그인 실패는 400이 아닌 401 Unauthorized. 인증 실패를 명확히 구분.
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
            // result에는 새 accessToken만 담겨있다.
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
        // JwtInterceptor에서 검증 후 저장한 쉼표번호. null일 수 없다 (인터셉터가 이미 검증).
        authService.logout(쉼표번호);
        // Redis에서 Refresh Token 삭제
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

    // GET /api/auth/social/providers  [JWT 필요] — 연동된 소셜 제공자 목록
    @GetMapping("/social/providers")
    public ResponseEntity<ApiResponse<java.util.List<String>>> getSocialProviders(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        return ResponseEntity.ok(ApiResponse.ok(authMapper.findProvidersByUser(쉼표번호), "조회 성공"));
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
    public ResponseEntity<Void> verifyEmail(@RequestParam String token) {
    // @RequestParam: URL의 ?token=xxx 에서 값을 꺼낸다.
    // 반환 타입이 Void인 이유: 바디 없이 리다이렉트(302)만 보내기 때문.
        HttpHeaders headers = new HttpHeaders();
        try {
            authService.verifyEmail(token);
            headers.add("Location", frontUrl + "/login?verified=true");
            // 인증 성공 → 로그인 페이지로 리다이렉트. 프론트에서 ?verified=true를 감지해서 메시지 표시.
        } catch (IllegalArgumentException e) {
            headers.add("Location", frontUrl + "/login?verified=false");
            // 인증 실패 → 실패 메시지 표시 페이지로 리다이렉트
        }
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
        // 302 Found: 브라우저가 Location 헤더의 URL로 자동 이동한다.
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
        // 이메일이 없어도 같은 응답을 보낸다 (보안상 이메일 존재 여부 노출 방지)
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

    // ==================== 비밀번호 변경 (로그인 상태) ====================
    // POST /api/auth/password/change  [JWT 필요]
    @PostMapping("/password/change")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            HttpServletRequest request,
            @RequestBody Map<String, String> body) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        // [JWT 필요] JwtInterceptor가 이미 인증을 마치고 쉼표번호를 저장해두었다.
        try {
            authService.changePassword(쉼표번호, body.get("currentPassword"), body.get("newPassword"));
            return ResponseEntity.ok(ApiResponse.ok("비밀번호가 변경되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    // ==================== 회원 탈퇴 ====================
    // DELETE /api/auth/withdraw  [JWT 필요]
    @DeleteMapping("/withdraw")
    // HTTP DELETE 메서드 사용. 리소스 삭제의 의미에 맞는 메서드 선택.
    public ResponseEntity<ApiResponse<Void>> withdraw(HttpServletRequest request) {
        String 쉼표번호 = (String) request.getAttribute("쉼표번호");
        authService.withdraw(쉼표번호);
        // status → dormant, email/username 익명화, 소셜 연동 해제
        return ResponseEntity.ok(ApiResponse.ok("회원 탈퇴가 처리되었습니다."));
    }
}
