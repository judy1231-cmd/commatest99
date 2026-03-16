package com.comma.global.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
@SuppressWarnings("null") // JJWT 라이브러리가 @NonNull 미지원 — Eclipse 정적 분석 억제
public class JwtUtil {

    private final Key key;
    private final long accessExpiration;
    private final long refreshExpiration;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-expiration}") long accessExpiration,
            @Value("${jwt.refresh-expiration}") long refreshExpiration
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessExpiration = accessExpiration;
        this.refreshExpiration = refreshExpiration;
    }

    public @NonNull String generateAccessToken(String 쉼표번호, String role) {
        return Jwts.builder()
                .setSubject(쉼표번호)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessExpiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public @NonNull String generateRefreshToken(String 쉼표번호) {
        return Jwts.builder()
                .setSubject(쉼표번호)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public @NonNull String extract쉼표번호(String token) {
        return parseClaims(token).getSubject();
    }

    public @NonNull String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    /** 소셜 가입 확인 전 임시 토큰 (10분 유효) — subject: providerId, claims: provider/nickname */
    public @NonNull String generatePendingToken(String provider, String providerId, String nickname) {
        return Jwts.builder()
                .setSubject(providerId)
                .claim("provider", provider)
                .claim("nickname", nickname != null ? nickname : "")
                .claim("pending", true)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 10 * 60 * 1000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /** pending 토큰에서 클레임 추출 — 유효하지 않거나 pending 아닌 경우 null 반환 */
    public Claims extractPendingClaims(String token) {
        try {
            Claims claims = parseClaims(token);
            if (!Boolean.TRUE.equals(claims.get("pending", Boolean.class))) return null;
            return claims;
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }

    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
