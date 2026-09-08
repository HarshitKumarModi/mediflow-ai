package com.mediflow.backend.controller;

import com.mediflow.backend.dto.MedicalRecordRequest;
import com.mediflow.backend.dto.MedicalRecordResponse;
import com.mediflow.backend.entity.Appointment;
import com.mediflow.backend.entity.MedicalRecord;
import com.mediflow.backend.entity.User;
import com.mediflow.backend.repository.AppointmentRepository;
import com.mediflow.backend.repository.MedicalRecordRepository;
import com.mediflow.backend.repository.UserRepository;
import com.mediflow.backend.service.PostVisitSummaryService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")

public class MedicalRecordController {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final PostVisitSummaryService postVisitSummaryService;

    public MedicalRecordController(
            MedicalRecordRepository medicalRecordRepository,
            AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            PostVisitSummaryService postVisitSummaryService) {

        this.medicalRecordRepository = medicalRecordRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.postVisitSummaryService = postVisitSummaryService;
    }

    // =========================================================
    // CREATE MEDICAL RECORD
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createMedicalRecord(
            @RequestBody MedicalRecordRequest request) {

        if (!hasRole("DOCTOR")) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Only doctors can create medical records.");
        }

        if (request == null || request.getAppointmentId() == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Appointment ID is required.");
        }

        Appointment appointment =
                appointmentRepository
                        .findById(request.getAppointmentId())
                        .orElse(null);

        if (appointment == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Appointment not found.");
        }

        // Doctor can create records only for their own appointment
        if (!isCurrentUser(
                appointment.getDoctor().getEmail())) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You can only create medical records for your own appointments."
                    );
        }

        if (!"COMPLETED".equalsIgnoreCase(
                appointment.getStatus())) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            "Medical record can only be created for a completed appointment."
                    );
        }

        if (medicalRecordRepository
                .existsByAppointment(appointment)) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(
                            "A medical record already exists for this appointment."
                    );
        }

        MedicalRecord medicalRecord =
                new MedicalRecord(
                        appointment,
                        request.getDiagnosis(),
                        request.getSymptoms(),
                        request.getDoctorNotes(),
                        request.getPrescription(),
                        request.getMedicines(),
                        request.getDosage(),
                        request.getFollowUpInstructions()
                );

        MedicalRecord savedRecord =
                medicalRecordRepository.save(medicalRecord);

        // AI failure must not break medical record creation
        try {

            postVisitSummaryService.generateAndSave(
                    savedRecord
            );

        } catch (Exception e) {

            System.err.println(
                    "Post-visit AI summary failed: "
                            + e.getMessage()
            );
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(convertToResponse(savedRecord));
    }

    // =========================================================
    // GET RECORD BY APPOINTMENT
    // =========================================================

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getByAppointment(
            @PathVariable Long appointmentId) {

        Appointment appointment =
                appointmentRepository
                        .findById(appointmentId)
                        .orElse(null);

        if (appointment == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Appointment not found.");
        }

        // Patient can access their own appointment
        boolean patientAccess =
                hasRole("PATIENT")
                        && isCurrentUser(
                        appointment.getPatient().getEmail()
                );

        // Doctor can access their own appointment
        boolean doctorAccess =
                hasRole("DOCTOR")
                        && isCurrentUser(
                        appointment.getDoctor().getEmail()
                );

        if (!patientAccess && !doctorAccess && !hasRole("ADMIN")) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You are not allowed to access this medical record."
                    );
        }

        MedicalRecord record =
                medicalRecordRepository
                        .findByAppointment(appointment)
                        .orElse(null);

        if (record == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "Medical record not found for this appointment."
                    );
        }

        return ResponseEntity.ok(
                convertToResponse(record)
        );
    }

    // =========================================================
    // GET ALL RECORDS OF PATIENT
    // =========================================================

    @GetMapping("/patient/{email}")
    public ResponseEntity<?> getPatientRecords(
            @PathVariable String email) {

        // Patient can only access their own records
        if (!hasRole("PATIENT")
                || !isCurrentUser(email)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You can only access your own medical records."
                    );
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

        List<MedicalRecordResponse> records =
                medicalRecordRepository
                        .findByAppointment_Patient(patient)
                        .stream()
                        .map(this::convertToResponse)
                        .toList();

        return ResponseEntity.ok(records);
    }

    // =========================================================
    // GET ALL RECORDS OF DOCTOR
    // =========================================================

    @GetMapping("/doctor/{email}")
    public ResponseEntity<?> getDoctorRecords(
            @PathVariable String email) {

        // Doctor can only access their own records
        if (!hasRole("DOCTOR")
                || !isCurrentUser(email)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "You can only access your own medical records."
                    );
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

        List<MedicalRecordResponse> records =
                medicalRecordRepository
                        .findByAppointment_Doctor(doctor)
                        .stream()
                        .map(this::convertToResponse)
                        .toList();

        return ResponseEntity.ok(records);
    }

    // =========================================================
    // SECURITY HELPERS
    // =========================================================

    private boolean isCurrentUser(String email) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || email == null) {

            return false;
        }

        return email.equalsIgnoreCase(
                authentication.getName()
        );
    }

    private boolean hasRole(String role) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            return false;
        }

        return authentication
                .getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority()
                                .equals("ROLE_" + role)
                                || authority.getAuthority()
                                .equals(role)
                );
    }

    // =========================================================
    // CONVERT ENTITY → RESPONSE
    // =========================================================

    private MedicalRecordResponse convertToResponse(
            MedicalRecord record) {

        Appointment appointment =
                record.getAppointment();

        User patient =
                appointment.getPatient();

        User doctor =
                appointment.getDoctor();

        MedicalRecordResponse response =
                new MedicalRecordResponse();

        response.setId(record.getId());

        response.setAppointmentId(
                appointment.getId()
        );

        response.setPatientName(
                patient.getName()
        );

        response.setPatientEmail(
                patient.getEmail()
        );

        response.setDoctorName(
                doctor.getName()
        );

        response.setDoctorEmail(
                doctor.getEmail()
        );

        response.setAppointmentDate(
                appointment.getAppointmentDate()
        );

        response.setAppointmentTime(
                appointment.getAppointmentTime()
        );

        response.setDiagnosis(
                record.getDiagnosis()
        );

        response.setSymptoms(
                record.getSymptoms()
        );

        response.setDoctorNotes(
                record.getDoctorNotes()
        );

        response.setPrescription(
                record.getPrescription()
        );

        response.setMedicines(
                record.getMedicines()
        );

        response.setDosage(
                record.getDosage()
        );

        response.setFollowUpInstructions(
                record.getFollowUpInstructions()
        );

        response.setCreatedAt(
                record.getCreatedAt()
        );

        return response;
    }
}