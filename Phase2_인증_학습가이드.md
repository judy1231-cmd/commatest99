# Phase 2 인증 작업 — 처음부터 따라하기

---

## 1. 학원에서 올린 코드 가져오기

```bash
# 원격 저장소에서 최신 코드 가져오기
git pull

# develop 브랜치에 새 커밋이 있으면 main에 머지
git merge origin/develop

# 머지 후 push
git push origin main
```

> **주석:**
> - `git pull` → 원격(GitHub)의 변경사항을 로컬에 반영
> - `git merge origin/develop` → develop 브랜치의 커밋을 현재 브랜치(main)에 합침
> - 학원(윈도우)에서 develop에 push → 집(맥북)에서 pull 후 merge = **환경 동기화**

---

## 2. 백엔드 — User 모델 생성

**파일:** `backend/src/main/java/com/comma/model/User.java`

```java
package com.comma.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data                   // getter, setter, toString 등 자동 생성 (Lombok)
@NoArgsConstructor      // 기본 생성자 자동 생성
@AllArgsConstructor     // 모든 필드 생성자 자동 생성
public class User {
    private String 쉼표번호;          // PK — "쉼표" + 4자리숫자 (예: 쉼표0001)
    private String email;
    private String password;          // BCrypt로 암호화된 비밀번호
    private String nickname;
    private String status;            // active / dormant / banned
    private Boolean emailVerified;    // 이메일 인증 여부
    private String role;              // USER / ADMIN
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

> **주석:**
> - Model = DB 테이블의 Java 버전. `users` 테이블의 컬럼과 1:1 매칭
> - `@Data` 하나면 getter/setter 다 만들어줌 → 코드가 짧아짐
> - **쉼표번호는 반드시 String** — DB에서 `VARCHAR(12)`이니까
> - `map-underscore-to-camel-case: true` 설정 덕분에 DB의 `email_verified` → Java의 `emailVerified`로 자동 매핑

---

## 3. 백엔드 — AuthMapper (DB 쿼리)

### 파일 1: `backend/src/main/java/com/comma/mapper/AuthMapper.java`

```java
package com.comma.mapper;

import com.comma.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper  // MyBatis가 이 인터페이스를 인식하고, XML과 연결해줌
public interface AuthMapper {

    void insertUser(User user);                              // 회원가입 INSERT
    User findByEmail(@Param("email") String email);          // 이메일로 조회 (로그인용)
    User findBy쉼표번호(@Param("쉼표번호") String 쉼표번호);     // 쉼표번호로 조회
    int countByEmail(@Param("email") String email);          // 이메일 중복 체크 (0이면 사용 가능)
    String findMax쉼표번호();                                  // 가장 큰 쉼표번호 조회 (자동생성용)
}
```

> **주석:**
> - Mapper = DB와 대화하는 역할. 메서드 이름이 곧 XML의 쿼리 ID
> - `@Param("email")` → XML에서 `#{email}`로 값을 받을 수 있게 해줌
> - 인터페이스만 만들면 됨 — 구현체는 MyBatis가 자동 생성

