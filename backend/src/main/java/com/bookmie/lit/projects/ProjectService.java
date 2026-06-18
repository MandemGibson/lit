package com.bookmie.lit.projects;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bookmie.lit.configs.services.EmailService;
import com.bookmie.lit.ops.OpsService;
import com.bookmie.lit.projects.dtos.AddCollaboratorDto;
import com.bookmie.lit.projects.dtos.CreateProjectDto;
import com.bookmie.lit.projects.dtos.InviteUserDto;
import com.bookmie.lit.users.UserModel;
import com.bookmie.lit.users.UserRepository;
import com.bookmie.lit.users.dtos.UserPublicDto;
import com.bookmie.lit.utils.EmailTemplateLoader;
import com.bookmie.lit.utils.dtos.ResponseDto;

@Service
public class ProjectService {

  @Autowired
  private ProjectRepo projectRepo;

  @Autowired
  private OpsService operations;

  @Autowired
  private EmailService emailService;

  @Autowired
  private UserRepository usersRepo;

  @Autowired
  private ProjectHistoryRepo projectHistoryRepo;

  public ResponseDto createProject(CreateProjectDto data, String userId) {
    if (this.projectRepo.findByProjectName(data.projectName()).isPresent()) {
      return new ResponseDto(409, "Project with similar name already exists", null);
    }
    ProjectModel project = new ProjectModel(data.projectName(), data.description(), userId);
    project.addCollaborator(userId);
    this.projectRepo.save(project);
    Map<String, String> result = new HashMap<>();
    result.put("id", project.getId());
    result.put("projectName", project.getProjectName());
    return new ResponseDto(201, "Project Added", result);
  }

  public ResponseDto deleteProject(String projectId, String userId) {
    if (this.projectRepo.findByIdAndOwner(projectId, userId).isPresent()) {
      this.projectRepo.deleteById(projectId);
      return new ResponseDto(200, "Project deleted", null);
    }
    return new ResponseDto(400, "No active Project", null);
  }

  public ResponseDto getProjects(String userId) {

    List<ProjectModel> projects = this.projectRepo.findByCollaboratorsContaining(userId);
    return new ResponseDto(200, "successfull", projects);
  }

  public ResponseDto getActiveProjects(String userId) {
    List<ProjectModel> projects = this.projectRepo.findByCollaboratorsContaining(userId);
    return new ResponseDto(200, "successfull", projects);
  }

  public ResponseDto pullEnvContent(String projectId) {
    Optional<ProjectModel> project = this.projectRepo.findById(projectId);
    if (project.isEmpty()) {
      return new ResponseDto(404, "Project not found", null);
    }
    String dotEnvData = project.get().getDotEnvData();
    if (dotEnvData == null || dotEnvData.isEmpty()) {
      return new ResponseDto(200, "successful", "");
    }
    String decryptedEnv = this.operations.decryptEnvData(dotEnvData);
    return new ResponseDto(200, "successful", decryptedEnv);
  }

  public ResponseDto updateEnvData(String projectId, String envData, String userId) {
    Optional<ProjectModel> project = this.projectRepo.findById(projectId);
    if (project.isPresent()) {
      ProjectModel projectObj = project.get();
      if (projectObj.getOwner().equals(userId) || projectObj.getCollaborators().contains(userId)) {
        String oldDecryptedEnv = "";
        if (projectObj.getDotEnvData() != null && !projectObj.getDotEnvData().isEmpty()) {
          try {
            oldDecryptedEnv = this.operations.decryptEnvData(projectObj.getDotEnvData());
          } catch (Exception e) {
            System.err.println("Failed to decrypt old env data: " + e.getMessage());
          }
        }

        Map<String, String> oldMap = parseEnv(oldDecryptedEnv);
        Map<String, String> newMap = parseEnv(envData);

        List<String> addedKeys = new ArrayList<>();
        List<String> modifiedKeys = new ArrayList<>();
        List<String> deletedKeys = new ArrayList<>();

        for (String key : newMap.keySet()) {
          if (!oldMap.containsKey(key)) {
            addedKeys.add(key);
          } else if (!newMap.get(key).equals(oldMap.get(key))) {
            modifiedKeys.add(key);
          }
        }

        for (String key : oldMap.keySet()) {
          if (!newMap.containsKey(key)) {
            deletedKeys.add(key);
          }
        }

        String securedData = this.operations.encryptEnvData(envData);
        projectObj.setDotEnvData(securedData);
        projectObj.setLastUpdated(Instant.now());

        String updaterName = "A collaborator";
        String updaterEmail = "";
        Optional<UserModel> updaterOpt = this.usersRepo.findById(userId);
        if (updaterOpt.isPresent()) {
          UserModel updater = updaterOpt.get();
          updaterName = updater.getName() != null && !updater.getName().trim().isEmpty() ? updater.getName() : updater.getEmail();
          updaterEmail = updater.getEmail();
        }
        projectObj.setUpdatedByUserId(userId);
        projectObj.setUpdatedByUserName(updaterName);
        this.projectRepo.save(projectObj);

        ProjectHistoryModel history = new ProjectHistoryModel(
            projectId,
            userId,
            updaterName,
            updaterEmail,
            addedKeys,
            modifiedKeys,
            deletedKeys
        );
        this.projectHistoryRepo.save(history);

        Set<String> recipientIds = new HashSet<>(projectObj.getCollaborators());
        if (!projectObj.getOwner().equals(userId)) {
          recipientIds.add(projectObj.getOwner());
        }
        recipientIds.remove(userId);

        if (!recipientIds.isEmpty()) {
          List<UserModel> recipients = this.usersRepo.findAllByIdIn(recipientIds);
          for (UserModel recipient : recipients) {
            if (recipient.isSecretUpdatesEnabled()) {
              try {
                String html = EmailTemplateLoader.loadTemplate("secret_update.html");
                String msg = html.replace("{{projectName}}", projectObj.getProjectName())
                                 .replace("{{updaterName}}", updaterName);
                this.emailService.sendHtmlEmail(recipient.getEmail(), "Lit Envs - Secret Update Alert", msg);
              } catch (Exception e) {
                System.err.println("Failed to send HTML update email to " + recipient.getEmail() + ": " + e.getMessage());
              }
            }
          }
        }

        return new ResponseDto(200, "successfull", null);
      }
      return new ResponseDto(403, "Access denied", null);
    }
    return new ResponseDto(404, "not found", null);
  }

