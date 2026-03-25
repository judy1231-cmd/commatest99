package com.comma.global.config;
// global/config 패키지: 전역 설정 클래스 모음

import io.jsonwebtoken.*;
// JJWT 라이브러리의 핵심 클래스들 (Jwts, Claims, JwtException 등)을 한 번에 가져온다.
import io.jsonwebtoken.security.Keys;
// 서명 키를 안전하게 생성해 주는 유틸 클래스
import org.springframework.beans.factory.annotation.Value;
// application.yml의 값을 필드에 자동으로 주입해 주는 어노테이션
import org.springframework.lang.NonNull;
// 이 값은 null이 아님을 정적 분석 도구에 알려준다.
import org.springframework.stereotype.Component;
// Spring이 이 클래스를 Bean으로 등록한다. 다른 클래스에서 @Autowired / 생성자 주입으로 쓸 수 있다.

import java.security.Key;
// JWT 서명에 사용할 암호화 키 타입
import java.util.Date;
// JWT의 발급시간(iat), 만료시간(exp)에 사용하는 날짜 타입

@Component
// Spring 컨테이너가 JwtUtil 객체를 하나 만들어서 관리한다.
// 여러 서비스에서 같은 인스턴스를 공유한다 (싱글턴).
@SuppressWarnings("null")
// JJWT 라이브러리가 @NonNull 어노테이션을 완전히 지원하지 않아서 생기는
// "null 반환 가능성" 경고를 억제한다. 실제로는 null이 반환되지 않는다.
public class JwtUtil {

    private final Key key;
    // HMAC-SHA256 서명에 사용할 암호화 키. 이 키로 토큰을 만들고, 같은 키로 검증한다.

    private final long accessExpiration;
    // Access Token 유효 시간 (밀리초). application.yml에서 주입. 보통 30분(1800000ms).

