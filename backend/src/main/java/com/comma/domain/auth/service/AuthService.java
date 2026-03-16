package com.comma.domain.auth.service;

import com.comma.domain.auth.mapper.AuthMapper;
import com.comma.domain.user.model.User;
import com.comma.global.config.JwtUtil;
import com.comma.global.util.MailService;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthMapper authMapper;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;
    private final MailService mailService;

    private static final String REFRESH_TOKEN_PREFIX = "RT:";

    // 로컬 개발용 — true면 가입 즉시 이메일 인증 완료 처리 (배포 환경에선 false)
    @Value("${app.skip-email-verification:false}")
    private boolean skipEmailVerification;

    // ==================== 회원가입 ====================

    @Transactional
    public User signup(String email, String username, String password) {
        if (authMapper.countByEmail(email.trim()) > 0) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        if (authMapper.countByUsername(username.trim()) > 0) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        // 동시 가입 시 race condition 방지 — MAX 조회 후 즉시 INSERT (같은 트랜잭션)
        String 쉼표번호 = generate쉼표번호();

        User user = new User();
        user.set쉼표번호(쉼표번호);
        user.setEmail(email.trim());
        user.setPassword(BCrypt.hashpw(password, BCrypt.gensalt()));
        user.setUsername(username.trim());
        user.setNickname(쉼표번호);  // 닉네임 = 자동 부여된 쉼표번호
        // DB DEFAULT 값을 Java 객체에도 반영 — 응답에서 null 방지
        user.setStatus("active");
        user.setEmailVerified(false);
        user.setRole("USER");

        authMapper.insertUser(user);

        // 로컬 개발 환경: 이메일 인증 자동 완료
        if (skipEmailVerification) {
            authMapper.updateUserEmailVerified(쉼표번호);
            user.setEmailVerified(true);
        } else {
            // 회원가입 직후 이메일 인증 메일 자동 발송
            try {
                String token = UUID.randomUUID().toString();
                authMapper.insertEmailVerification(쉼표번호, token, LocalDateTime.now().plusHours(24));
                mailService.sendVerificationEmail(email.trim(), username.trim(), token);
            } catch (Exception e) {
                // 메일 발송 실패해도 회원가입은 성공 처리
                log.error("[메일 발송 실패] to={}, error={}", email.trim(), e.getMessage(), e);
            }
        }

        user.setPassword(null);
        return user;
    }

    // ==================== 로그인 ====================

    public Map<String, Object> login(String identifier, String password) {
        // @ 포함이면 이메일, 아니면 아이디(username)로 조회
        User user = identifier.contains("@")
                ? authMapper.findByEmail(identifier)
                : authMapper.findByUsername(identifier);
        if (user == null) {
            throw new IllegalArgumentException("존재하지 않는 계정입니다.");
        }

        // banned 체크를 BCrypt 연산 전에 — BCrypt는 비용이 큰 연산
        if ("banned".equals(user.getStatus())) {
            throw new IllegalArgumentException("정지된 계정입니다. 관리자에게 문의하세요.");
        }

        if (!BCrypt.checkpw(password, user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        String accessToken = jwtUtil.generateAccessToken(user.get쉼표번호(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.get쉼표번호());

        try {
            redisTemplate.opsForValue().set(
                    REFRESH_TOKEN_PREFIX + user.get쉼표번호(),
                    refreshToken,
                    14, TimeUnit.DAYS
            );
        } catch (Exception e) {
            // Redis 미가동 시에도 로그인 허용 (개발 환경 대응)
            // 운영 환경에서는 Redis 필수
        }

        user.setPassword(null);

        Map<String, Object> result = new HashMap<>();
        result.put("accessToken", accessToken);
        result.put("refreshToken", refreshToken);
        result.put("user", user);
        return result;
    }

    // ==================== 토큰 갱신 ====================

    public Map<String, String> refresh(String refreshToken) {
        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다.");
        }

        String 쉼표번호 = jwtUtil.extract쉼표번호(refreshToken);
        try {
            String storedToken = redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + 쉼표번호);
            if (storedToken != null && !storedToken.equals(refreshToken)) {
                throw new IllegalArgumentException("리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.");
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            // Redis 미가동 시 토큰 자체 검증만으로 통과
        }

        User user = authMapper.findBy쉼표번호(쉼표번호);
        if (user == null) {
            throw new IllegalArgumentException("존재하지 않는 계정입니다. 다시 로그인해주세요.");
        }
        if ("banned".equals(user.getStatus())) {
            throw new IllegalArgumentException("정지된 계정입니다. 관리자에게 문의하세요.");
        }
        String newAccessToken = jwtUtil.generateAccessToken(쉼표번호, user.getRole());

        Map<String, String> result = new HashMap<>();
        result.put("accessToken", newAccessToken);
        return result;
    }

    // ==================== 로그아웃 ====================

    public void logout(String 쉼표번호) {
        try {
            redisTemplate.delete(REFRESH_TOKEN_PREFIX + 쉼표번호);
        } catch (Exception e) {
            // Redis 미가동 시 무시
        }
    }

    // ==================== 내 정보 ====================

    public User getMe(String 쉼표번호) {
        User user = authMapper.findBy쉼표번호(쉼표번호);
        if (user == null) throw new IllegalArgumentException("존재하지 않는 계정입니다.");
        user.setPassword(null);
        return user;
    }

    // ==================== 이메일 인증 ====================

    @Transactional
    public void sendVerificationEmail(String 쉼표번호) {
        User user = authMapper.findBy쉼표번호(쉼표번호);
        if (user == null) throw new IllegalArgumentException("존재하지 않는 계정입니다.");
        if (Boolean.TRUE.equals(user.getEmailVerified())) throw new IllegalArgumentException("이미 인증된 이메일입니다.");

        // 기존 토큰 삭제 후 새 토큰 발급 (트랜잭션으로 원자성 보장)
        authMapper.deleteEmailVerificationBy쉼표번호(쉼표번호);
        String token = UUID.randomUUID().toString();
        authMapper.insertEmailVerification(쉼표번호, token, LocalDateTime.now().plusHours(24));

        mailService.sendVerificationEmail(user.getEmail(), user.getUsername(), token);
    }

    @Transactional
    public void verifyEmail(String token) {
        Map<String, Object> record = authMapper.findEmailVerification(token);
        if (record == null) throw new IllegalArgumentException("유효하지 않은 인증 링크입니다.");

        Object verifiedVal = record.get("verified");
        if (verifiedVal != null) {
            boolean alreadyVerified = verifiedVal instanceof Boolean
                    ? (Boolean) verifiedVal
                    : ((Number) verifiedVal).intValue() == 1;
            if (alreadyVerified) throw new IllegalArgumentException("이미 인증된 이메일입니다.");
        }

        Object expiresVal = record.get("expiresAt");
        if (expiresVal == null) throw new IllegalArgumentException("유효하지 않은 인증 링크입니다.");

        LocalDateTime expiresAt = toLocalDateTime(expiresVal);
        if (expiresAt.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("인증 링크가 만료되었습니다. 다시 요청해주세요.");
        }

        String 쉼표번호 = (String) record.get("쉼표번호");
        authMapper.markEmailVerificationComplete(token);   // 특정 token만 verified 처리
        authMapper.updateUserEmailVerified(쉼표번호);
    }

    // ==================== 비밀번호 재설정 ====================

    public void sendPasswordResetEmail(String email) {
        User user = authMapper.findByEmail(email);
        // 보안상 이메일 존재 여부 노출 안 함 — 없는 이메일이어도 성공 응답
        if (user == null) return;

        String token = UUID.randomUUID().toString();
        authMapper.insertPasswordResetToken(user.get쉼표번호(), token, LocalDateTime.now().plusMinutes(30));
        mailService.sendPasswordResetEmail(email, token);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("유효하지 않은 재설정 링크입니다.");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("비밀번호는 8자 이상이어야 합니다.");
        }

        Map<String, Object> record = authMapper.findPasswordResetToken(token);
        if (record == null) throw new IllegalArgumentException("유효하지 않은 재설정 링크입니다.");

        Object usedVal = record.get("used");
        if (usedVal != null && ((Number) usedVal).intValue() == 1) {
            throw new IllegalArgumentException("이미 사용된 링크입니다.");
        }

        Object expiresVal = record.get("expiresAt");
        if (expiresVal == null) throw new IllegalArgumentException("유효하지 않은 재설정 링크입니다.");

        LocalDateTime expiresAt = toLocalDateTime(expiresVal);
        if (expiresAt.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("재설정 링크가 만료되었습니다. 다시 요청해주세요.");
        }

        String 쉼표번호 = (String) record.get("쉼표번호");
        authMapper.updatePassword(쉼표번호, BCrypt.hashpw(newPassword, BCrypt.gensalt()));
        authMapper.markPasswordResetTokenUsed(token);

        // 비밀번호 재설정 후 모든 기기 로그아웃 (Redis 미가동 시 무시)
        try {
            redisTemplate.delete(REFRESH_TOKEN_PREFIX + 쉼표번호);
        } catch (Exception ignored) {
        }
    }

    // ==================== 아이디 중복확인 ====================

    public void checkUsernameAvailable(String username) {
        if (authMapper.countByUsername(username.trim()) > 0) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
    }

    // ==================== 닉네임 변경 ====================

    public User updateNickname(String 쉼표번호, String newNickname) {
        if (newNickname == null || newNickname.isBlank())
            throw new IllegalArgumentException("닉네임을 입력해주세요.");
        if (newNickname.length() < 2 || newNickname.length() > 20)
            throw new IllegalArgumentException("닉네임은 2~20자로 입력해주세요.");

        authMapper.updateNickname(쉼표번호, newNickname.trim());

        User user = authMapper.findBy쉼표번호(쉼표번호);
        user.setPassword(null);
        return user;
    }

    // ==================== 비밀번호 변경 ====================

    public void changePassword(String 쉼표번호, String currentPassword, String newPassword) {
        if (currentPassword == null || currentPassword.isBlank())
            throw new IllegalArgumentException("현재 비밀번호를 입력해주세요.");
        if (newPassword == null || newPassword.length() < 8)
            throw new IllegalArgumentException("새 비밀번호는 8자 이상이어야 합니다.");

        User user = authMapper.findBy쉼표번호(쉼표번호);
        if (user == null) throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        if (!BCrypt.checkpw(currentPassword, user.getPassword()))
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");

        authMapper.updatePassword(쉼표번호, BCrypt.hashpw(newPassword, BCrypt.gensalt()));
    }

    // ==================== 회원 탈퇴 ====================

    public void withdraw(String 쉼표번호) {
        authMapper.updateStatus(쉼표번호, "dormant");
    }

    // ==================== 내부 유틸 ====================

    private String generate쉼표번호() {
        String max = authMapper.findMax쉼표번호ForUser();
        int nextNum = 1;
        if (max != null && max.startsWith("쉼표")) {
            nextNum = Integer.parseInt(max.substring(2)) + 1;
        }
        if (nextNum > 8999) throw new IllegalStateException("쉼표번호 발급 한도를 초과했습니다.");
        return String.format("쉼표%04d", nextNum);
    }

    // DATETIME 컬럼이 Timestamp 또는 LocalDateTime으로 반환될 수 있어 안전하게 변환
    private LocalDateTime toLocalDateTime(Object value) {
        if (value instanceof LocalDateTime) return (LocalDateTime) value;
        if (value instanceof Timestamp) return ((Timestamp) value).toLocalDateTime();
        throw new IllegalStateException("날짜 타입 변환 실패: " + value.getClass());
    }
}
