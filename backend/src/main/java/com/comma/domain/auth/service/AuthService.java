package com.comma.domain.auth.service;

import com.comma.domain.auth.mapper.AuthMapper;
import com.comma.domain.user.model.User;
import com.comma.global.config.JwtUtil;
import com.comma.global.util.MailService;
import lombok.extern.slf4j.Slf4j;
// Slf4j: log.info(), log.error() 등을 쓸 수 있게 해주는 Lombok 어노테이션
import lombok.RequiredArgsConstructor;
import org.mindrot.jbcrypt.BCrypt;
// Spring Security 없이 BCrypt 암호화를 직접 사용하는 라이브러리
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
// Redis에 String 타입 키-값을 저장/조회하는 Spring의 Redis 클라이언트
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// @Transactional: 메서드 전체를 하나의 DB 트랜잭션으로 묶는다. 중간에 실패하면 전체 롤백.

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
// 이메일/비밀번호 재설정 토큰 생성에 사용. 전 세계적으로 유일한 랜덤 문자열.
import java.util.concurrent.TimeUnit;
// Redis TTL(만료시간) 단위 지정에 사용 (TimeUnit.DAYS 등)

@Slf4j
// private static final Logger log = LoggerFactory.getLogger(AuthService.class) 자동 생성
@Service
// 이 클래스를 Spring이 Service Bean으로 등록한다.
@RequiredArgsConstructor
// final 필드들(authMapper, jwtUtil, ...)을 받는 생성자를 자동 생성. 의존성 주입에 사용.
public class AuthService {

    private final AuthMapper authMapper;
    // DB 쿼리 실행 담당. Spring이 주입.
    private final JwtUtil jwtUtil;
    // JWT 토큰 생성/검증 담당. Spring이 주입.
    private final StringRedisTemplate redisTemplate;
    // Redis 클라이언트. Refresh Token 저장/조회에 사용. Spring이 주입.
    private final MailService mailService;
    // 이메일 발송 담당. Spring이 주입.

    private static final String REFRESH_TOKEN_PREFIX = "RT:";
    // Redis 키 prefix. "RT:쉼표0001" 처럼 저장된다.
    // prefix를 붙이는 이유: 다른 용도의 Redis 키와 구분하기 위해.

    // 로컬 개발용 — true면 가입 즉시 이메일 인증 완료 처리 (배포 환경에선 false)
    @Value("${app.skip-email-verification:false}")
    private boolean skipEmailVerification;
    // 로컬 개발 시 이메일 인증을 건너뛰는 플래그.
    // application-local.yml에서 true로 설정하면 가입 즉시 인증 완료.
    // 기본값은 false (배포 환경에서는 인증 필수).

    // ==================== 회원가입 ====================

