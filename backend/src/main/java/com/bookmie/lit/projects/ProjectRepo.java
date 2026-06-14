package com.bookmie.lit.projects;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepo extends MongoRepository<ProjectModel, String> {
  List<ProjectModel> findByOwner(String userId);

  Optional<ProjectModel> findByIdAndOwner(String id, String owner);

  Optional<ProjectModel> findByProjectName(String projectName);

  List<ProjectModel> findByCollaboratorsContaining(String userId);
}
