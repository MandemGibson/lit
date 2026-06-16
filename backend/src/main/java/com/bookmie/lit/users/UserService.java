package com.bookmie.lit.users;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bookmie.lit.projects.ProjectRepo;
import com.bookmie.lit.users.dtos.*;
import com.bookmie.lit.utils.dtos.ResponseDto;

@Service
public class UserService {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private CliTokenRepository cliTokenRepository;

  @Autowired
  private ProjectRepo projectRepo;

  @Autowired
  private PasswordEncoder passwordEncoder;

  // ── Search ────────────────────────────────────────────────
  public ResponseDto searchUser(SearchRequestDto data) {
    Optional<UserModel> user = this.userRepository.findByEmail(data.userEmail());
    if (user.isEmpty()) {
      return new ResponseDto(404, "user not found", null);
    }
    Map<String, String> userData = new HashMap<>();
    userData.put("email", user.get().getEmail());
    userData.put("id", user.get().getId());
    return new ResponseDto(200, "user found", userData);
  }

  // ── Get Profile ───────────────────────────────────────────
  public ResponseDto getProfile(String userId) {
    Optional<UserModel> user = this.userRepository.findById(userId);
    if (user.isEmpty()) {
      return new ResponseDto(404, "User not found", null);
    }
    UserModel u = user.get();
    Map<String, Object> profile = new HashMap<>();
    profile.put("id", u.getId());
    profile.put("email", u.getEmail());
    profile.put("name", u.getName() != null ? u.getName() : u.getEmail().split("@")[0]);
    profile.put("avatar", u.getAvatar() != null ? u.getAvatar() : "");
    profile.put("joinedOn", u.getJoinedOn() != null ? u.getJoinedOn().toString() : null);
    profile.put("secretUpdatesEnabled", u.isSecretUpdatesEnabled());
    profile.put("collabRequestsEnabled", u.isCollabRequestsEnabled());
    profile.put("cliActivityEnabled", u.isCliActivityEnabled());
    return new ResponseDto(200, "Profile fetched", profile);
  }

  // ── Update Profile ────────────────────────────────────────
  public ResponseDto updateProfile(String userId, UpdateProfileDto data) {
    Optional<UserModel> user = this.userRepository.findById(userId);
    if (user.isEmpty()) {
      return new ResponseDto(404, "User not found", null);
    }
    UserModel u = user.get();
    if (data.name() != null && !data.name().isBlank()) {
      u.setName(data.name().trim());
    }
    this.userRepository.save(u);
    Map<String, String> result = new HashMap<>();
    result.put("name", u.getName());
    return new ResponseDto(200, "Profile updated", result);
  }

  // ── Change Password ───────────────────────────────────────
  public ResponseDto changePassword(String userId, ChangePasswordDto data) {
    Optional<UserModel> user = this.userRepository.findById(userId);
    if (user.isEmpty()) {
      return new ResponseDto(404, "User not found", null);
    }
    UserModel u = user.get();
    if (!this.passwordEncoder.matches(data.currentPassword(), u.getPassword())) {
      return new ResponseDto(401, "Current password is incorrect", null);
    }
    if (data.newPassword() == null || data.newPassword().length() < 8) {
      return new ResponseDto(400, "New password must be at least 8 characters", null);
    }
    u.setPassword(this.passwordEncoder.encode(data.newPassword()));
    this.userRepository.save(u);
    return new ResponseDto(200, "Password updated successfully", null);
  }

  // ── Notification Preferences ──────────────────────────────
  public ResponseDto updateNotificationPrefs(String userId, NotificationPrefsDto data) {
    Optional<UserModel> user = this.userRepository.findById(userId);
    if (user.isEmpty()) {
      return new ResponseDto(404, "User not found", null);
    }
    UserModel u = user.get();
    u.setSecretUpdatesEnabled(data.secretUpdatesEnabled());
    u.setCollabRequestsEnabled(data.collabRequestsEnabled());
    u.setCliActivityEnabled(data.cliActivityEnabled());
    this.userRepository.save(u);
    return new ResponseDto(200, "Notification preferences updated", null);
  }

  // ── CLI Token: Generate ───────────────────────────────────
  public ResponseDto generateCliToken(String userId, CreateCliTokenDto data) {
    if (data.label() == null || data.label().isBlank()) {
      return new ResponseDto(400, "Token label is required", null);
    }
    // Generate a raw token like: lit_xxxxxxxxxxxx
    String rawToken = "lit_" + UUID.randomUUID().toString().replace("-", "");
    String tokenHash = this.passwordEncoder.encode(rawToken);
    String tokenPrefix = rawToken.substring(0, 8) + "...";

    CliTokenModel token = new CliTokenModel(userId, tokenHash, data.label().trim(), tokenPrefix);
    this.cliTokenRepository.save(token);

    Map<String, String> result = new HashMap<>();
    result.put("id", token.getId());
    result.put("label", token.getLabel());
    result.put("token", rawToken); // shown only once
    result.put("prefix", tokenPrefix);
    result.put("createdOn", token.getCreatedOn() != null ? token.getCreatedOn().toString() : Instant.now().toString());
    return new ResponseDto(201, "Token created. Copy it now — it won't be shown again.", result);
  }

  // ── CLI Token: List ───────────────────────────────────────
  public ResponseDto listCliTokens(String userId) {
    List<CliTokenModel> tokens = this.cliTokenRepository.findByUserId(userId);
    List<Map<String, String>> result = tokens.stream().map(t -> {
      Map<String, String> m = new HashMap<>();
      m.put("id", t.getId());
      m.put("label", t.getLabel());
      m.put("prefix", t.getTokenPrefix());
      m.put("createdOn", t.getCreatedOn() != null ? t.getCreatedOn().toString() : "");
      m.put("lastUsedOn", t.getLastUsedOn() != null ? t.getLastUsedOn().toString() : "");
      return m;
    }).collect(Collectors.toList());
    return new ResponseDto(200, "Tokens fetched", result);
  }

  // ── CLI Token: Revoke ─────────────────────────────────────
  public ResponseDto revokeCliToken(String userId, String tokenId) {
    this.cliTokenRepository.deleteByIdAndUserId(tokenId, userId);
    return new ResponseDto(200, "Token revoked", null);
  }

  // ── Delete Account ────────────────────────────────────────
  public ResponseDto deleteAccount(String userId, DeleteAccountDto data) {
    Optional<UserModel> user = this.userRepository.findById(userId);
    if (user.isEmpty()) {
      return new ResponseDto(404, "User not found", null);
    }
    UserModel u = user.get();
    if (!this.passwordEncoder.matches(data.password(), u.getPassword())) {
      return new ResponseDto(401, "Password is incorrect", null);
    }
    // Cascade: delete all owned projects
    this.projectRepo.deleteAll(this.projectRepo.findByOwner(userId));
    // Delete CLI tokens
    this.cliTokenRepository.deleteAllByUserId(userId);
    // Delete user
    this.userRepository.deleteById(userId);
    return new ResponseDto(200, "Account deleted", null);
  }
}
