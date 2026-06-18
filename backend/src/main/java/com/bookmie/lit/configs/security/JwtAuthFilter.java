package com.bookmie.lit.configs.security;

import java.io.IOException;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import com.bookmie.lit.auths.AuthsService;
import com.bookmie.lit.users.CliTokenModel;
import com.bookmie.lit.users.CliTokenRepository;
import com.bookmie.lit.users.UserModel;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthFilter extends OncePerRequestFilter {

  @Autowired
  private JwtService jwtService;

  @Autowired
  private AuthsService authsService;

  @Autowired
  private CliTokenRepository cliTokenRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    final String authHeader = request.getHeader("Authorization");
    final String userId;
    final String jwt;

    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }
    jwt = authHeader.substring(7);

    // Bypassing JWT checks for Personal Access Tokens (PATs) starting with "lit_"
    if (jwt.startsWith("lit_")) {
      if (SecurityContextHolder.getContext().getAuthentication() == null) {
        if (jwt.length() < 8) {
          filterChain.doFilter(request, response);
          return;
        }
        String tokenPrefix = jwt.substring(0, 8) + "...";
        List<CliTokenModel> tokens = this.cliTokenRepository.findByTokenPrefix(tokenPrefix);
        Optional<CliTokenModel> matchedToken = tokens.stream()
            .filter(t -> this.passwordEncoder.matches(jwt, t.getTokenHash()))
            .findFirst();

        if (matchedToken.isPresent()) {
          CliTokenModel token = matchedToken.get();
          Optional<UserModel> userDetails = this.authsService.loadUserByUserId(token.getUserId());
          if (userDetails.isPresent()) {
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                userDetails.get(), null, Collections.emptyList());
            authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            token.setLastUsedOn(Instant.now());
            this.cliTokenRepository.save(token);
          }
        }
      }
      filterChain.doFilter(request, response);
      return;
    }

    userId = this.jwtService.extractedUserId(jwt);

    if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
      Optional<UserModel> userDetails = this.authsService.loadUserByUserId(userId);
      if (jwtService.isTokenValid(jwt, userDetails.get().getId())) {
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
            userDetails.get(), null, Collections.emptyList());
        authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
      }
    }
    filterChain.doFilter(request, response);
  }
}
