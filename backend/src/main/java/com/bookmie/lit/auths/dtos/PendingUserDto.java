package com.bookmie.lit.auths.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PendingUserDto {
  private String email;
  private String password;
  private String otp;

  public PendingUserDto(String email, String password, String otp) {
    this.email = email;
    this.password = password;
    this.otp = otp;
  }

  public String getOtp() {
    return otp;
  }

  public String getEmail() {
    return email;
  }

  public String getPassword() {
    return password;
  }
}
