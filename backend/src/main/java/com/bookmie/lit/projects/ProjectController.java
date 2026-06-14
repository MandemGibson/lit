package com.bookmie.lit.projects;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookmie.lit.configs.components.CurrentUser;
import com.bookmie.lit.projects.dtos.AddCollaboratorDto;
import com.bookmie.lit.projects.dtos.CreateProjectDto;
import com.bookmie.lit.projects.dtos.InviteUserDto;
import com.bookmie.lit.projects.dtos.UpdateEnvDataDto;
import com.bookmie.lit.utils.dtos.ResponseDto;

@RestController
@RequestMapping("/projects")
public class ProjectController {

  @Autowired
  private ProjectService projectService;

  @Autowired
  private CurrentUser currentUser;

  @GetMapping("/")
  public ResponseEntity<ResponseDto> getProjects(Authentication auth) {
    ResponseDto res = this.projectService.getProjects(this.currentUser.getId());
    return ResponseEntity.status(res.statusCode()).body(res);
  }

  @GetMapping("/active-projects")
  public ResponseEntity<ResponseDto> getUsersActiveProjects(Authentication auth) {
    ResponseDto res = this.projectService.getActiveProjects(this.currentUser.getId());
    return ResponseEntity.status(res.statusCode()).body(res);
  }

  @PostMapping("/create")
  public ResponseEntity<ResponseDto> createProject(Authentication auth, @RequestBody CreateProjectDto requestData) {
    ResponseDto response = this.projectService.createProject(requestData, this.currentUser.getId());
    return ResponseEntity.status(response.statusCode()).body(response);
  }

  @DeleteMapping("/{projectId}")
  public ResponseEntity<ResponseDto> deleteProject(Authentication auth, @PathVariable String projectId) {
    ResponseDto response = this.projectService.deleteProject(projectId, this.currentUser.getId());
    return ResponseEntity.status(response.statusCode()).body(response);
  }

  @PutMapping("/update-env-data/{projectId}/")
  public ResponseEntity<ResponseDto> updateEnvData(@PathVariable String projectId,
      @RequestBody UpdateEnvDataDto requestData) {
    ResponseDto response = this.projectService.updateEnvData(projectId, requestData.envData(),
        this.currentUser.getId());
    return ResponseEntity.status(response.statusCode()).body(response);
  }

  @GetMapping("/pull-env-data/{projectId}")
  public ResponseEntity<ResponseDto> pullEnvData(@PathVariable String projectId) {
    ResponseDto res = this.projectService.pullEnvContent(projectId);
    return ResponseEntity.status(res.statusCode()).body(res);
  }

  @PostMapping("/invite")
  public ResponseEntity<ResponseDto> pullEnvData(@RequestBody InviteUserDto data) throws Exception {
    ResponseDto res = this.projectService.sendInvitation(data);
    return ResponseEntity.status(res.statusCode()).body(res);
  }

  @PostMapping("/accept-invite")
  public ResponseEntity<ResponseDto> addCollaborator(@RequestBody AddCollaboratorDto data) {
    ResponseDto res = this.projectService.addCollaborator(data);
    return ResponseEntity.status(res.statusCode()).body(res);
  }

  @GetMapping("/collabs/{projectId}")
  public ResponseEntity<ResponseDto> getCollabs(@PathVariable String projectId) {
    ResponseDto res = this.projectService.getCollaboratorDetails(projectId);
    return ResponseEntity.status(res.statusCode()).body(res);
  }

  @DeleteMapping("/{projectId}/collabs/{userId}")
  public ResponseEntity<ResponseDto> removeCollaborator(
      @PathVariable String projectId,
      @PathVariable String userId) {
    ResponseDto response = projectService.removeCollaborator(projectId, userId);
    return ResponseEntity.status(response.statusCode()).body(response);
  }

}