  private Map<String, String> parseEnv(String envData) {
    Map<String, String> map = new HashMap<>();
    if (envData == null || envData.isEmpty()) {
      return map;
    }
    String[] lines = envData.split("\n");
    for (String line : lines) {
      line = line.trim();
      if (line.isEmpty() || line.startsWith("#")) {
        continue;
      }
      int eqIdx = line.indexOf('=');
      if (eqIdx > 0) {
        String key = line.substring(0, eqIdx).trim();
        String value = line.substring(eqIdx + 1).trim();
        map.put(key, value);
      }
    }
    return map;
  }

  public ResponseDto sendInvitation(InviteUserDto request) throws Exception {
    Optional<ProjectModel> projectOpt = projectRepo.findById(request.projectId());
    if (projectOpt.isEmpty()) {
      return new ResponseDto(404, "Project not found", null);
    }

    Optional<UserModel> userOpt = this.usersRepo.findByEmail(request.email());
    if (userOpt.isEmpty()) {
      return new ResponseDto(404, "No user found with this email", null);
    }

    UserModel user = userOpt.get();
    ProjectModel project = projectOpt.get();

    if (project.getCollaborators().contains(user.getId())) {
      return new ResponseDto(400, "User is already a collaborator", null);
    }
    String inviteLink = String.format(
        "http://localhost:5175/accept-invite?projectId=%s&userId=%s",
        project.getId(), user.getId());
    String html = EmailTemplateLoader.loadTemplate("invite.html");
    String msg = html.replace("{{inviteLink}}", inviteLink).replace("{{projectName}}", project.getProjectName());

    this.emailService.sendHtmlEmail(user.getEmail(), "Lit Envs Verification", msg);

    return new ResponseDto(200, "Invitation sent", null);
  }

  public ResponseDto addCollaborator(AddCollaboratorDto data) {
    // System.out.println("sksks");
    Optional<ProjectModel> projectOtp = this.projectRepo.findById(data.projectId());
    if (projectOtp.isEmpty()) {
      return new ResponseDto(404, "project not found", null);
    }
    ProjectModel project = projectOtp.get();

    if (project.getCollaborators().contains(data.userId())) {
      return new ResponseDto(400, "User is already a collaborator", null);
    }

    project.addCollaborator(data.userId());
    projectRepo.save(project);

    return new ResponseDto(200, "User added as collaborator", null);
  }

  public ResponseDto getCollaboratorDetails(String projectId) {
    Optional<ProjectModel> projectOpt = projectRepo.findById(projectId);

    if (projectOpt.isEmpty()) {
      return new ResponseDto(404, "Project not found", null);
    }

    ProjectModel project = projectOpt.get();
    Set<String> collaboratorIds = project.getCollaborators();

    List<UserModel> users = usersRepo.findAllByIdIn(collaboratorIds);

    // Convert to DTOs
    List<UserPublicDto> collaborators = users.stream()
        .map(user -> new UserPublicDto(user.getId(), user.getEmail()))
        .toList();

    return new ResponseDto(200, "Collaborators fetched", collaborators);
  }

  public ResponseDto removeCollaborator(String projectId, String userId) {
    Optional<ProjectModel> projectOtp = this.projectRepo.findById(projectId);
    if (projectOtp.isEmpty()) {
      return new ResponseDto(404, "Project not found", null);
    }

    ProjectModel project = projectOtp.get();

    if (!project.getCollaborators().contains(userId)) {
      return new ResponseDto(400, "User is not a collaborator", null);
    }

    project.getCollaborators().remove(userId);
    projectRepo.save(project);
    Set<String> collaboratorIds = project.getCollaborators();

    List<UserModel> users = usersRepo.findAllByIdIn(collaboratorIds);

    // Convert to DTOs
    List<UserPublicDto> collaborators = users.stream()
        .map(user -> new UserPublicDto(user.getId(), user.getEmail()))
        .toList();

    return new ResponseDto(200, "Collaborator deleted", collaborators);

  }

  public ResponseDto getProjectHistory(String projectId, String userId) {
    Optional<ProjectModel> projectOtp = this.projectRepo.findById(projectId);
    if (projectOtp.isEmpty()) {
      return new ResponseDto(404, "Project not found", null);
    }
    ProjectModel project = projectOtp.get();
    if (project.getOwner().equals(userId) || project.getCollaborators().contains(userId)) {
      List<ProjectHistoryModel> history = this.projectHistoryRepo.findByProjectIdOrderByTimestampDesc(projectId);
      return new ResponseDto(200, "History fetched successfully", history);
    }
    return new ResponseDto(403, "Access denied", null);
  }

}
