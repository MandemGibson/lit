package com.bookmie.lit.projects;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
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

  @Field(name = "owner")
  private String owner;
  //
  @Field(name = "created_on")
  @CreatedDate
  private Instant createdOn;

  @Field(name = "last_updated")
  private Instant lastUpdated;

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

}