### 파일 2: `backend/src/main/resources/mapper/AuthMapper.xml`

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<!-- namespace = Java Mapper 인터페이스의 전체 경로 (정확히 일치해야 함!) -->
<mapper namespace="com.comma.mapper.AuthMapper">

    <!-- 회원가입: User 객체를 받아서 INSERT -->
    <insert id="insertUser" parameterType="User">
        INSERT INTO users (쉼표번호, email, password, nickname, status, email_verified, role)
        VALUES (#{쉼표번호}, #{email}, #{password}, #{nickname}, 'active', 0, 'USER')
    </insert>
    <!--
        #{쉼표번호} = Java의 user.get쉼표번호() 값이 들어감
        status는 항상 'active', role은 항상 'USER'로 고정 (가입 시)
    -->

    <!-- 이메일로 사용자 조회 (로그인할 때 사용) -->
    <select id="findByEmail" resultType="User">
        SELECT 쉼표번호, email, password, nickname, status, email_verified, role,
               created_at, updated_at
        FROM users
        WHERE email = #{email}
    </select>
    <!--
        resultType="User" = 조회 결과를 User 객체로 자동 매핑
        application.yml의 type-aliases-package 덕분에 "User"만 써도 됨
    -->

    <!-- 쉼표번호로 사용자 조회 -->
    <select id="findBy쉼표번호" resultType="User">
        SELECT 쉼표번호, email, password, nickname, status, email_verified, role,
               created_at, updated_at
        FROM users
        WHERE 쉼표번호 = #{쉼표번호}
    </select>

    <!-- 이메일 중복 체크: 결과가 0이면 사용 가능, 1 이상이면 중복 -->
    <select id="countByEmail" resultType="int">
        SELECT COUNT(*) FROM users WHERE email = #{email}
    </select>

    <!-- 쉼표번호 최대값 조회: 다음 번호를 계산하기 위해 -->
    <select id="findMax쉼표번호" resultType="String">
        SELECT 쉼표번호 FROM users ORDER BY 쉼표번호 DESC LIMIT 1
    </select>
    <!--
        예: 현재 최대가 "쉼표0003"이면 → 다음은 "쉼표0004"
        DESC LIMIT 1 = 내림차순으로 첫 번째 = 가장 큰 값
    -->

</mapper>
```

---

## 4. 백엔드 — AuthService (비즈니스 로직)

**파일:** `backend/src/main/java/com/comma/service/AuthService.java`

```java
package com.comma.service;

import com.comma.config.JwtUtil;
import com.comma.mapper.AuthMapper;
import com.comma.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service                   // 스프링이 이 클래스를 "서비스"로 관리
@RequiredArgsConstructor   // final 필드를 자동으로 생성자 주입
public class AuthService {

    private final AuthMapper authMapper;              // DB 쿼리
    private final PasswordEncoder passwordEncoder;    // BCrypt 암호화
    private final JwtUtil jwtUtil;                    // JWT 토큰 생성/검증
    private final StringRedisTemplate redisTemplate;  // Redis (리프레시 토큰 저장)

    private static final String REFRESH_TOKEN_PREFIX = "RT:";
    // Redis 키: "RT:쉼표0001" → 해당 유저의 리프레시 토큰 저장

    /**
     * 회원가입
     */
    public User signup(String email, String password, String nickname) {
        // 1. 이메일 중복 체크
        if (authMapper.countByEmail(email) > 0) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
            // throw = 에러 던지기 → Controller의 catch에서 잡힘
        }

        // 2. 쉼표번호 자동 생성
        String 쉼표번호 = generate쉼표번호();

        // 3. User 객체 만들어서 DB에 저장
        User user = new User();
        user.set쉼표번호(쉼표번호);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        // passwordEncoder.encode() = "1234" → "$2a$10$xK9..." (BCrypt 해시)
        user.setNickname(nickname);

        authMapper.insertUser(user);  // INSERT 실행

        user.setPassword(null);  // 비밀번호는 응답에서 제거 (보안)
        return user;
    }

    /**
     * 로그인 — Access Token + Refresh Token 발급
     */
    public Map<String, Object> login(String email, String password) {
        // 1. 이메일로 유저 조회
        User user = authMapper.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("존재하지 않는 계정입니다.");
        }

        // 2. 비밀번호 비교
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
            // matches(입력값, 해시값) = 입력값을 해시해서 DB값과 비교
        }

        // 3. 정지된 계정 체크
        if ("banned".equals(user.getStatus())) {
            throw new IllegalArgumentException("정지된 계정입니다. 관리자에게 문의하세요.");
        }

        // 4. JWT 토큰 생성
        String accessToken = jwtUtil.generateAccessToken(user.get쉼표번호(), user.getRole());
        // Access Token: 30분 유효, API 호출할 때마다 헤더에 담아 보냄
        String refreshToken = jwtUtil.generateRefreshToken(user.get쉼표번호());
        // Refresh Token: 14일 유효, Access Token 만료 시 갱신용

        // 5. Redis에 Refresh Token 저장
        redisTemplate.opsForValue().set(
                REFRESH_TOKEN_PREFIX + user.get쉼표번호(),  // 키: "RT:쉼표0001"
                refreshToken,                              // 값: 토큰 문자열
                14, TimeUnit.DAYS                          // 14일 후 자동 삭제
        );

        // 6. 응답 데이터 구성
        Map<String, Object> result = new HashMap<>();
        result.put("accessToken", accessToken);
        result.put("refreshToken", refreshToken);
        user.setPassword(null);  // 비밀번호 제거
        result.put("user", user);

        return result;
    }

    /**
     * Access Token 갱신
     * Access Token이 만료되면 Refresh Token으로 새 Access Token 발급
     */
    public Map<String, String> refresh(String refreshToken) {
        // 1. 리프레시 토큰 유효성 체크
        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다.");
        }

        String 쉼표번호 = jwtUtil.extract쉼표번호(refreshToken);

        // 2. Redis에 저장된 토큰과 비교 (탈취 방지)
        String storedToken = redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + 쉼표번호);
        if (storedToken == null || !storedToken.equals(refreshToken)) {
            throw new IllegalArgumentException("리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.");
        }

        // 3. 새 Access Token 발급
        User user = authMapper.findBy쉼표번호(쉼표번호);
        String newAccessToken = jwtUtil.generateAccessToken(쉼표번호, user.getRole());

        Map<String, String> result = new HashMap<>();
        result.put("accessToken", newAccessToken);
        return result;
    }

    /**
     * 로그아웃 — Redis에서 Refresh Token 삭제
     */
    public void logout(String 쉼표번호) {
        redisTemplate.delete(REFRESH_TOKEN_PREFIX + 쉼표번호);
        // Redis에서 삭제 → 이 토큰으로 더 이상 Access Token 갱신 불가
    }

    /**
     * 쉼표번호 자동 생성
     * DB에서 가장 큰 번호를 찾아서 +1
     */
    private String generate쉼표번호() {
        String max = authMapper.findMax쉼표번호();  // 예: "쉼표0003"
        int nextNum = 1;

        if (max != null && max.startsWith("쉼표")) {
            String numPart = max.substring(2);     // "쉼표0003" → "0003"
            nextNum = Integer.parseInt(numPart) + 1; // 3 + 1 = 4
        }

        return String.format("쉼표%04d", nextNum);   // "쉼표0004" (%04d = 4자리, 빈자리 0)
    }
}
```

---

## 5. 백엔드 — AuthController (API 엔드포인트)

**파일:** `backend/src/main/java/com/comma/controller/AuthController.java`

```java
package com.comma.controller;

