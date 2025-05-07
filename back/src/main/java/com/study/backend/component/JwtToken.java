package com.study.backend.component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtToken {

    private final String SECRET_KEY = "dGhpc19pc19hX3Zlcnlfc2VjdXJlX3Rlc3Rfc2VjcmV0X2tleQ=="; // Base64 encoded

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET_KEY));
    }


    // Access Token 생성: 사용자 이메일, 이름, 권한, iat, exp를 포함 (5시간 유효)
    public String generateTokenWithClaims(String uEmail, String uName, String uRole) {
        Key key = getSigningKey();

        long now = System.currentTimeMillis();
        Date issuedAt = new Date(now);
        Date expiryDate = new Date(now + 5 * 60 * 60 * 1000); // 5시간

        Map<String, Object> claims = new HashMap<>();
        claims.put("uEmail", uEmail);
        claims.put("uName", uName);
        claims.put("uRole", uRole);
        claims.put("iat", issuedAt.getTime() / 1000); // 초 단위
        claims.put("exp", expiryDate.getTime() / 1000);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(issuedAt)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Refresh Token 생성: 이메일 기반 (7일 유효)
    public String generateRefreshToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 7))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // JWT 토큰 유효성 검사
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .setSigningKey(getSigningKey())
                .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // 토큰에서 사용자 이메일(Subject) 추출
    public String extractEmail(String token) {
        return Jwts.parser()
                .setSigningKey(getSigningKey())
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 토큰에서 사용자 이메일 추출
    public String getUserEmail(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .get("uEmail", String.class);
        } catch (Exception e) {
            throw new RuntimeException("토큰에서 이메일을 추출할 수 없습니다: " + e.getMessage());
        }
    }

}
