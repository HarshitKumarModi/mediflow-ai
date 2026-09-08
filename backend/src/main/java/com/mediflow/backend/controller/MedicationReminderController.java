package com.mediflow.backend.controller;

import com.mediflow.backend.entity.MedicationReminder;
import com.mediflow.backend.entity.User;
import com.mediflow.backend.repository.MedicationReminderRepository;
import com.mediflow.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/medication-reminders")
@CrossOrigin(origins = "http://localhost:5173")
public class MedicationReminderController {

    private final MedicationReminderRepository reminderRepository;
    private final UserRepository userRepository;

    public MedicationReminderController(
            MedicationReminderRepository reminderRepository,
            UserRepository userRepository
    ) {
        this.reminderRepository = reminderRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // GET ALL PATIENT REMINDERS
    // =========================================================

    @GetMapping("/patient/{email}")
    public ResponseEntity<?> getPatientReminders(
            @PathVariable String email
    ) {

        // Only a PATIENT can access this endpoint
        if (!hasRole("PATIENT")) {
            return forbidden("Only patients can access medication reminders.");
        }

        // Logged-in patient can access only their own reminders
        if (!isCurrentUser(email)) {
            return forbidden("You can only access your own medication reminders.");
        }

        User patient =
                userRepository
                        .findByEmail(email)
                        .orElse(null);

        if (patient == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Patient not found.");
        }

        List<MedicationReminder> reminders =
                reminderRepository
                        .findByMedication_MedicalRecord_Appointment_Patient(
                                patient
                        );

        return ResponseEntity.ok(reminders);
    }

    // =========================================================
    // GET TODAY'S REMINDERS
    // =========================================================

    @GetMapping("/patient/{email}/today")
    public ResponseEntity<?> getTodayReminders(
            @PathVariable String email
    ) {

        // Only a PATIENT can access this endpoint
        if (!hasRole("PATIENT")) {
            return forbidden("Only patients can access medication reminders.");
        }

        // Logged-in patient can access only their own reminders
        if (!isCurrentUser(email)) {
            return forbidden("You can only access your own medication reminders.");
        }

        User patient =
                userRepository
                        .findByEmail(email)
                        .orElse(null);

        if (patient == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Patient not found.");
        }

        List<MedicationReminder> reminders =
                reminderRepository
                        .findByMedication_MedicalRecord_Appointment_PatientAndReminderDate(
                                patient,
                                LocalDate.now()
                        );

        return ResponseEntity.ok(reminders);
    }

    // =========================================================
    // MARK REMINDER AS TAKEN
    // =========================================================

    @PutMapping("/{id}/taken")
    public ResponseEntity<?> markAsTaken(
            @PathVariable Long id
    ) {

        // Only a PATIENT can mark their own reminder
        if (!hasRole("PATIENT")) {
            return forbidden("Only patients can update medication reminders.");
        }

        MedicationReminder reminder =
                reminderRepository
                        .findById(id)
                        .orElse(null);

        if (reminder == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Reminder not found.");
        }

        // Ownership check
        if (!ownsReminder(reminder)) {
            return forbidden("You can only update your own medication reminders.");
        }

        reminder.setStatus("TAKEN");
        reminder.setTakenAt(LocalDateTime.now());

        MedicationReminder updated =
                reminderRepository.save(reminder);

        return ResponseEntity.ok(updated);
    }

    // =========================================================
    // MARK REMINDER AS PENDING AGAIN
    // =========================================================

    @PutMapping("/{id}/pending")
    public ResponseEntity<?> markAsPending(
            @PathVariable Long id
    ) {

        // Only a PATIENT can update their own reminder
        if (!hasRole("PATIENT")) {
            return forbidden("Only patients can update medication reminders.");
        }

        MedicationReminder reminder =
                reminderRepository
                        .findById(id)
                        .orElse(null);

        if (reminder == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Reminder not found.");
        }

        // Ownership check
        if (!ownsReminder(reminder)) {
            return forbidden("You can only update your own medication reminders.");
        }

        reminder.setStatus("PENDING");
        reminder.setTakenAt(null);

        MedicationReminder updated =
                reminderRepository.save(reminder);

        return ResponseEntity.ok(updated);
    }

    // =========================================================
    // CHECK CURRENT LOGGED-IN USER
    // =========================================================

    private boolean isCurrentUser(String email) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {
            return false;
        }

        String currentUserEmail =
                authentication.getName();

        return currentUserEmail != null
                && currentUserEmail.equalsIgnoreCase(email);
    }

    // =========================================================
    // CHECK REMINDER OWNERSHIP
    // =========================================================

    private boolean ownsReminder(
            MedicationReminder reminder
    ) {

        if (reminder == null ||
                reminder.getMedication() == null ||
                reminder.getMedication().getMedicalRecord() == null ||
                reminder.getMedication()
                        .getMedicalRecord()
                        .getAppointment() == null ||
                reminder.getMedication()
                        .getMedicalRecord()
                        .getAppointment()
                        .getPatient() == null) {

            return false;
        }

        User patient =
                reminder.getMedication()
                        .getMedicalRecord()
                        .getAppointment()
                        .getPatient();

        if (patient.getEmail() == null) {
            return false;
        }

        return isCurrentUser(patient.getEmail());
    }

    // =========================================================
    // CHECK ROLE
    // =========================================================

    private boolean hasRole(String role) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {
            return false;
        }

        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority()
                                .equals("ROLE_" + role)
                );
    }

    // =========================================================
    // FORBIDDEN RESPONSE
    // =========================================================

    private ResponseEntity<String> forbidden(
            String message
    ) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(message);
    }
}