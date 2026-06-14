package com.bookmie.lit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LitApplication {

  public static void main(String[] args) {
    SpringApplication.run(LitApplication.class, args);
  }

}
