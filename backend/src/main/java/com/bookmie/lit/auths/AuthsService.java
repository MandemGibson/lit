package com.bookmie.lit.auths;

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

@Service
public class AuthsService {

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
      UserModel newUser = new UserModel(data.email(), password, hashedOtp);
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
      String token = this.jwtService.generateToken(user.getId(), user.getEmail());
      Map<String, String> userObj = new HashMap<>();
      userObj.put("token", token);
      userObj.put("email", user.getEmail());
      userObj.put("lastLogedIn", user.getLastLogedIn() != null ? user.getLastLogedIn().toString() : null);
      userObj.put("joinedOn", user.getJoinedOn() != null ? user.getJoinedOn().toString() : null);
      return new AuthResponseDto(200, "login successful", userObj);
    }
    return new AuthResponseDto(401, "login failed", null);
  }

  public Optional<UserModel> loadUserByUserId(String userId) {
    return this.userRepository.findById(userId);
  }
}
