package com.bookmie.lit.configs.security;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

  @Value("${jwt.secret_key}")
  private String jwtSecretKey;

  @Value("${jwt.expiration}")
  private long jwtExpiry;

  private Key getSignInkey() {
    byte[] keyBytes = Decoders.BASE64.decode(this.jwtSecretKey);
    return Keys.hmacShaKeyFor(keyBytes);
  }

  public String generateToken(String userId, String userEmail) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("email", userEmail);
    return Jwts.builder()
        .setClaims(claims)
        .setSubject(userId)
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + this.jwtExpiry))
        .signWith(this.getSignInkey(), SignatureAlgorithm.HS256)
        .compact();
  }

  public Claims extractAllClaims(String token) {
    return Jwts.parserBuilder()
        .setSigningKey(this.getSignInkey())
        .build()
        .parseClaimsJws(token)
        .getBody();
  }

  public String extractedUserId(String token) {
    return this.extractAllClaims(token).getSubject();
  }

  public boolean isTokenExpired(String token) {
    try {
      Date expiration = this.extractAllClaims(token).getExpiration();
      return expiration.after(new Date());
    } catch (Exception e) {
      return false;
    }
  }

  public boolean isTokenValid(String token, String userId) {
    String extractedUserId = this.extractAllClaims(token).getSubject();
    return (extractedUserId.equals(userId) && this.isTokenExpired(token));
  }
}
