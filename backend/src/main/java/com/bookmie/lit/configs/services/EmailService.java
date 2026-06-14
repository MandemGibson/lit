package com.bookmie.lit.configs.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;

@Service
public class EmailService {
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
      System.out.println("Email sent");
    } catch (Exception e) {
      System.out.println(e);
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
      System.out.println("HTML email sent successfully to: " + to);
    } catch (MessagingException e) {
      System.err.println("Error sending HTML email to " + to + ": " + e.getMessage());
    }
  }
}
