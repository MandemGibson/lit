package com.bookmie.lit.auths;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.SecurityProperties.User;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bookmie.lit.auths.dtos.AuthResponseDto;
import com.bookmie.lit.auths.dtos.PendingUserDto;
import com.bookmie.lit.auths.dtos.RegisterDto;
import com.bookmie.lit.auths.dtos.VerifyMfaDto;
import com.bookmie.lit.utils.*;
import com.bookmie.lit.auths.dtos.VerifyUserDto;
import com.bookmie.lit.configs.security.JwtService;
import com.bookmie.lit.configs.services.EmailService;
import com.bookmie.lit.users.UserModel;
import com.bookmie.lit.users.UserRepository;
import com.bookmie.lit.utils.Contrib;
import com.bookmie.lit.utils.dtos.ResponseDto;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.beans.factory.annotation.Value;
import com.bookmie.lit.auths.dtos.ReleaseNotifyDto;
import java.util.List;

@Service
public class AuthsService {

  @Value("${release.notification.api.key}")
  private String releaseNotificationApiKey;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Autowired
  private ObjectMapper objectMapper;

  @Autowired
  private RedisTemplate redisTemplate;

  @Autowired
  private EmailService emailService;

  @Autowired
  private JwtService jwtService;

  public ResponseDto registerUser(RegisterDto data) {
    String email = data.email();
    String password = passwordEncoder.encode(data.password());
    String pendingUserId = "pending_user_" + email;
    String otpCOde = Contrib.generateOtpCode().toString();
    String hashedOtp = this.passwordEncoder.encode(otpCOde);
    PendingUserDto newPendingUser = new PendingUserDto(email, password, hashedOtp);
    if (this.userRepository.findByEmail(email).isPresent()) {
      return new ResponseDto(400, "Email already exists", null);
    }
    try {
      // String strNewPendingUser = objectMapper.writeValueAsString(newPendingUser);
      // if (this.redisTemplate.opsForValue().get(pendingUserId) != null) {
      // this.redisTemplate.opsForValue().getAndDelete(pendingUserId);
      // }
      // this.redisTemplate.opsForValue().set(pendingUserId, strNewPendingUser, 15,
      // TimeUnit.MINUTES);
      String defaultName = data.email().split("@")[0];
      UserModel newUser = new UserModel(data.email(), password, hashedOtp, defaultName);
      this.userRepository.save(newUser);

      String html = EmailTemplateLoader.loadTemplate("verification_email.html");
      String msg = html.replace("123456", otpCOde);
      this.emailService.sendHtmlEmail(email, "Lit Envs Verification", msg);
      return new ResponseDto(200, "Verification code sent to " + email, null);
    } catch (Exception e) {
      System.out.println(e);
      return new ResponseDto(400, "Registration failed", null);
    }
  }

  public ResponseDto verifyUser(VerifyUserDto data) {
    System.out.println(data.token());
    //String pendingUserId = "pending_user_" + data.email();
    Optional<UserModel>  pendingUserOtp = this.userRepository.findByEmail(data.email());

    if (pendingUserOtp.isEmpty()) {
      //Map<String, String> emailPayload = new HashMap<>();
      //emailPayload.put("email", data.email());
      return new ResponseDto(400, "Invalid code or code", null);
    }
    try {
      //PendingUserDto userObj = this.objectMapper.readValue(pendingUser.toString(), PendingUserDto.class);
      UserModel pendingUser = pendingUserOtp.get();
      if (this.passwordEncoder.matches(data.token(), pendingUser.getOtp())) {
        pendingUser.setOtp(null);
        this.userRepository.save(pendingUser);
        return new ResponseDto(200, "Account has been created successfully", null);
      }
    } catch (Exception e) {
      System.out.println(e);
      System.out.println(e.getStackTrace());
      return new ResponseDto(500, "Invalid code or code", null);
    }
    return new ResponseDto(400, "Invalid code or code", null);
  }

