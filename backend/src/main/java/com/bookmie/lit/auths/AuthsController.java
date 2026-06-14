package com.bookmie.lit.auths;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookmie.lit.auths.dtos.AuthResponseDto;
import com.bookmie.lit.auths.dtos.GetTokenDto;
import com.bookmie.lit.auths.dtos.RegisterDto;
import com.bookmie.lit.auths.dtos.VerifyUserDto;
import com.bookmie.lit.utils.dtos.ResponseDto;

@RestController
@RequestMapping("/auths")
public class AuthsController {

  @Autowired
  private AuthsService authsService;

  @PostMapping("/register")
  public ResponseEntity<ResponseDto> registerUser(@RequestBody RegisterDto requestData) {
    ResponseDto response = this.authsService.registerUser(requestData);
    return ResponseEntity.status(response.statusCode()).body(response);
  }

  @PostMapping("/verify-user")
  public ResponseEntity<ResponseDto> verifyUser(@RequestBody VerifyUserDto requestData) {
    ResponseDto response = this.authsService.verifyUser(requestData);
    return ResponseEntity.status(response.statusCode()).body(response);
  }

  @PostMapping("/obtain-token")
  public ResponseEntity<AuthResponseDto> obtainToken(@RequestBody GetTokenDto requestData) {
    AuthResponseDto response = this.authsService.getToken(requestData.email(), requestData.password());
    return ResponseEntity.status(response.statusCode()).body(response);
  }
}
