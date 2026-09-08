package com.mediflow.backend.controller;

import com.mediflow.backend.entity.Appointment;
import com.mediflow.backend.entity.PreVisitSummary;
import com.mediflow.backend.repository.AppointmentRepository;
import com.mediflow.backend.repository.PreVisitSummaryRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pre-visit-summaries")
@CrossOrigin(origins = "http://localhost:5173")
public class PreVisitSummaryController {

    private final PreVisitSummaryRepository preVisitSummaryRepository;
    private final AppointmentRepository appointmentRepository;
    private final ObjectMapper objectMapper;

    public PreVisitSummaryController(
            PreVisitSummaryRepository preVisitSummaryRepository,
            AppointmentRepository appointmentRepository,
            ObjectMapper objectMapper
    ) {
        this.preVisitSummaryRepository = preVisitSummaryRepository;
        this.appointmentRepository = appointmentRepository;
        this.objectMapper = objectMapper;
    }


    // =========================================================
    // GET PRE-VISIT SUMMARY BY APPOINTMENT
    // =========================================================

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getPreVisitSummary(
            @PathVariable Long appointmentId) {

        // -----------------------------------------------------
        // FIND APPOINTMENT
        // -----------------------------------------------------

        Appointment appointment =
                appointmentRepository
                        .findById(appointmentId)
                        .orElse(null);

        if (appointment == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Appointment not found.");
        }


        // -----------------------------------------------------
        // FIND PRE-VISIT SUMMARY
        // -----------------------------------------------------

        PreVisitSummary summary =
                preVisitSummaryRepository
                        .findByAppointment(appointment)
                        .orElse(null);

        if (summary == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "Pre-visit summary is not available for this appointment."
                    );
        }


        // -----------------------------------------------------
        // PARSE SUGGESTED QUESTIONS
        // -----------------------------------------------------

        List<String> suggestedQuestions;

        try {

            if (summary.getSuggestedQuestions() == null
                    || summary.getSuggestedQuestions().isBlank()) {

                suggestedQuestions = List.of();

            } else {

                suggestedQuestions =
                        objectMapper.readValue(
                                summary.getSuggestedQuestions(),
                                List.class
                        );
            }

        } catch (Exception e) {

            suggestedQuestions = List.of();
        }


        // -----------------------------------------------------
        // BUILD RESPONSE
        // -----------------------------------------------------

        Map<String, Object> response =
                Map.of(
                        "id",
                        summary.getId(),

                        "appointmentId",
                        appointment.getId(),

                        "urgency",
                        summary.getUrgency() != null
                                ? summary.getUrgency()
                                : "Medium",

                        "chiefComplaint",
                        summary.getChiefComplaint() != null
                                ? summary.getChiefComplaint()
                                : "",

                        "summary",
                        summary.getSummary() != null
                                ? summary.getSummary()
                                : "",

                        "suggestedQuestions",
                        suggestedQuestions,

                        "createdAt",
                        summary.getCreatedAt() != null
                                ? summary.getCreatedAt().toString()
                                : null
                );


        // -----------------------------------------------------
        // RETURN RESPONSE
        // -----------------------------------------------------

        return ResponseEntity.ok(response);
    }
}