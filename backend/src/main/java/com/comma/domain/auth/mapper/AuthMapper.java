package com.comma.domain.auth.mapper;

import com.comma.domain.user.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.Map;

@Mapper
public interface AuthMapper {

    // ==================== 회원 ====================

    void insertUser(User user);

    User findByEmail(@Param("email") String email);

    User findByUsername(@Param("username") String username);

    User findBy쉼표번호(@Param("쉼표번호") String 쉼표번호);

    int countByEmail(@Param("email") String email);

    int countByUsername(@Param("username") String username);

    int countBy쉼표번호(@Param("쉼표번호") String 쉼표번호);

    // USER role만 조회 — 관리자 번호(쉼표9xxx) 제외
    String findMax쉼표번호ForUser();

    // ==================== 이메일 인증 ====================

    void insertEmailVerification(
            @Param("쉼표번호") String 쉼표번호,
            @Param("token") String token,
            @Param("expiresAt") LocalDateTime expiresAt
    );

    Map<String, Object> findEmailVerification(@Param("token") String token);

    void markEmailVerificationComplete(@Param("token") String token);

    void updateUserEmailVerified(@Param("쉼표번호") String 쉼표번호);

    void deleteEmailVerificationBy쉼표번호(@Param("쉼표번호") String 쉼표번호);

    // ==================== 비밀번호 재설정 ====================

    void insertPasswordResetToken(
            @Param("쉼표번호") String 쉼표번호,
            @Param("token") String token,
            @Param("expiresAt") LocalDateTime expiresAt
    );

    Map<String, Object> findPasswordResetToken(@Param("token") String token);

    void markPasswordResetTokenUsed(@Param("token") String token);

    void updatePassword(@Param("쉼표번호") String 쉼표번호, @Param("password") String password);

    void updateNickname(@Param("쉼표번호") String 쉼표번호, @Param("nickname") String nickname);

    void updateStatus(@Param("쉼표번호") String 쉼표번호, @Param("status") String status);

    void anonymizeUser(@Param("쉼표번호") String 쉼표번호);

    // ==================== 소셜 로그인 ====================

    User findByProvider(@Param("provider") String provider, @Param("providerId") String providerId);

    void insertAuthProvider(
            @Param("쉼표번호") String 쉼표번호,
            @Param("provider") String provider,
            @Param("providerId") String providerId
    );

    java.util.List<String> findProvidersByUser(@Param("쉼표번호") String 쉼표번호);

    void deleteAuthProvider(@Param("쉼표번호") String 쉼표번호, @Param("provider") String provider);

    void deleteAllAuthProviders(@Param("쉼표번호") String 쉼표번호);
}
