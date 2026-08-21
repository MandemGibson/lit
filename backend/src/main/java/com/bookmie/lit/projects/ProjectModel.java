package com.bookmie.lit.projects;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.mongodb.lang.Nullable;

import lombok.NoArgsConstructor;

@NoArgsConstructor
@Document(collection = "projects")
public class ProjectModel {
  @Id
  private String id;

  @Field(name = "project_name")
  @Indexed(unique = true)
  private String projectName;

  private String description;

  @Field(name = "dot_env_data")
  @Nullable
  private String dotEnvData;

  @Field(name = "envs_data")
  private java.util.Map<String, java.util.Map<String, String>> envsData = new java.util.HashMap<>();

  @Field(name = "owner")
  private String owner;
  //
  @Field(name = "created_on")
  @CreatedDate
  private Instant createdOn;

  @Field(name = "last_updated")
  private Instant lastUpdated;

  @Field(name = "updated_by_user_id")
  @Nullable
  private String updatedByUserId;

  @Field(name = "updated_by_user_name")
  @Nullable
  private String updatedByUserName;

  @Field(name = "collaborators")
  private Set<String> collaborators = new HashSet<>();

  public ProjectModel(String projectName, String description, String owner) {
    this.projectName = projectName;
    this.description = description;
    this.owner = owner;
  }

  public String getId() {
    return id;
  }

  public Set<String> getCollaborators() {
    return collaborators;
  }

  public void addCollaborator(String userId) {
    this.collaborators.add(userId);
  }

  public String getDotEnvData() {
    return dotEnvData;
  }

  public String getProjectName() {
    return projectName;
  }

  public Instant getLastUpdated() {
    return lastUpdated;
  }

  public String getDescription() {
    return description;
  }

  public Instant getCreatedOn() {
    return createdOn;
  }

  public void setDotEnvData(String dotEnvData) {
    this.dotEnvData = dotEnvData;
  }

  public void setOwner(String owner) {
    this.owner = owner;
  }

  public String getOwner() {
    return owner;
  }

  public void setLastUpdated(Instant lastUpdated) {
    this.lastUpdated = lastUpdated;
  }

  public String getUpdatedByUserId() {
    return updatedByUserId;
  }

  public void setUpdatedByUserId(String updatedByUserId) {
    this.updatedByUserId = updatedByUserId;
  }

  public String getUpdatedByUserName() {
    return updatedByUserName;
  }

  public void setUpdatedByUserName(String updatedByUserName) {
    this.updatedByUserName = updatedByUserName;
  }

  public java.util.Map<String, java.util.Map<String, String>> getEnvsData() {
    return envsData;
  }

  public void setEnvsData(java.util.Map<String, java.util.Map<String, String>> envsData) {
    this.envsData = envsData;
  }

  public String getEncryptedEnv(String environment, String scope) {
    String envKey = (environment != null && !environment.trim().isEmpty()) ? environment.trim().toLowerCase() : "development";
    String scopeKey = (scope != null && !scope.trim().isEmpty()) ? scope.trim().toLowerCase() : "default";

    if (envsData != null && envsData.containsKey(envKey)) {
      java.util.Map<String, String> scopeMap = envsData.get(envKey);
      if (scopeMap != null && scopeMap.containsKey(scopeKey)) {
        return scopeMap.get(scopeKey);
      }
    }
    // Backward compatibility fallback for default environment & scope
    if ("development".equals(envKey) && "default".equals(scopeKey)) {
      return this.dotEnvData;
    }
    return null;
  }

  public void setEncryptedEnv(String environment, String scope, String encryptedData) {
    String envKey = (environment != null && !environment.trim().isEmpty()) ? environment.trim().toLowerCase() : "development";
    String scopeKey = (scope != null && !scope.trim().isEmpty()) ? scope.trim().toLowerCase() : "default";

    if (this.envsData == null) {
      this.envsData = new java.util.HashMap<>();
    }
    this.envsData.computeIfAbsent(envKey, k -> new java.util.HashMap<>()).put(scopeKey, encryptedData);

    // Keep dotEnvData in sync for legacy readers if updating development/default
    if ("development".equals(envKey) && "default".equals(scopeKey)) {
      this.dotEnvData = encryptedData;
    }
  }

}

