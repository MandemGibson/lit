package com.bookmie.lit.projects.dtos;

public record UpdateEnvDataDto(String envData, String environment, String scope) {
  public UpdateEnvDataDto(String envData) {
    this(envData, "development", "default");
  }

  public String environment() {
    return environment != null && !environment.trim().isEmpty() ? environment : "development";
  }

  public String scope() {
    return scope != null && !scope.trim().isEmpty() ? scope : "default";
  }
}
