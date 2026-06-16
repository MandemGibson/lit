package com.bookmie.lit.users;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.bookmie.lit.configs.components.CurrentUser;
import com.bookmie.lit.users.dtos.*;
import com.bookmie.lit.utils.dtos.ResponseDto;

@RestController
@RequestMapping("/users")
public class UserController {

  @Autowired
  private UserService userService;

  @Autowired
  private CurrentUser currentUser;

  // ── Search user by email ──────────────────────────────────
  @PostMapping("/search")
  public ResponseEntity<ResponseDto> searchUser(@RequestBody SearchRequestDto data) {
    ResponseDto res = this.userService.searchUser(data);
    return ResponseEntity.status(res.statusCode()).body(res);
  }

  // ── Get current user's profile ────────────────────────────
  @GetMapping("/me")
  public ResponseEntity<ResponseDto> getProfile(Authentication auth) {
    ResponseDto res = this.userService.getProfile(this.currentUser.getId());
    return ResponseEntity.status(res.statusCode()).body(res);
  }

  // ── Update profile (name) ────────────────────────────────
  @PutMapping("/me")
  public ResponseEntity<ResponseDto> updateProfile(Authentication auth, @RequestBody UpdateProfileDto data) {
    ResponseDto res = this.userService.updateProfile(this.currentUser.getId(), data);
    return ResponseEntity.status(res.statusCode()).body(res);
  }

  // ── Change password ──────────────────────────────────────
  @PutMapping("/me/password")
  public ResponseEntity<ResponseDto> changePassword(Authentication auth, @RequestBody ChangePasswordDto data) {
    ResponseDto res = this.userService.changePassword(this.currentUser.getId(), data);
    return ResponseEntity.status(res.statusCode()).body(res);
  }

  // ── Update notification preferences ───────────────────────
  @PutMapping("/me/notifications")
  public ResponseEntity<ResponseDto> updateNotificationPrefs(Authentication auth,
      @RequestBody NotificationPrefsDto data) {
    ResponseDto res = this.userService.updateNotificationPrefs(this.currentUser.getId(), data);
    return ResponseEntity.status(res.statusCode()).body(res);
  }

  // ── Generate CLI token ───────────────────────────────────
  @PostMapping("/me/tokens")
  public ResponseEntity<ResponseDto> generateCliToken(Authentication auth, @RequestBody CreateCliTokenDto data) {
    ResponseDto res = this.userService.generateCliToken(this.currentUser.getId(), data);
    return ResponseEntity.status(res.statusCode()).body(res);
  }

  // ── List CLI tokens ──────────────────────────────────────
  @GetMapping("/me/tokens")
  public ResponseEntity<ResponseDto> listCliTokens(Authentication auth) {
    ResponseDto res = this.userService.listCliTokens(this.currentUser.getId());
    return ResponseEntity.status(res.statusCode()).body(res);
  }

  // ── Revoke a CLI token ───────────────────────────────────
  @DeleteMapping("/me/tokens/{tokenId}")
  public ResponseEntity<ResponseDto> revokeCliToken(Authentication auth, @PathVariable String tokenId) {
    ResponseDto res = this.userService.revokeCliToken(this.currentUser.getId(), tokenId);
    return ResponseEntity.status(res.statusCode()).body(res);
  }

  // ── Delete account ───────────────────────────────────────
  @DeleteMapping("/me")
  public ResponseEntity<ResponseDto> deleteAccount(Authentication auth, @RequestBody DeleteAccountDto data) {
    ResponseDto res = this.userService.deleteAccount(this.currentUser.getId(), data);
    return ResponseEntity.status(res.statusCode()).body(res);
  }
}
