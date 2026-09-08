package com.mediflow.backend.service;

import com.mediflow.backend.dto.PostVisitResponse;
import com.mediflow.backend.dto.PreVisitRequest;
import com.mediflow.backend.dto.PreVisitResponse;
import com.mediflow.backend.entity.MedicalRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class AIService {

    private static final Logger logger =
            LoggerFactory.getLogger(AIService.class);

    private final RestClient restClient;

    public AIService(
            @Value("${ai.service.url:http://127.0.0.1:8000}")
            String aiServiceUrl) {

        this.restClient = RestClient.builder()
                .baseUrl(aiServiceUrl)
                .build();
    }


    // ============================================================
    // PRE-VISIT AI SUMMARY
    // ============================================================

    /**
     * Calls the Python AI service to generate
     * a pre-visit summary from patient symptoms.
     *
     * Returns null if the AI service is unavailable.
     * AI failure must never break the appointment flow.
     */
    public PreVisitResponse generatePreVisitSummary(
            String symptoms
    ) {

        if (symptoms == null || symptoms.trim().isEmpty()) {

            logger.warn(
                    "Cannot generate AI pre-visit summary: symptoms are empty"
            );

            return null;
        }

        try {

            PreVisitRequest request =
                    new PreVisitRequest(symptoms);

            PreVisitResponse response =
                    restClient.post()
                            .uri("/api/ai/pre-visit-summary")
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(request)
                            .retrieve()
                            .body(PreVisitResponse.class);

            logger.info(
                    "AI pre-visit summary generated successfully"
            );

            return response;

        } catch (Exception e) {

            logger.error(
                    "AI pre-visit service unavailable. "
                            + "Appointment flow will continue.",
                    e
            );

            return null;
        }
    }


    // ============================================================
    // POST-VISIT AI SUMMARY
    // ============================================================

    /**
     * Generates a patient-friendly post-visit summary
     * directly from a MedicalRecord.
     *
     * This method is used by PostVisitSummaryService.
     *
     * AI failure must never break the medical-record flow.
     */
    public PostVisitResponse generatePostVisitSummary(
            MedicalRecord medicalRecord
    ) {

        if (medicalRecord == null) {

            logger.warn(
                    "Cannot generate AI post-visit summary: "
                            + "medical record is null"
            );

            return null;
        }

        return generatePostVisitSummary(
                medicalRecord.getDiagnosis(),
                medicalRecord.getDoctorNotes(),
                medicalRecord.getPrescription(),
                medicalRecord.getMedicines(),
                medicalRecord.getDosage(),
                medicalRecord.getFollowUpInstructions()
        );
    }


    // ============================================================
    // POST-VISIT AI SUMMARY
    // ============================================================

    /**
     * Calls the Python AI service to convert
     * doctor's post-visit information into a
     * patient-friendly summary.
     *
     * Returns null if the AI service is unavailable.
     * AI failure must never break the medical-record flow.
     */
    public PostVisitResponse generatePostVisitSummary(
            String diagnosis,
            String doctorNotes,
            String prescription,
            String medicines,
            String dosage,
            String followUpInstructions
    ) {

        if (diagnosis == null || diagnosis.trim().isEmpty()) {

            logger.warn(
                    "Cannot generate AI post-visit summary: "
                            + "diagnosis is empty"
            );

            return null;
        }

        if (doctorNotes == null || doctorNotes.trim().isEmpty()) {

            logger.warn(
                    "Cannot generate AI post-visit summary: "
                            + "doctor notes are empty"
            );

            return null;
        }

        try {

            PostVisitRequest request =
                    new PostVisitRequest(
                            diagnosis,
                            doctorNotes,
                            prescription,
                            medicines,
                            dosage,
                            followUpInstructions
                    );

            PostVisitResponse response =
                    restClient.post()
                            .uri("/api/ai/post-visit-summary")
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(request)
                            .retrieve()
                            .body(PostVisitResponse.class);

            logger.info(
                    "AI post-visit summary generated successfully"
            );

            return response;

        } catch (Exception e) {

            logger.error(
                    "AI post-visit service unavailable. "
                            + "Medical record flow will continue.",
                    e
            );

            return null;
        }
    }


    // ============================================================
    // REQUEST DTO FOR POST-VISIT AI
    // ============================================================

    private static class PostVisitRequest {

        private String diagnosis;
        private String doctorNotes;
        private String prescription;
        private String medicines;
        private String dosage;
        private String followUpInstructions;

        public PostVisitRequest(
                String diagnosis,
                String doctorNotes,
                String prescription,
                String medicines,
                String dosage,
                String followUpInstructions
        ) {

            this.diagnosis = diagnosis;
            this.doctorNotes = doctorNotes;
            this.prescription = prescription;
            this.medicines = medicines;
            this.dosage = dosage;
            this.followUpInstructions = followUpInstructions;
        }

        public String getDiagnosis() {
            return diagnosis;
        }

        public String getDoctorNotes() {
            return doctorNotes;
        }

        public String getPrescription() {
            return prescription;
        }

        public String getMedicines() {
            return medicines;
        }

        public String getDosage() {
            return dosage;
        }

        public String getFollowUpInstructions() {
            return followUpInstructions;
        }
    }
}