    private final long refreshExpiration;
    // Refresh Token 유효 시간 (밀리초). application.yml에서 주입. 보통 14일.

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            // application.yml의 jwt.secret 값을 읽어온다. 256비트 이상의 무작위 문자열.
            @Value("${jwt.access-expiration}") long accessExpiration,
            // application.yml의 jwt.access-expiration 값 (밀리초 숫자)
            @Value("${jwt.refresh-expiration}") long refreshExpiration
            // application.yml의 jwt.refresh-expiration 값 (밀리초 숫자)
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        // 문자열 시크릿을 바이트 배열로 변환해서 HMAC 서명 키 객체를 만든다.
        // Keys.hmacShaKeyFor()는 키 길이를 자동 검증한다 (최소 256비트).
        this.accessExpiration = accessExpiration;
        this.refreshExpiration = refreshExpiration;
    }

    public @NonNull String generateAccessToken(String 쉼표번호, String role) {
    // Access Token을 만들어서 반환한다. 쉼표번호와 role(권한)을 토큰 안에 담는다.
        return Jwts.builder()
                .setSubject(쉼표번호)
                // 토큰의 주인이 누구인지 설정. "쉼표0001" 같은 값이 들어간다.
                // 나중에 extract쉼표번호()로 꺼낼 수 있다.
                .claim("role", role)
                // 커스텀 클레임: 권한 정보를 토큰에 추가로 담는다.
                // 관리자 여부를 API 요청마다 DB 조회 없이 확인할 수 있다.
                .setIssuedAt(new Date())
                // iat(issued at): 토큰 발급 시각. 현재 시각.
                .setExpiration(new Date(System.currentTimeMillis() + accessExpiration))
                // exp(expiration): 만료 시각. 현재시각 + 유효시간(30분).
                .signWith(key, SignatureAlgorithm.HS256)
                // 위에서 만든 key로 HS256 알고리즘으로 서명한다.
                // 서명이 있어야 토큰 위변조를 감지할 수 있다.
                .compact();
                // 최종적으로 "xxxxx.yyyyy.zzzzz" 형태의 JWT 문자열을 만든다.
    }

    public @NonNull String generateRefreshToken(String 쉼표번호) {
    // Refresh Token 생성. Access Token보다 오래 살고, role은 담지 않는다.
    // role은 Access Token 재발급 시 DB에서 다시 조회하기 때문.
        return Jwts.builder()
                .setSubject(쉼표번호)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpiration))
                // 유효시간이 accessExpiration 대신 refreshExpiration (14일).
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public @NonNull String extract쉼표번호(String token) {
    // 토큰 문자열에서 subject(쉼표번호)를 꺼낸다.
    // JwtInterceptor에서 "이 요청이 누구 것인지" 알아낼 때 사용.
        return parseClaims(token).getSubject();
        // parseClaims()가 토큰을 파싱하고, getSubject()가 subject 값을 반환한다.
    }

    public @NonNull String extractRole(String token) {
    // 토큰에서 role 클레임을 꺼낸다.
    // /api/admin/** 경로에서 ADMIN인지 확인할 때 사용.
        return parseClaims(token).get("role", String.class);
        // get("role", String.class): "role" 클레임을 String 타입으로 꺼낸다.
    }

    /** 소셜 가입 확인 전 임시 토큰 (10분 유효) — subject: providerId, claims: provider/nickname */
    public @NonNull String generatePendingToken(String provider, String providerId, String nickname) {
    // 소셜 로그인 중간 단계용 임시 토큰 (10분짜리).
    // 카카오/구글 로그인 후, 이미 가입된 계정인지 확인하기 전까지만 쓰인다.
        return generatePendingToken(provider, providerId, nickname, null);
        // email 없는 버전 → email 있는 버전을 null 이메일로 호출 (메서드 오버로딩)
    }

    /** email 포함 버전 (구글 등 이메일 제공 소셜) */
    public @NonNull String generatePendingToken(String provider, String providerId, String nickname, String email) {
    // email까지 포함하는 pending 토큰 생성 (구글 등 이메일을 제공하는 소셜용)
        var builder = Jwts.builder()
                .setSubject(providerId)
                // subject에 소셜 플랫폼의 사용자 ID를 담는다.
                .claim("provider", provider)
                // 어떤 소셜 서비스인지 (예: "kakao", "google")
                .claim("nickname", nickname != null ? nickname : "")
                // 소셜에서 가져온 닉네임. null이면 빈 문자열로 대체.
                .claim("pending", true)
                // pending 토큰임을 명시. extractPendingClaims()에서 이 값을 검증한다.
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 10 * 60 * 1000));
                // 10분 후 만료 (10분 * 60초 * 1000밀리초)
        if (email != null) builder = builder.claim("email", email);
        // 이메일이 있는 경우에만 클레임에 추가
        return builder.signWith(key, SignatureAlgorithm.HS256).compact();
    }

    /** pending 토큰에서 클레임 추출 — 유효하지 않거나 pending 아닌 경우 null 반환 */
    public Claims extractPendingClaims(String token) {
    // pending 토큰에서 클레임을 추출한다. 유효하지 않거나 pending이 아니면 null 반환.
        try {
            Claims claims = parseClaims(token);
            if (!Boolean.TRUE.equals(claims.get("pending", Boolean.class))) return null;
            // pending 클레임이 true가 아니면 이 토큰은 pending 토큰이 아니다.
            return claims;
        } catch (JwtException | IllegalArgumentException e) {
            return null;
            // 토큰이 변조됐거나 만료됐으면 예외가 발생한다. null을 반환해서 실패를 알린다.
        }
    }

    public boolean isTokenValid(String token) {
    // 토큰이 유효한지(서명 검증 + 만료 여부) 확인한다. true면 유효, false면 무효.
        try {
            parseClaims(token);
            // 예외 없이 파싱이 되면 유효한 토큰이다.
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
            // 서명이 틀리거나, 만료됐거나, 형식이 잘못됐으면 예외가 발생한다.
        }
    }

    private Claims parseClaims(String token) {
    // 토큰 문자열을 파싱해서 Claims(페이로드) 객체를 반환하는 내부 메서드.
    // private: 이 클래스 안에서만 사용한다.
        return Jwts.parserBuilder()
                .setSigningKey(key)
                // 검증에 쓸 키를 지정한다. 토큰 생성 때와 같은 key를 써야 한다.
                .build()
                .parseClaimsJws(token)
                // 실제 파싱. 서명 검증 + 만료 확인이 여기서 일어난다.
                // 문제가 있으면 JwtException을 던진다.
                .getBody();
                // 검증 완료된 Claims(페이로드) 부분을 꺼낸다.
    }
}
