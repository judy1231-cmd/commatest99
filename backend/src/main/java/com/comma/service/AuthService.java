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

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthMapper authMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;

    private static final String REFRESH_TOKEN_PREFIX = "RT:";

    /**
     * 회원가입
     */
    public User signup(String email, String password, String nickname) {
        // 이메일 중복 체크
        if (authMapper.countByEmail(email) > 0) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 쉼표번호 자동 생성
        String 쉼표번호 = generate쉼표번호();

        User user = new User();
        user.set쉼표번호(쉼표번호);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setNickname(nickname);

        authMapper.insertUser(user);

        // 비밀번호 제거 후 반환
        user.setPassword(null);
        return user;
    }

    /**
     * 로그인 — Access Token + Refresh Token 발급
     */
    public Map<String, Object> login(String email, String password) {
        User user = authMapper.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("존재하지 않는 계정입니다.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        if ("banned".equals(user.getStatus())) {
            throw new IllegalArgumentException("정지된 계정입니다. 관리자에게 문의하세요.");
        }

        String accessToken = jwtUtil.generateAccessToken(user.get쉼표번호(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.get쉼표번호());

        // Redis에 Refresh Token 저장 (14일)
        redisTemplate.opsForValue().set(
                REFRESH_TOKEN_PREFIX + user.get쉼표번호(),
                refreshToken,
                14, TimeUnit.DAYS
        );

        Map<String, Object> result = new HashMap<>();
        result.put("accessToken", accessToken);
        result.put("refreshToken", refreshToken);

        // 사용자 정보 (비밀번호 제외)
        user.setPassword(null);
        result.put("user", user);

        return result;
    }

    /**
     * Access Token 갱신
     */
    public Map<String, String> refresh(String refreshToken) {
        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다.");
        }

        String 쉼표번호 = jwtUtil.extract쉼표번호(refreshToken);

        // Redis에 저장된 토큰과 비교
        String storedToken = redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + 쉼표번호);
        if (storedToken == null || !storedToken.equals(refreshToken)) {
            throw new IllegalArgumentException("리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.");
        }

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
    }

    /**
     * 쉼표번호 자동 생성: "쉼표" + 4자리 숫자 (0001 ~ 9999)
     */
    private String generate쉼표번호() {
        String max = authMapper.findMax쉼표번호();
        int nextNum = 1;

        if (max != null && max.startsWith("쉼표")) {
            String numPart = max.substring(2); // "쉼표" 제거
            nextNum = Integer.parseInt(numPart) + 1;
        }

        return String.format("쉼표%04d", nextNum);
    }
}