    @Transactional
    // insertUser + insertEmailVerification 두 쿼리를 하나의 트랜잭션으로 묶는다.
    // insertUser가 성공하고 insertEmailVerification이 실패하면 insertUser도 롤백된다.
    public User signup(String email, String username, String password) {
        if (authMapper.countByEmail(email.trim()) > 0) {
        // email.trim(): 앞뒤 공백 제거. 사용자 실수 방지.
        // countByEmail > 0: 이미 활성 계정이 있으면
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
            // Controller에서 catch해서 400 BadRequest로 응답한다.
        }
        if (authMapper.countByUsername(username.trim()) > 0) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        // 동시 가입 시 race condition 방지 — MAX 조회 후 즉시 INSERT (같은 트랜잭션)
        String 쉼표번호 = generate쉼표번호();
        // 새 사용자의 쉼표번호를 자동으로 채번한다. (아래 private 메서드 참고)

        User user = new User();
        // @NoArgsConstructor로 만든 빈 객체. 필드를 하나씩 세팅한다.
        user.set쉼표번호(쉼표번호);
        user.setEmail(email.trim());
        user.setPassword(BCrypt.hashpw(password, BCrypt.gensalt()));
        // BCrypt.gensalt(): 랜덤 솔트 생성. 같은 비밀번호라도 매번 다른 해시값이 나온다.
        // BCrypt.hashpw(): 솔트 + 비밀번호로 해시값 생성. 단방향 — 원래 비밀번호를 복원할 수 없다.
        user.setUsername(username.trim());
        user.setNickname(쉼표번호);  // 닉네임 = 자동 부여된 쉼표번호
        // 닉네임은 처음에 쉼표번호와 동일. 나중에 변경 가능.
        // DB DEFAULT 값을 Java 객체에도 반영 — 응답에서 null 방지
        user.setStatus("active");
        user.setEmailVerified(false);
        user.setRole("USER");

        authMapper.insertUser(user);
        // 위에서 세팅한 user 객체를 DB에 INSERT한다.

        // 로컬 개발 환경: 이메일 인증 자동 완료
        if (skipEmailVerification) {
            // 로컬 개발 환경: 이메일 인증 없이 바로 완료 처리
            authMapper.updateUserEmailVerified(쉼표번호);
            user.setEmailVerified(true);
        } else {
            // 회원가입 직후 이메일 인증 메일 자동 발송
            try {
                String token = UUID.randomUUID().toString();
                // 예: "550e8400-e29b-41d4-a716-446655440000" 형태의 유일한 랜덤 문자열
                authMapper.insertEmailVerification(쉼표번호, token, LocalDateTime.now().plusHours(24));
                // 토큰을 DB에 저장. 24시간 후 만료.
                mailService.sendVerificationEmail(email.trim(), username.trim(), token);
                // 가입 이메일로 인증 링크 발송. 링크에 token이 포함된다.
            } catch (Exception e) {
                // 메일 발송 실패해도 회원가입은 성공 처리
                // 메일 서버 문제로 가입이 막히면 안 된다.
                log.error("[메일 발송 실패] to={}, error={}", email.trim(), e.getMessage(), e);
            }
        }

        user.setPassword(null);
        // 응답에 BCrypt 해시값이 노출되면 안 된다. null로 지운다.
        return user;
    }

    // ==================== 로그인 ====================

    public Map<String, Object> login(String identifier, String password) {
        // @ 포함이면 이메일, 아니면 아이디(username)로 조회
        User user = identifier.contains("@")
                ? authMapper.findByEmail(identifier)
                : authMapper.findByUsername(identifier);
        // "@" 포함이면 이메일, 아니면 username으로 조회. 둘 다 로그인 가능.

        if (user == null) {
            throw new IllegalArgumentException("존재하지 않는 계정입니다.");
        }

        // banned 체크를 BCrypt 연산 전에 — BCrypt는 비용이 큰 연산
        if ("banned".equals(user.getStatus())) {
            throw new IllegalArgumentException("정지된 계정입니다. 관리자에게 문의하세요.");
            // BCrypt.checkpw보다 먼저 체크한다. BCrypt는 연산 비용이 크기 때문.
            // banned 계정은 비밀번호 확인도 안 한다.
        }

        if (!BCrypt.checkpw(password, user.getPassword())) {
        // BCrypt.checkpw: 입력한 평문 비밀번호와 저장된 해시값을 비교한다.
        // 해시값에서 원래 값을 복원하지 않고, 같은 방식으로 해시해서 비교한다.
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        String accessToken = jwtUtil.generateAccessToken(user.get쉼표번호(), user.getRole());
        // 30분짜리 Access Token 발급
        String refreshToken = jwtUtil.generateRefreshToken(user.get쉼표번호());
        // 14일짜리 Refresh Token 발급

        try {
            redisTemplate.opsForValue().set(
                    REFRESH_TOKEN_PREFIX + user.get쉼표번호(),
                    // Redis 키: "RT:쉼표0001"
                    refreshToken,
                    // Redis 값: Refresh Token 문자열
                    14, TimeUnit.DAYS
                    // TTL: 14일. 14일 후 Redis에서 자동 삭제.
            );
        } catch (Exception e) {
            // Redis 미가동 시에도 로그인 허용 (개발 환경 대응)
            // 운영 환경에서는 Redis 필수
        }

        user.setPassword(null);
        // 응답에 비밀번호 해시값 절대 포함 금지

        Map<String, Object> result = new HashMap<>();
        result.put("accessToken", accessToken);
        result.put("refreshToken", refreshToken);
        result.put("user", user);
        // 프론트에서 받아서 localStorage에 저장할 데이터 3가지
        return result;
    }

    // ==================== 토큰 갱신 ====================

    public Map<String, String> refresh(String refreshToken) {
        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다.");
            // 만료됐거나 위변조된 토큰이면 즉시 거부
        }

        String 쉼표번호 = jwtUtil.extract쉼표번호(refreshToken);
        // 토큰에서 사용자 ID 추출
        try {
            String storedToken = redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + 쉼표번호);
            // Redis에서 저장된 Refresh Token을 조회
            if (storedToken != null && !storedToken.equals(refreshToken)) {
                throw new IllegalArgumentException("리프레시 토큰이 만료되었습니다. 다시 로그인해주세요.");
                // 저장된 토큰과 요청한 토큰이 다르면 무효.
                // 로그아웃 후 이전 토큰으로 갱신 시도하는 케이스를 차단.
            }
        } catch (IllegalArgumentException e) {
            throw e;
            // 위에서 던진 예외는 그대로 전파
        } catch (Exception e) {
            // Redis 미가동 시 토큰 자체 검증만으로 통과
        }

