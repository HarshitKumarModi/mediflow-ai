package com.mediflow.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationTime;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms:86400000}") long expirationTime) {

        if (secret == null || secret.isBlank()) {
            throw new IllegalArgumentException(
                    "JWT_SECRET must not be empty."
            );
        }

        if (secret.length() < 32) {
            throw new IllegalArgumentException(
                    "JWT_SECRET must contain at least 32 characters."
            );
        }

        if (expirationTime <= 0) {
            throw new IllegalArgumentException(
                    "JWT expiration time must be greater than 0."
            );
        }

        this.key = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );

        this.expirationTime = expirationTime;
    }

    // =========================
    // GENERATE TOKEN
    // =========================

    public String generateToken(
            String email,
            String role) {

        Date now = new Date();

        Date expiration = new Date(
                now.getTime() + expirationTime
        );

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(key)
                .compact();
    }

    // =========================
    // EXTRACT EMAIL
    // =========================

    public String extractEmail(String token) {

        return getClaims(token)
                .getSubject();
    }

    // =========================
    // EXTRACT ROLE
    // =========================

    public String extractRole(String token) {

        return getClaims(token)
                .get("role", String.class);
    }

    // =========================
    // VALIDATE TOKEN
    // =========================

    public boolean isTokenValid(String token) {

        try {

            Claims claims = getClaims(token);

            String subject = claims.getSubject();
            Date expiration = claims.getExpiration();

            return subject != null
                    && !subject.isBlank()
                    && expiration != null
                    && expiration.after(new Date());

        } catch (Exception e) {

            return false;
        }
    }

    // =========================
    // GET CLAIMS
    // =========================

    private Claims getClaims(String token) {

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}