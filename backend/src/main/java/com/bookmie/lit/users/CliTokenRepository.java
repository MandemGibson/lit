package com.bookmie.lit.users;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CliTokenRepository extends MongoRepository<CliTokenModel, String> {
  List<CliTokenModel> findByUserId(String userId);

  List<CliTokenModel> findByTokenPrefix(String tokenPrefix);

  void deleteByIdAndUserId(String id, String userId);

  void deleteAllByUserId(String userId);
}
