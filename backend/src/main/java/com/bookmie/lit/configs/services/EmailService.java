package com.bookmie.lit.configs.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
  private static final Logger log = LoggerFactory.getLogger(EmailService.class);

  @Autowired
  private JavaMailSender mailSender;

  @Value("${spring.mail.username}")
  private String fromEmail;

  @Async
  public void sendSimpleEmail(String to, String subject, String body) {
    SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
    simpleMailMessage.setFrom(this.fromEmail);
    simpleMailMessage.setTo(to);
    simpleMailMessage.setSubject(subject);
    simpleMailMessage.setText(body);

    try {
      this.mailSender.send(simpleMailMessage);
      log.info("Simple email sent to {}", to);
    } catch (Exception e) {
      log.error("Failed to send simple email to {}: {}", to, e.getMessage(), e);
    }
  }

  @Async
  public void sendHtmlEmail(String to, String subject, String htmlBody) {
    jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
    try {
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
      helper.setFrom(this.fromEmail);
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(htmlBody, true);
      mailSender.send(message);
      log.info("HTML email sent successfully to {}", to);
    } catch (Exception e) {
      log.error("Error sending HTML email to {}: {}", to, e.getMessage(), e);
    }
  }
}
