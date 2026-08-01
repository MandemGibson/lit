package com.bookmie.lit.users;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<UserModel, String> {
  Optional<UserModel> findByEmail(String email);
   List<UserModel> findAllByIdIn(Collection<String> ids);
   List<UserModel> findAllByCliActivityEnabled(boolean cliActivityEnabled);
}
