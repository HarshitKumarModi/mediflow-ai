package com.mediflow.backend.service;

import com.mediflow.backend.dto.PostVisitResponse;
import com.mediflow.backend.entity.Appointment;
import com.mediflow.backend.entity.MedicalRecord;
import com.mediflow.backend.entity.PostVisitSummary;
import com.mediflow.backend.repository.PostVisitSummaryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

@Service
public class PostVisitSummaryService {

    private static final Logger logger =
            LoggerFactory.getLogger(PostVisitSummaryService.class);

    private final AIService aiService;
    private final PostVisitSummaryRepository postVisitSummaryRepository;
    private final ObjectMapper objectMapper;

    public PostVisitSummaryService(
            AIService aiService,
            PostVisitSummaryRepository postVisitSummaryRepository,
            ObjectMapper objectMapper
    ) {
        this.aiService = aiService;
        this.postVisitSummaryRepository = postVisitSummaryRepository;
        this.objectMapper = objectMapper;
    }

    // =========================================================
    // GENERATE AND SAVE POST-VISIT SUMMARY
    // =========================================================

    public PostVisitSummary generateAndSave(
            MedicalRecord medicalRecord
    ) {

        // ---------------------------------------------------------
        // VALIDATE MEDICAL RECORD
        // ---------------------------------------------------------

        if (medicalRecord == null) {

            logger.warn(
                    "Cannot generate post-visit summary: medical record is null"
            );

            return null;
        }

        Appointment appointment =
                medicalRecord.getAppointment();

        if (appointment == null) {

            logger.warn(
                    "Cannot generate post-visit summary: appointment is null"
            );

            return null;
        }


        try {

            // -----------------------------------------------------
            // CHECK IF SUMMARY ALREADY EXISTS
            // -----------------------------------------------------

            var existingSummary =
                    postVisitSummaryRepository
                            .findByAppointment(appointment);

            if (existingSummary.isPresent()) {

                logger.info(
                        "Post-visit summary already exists for appointment {}",
                        appointment.getId()
                );

                return existingSummary.get();
            }


            // -----------------------------------------------------
            // CALL AI SERVICE
            // -----------------------------------------------------

            PostVisitResponse aiResponse =
                    aiService.generatePostVisitSummary(
                            medicalRecord.getDiagnosis(),
                            medicalRecord.getDoctorNotes(),
                            medicalRecord.getPrescription(),
                            medicalRecord.getMedicines(),
                            medicalRecord.getDosage(),
                            medicalRecord.getFollowUpInstructions()
                    );


            // -----------------------------------------------------
            // AI SERVICE FAILED
            // -----------------------------------------------------

            if (aiResponse == null) {

                logger.warn(
                        "AI post-visit summary could not be generated "
                                + "for appointment {}",
                        appointment.getId()
                );

                return null;
            }


            // -----------------------------------------------------
            // CONVERT LISTS TO JSON
            // -----------------------------------------------------

            String medicationScheduleJson =
                    objectMapper.writeValueAsString(
                            aiResponse.getMedicationSchedule()
                    );

            String followUpStepsJson =
                    objectMapper.writeValueAsString(
                            aiResponse.getFollowUpSteps()
                    );

            String importantNotesJson =
                    objectMapper.writeValueAsString(
                            aiResponse.getImportantNotes()
                    );


            // -----------------------------------------------------
            // CREATE POST-VISIT SUMMARY ENTITY
            // -----------------------------------------------------

            PostVisitSummary summary =
                    new PostVisitSummary(
                            appointment,
                            aiResponse.getSummary(),
                            medicationScheduleJson,
                            followUpStepsJson,
                            importantNotesJson
                    );


            // -----------------------------------------------------
            // SAVE TO DATABASE
            // -----------------------------------------------------

            PostVisitSummary saved =
                    postVisitSummaryRepository.save(summary);

            logger.info(
                    "Post-visit AI summary saved successfully "
                            + "for appointment {}",
                    appointment.getId()
            );

            return saved;

        } catch (Exception e) {

            logger.error(
                    "Failed to generate/save post-visit summary. "
                            + "Medical record flow will continue.",
                    e
            );

            return null;
        }
    }
}