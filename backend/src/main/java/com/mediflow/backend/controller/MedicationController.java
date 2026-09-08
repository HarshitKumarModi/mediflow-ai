package com.mediflow.backend.controller;

import com.mediflow.backend.dto.MedicationRequest;
import com.mediflow.backend.entity.Appointment;
import com.mediflow.backend.entity.MedicalRecord;
import com.mediflow.backend.entity.Medication;
import com.mediflow.backend.entity.User;
import com.mediflow.backend.repository.MedicalRecordRepository;
import com.mediflow.backend.repository.MedicationRepository;
import com.mediflow.backend.repository.UserRepository;
import com.mediflow.backend.service.MedicationReminderService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/medications")

public class MedicationController {

    private final MedicationRepository medicationRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;
    private final MedicationReminderService reminderService;

    public MedicationController(
            MedicationRepository medicationRepository,
            MedicalRecordRepository medicalRecordRepository,
            UserRepository userRepository,
            MedicationReminderService reminderService
    ) {
        this.medicationRepository = medicationRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.userRepository = userRepository;
        this.reminderService = reminderService;
    }

    // =========================================================
    // CREATE MEDICATION
    // Only the doctor who owns the medical record can create it
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createMedication(
            @Valid @RequestBody MedicationRequest request
    ) {

        if (!hasRole("DOCTOR")) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Only doctors can create medications.");
        }

        MedicalRecord medicalRecord =
                medicalRecordRepository
                        .findById(request.getMedicalRecordId())
                        .orElse(null);

        if (medicalRecord == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Medical record not found.");
        }

        // ---------------------------------------------------------
        // OWNERSHIP CHECK
        // ---------------------------------------------------------

        Appointment appointment =
                medicalRecord.getAppointment();

        if (appointment == null ||
                appointment.getDoctor() == null) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Medical record ownership could not be verified.");
        }

        String loggedInEmail = getLoggedInEmail();

        if (!loggedInEmail.equalsIgnoreCase(
                appointment.getDoctor().getEmail()
        )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to create medication for this record.");
        }

        // ---------------------------------------------------------
        // START DATE
        // ---------------------------------------------------------

        LocalDate startDate = LocalDate.now();

        try {
            startDate = LocalDate.parse(request.getStartDate());

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Invalid start date. Use YYYY-MM-DD.");
        }

        // ---------------------------------------------------------
        // CREATE MEDICATION
        // ---------------------------------------------------------

        Medication medication =
                new Medication(
                        medicalRecord,
                        request.getMedicineName(),
                        request.getDosage(),
                        request.getFrequency(),
                        request.getDurationDays(),
                        request.getInstructions(),
                        startDate
                );

        Medication savedMedication =
                medicationRepository.save(medication);

        // ---------------------------------------------------------
        // CREATE REMINDERS
        // Existing reminder functionality preserved
        // ---------------------------------------------------------

        reminderService.createRemindersForMedication(
                savedMedication
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedMedication);
    }

    // =========================================================
    // GET PATIENT MEDICATIONS
    // Patient can only see their own medications
    // =========================================================

    @GetMapping("/patient/{email}")
    public ResponseEntity<?> getPatientMedications(
            @PathVariable String email
    ) {

        if (!hasRole("PATIENT") && !hasRole("ADMIN")) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to access patient medications.");
        }

        String loggedInEmail = getLoggedInEmail();

        if (hasRole("PATIENT") &&
                !loggedInEmail.equalsIgnoreCase(email)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You can only access your own medications.");
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

        List<Medication> medications =
                medicationRepository
                        .findByMedicalRecord_Appointment_Patient(patient);

        return ResponseEntity.ok(medications);
    }

    // =========================================================
    // GET DOCTOR MEDICATIONS
    // Doctor can only see medications belonging to their patients
    // =========================================================

    @GetMapping("/doctor/{email}")
    public ResponseEntity<?> getDoctorMedications(
            @PathVariable String email
    ) {

        if (!hasRole("DOCTOR") && !hasRole("ADMIN")) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to access doctor medications.");
        }

        String loggedInEmail = getLoggedInEmail();

        if (hasRole("DOCTOR") &&
                !loggedInEmail.equalsIgnoreCase(email)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You can only access your own medication records.");
        }

        User doctor =
                userRepository
                        .findByEmail(email)
                        .orElse(null);

        if (doctor == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Doctor not found.");
        }

        List<Medication> medications =
                medicationRepository
                        .findByMedicalRecord_Appointment_Doctor(doctor);

        return ResponseEntity.ok(medications);
    }

    // =========================================================
    // GET SINGLE MEDICATION
    // Only related patient, related doctor or admin can access
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getMedication(
            @PathVariable Long id
    ) {

        Medication medication =
                medicationRepository
                        .findById(id)
                        .orElse(null);

        if (medication == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Medication not found.");
        }

        if (hasRole("ADMIN")) {
            return ResponseEntity.ok(medication);
        }

        if (medication.getMedicalRecord() == null ||
                medication.getMedicalRecord().getAppointment() == null) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Medication ownership could not be verified.");
        }

        Appointment appointment =
                medication.getMedicalRecord().getAppointment();

        String loggedInEmail = getLoggedInEmail();

        boolean isPatient =
                appointment.getPatient() != null &&
                appointment.getPatient().getEmail() != null &&
                loggedInEmail.equalsIgnoreCase(
                        appointment.getPatient().getEmail()
                );

        boolean isDoctor =
                appointment.getDoctor() != null &&
                appointment.getDoctor().getEmail() != null &&
                loggedInEmail.equalsIgnoreCase(
                        appointment.getDoctor().getEmail()
                );

        if (!isPatient && !isDoctor) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to access this medication.");
        }

        return ResponseEntity.ok(medication);
    }

    // =========================================================
    // DEACTIVATE MEDICATION
    // Only the doctor who prescribed it can deactivate it
    // =========================================================

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateMedication(
            @PathVariable Long id
    ) {

        if (!hasRole("DOCTOR") && !hasRole("ADMIN")) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Only doctors can deactivate medications.");
        }

        Medication medication =
                medicationRepository
                        .findById(id)
                        .orElse(null);

        if (medication == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Medication not found.");
        }

        // Admin can manage any medication
        if (!hasRole("ADMIN")) {

            if (medication.getMedicalRecord() == null ||
                    medication.getMedicalRecord().getAppointment() == null ||
                    medication.getMedicalRecord()
                            .getAppointment()
                            .getDoctor() == null) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body("Medication ownership could not be verified.");
            }

            String doctorEmail =
                    medication
                            .getMedicalRecord()
                            .getAppointment()
                            .getDoctor()
                            .getEmail();

            if (doctorEmail == null ||
                    !getLoggedInEmail().equalsIgnoreCase(doctorEmail)) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body("You are not authorized to deactivate this medication.");
            }
        }

        medication.setActive(false);

        Medication updated =
                medicationRepository.save(medication);

        return ResponseEntity.ok(updated);
    }

    // =========================================================
    // SECURITY HELPERS
    // =========================================================

    private String getLoggedInEmail() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null) {

            return "";
        }

        return authentication.getName();
    }

    private boolean hasRole(String role) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null) {
            return false;
        }

        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority()
                                .equals("ROLE_" + role)
                );
    }
}