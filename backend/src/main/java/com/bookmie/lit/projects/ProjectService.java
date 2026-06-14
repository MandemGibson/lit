package com.bookmie.lit.projects;

import java.util.List;
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

  public ResponseDto createProject(CreateProjectDto data, String userId) {
    if (this.projectRepo.findByProjectName(data.projectName()).isPresent()) {
      return new ResponseDto(409, "Project with similar name already exists", null);
    }
    ProjectModel project = new ProjectModel(data.projectName(), data.description(), userId);
    project.addCollaborator(userId);
    this.projectRepo.save(project);
    return new ResponseDto(201, "Project Added", null);
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
    String decryptedEnv = this.operations.decryptEnvData(project.get().getDotEnvData());
    return new ResponseDto(200, "successfull", decryptedEnv);
  }

  public ResponseDto updateEnvData(String projectId, String envData, String userId) {
    Optional<ProjectModel> project = this.projectRepo.findByIdAndOwner(projectId, userId);
    if (project.isPresent()) {
      ProjectModel projectObj = project.get();
      String securedData = this.operations.encryptEnvData(envData);
      projectObj.setDotEnvData(securedData);
      this.projectRepo.save(projectObj);
      return new ResponseDto(200, "successfull", null);
    }
    return new ResponseDto(404, "not found", null);
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
        "https://lit.bookmie.com/accept-invite?projectId=%s&userId=%s",
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

}