import com.comma.service.AuthService;
import com.comma.model.User;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController                 // JSON 응답을 반환하는 컨트롤러
@RequestMapping("/api/auth")    // 이 클래스의 모든 URL은 /api/auth로 시작
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 회원가입
     * POST /api/auth/signup
     * Body: { "email": "...", "password": "...", "nickname": "..." }
     */
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@RequestBody Map<String, String> request) {
        // @RequestBody = 프론트에서 보낸 JSON을 Map으로 변환
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
                // badRequest() = HTTP 400
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
            return ResponseEntity.ok(response);  // HTTP 200

        } catch (IllegalArgumentException e) {
            // Service에서 throw한 에러가 여기로 옴
            response.put("success", false);
            response.put("data", null);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 로그인
     * POST /api/auth/login
     * Body: { "email": "...", "password": "..." }
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> loginResult = authService.login(
                request.get("email"), request.get("password")
            );
            response.put("success", true);
            response.put("data", loginResult);   // { accessToken, refreshToken, user }
            response.put("message", "로그인 성공");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("data", null);
            response.put("message", e.getMessage());
            return ResponseEntity.status(401).body(response);  // HTTP 401 = 인증 실패
        }
    }

    /**
     * Access Token 갱신
     * POST /api/auth/refresh
     * Body: { "refreshToken": "..." }
     */
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, String> tokenResult = authService.refresh(request.get("refreshToken"));
            response.put("success", true);
            response.put("data", tokenResult);   // { accessToken: "새토큰" }
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
     * Header: Authorization: Bearer {accessToken}
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
            // SecurityContext에서 현재 로그인한 유저의 쉼표번호 가져오기
            // (JwtAuthFilter가 토큰 파싱 후 SecurityContext에 저장해둔 것)
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
```

> **전체 흐름:**
> ```
> 프론트(fetch) → Controller(요청 받기) → Service(로직 처리) → Mapper(DB 쿼리) → DB
>                 ← JSON 응답            ← 결과 반환          ← 데이터 반환      ← 결과
> ```
> - **Controller**: 요청 받고 응답 보내는 역할만
> - **Service**: 실제 비즈니스 로직 (암호화, 토큰 생성 등)
> - **Mapper**: DB와 대화 (SQL 실행)

---

## 6. 백엔드 — JwtAuthFilter 수정

### 원래 문제 3가지

| # | 문제 | 영향 |
|---|------|------|
| 1 | `@Component` + `SecurityConfig.addFilterBefore` | 필터가 2번 실행됨 |
| 2 | SecurityConfig에 `.cors()` 없음 | 프론트에서 API 호출 시 CORS 에러 |
| 3 | `/api/auth/**` 공개 경로에서도 토큰 파싱 | 불필요한 연산 |

### 수정된 JwtAuthFilter.java

**파일:** `backend/src/main/java/com/comma/config/JwtAuthFilter.java`

```java
package com.comma.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

// ★ @Component 삭제! → SecurityConfig에서 @Bean으로 직접 등록하니까 여기선 빼야 함
// @Component가 있으면 스프링이 자동 등록 + SecurityConfig에서 수동 등록 = 2번 실행
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    private static final AntPathMatcher pathMatcher = new AntPathMatcher();

    // 토큰 검사 안 할 경로 목록
    private static final String[] SKIP_URLS = {
            "/api/auth/**",        // 로그인/회원가입은 토큰 없어도 됨
            "/api/places/**",
            "/api/rest-types/**",
            "/api/survey/**"
    };

    // ★ 이 경로들은 필터를 건너뜀 (성능 향상)
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        for (String pattern : SKIP_URLS) {
            if (pathMatcher.match(pattern, path)) {
                return true;  // true = 이 요청은 필터 안 탐
            }
        }
        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = extractToken(request);

        if (StringUtils.hasText(token) && jwtUtil.isTokenValid(token)) {
            String 쉼표번호 = jwtUtil.extract쉼표번호(token);
            String role = jwtUtil.extractRole(token);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            쉼표번호,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role))
                    );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
```

### 수정된 SecurityConfig.java

**파일:** `backend/src/main/java/com/comma/config/SecurityConfig.java`

```java
package com.comma.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // ★ @RequiredArgsConstructor 대신 @Bean으로 직접 생성

    private static final String[] PUBLIC_URLS = {
            "/api/auth/**",
            "/api/places/**",
            "/api/rest-types/**",
            "/api/survey/**",
    };

    // ★ JwtAuthFilter를 @Bean으로 딱 1번만 등록
    @Bean
    public JwtAuthFilter jwtAuthFilter(JwtUtil jwtUtil) {
        return new JwtAuthFilter(jwtUtil);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        http
            .cors(Customizer.withDefaults())  // ★ 이거 추가! CORS 허용
            // 이게 없으면 프론트(3000)에서 백엔드(8080) 호출 시 브라우저가 차단
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // STATELESS = 세션 안 씀 (JWT 방식이니까)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(PUBLIC_URLS).permitAll()           // 공개 경로
                .requestMatchers("/api/admin/**").hasRole("ADMIN")  // 관리자만
                .anyRequest().authenticated()                       // 나머지는 로그인 필요
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
            // 모든 요청이 UsernamePasswordAuthenticationFilter 전에 JwtAuthFilter를 거침

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

---

## 7. 프론트엔드 — Login.jsx API 연결

**핵심 변경: 하드코딩 → fetch API 호출**

```jsx
// ❌ 변경 전 (하드코딩)
const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('isLoggedIn', 'true');  // 그냥 true 저장... 인증 아님
    navigate('/');
};

// ✅ 변경 후 (실제 API 호출)
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
        setLoading(true);

        // 백엔드 로그인 API 호출
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
            // JSON.stringify = JS 객체 → JSON 문자열로 변환
        });
        const data = await res.json();
        // res.json() = 응답 body를 JSON으로 파싱

        if (!data.success) {
            setError(data.message);  // "비밀번호가 일치하지 않습니다." 등
            return;
        }

        // JWT 토큰을 localStorage에 저장
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        // user 정보도 저장 (닉네임, 쉼표번호 등 화면에서 사용)

        navigate('/');  // 메인으로 이동
    } catch (e) {
        setError('서버에 연결할 수 없습니다.');
        // 백엔드가 꺼져있거나 네트워크 오류
    } finally {
        setLoading(false);  // 로딩 끝 (성공이든 실패든)
    }
};
```

> **로그인 흐름:**
> ```
> 1. 사용자가 이메일/비밀번호 입력 후 "로그인" 클릭
> 2. fetch로 POST /api/auth/login 호출
> 3. 백엔드가 비밀번호 확인 후 JWT 토큰 발급
> 4. 프론트가 토큰을 localStorage에 저장
> 5. 이후 API 호출할 때마다 헤더에 토큰 담아서 보냄
>    Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
> ```

---

## 8. 프론트엔드 — Signup.jsx API 연결

### 추가된 기능들

```jsx
// 비밀번호 강도 계산
const getPasswordStrength = () => {
    const pw = form.password;
    let score = 0;
    if (pw.length >= 8) score++;           // 8자 이상
    if (/[a-zA-Z]/.test(pw)) score++;      // 영문 포함
    if (/[0-9]/.test(pw)) score++;         // 숫자 포함
    if (/[^a-zA-Z0-9]/.test(pw)) score++;  // 특수문자 포함
    // score: 1=약함, 2=보통, 3=좋음, 4=강함
};

// 약관 전체 동의 로직
const handleAgreementChange = (key) => {
    if (key === 'all') {
        const newValue = !agreements.all;
        // 전체 동의 토글 → 나머지도 전부 같은 값으로
        setAgreements({ all: newValue, age: newValue, terms: newValue, privacy: newValue });
    } else {
        const updated = { ...agreements, [key]: !agreements[key] };
        // 개별 체크 → 3개 다 체크됐으면 전체 동의도 자동 체크
        updated.all = updated.age && updated.terms && updated.privacy;
        setAgreements(updated);
    }
};

// 회원가입 API 호출
const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (form.password.length < 8) { setError('비밀번호는 8자 이상이어야 합니다.'); return; }
    if (form.password !== form.passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    if (!agreements.age || !agreements.terms || !agreements.privacy) {
        setError('필수 약관에 모두 동의해주세요.'); return;
    }

    const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, nickname: form.nickname })
    });
    const data = await res.json();

    if (data.success) {
        navigate('/signup-complete');  // 성공 → 가입완료 페이지로
    } else {
        setError(data.message);       // "이미 사용 중인 이메일입니다." 등
    }
};
```

---

## 9. 프론트엔드 — PrivateRoute JWT 기반으로 변경

**파일:** `frontend/src/components/common/PrivateRoute.jsx`

```jsx
// ❌ 변경 전
const isLoggedIn = !!localStorage.getItem('isLoggedIn');
// 아무나 localStorage에 'isLoggedIn' 넣으면 통과됨 (보안 취약)

// ✅ 변경 후
function PrivateRoute({ children }) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
    // JWT 토큰이 있어야만 보호된 페이지 접근 가능
}

export function AdminRoute({ children }) {
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || user.role !== 'ADMIN') {
        return <Navigate to="/login" replace />;
    }
    return children;
    // 토큰 + ADMIN 역할 둘 다 있어야 관리자 페이지 접근 가능
}
```

---

## 10. 프론트엔드 — UserNavbar 로그아웃 JWT 연동

```jsx
// ❌ 변경 전
const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('isLoggedIn'));
const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
};

// ✅ 변경 후
const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('accessToken'));
const handleLogout = async () => {
    try {
        const token = localStorage.getItem('accessToken');
        if (token) {
            // 백엔드에 로그아웃 요청 → Redis에서 Refresh Token 삭제
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }
    } catch (e) {
        // 로그아웃 API 실패해도 로컬은 정리
    }
    // localStorage에서 토큰 전부 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
};
```

---

## 11. Gradle Wrapper 생성

```bash
# Gradle Wrapper가 없으면 VS Code Java가 프로젝트를 인식 못 함
# gradlew = Gradle을 설치 안 해도 빌드할 수 있게 해주는 파일

brew install gradle                          # 맥에 Gradle 설치
cd backend
gradle wrapper --gradle-version 8.9          # Wrapper 생성

# 생성되는 파일들:
# gradlew          ← 맥/리눅스용 실행 스크립트
# gradlew.bat      ← 윈도우용 실행 스크립트
# gradle/wrapper/  ← Wrapper 설정 파일
```

---

## 12. settings.gradle 충돌 해결

```bash
# 문제: settings.gradle이 2개 → VS Code가 혼란
# comma/settings.gradle         → "루트 프로젝트, backend 포함"
# comma/backend/settings.gradle → "나(backend)가 루트 프로젝트"

# 해결: backend/settings.gradle 삭제, 루트 하나로 통합
rm backend/settings.gradle
```

**루트 `comma/settings.gradle`:**
```groovy
rootProject.name = 'comma'
include 'backend'
// include 'backend' = comma/backend/를 서브프로젝트로 인식시킴
```

---

## 13. .gitignore 정리

```gitignore
# 이거 추가해야 .gradle 캐시 파일이 git에 안 올라감
.gradle/
**/bin/
```

---

## 전체 구조 요약

```
[요청 흐름]
프론트 fetch 호출  →  AuthController.java   (요청 받기)
                   →  AuthService.java      (로직 처리: 암호화, 토큰)
                   →  AuthMapper.java/XML   (DB 쿼리 실행)
                   →  User.java             (데이터 담는 그릇)
                   ←  JSON 응답             (프론트에 결과 전달)

