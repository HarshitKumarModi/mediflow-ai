package com.mediflow.backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends a simple email.
     *
     * Email failures are caught so that a notification
     * problem does not break the main application flow.
     */
    public boolean sendEmail(
            String to,
            String subject,
            String body
    ) {

        try {

            if (to == null || to.isBlank()) {
                System.err.println("Email not sent: recipient email is empty.");
                return false;
            }

            SimpleMailMessage message = new SimpleMailMessage();

            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

            System.out.println(
                    "Email sent successfully to: " + to
            );

            return true;

        } catch (Exception exception) {

            System.err.println(
                    "Email sending failed for: " + to
            );

            System.err.println(
                    "Reason: " + exception.getMessage()
            );

            // Important:
            // Email failure must NOT break the main application flow.
            return false;
        }
    }
}