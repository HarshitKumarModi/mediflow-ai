package com.mediflow.backend.controller;

import com.mediflow.backend.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test-email")
public class EmailTestController {

    private final EmailService emailService;

    public EmailTestController(EmailService emailService) {
        this.emailService = emailService;
    }

    @GetMapping
    public ResponseEntity<String> testEmail(
            @RequestParam String email
    ) {

        boolean sent = emailService.sendEmail(
                email,
                "MediFlow AI - Test Email",
                "Hello! This is a test email from MediFlow AI."
        );

        if (sent) {
            return ResponseEntity.ok("Email sent successfully");
        }

        return ResponseEntity
                .internalServerError()
                .body("Failed to send email");
    }
}