[보안 흐름]
JwtAuthFilter.java   →  모든 API 요청에서 토큰 검사
SecurityConfig.java  →  어떤 URL이 공개/보호인지 설정
JwtUtil.java         →  토큰 생성/검증 유틸리티

[생성/수정된 파일 목록]
backend/
├── src/main/java/com/comma/
│   ├── model/User.java              ← 새로 생성
│   ├── mapper/AuthMapper.java       ← 새로 생성
│   ├── service/AuthService.java     ← 새로 생성
│   ├── controller/AuthController.java ← 새로 생성
│   └── config/
│       ├── JwtAuthFilter.java       ← 수정 (@Component 제거, shouldNotFilter 추가)
│       └── SecurityConfig.java      ← 수정 (CORS 추가, @Bean 등록 방식 변경)
├── src/main/resources/mapper/
│   └── AuthMapper.xml               ← 새로 생성
frontend/
├── src/pages/user/
│   ├── Login.jsx                    ← 수정 (fetch API 연결)
│   ├── Signup.jsx                   ← 수정 (fetch API 연결, 약관/비밀번호 강도)
│   └── MainDashboard.jsx            ← 수정 (accessToken 체크)
├── src/components/
│   ├── common/PrivateRoute.jsx      ← 수정 (JWT 기반)
│   └── user/UserNavbar.jsx          ← 수정 (로그인/로그아웃 JWT 연동)
```
