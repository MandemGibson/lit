package com.bookmie.lit.users;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators.StringIdGenerator;
import com.mongodb.lang.Nullable;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "users")
@NoArgsConstructor
@Getter
@Setter
public class UserModel {
  @Id
  private String id;

  @Indexed(unique = true)
  private String email;

  //@JsonIgnore
  private String password;

  @Field(name = "joined_on")
  @CreatedDate
  private Instant joinedOn;

  @Field(name = "otp")
  private String otp;

  @Field(name = "last_loged_in")
  @Nullable
  private Instant lastLogedIn;

  public UserModel(String email, String password, String otp) {
    this.email = email;
    this.password = password;
    this.otp = otp;
  }

  public String getId() {
    return id;
  }

  public void setOtp(String otp) {
    this.otp = otp;
  }

  public String getOtp() {
    return otp;
  }

  //
  // public void setId(String id) {
  // this.id = id;
  // }
  //
  public String getEmail() {
    return email;
  }

  //
  // public void setEmail(String email) {
  // this.email = email;
  // }
  //
  public String getPassword() {
    return password;
  }

  //
  // public void setPassword(String password) {
  // this.password = password;
  // }
  //
  public Instant getJoinedOn() {
    return joinedOn;
  }

  //
  // public void setJoinedOn(Instant joinedOn) {
  // this.joinedOn = joinedOn;
  // }
  //
  public Instant getLastLogedIn() {
    return lastLogedIn;
  }
  //
  // public void setLastLogedIn(Instant lastLogedIn) {
  // this.lastLogedIn = lastLogedIn;
  // }
}
