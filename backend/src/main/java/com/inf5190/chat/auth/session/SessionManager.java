package com.inf5190.chat.auth.session;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Repository;

import javax.crypto.SecretKey;

/**
 * Classe qui gère les sessions utilisateur.
 * 
 * Pour le moment, on gère en mémoire.
 */
@Repository
public class SessionManager {

    private static final String SECRET_KEY_BASE64 = "tTQnn1MgYf4zf8/5YToNYQKxnTAx7iTSQh388t0phVc=";
    private final String DEFAULT_AUDIENCE = "chat";

    private final SecretKey secretKey;
    private final JwtParser jwtParser;

    public SessionManager() {
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET_KEY_BASE64));
        this.jwtParser = Jwts.parser().verifyWith(this.secretKey).build();
    }

    public String addSession(SessionData authData) {
        return Jwts.builder()
            .audience().add(DEFAULT_AUDIENCE).and()
            .issuedAt(new Date())
            .subject(authData.username())
            .expiration(Date.from(Instant.now().plus(2, ChronoUnit.HOURS)))
            .signWith(this.secretKey)
            .compact();
    }

    public SessionData getSession(String sessionId) {
        Jws<Claims> jws = null;

        try{
            jws = Jwts.parser()
                .verifyWith(this.secretKey)
                .build()
                .parseSignedClaims(sessionId);

            return new SessionData(jws.getPayload().getSubject());
        } catch (JwtException e) {
            return null;
        }
    }

    private String generateSessionId() {
        return UUID.randomUUID().toString();
    }
}
