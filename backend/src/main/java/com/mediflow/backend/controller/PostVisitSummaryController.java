package com.mediflow.backend.controller;

import com.mediflow.backend.entity.MedicalRecord;
import com.mediflow.backend.entity.PostVisitSummary;
import com.mediflow.backend.repository.MedicalRecordRepository;
import com.mediflow.backend.repository.PostVisitSummaryRepository;
import com.mediflow.backend.service.PostVisitSummaryService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/post-visit-summaries")
@CrossOrigin(origins = "http://localhost:5173")
public class PostVisitSummaryController {

    private final PostVisitSummaryService postVisitSummaryService;
    private final PostVisitSummaryRepository postVisitSummaryRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    public PostVisitSummaryController(
            PostVisitSummaryService postVisitSummaryService,
            PostVisitSummaryRepository postVisitSummaryRepository,
            MedicalRecordRepository medicalRecordRepository
    ) {
        this.postVisitSummaryService = postVisitSummaryService;
        this.postVisitSummaryRepository = postVisitSummaryRepository;
        this.medicalRecordRepository = medicalRecordRepository;
    }

    // =========================================================
    // GENERATE POST-VISIT AI SUMMARY
    // =========================================================

    @PostMapping("/medical-record/{medicalRecordId}")
    public ResponseEntity<?> generatePostVisitSummary(
            @PathVariable Long medicalRecordId
    ) {

        // -----------------------------------------------------
        // FIND MEDICAL RECORD
        // -----------------------------------------------------

        MedicalRecord medicalRecord =
                medicalRecordRepository
                        .findById(medicalRecordId)
                        .orElse(null);

        if (medicalRecord == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Medical record not found.");
        }

        // -----------------------------------------------------
        // CHECK IF SUMMARY ALREADY EXISTS
        // -----------------------------------------------------

        PostVisitSummary existingSummary =
                postVisitSummaryRepository
                        .findByAppointment(
                                medicalRecord.getAppointment()
                        )
                        .orElse(null);

        if (existingSummary != null) {
            return ResponseEntity.ok(existingSummary);
        }

        // -----------------------------------------------------
        // GENERATE AND SAVE AI SUMMARY
        // -----------------------------------------------------

        PostVisitSummary summary =
                postVisitSummaryService.generateAndSave(
                        medicalRecord
                );

        // -----------------------------------------------------
        // AI FAILURE
        // -----------------------------------------------------

        if (summary == null) {
            return ResponseEntity
                    .status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(
                            "Unable to generate post-visit AI summary. " +
                            "The medical record was saved successfully."
                    );
        }

        // -----------------------------------------------------
        // SUCCESS
        // -----------------------------------------------------

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(summary);
    }

    // =========================================================
    // GET POST-VISIT SUMMARY BY MEDICAL RECORD
    // =========================================================

    @GetMapping("/medical-record/{medicalRecordId}")
    public ResponseEntity<?> getPostVisitSummary(
            @PathVariable Long medicalRecordId
    ) {

        // -----------------------------------------------------
        // FIND MEDICAL RECORD
        // -----------------------------------------------------

        MedicalRecord medicalRecord =
                medicalRecordRepository
                        .findById(medicalRecordId)
                        .orElse(null);

        if (medicalRecord == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Medical record not found.");
        }

        // -----------------------------------------------------
        // FIND SUMMARY
        // -----------------------------------------------------

        PostVisitSummary summary =
                postVisitSummaryRepository
                        .findByAppointment(
                                medicalRecord.getAppointment()
                        )
                        .orElse(null);

        if (summary == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "Post-visit AI summary not found."
                    );
        }

        return ResponseEntity.ok(summary);
    }

    // =========================================================
    // GET POST-VISIT SUMMARY BY APPOINTMENT
    // =========================================================

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getByAppointment(
            @PathVariable Long appointmentId
    ) {

        PostVisitSummary summary =
                postVisitSummaryRepository
                        .findByAppointmentId(appointmentId)
                        .orElse(null);

        if (summary == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "Post-visit AI summary not found."
                    );
        }

        return ResponseEntity.ok(summary);
    }
}