        User user = authMapper.findBy쉼표번호(쉼표번호);
        if (user == null) {
            throw new IllegalArgumentException("존재하지 않는 계정입니다. 다시 로그인해주세요.");
        }
        if ("banned".equals(user.getStatus())) {
            throw new IllegalArgumentException("정지된 계정입니다. 관리자에게 문의하세요.");
            // 갱신 시에도 banned 체크. 토큰이 살아있어도 정지된 계정은 막는다.
        }
        String newAccessToken = jwtUtil.generateAccessToken(쉼표번호, user.getRole());
        // 새로운 Access Token 발급. role을 DB에서 다시 조회하기 때문에 권한 변경이 즉시 반영된다.

        Map<String, String> result = new HashMap<>();
        result.put("accessToken", newAccessToken);
        return result;
        // Access Token만 새로 발급. Refresh Token은 그대로 유지.
    }

    // ==================== 로그아웃 ====================

    public void logout(String 쉼표번호) {
        try {
            redisTemplate.delete(REFRESH_TOKEN_PREFIX + 쉼표번호);
            // Redis에서 Refresh Token을 삭제한다.
            // 이후 이 Refresh Token으로 갱신 시도하면 Redis에 없어서 막힌다.
        } catch (Exception e) {
            // Redis 미가동 시 무시. 로그아웃은 항상 성공 응답.
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
        // Boolean.TRUE.equals()를 쓰는 이유: user.getEmailVerified()가 null일 수 있어서.
        // null == true 는 NPE 발생, Boolean.TRUE.equals(null)은 false를 반환.

        // 기존 토큰 삭제 후 새 토큰 발급 (트랜잭션으로 원자성 보장)
        authMapper.deleteEmailVerificationBy쉼표번호(쉼표번호);
        // 기존 미인증 토큰 삭제. 재발송 시 두 개의 유효 링크가 생기는 걸 방지.
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
            // DB에서 tinyint(0/1)가 Integer로 올 수도, Boolean으로 올 수도 있다.
            // 타입을 안전하게 변환해서 확인한다.
            if (alreadyVerified) throw new IllegalArgumentException("이미 인증된 이메일입니다.");
        }

        Object expiresVal = record.get("expiresAt");
        if (expiresVal == null) throw new IllegalArgumentException("유효하지 않은 인증 링크입니다.");

        LocalDateTime expiresAt = toLocalDateTime(expiresVal);
        // DB의 DATETIME이 Timestamp 또는 LocalDateTime으로 올 수 있어서 변환 메서드를 사용.
        if (expiresAt.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("인증 링크가 만료되었습니다. 다시 요청해주세요.");
        }

        String 쉼표번호 = (String) record.get("쉼표번호");
        authMapper.markEmailVerificationComplete(token);   // 특정 token만 verified 처리
        // email_verification.verified = 1
        authMapper.updateUserEmailVerified(쉼표번호);
        // users.email_verified = 1
    }

    // ==================== 비밀번호 재설정 ====================

    public void sendPasswordResetEmail(String email) {
        User user = authMapper.findByEmail(email);
        // 보안상 이메일 존재 여부 노출 안 함 — 없는 이메일이어도 성공 응답
        if (user == null) return;
        // 존재하지 않는 이메일이어도 그냥 반환한다.
        // 이메일 존재 여부를 공격자에게 알려주지 않기 위한 보안 조치.
        // Controller에서는 성공 응답을 보낸다.

        String token = UUID.randomUUID().toString();
        authMapper.insertPasswordResetToken(user.get쉼표번호(), token, LocalDateTime.now().plusMinutes(30));
        // 30분 유효 토큰. 이메일 인증(24시간)보다 짧게 설정. 비밀번호 재설정이 더 민감하기 때문.
        mailService.sendPasswordResetEmail(email, token);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        // 유효성 검증
        if (token == null || token.isBlank()) throw new IllegalArgumentException("유효하지 않은 재설정 링크입니다.");
        if (newPassword == null || newPassword.length() < 8) throw new IllegalArgumentException("비밀번호는 8자 이상이어야 합니다.");

        Map<String, Object> record = authMapper.findPasswordResetToken(token);
        if (record == null) throw new IllegalArgumentException("유효하지 않은 재설정 링크입니다.");

        Object usedVal = record.get("used");
        if (usedVal != null && ((Number) usedVal).intValue() == 1) {
            throw new IllegalArgumentException("이미 사용된 링크입니다.");
            // used = 1: 이미 이 링크로 비밀번호를 재설정했다. 재사용 방지.
        }

        Object expiresVal = record.get("expiresAt");
        if (expiresVal == null) throw new IllegalArgumentException("유효하지 않은 재설정 링크입니다.");

        LocalDateTime expiresAt = toLocalDateTime(expiresVal);
        if (expiresAt.isBefore(LocalDateTime.now())) throw new IllegalArgumentException("재설정 링크가 만료되었습니다. 다시 요청해주세요.");

        String 쉼표번호 = (String) record.get("쉼표번호");
        authMapper.updatePassword(쉼표번호, BCrypt.hashpw(newPassword, BCrypt.gensalt()));
        // 새 비밀번호를 BCrypt로 해시해서 저장
        authMapper.markPasswordResetTokenUsed(token);
        // 토큰을 used = 1로 표시. 재사용 방지.

        // 비밀번호 재설정 후 모든 기기 로그아웃 (Redis 미가동 시 무시)
        try {
            redisTemplate.delete(REFRESH_TOKEN_PREFIX + 쉼표번호);
            // 비밀번호 변경 후 모든 기기에서 자동 로그아웃.
            // Refresh Token을 삭제하면 기존 토큰으로 갱신이 안 된다.
        } catch (Exception ignored) {}
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
        // UNIQUE 컬럼 해제 → 탈퇴 후 같은 아이디/이메일로 재가입 가능
        authMapper.anonymizeUser(쉼표번호);
        // 소셜 연동 해제 → 탈퇴 후 같은 소셜 계정으로 재가입 가능
        authMapper.deleteAllAuthProviders(쉼표번호);
    }

    // ==================== 내부 유틸 ====================

    private String generate쉼표번호() {
        String max = authMapper.findMax쉼표번호ForUser();
        // 현재 USER role 중 가장 큰 쉼표번호를 조회. 예: "쉼표0005"
        int nextNum = 1;
        // 아무도 없으면 1번부터 시작
        if (max != null && max.startsWith("쉼표")) {
            nextNum = Integer.parseInt(max.substring(2)) + 1;
            // "쉼표0005".substring(2) = "0005" → parseInt = 5 → +1 = 6
        }
        if (nextNum > 8999) throw new IllegalStateException("쉼표번호 발급 한도를 초과했습니다.");
        // 9000번 이상은 관리자 번호 영역. 일반 사용자는 최대 8999번.
        return String.format("쉼표%04d", nextNum);
        // %04d: 4자리, 부족하면 0으로 채움. nextNum=6이면 "쉼표0006"
    }

    // DATETIME 컬럼이 Timestamp 또는 LocalDateTime으로 반환될 수 있어 안전하게 변환
    private LocalDateTime toLocalDateTime(Object value) {
    // DB에서 DATETIME 컬럼이 MyBatis 설정에 따라 Timestamp 또는 LocalDateTime으로 올 수 있다.
    // 타입을 안전하게 변환한다.
        if (value instanceof LocalDateTime) return (LocalDateTime) value;
        if (value instanceof Timestamp) return ((Timestamp) value).toLocalDateTime();
        throw new IllegalStateException("날짜 타입 변환 실패: " + value.getClass());
    }
}
