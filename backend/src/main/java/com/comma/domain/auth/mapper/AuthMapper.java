package com.comma.domain.auth.mapper;

import com.comma.domain.user.model.User;
import org.apache.ibatis.annotations.Mapper;
// MyBatis가 이 인터페이스의 구현체를 자동으로 만들어준다는 표시
import org.apache.ibatis.annotations.Param;
// 메서드 파라미터에 이름을 붙여서 XML의 #{이름}과 연결한다.

import java.time.LocalDateTime;
import java.util.Map;

@Mapper
// MyBatis가 이 인터페이스를 스캔해서 구현체(Proxy)를 만들고 Spring Bean으로 등록한다.
// 개발자는 인터페이스만 선언하면 되고, 실제 구현은 AuthMapper.xml의 SQL이 담당한다.
public interface AuthMapper {

    // ==================== 회원 ====================

    void insertUser(User user);
    // user 객체의 필드들을 users 테이블에 INSERT한다.
    // XML: #{쉼표번호}, #{email} 등으로 User의 getter를 자동 호출한다.

    User findByEmail(@Param("email") String email);
    // 이메일로 사용자를 조회한다. 없으면 null 반환.
    // @Param("email"): XML에서 #{email}로 참조할 수 있도록 파라미터에 이름을 붙인다.

    User findByUsername(@Param("username") String username);
    // 로그인 아이디(username)로 사용자를 조회한다.

    User findBy쉼표번호(@Param("쉼표번호") String 쉼표번호);
    // 쉼표번호(PK)로 사용자를 조회한다. 로그인 후 내 정보 조회 등에 사용.
    // @Param("쉼표번호"): 한글 파라미터명이 OGNL에서 오작동할 수 있어 명시적으로 이름을 준다.

    int countByEmail(@Param("email") String email);
    // 해당 이메일로 가입된 계정 수를 반환한다. 0이면 없음, 1이면 이미 있음.

    int countByUsername(@Param("username") String username);
    // 해당 아이디로 가입된 계정 수를 반환한다.

    int countBy쉼표번호(@Param("쉼표번호") String 쉼표번호);
    // 해당 쉼표번호가 존재하는지 확인한다.

    // USER role만 조회 — 관리자 번호(쉼표9xxx) 제외
    String findMax쉼표번호ForUser();
    // USER role 중 가장 큰 쉼표번호를 반환한다. 새 사용자의 번호를 채번할 때 사용.
    // 예: 현재 최대가 "쉼표0005"이면 다음은 "쉼표0006"

    // ==================== 이메일 인증 ====================

    void insertEmailVerification(
            @Param("쉼표번호") String 쉼표번호,
            @Param("token") String token,
            @Param("expiresAt") LocalDateTime expiresAt
    );
    // 이메일 인증 토큰을 DB에 저장한다.
    // token: UUID 형식의 랜덤 문자열. 이메일 링크에 포함된다.
    // expiresAt: 24시간 후 만료 시각.

    Map<String, Object> findEmailVerification(@Param("token") String token);
    // 토큰으로 인증 레코드를 조회한다. 없으면 null.
    // Map으로 반환하는 이유: verified(0/1), expiresAt 등 여러 타입이 섞여 있어서.

    void markEmailVerificationComplete(@Param("token") String token);
    // 특정 토큰의 verified 컬럼을 1로 업데이트한다. 인증 완료 처리.

    void updateUserEmailVerified(@Param("쉼표번호") String 쉼표번호);
    // users 테이블의 email_verified를 1로 업데이트한다. 실제 계정 인증 완료.

    void deleteEmailVerificationBy쉼표번호(@Param("쉼표번호") String 쉼표번호);
    // 재발송 시 기존 인증 레코드를 먼저 삭제하고 새 토큰을 INSERT한다.

    // ==================== 비밀번호 재설정 ====================

    void insertPasswordResetToken(
            @Param("쉼표번호") String 쉼표번호,
            @Param("token") String token,
            @Param("expiresAt") LocalDateTime expiresAt
    );
    // 비밀번호 재설정 토큰을 DB에 저장한다. 30분 유효.

    Map<String, Object> findPasswordResetToken(@Param("token") String token);
    // 토큰으로 재설정 레코드를 조회한다.

    void markPasswordResetTokenUsed(@Param("token") String token);
    // used 컬럼을 1로 업데이트. 한 번 쓴 토큰은 재사용 불가.

    void updatePassword(@Param("쉼표번호") String 쉼표번호, @Param("password") String password);
    // users 테이블의 password 컬럼을 새 BCrypt 해시값으로 업데이트.

    void updateNickname(@Param("쉼표번호") String 쉼표번호, @Param("nickname") String nickname);
    // 닉네임 변경

    void updateStatus(@Param("쉼표번호") String 쉼표번호, @Param("status") String status);
    // 계정 상태 변경 (active → dormant 등)

    void anonymizeUser(@Param("쉼표번호") String 쉼표번호);
    // 탈퇴 처리: username, email을 "deleted_쉼표번호@deleted.com" 으로 바꾼다.
    // UNIQUE 컬럼을 해제해서 같은 이메일/아이디로 재가입이 가능하게 한다.

    // ==================== 소셜 로그인 ====================

    User findByProvider(@Param("provider") String provider, @Param("providerId") String providerId);
    // 소셜 로그인 시 해당 provider + providerId로 연결된 계정을 조회한다.
    // 없으면 null → 신규 가입 플로우로 이동.

    void insertAuthProvider(
            @Param("쉼표번호") String 쉼표번호,
            @Param("provider") String provider,
            @Param("providerId") String providerId
    );
    // auth_provider 테이블에 소셜 연동 정보를 저장한다.

    java.util.List<String> findProvidersByUser(@Param("쉼표번호") String 쉼표번호);
    // 이 사용자에게 연동된 소셜 provider 목록을 반환한다.
    // 예: ["kakao", "google"]

    void deleteAuthProvider(@Param("쉼표번호") String 쉼표번호, @Param("provider") String provider);
    // 특정 소셜 연동을 해제한다.

    void deleteAllAuthProviders(@Param("쉼표번호") String 쉼표번호);
    // 모든 소셜 연동을 해제한다. 회원 탈퇴 시 호출.
}
