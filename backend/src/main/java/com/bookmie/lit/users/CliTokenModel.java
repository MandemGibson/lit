package com.bookmie.lit.users;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.mongodb.lang.Nullable;

import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Document(collection = "cli_tokens")
@NoArgsConstructor
@Getter
@Setter
public class CliTokenModel {
  @Id
  private String id;

  @Field(name = "user_id")
  private String userId;

  @Field(name = "token_hash")
  private String tokenHash;

  @Field(name = "label")
  private String label;

  @Field(name = "token_prefix")
  private String tokenPrefix;

  @Field(name = "created_on")
  @CreatedDate
  private Instant createdOn;

  @Field(name = "last_used_on")
  @Nullable
  private Instant lastUsedOn;

  public CliTokenModel(String userId, String tokenHash, String label, String tokenPrefix) {
    this.userId = userId;
    this.tokenHash = tokenHash;
    this.label = label;
    this.tokenPrefix = tokenPrefix;
  }
}
