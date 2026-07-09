package com.bookmie.lit.users.dtos;

public class UserPublicDto {
  private String id;
  private String email;
  private String plan;

  public UserPublicDto(String id, String email, String plan) {
    this.id = id;
    this.email = email;
    this.plan = plan;
  }

  public String getEmail() {
    return email;
  }

  public String getId() {
    return id;
  }

  public String getPlan() {
    return plan;
  }

  public void setId(String id) {
    this.id = id;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public void setPlan(String plan) {
    this.plan = plan;
  }
}
