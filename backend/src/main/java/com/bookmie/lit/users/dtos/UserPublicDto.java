package com.bookmie.lit.users.dtos;

public class UserPublicDto {
  private String id;
  private String email;

  public UserPublicDto(String id, String email) {
    this.id = id;
    this.email = email;
  }

  public String getEmail() {
    return email;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public void setEmail(String email) {
    this.email = email;
  }

}
