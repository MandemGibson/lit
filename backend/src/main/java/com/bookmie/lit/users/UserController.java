package com.bookmie.lit.users;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.bookmie.lit.utils.dtos.ResponseDto;
import com.bookmie.lit.users.dtos.SearchRequestDto;

@Controller
@RequestMapping("/users")
public class UserController {

  @Autowired
  private UserService userService;

  @PostMapping("/search")
  public ResponseEntity<ResponseDto> searchUser(@RequestBody SearchRequestDto data) {
    ResponseDto res = this.userService.searchUser(data);
    return ResponseEntity.status(res.statusCode()).body(res);
  }

}