  public AuthResponseDto getToken(String email, String password) {
    UserModel user = this.userRepository.findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    if (this.passwordEncoder.matches(password, user.getPassword())) {
      if (user.isMfaEnabled()) {
        String mfaCode = Contrib.generateOtpCode().toString();
        user.setMfaCode(this.passwordEncoder.encode(mfaCode));
        user.setMfaCodeExpiresAt(Instant.now().plusSeconds(300)); // 5 mins expiration
        this.userRepository.save(user);

        try {
          String html = EmailTemplateLoader.loadTemplate("verification_email.html");
          String msg = html.replace("123456", mfaCode);
          this.emailService.sendHtmlEmail(user.getEmail(), "Lit Envs 2FA Verification Code", msg);
        } catch (Exception e) {
          System.out.println("Error sending 2FA email: " + e.getMessage());
        }

        Map<String, String> mfaData = new HashMap<>();
        mfaData.put("mfaRequired", "true");
        mfaData.put("email", user.getEmail());
        return new AuthResponseDto(200, "MFA code sent to email", mfaData);
      }

      String token = this.jwtService.generateToken(user.getId(), user.getEmail());
      user.setLastLogedIn(Instant.now());
      this.userRepository.save(user);

      Map<String, String> userObj = new HashMap<>();
      userObj.put("token", token);
      userObj.put("email", user.getEmail());
      userObj.put("lastLogedIn", user.getLastLogedIn() != null ? user.getLastLogedIn().toString() : null);
      userObj.put("joinedOn", user.getJoinedOn() != null ? user.getJoinedOn().toString() : null);
      userObj.put("name", user.getName() != null ? user.getName() : user.getEmail().split("@")[0]);
      userObj.put("avatar", user.getAvatar() != null ? user.getAvatar() : "");
      return new AuthResponseDto(200, "login successful", userObj);
    }
    return new AuthResponseDto(401, "login failed", null);
  }

  public AuthResponseDto verifyMfa(VerifyMfaDto data) {
    Optional<UserModel> userOpt = this.userRepository.findByEmail(data.email());
    if (userOpt.isEmpty()) {
      return new AuthResponseDto(404, "User not found", null);
    }
    UserModel user = userOpt.get();
    if (user.getMfaCode() == null || user.getMfaCodeExpiresAt() == null) {
      return new AuthResponseDto(400, "No active 2FA request found", null);
    }
    if (user.getMfaCodeExpiresAt().isBefore(Instant.now())) {
      return new AuthResponseDto(400, "MFA code has expired", null);
    }
    if (!this.passwordEncoder.matches(data.code(), user.getMfaCode())) {
      return new AuthResponseDto(400, "Invalid MFA code", null);
    }

    // Success! Clear code and update login time
    user.setMfaCode(null);
    user.setMfaCodeExpiresAt(null);
    user.setLastLogedIn(Instant.now());
    this.userRepository.save(user);

    String token = this.jwtService.generateToken(user.getId(), user.getEmail());
    Map<String, String> userObj = new HashMap<>();
    userObj.put("token", token);
    userObj.put("email", user.getEmail());
    userObj.put("lastLogedIn", user.getLastLogedIn() != null ? user.getLastLogedIn().toString() : null);
    userObj.put("joinedOn", user.getJoinedOn() != null ? user.getJoinedOn().toString() : null);
    userObj.put("name", user.getName() != null ? user.getName() : user.getEmail().split("@")[0]);
    userObj.put("avatar", user.getAvatar() != null ? user.getAvatar() : "");

    return new AuthResponseDto(200, "Login successful", userObj);
  }

  public ResponseDto notifyNewRelease(ReleaseNotifyDto data) {
    if (this.releaseNotificationApiKey == null || this.releaseNotificationApiKey.isEmpty()) {
      return new ResponseDto(500, "Server configuration error: Release notification API key is not configured", null);
    }
    if (data.apiKey() == null || !data.apiKey().equals(this.releaseNotificationApiKey)) {
      return new ResponseDto(403, "Forbidden: Invalid API Key", null);
    }

    List<UserModel> subscribers = this.userRepository.findAllByCliActivityEnabled(true);
    if (subscribers.isEmpty()) {
      return new ResponseDto(200, "No subscribed users found", null);
    }

    try {
      String html = EmailTemplateLoader.loadTemplate("new_release.html");
      String emailBody = html.replace("{{version}}", data.version())
                             .replace("{{changelog}}", data.changelog());

      for (UserModel subscriber : subscribers) {
        this.emailService.sendHtmlEmail(subscriber.getEmail(), "Lit CLI " + data.version() + " Released!", emailBody);
      }
      return new ResponseDto(200, "Release notification emails dispatched successfully", null);
    } catch (Exception e) {
      System.err.println("Failed to load release notification template: " + e.getMessage());
      return new ResponseDto(500, "Failed to process release notification: " + e.getMessage(), null);
    }
  }

  public Optional<UserModel> loadUserByUserId(String userId) {
    return this.userRepository.findById(userId);
  }
}
