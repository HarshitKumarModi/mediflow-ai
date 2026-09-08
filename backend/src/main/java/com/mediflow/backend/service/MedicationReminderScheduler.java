package com.mediflow.backend.service;

import com.mediflow.backend.entity.Medication;
import com.mediflow.backend.repository.MedicationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MedicationReminderScheduler {

    private final MedicationRepository medicationRepository;
    private final MedicationReminderService reminderService;

    public MedicationReminderScheduler(
            MedicationRepository medicationRepository,
            MedicationReminderService reminderService
    ) {
        this.medicationRepository = medicationRepository;
        this.reminderService = reminderService;
    }

    // =========================================================
    // RUN EVERY DAY AT 12:05 AM
    // =========================================================

    @Scheduled(
            cron = "0 5 0 * * *",
            zone = "Asia/Kolkata"
    )
    public void generateDailyMedicationReminders() {

        List<Medication> medications =
                medicationRepository.findAll();

        reminderService.generateDailyReminders(
                medications
        );
    }
}