package com.bookmie.lit.projects;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "project_history")
@NoArgsConstructor
@Getter
@Setter
public class ProjectHistoryModel {
  @Id
  private String id;

  @Field(name = "project_id")
  private String projectId;

  @Field(name = "user_id")
  private String userId;

  @Field(name = "user_name")
  private String userName;

  @Field(name = "user_email")
  private String userEmail;

  @Field(name = "timestamp")
  @CreatedDate
  private Instant timestamp;

  @Field(name = "added_keys")
  private List<String> addedKeys = new ArrayList<>();

  @Field(name = "modified_keys")
  private List<String> modifiedKeys = new ArrayList<>();

  @Field(name = "deleted_keys")
  private List<String> deletedKeys = new ArrayList<>();

  public ProjectHistoryModel(String projectId, String userId, String userName, String userEmail,
      List<String> addedKeys, List<String> modifiedKeys, List<String> deletedKeys) {
    this.projectId = projectId;
    this.userId = userId;
    this.userName = userName;
    this.userEmail = userEmail;
    this.timestamp = Instant.now();
    this.addedKeys = addedKeys != null ? addedKeys : new ArrayList<>();
    this.modifiedKeys = modifiedKeys != null ? modifiedKeys : new ArrayList<>();
    this.deletedKeys = deletedKeys != null ? deletedKeys : new ArrayList<>();
  }
}
