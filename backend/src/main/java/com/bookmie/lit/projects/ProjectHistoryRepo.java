package com.bookmie.lit.projects;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectHistoryRepo extends MongoRepository<ProjectHistoryModel, String> {
  List<ProjectHistoryModel> findByProjectIdOrderByTimestampDesc(String projectId);
}
