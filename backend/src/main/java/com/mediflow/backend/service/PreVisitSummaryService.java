package com.mediflow.backend.service;

import com.mediflow.backend.dto.PreVisitResponse;
import com.mediflow.backend.entity.Appointment;
import com.mediflow.backend.entity.PreVisitSummary;
import com.mediflow.backend.repository.PreVisitSummaryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

@Service
public class PreVisitSummaryService {

    private static final Logger logger =
            LoggerFactory.getLogger(PreVisitSummaryService.class);

    private final AIService aiService;
    private final PreVisitSummaryRepository preVisitSummaryRepository;
    private final ObjectMapper objectMapper;

    public PreVisitSummaryService(
            AIService aiService,
            PreVisitSummaryRepository preVisitSummaryRepository,
            ObjectMapper objectMapper
    ) {
        this.aiService = aiService;
        this.preVisitSummaryRepository = preVisitSummaryRepository;
        this.objectMapper = objectMapper;
    }

    public PreVisitSummary generateAndSave(
            Appointment appointment,
            String symptoms
    ) {

        if (appointment == null) {
            logger.warn("Cannot create pre-visit summary: appointment is null");
            return null;
        }

        if (symptoms == null || symptoms.trim().isEmpty()) {
            logger.warn("Cannot create pre-visit summary: symptoms are empty");
            return null;
        }

        try {

            // Check if summary already exists
            var existingSummary =
                    preVisitSummaryRepository.findByAppointment(appointment);

            if (existingSummary.isPresent()) {

                logger.info(
                        "Pre-visit summary already exists for appointment {}",
                        appointment.getId()
                );

                return existingSummary.get();
            }

            // Call Python AI service
            PreVisitResponse aiResponse =
                    aiService.generatePreVisitSummary(symptoms);

            // AI unavailable
            if (aiResponse == null) {

                logger.warn(
                        "AI summary could not be generated for appointment {}",
                        appointment.getId()
                );

                return null;
            }

            // Convert suggested questions to JSON
            String suggestedQuestionsJson =
                    objectMapper.writeValueAsString(
                            aiResponse.getSuggestedQuestions()
                    );

            // Create entity
            PreVisitSummary summary = new PreVisitSummary(
                    appointment,
                    aiResponse.getUrgency(),
                    aiResponse.getChiefComplaint(),
                    aiResponse.getSummary(),
                    suggestedQuestionsJson
            );

            // Save to PostgreSQL
            PreVisitSummary saved =
                    preVisitSummaryRepository.save(summary);

            logger.info(
                    "Pre-visit summary saved successfully for appointment {}",
                    appointment.getId()
            );

            return saved;

        } catch (Exception e) {

            logger.error(
                    "Failed to save pre-visit summary. Appointment flow will continue.",
                    e
            );

            return null;
        }
    }
}