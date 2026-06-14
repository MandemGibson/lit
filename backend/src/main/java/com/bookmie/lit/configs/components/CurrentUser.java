package com.bookmie.lit.configs.components;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.WebApplicationContext;

import com.bookmie.lit.users.UserModel;


@Component
@Scope(value = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class CurrentUser {

  private UserModel user;

  @PostConstruct
  public void init() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();

    if (auth != null && auth.isAuthenticated()) {
      this.user = (UserModel) auth.getPrincipal();
    } else {
      throw new RuntimeException("No authenticated user found");
    }
  }

  public UserModel get() {
    return this.user;
  }

  public String getId() {

    System.out.println(this.user.getId());
    return this.user.getId();
  }

  public String getEmail() {
    return this.user.getEmail();
  }

}
