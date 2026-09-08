package com.mediflow.backend.service;

import com.mediflow.backend.entity.Medication;
import com.mediflow.backend.entity.MedicationReminder;
import com.mediflow.backend.repository.MedicationReminderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class MedicationReminderService {

    private final MedicationReminderRepository reminderRepository;

    public MedicationReminderService(
            MedicationReminderRepository reminderRepository
    ) {
        this.reminderRepository = reminderRepository;
    }

    // =========================================================
    // CREATE TODAY'S REMINDERS
    // =========================================================

    public void createRemindersForMedication(
            Medication medication
    ) {

        if (medication == null) {
            return;
        }

        if (Boolean.FALSE.equals(medication.getActive())) {
            return;
        }

        LocalDate startDate = medication.getStartDate();

        if (startDate == null) {
            startDate = LocalDate.now();
        }

        LocalDate endDate = medication.getEndDate();

        if (endDate == null) {
            endDate = startDate;
        }

        LocalDate today = LocalDate.now();

        // Do not create reminders before medication starts
        if (today.isBefore(startDate)) {
            return;
        }

        // Do not create reminders after medication ends
        if (today.isAfter(endDate)) {
            return;
        }

        List<LocalTime> reminderTimes =
                getReminderTimes(medication.getFrequency());

        for (LocalTime time : reminderTimes) {

            boolean exists =
                    reminderRepository
                            .findByMedicationAndReminderDateAndReminderTime(
                                    medication,
                                    today,
                                    time
                            )
                            .isPresent();

            if (!exists) {

                MedicationReminder reminder =
                        new MedicationReminder(
                                medication,
                                today,
                                time
                        );

                reminderRepository.save(reminder);
            }
        }
    }

    // =========================================================
    // GENERATE REMINDERS FOR ALL ACTIVE MEDICATIONS
    // =========================================================

    public void generateDailyReminders(
            List<Medication> medications
    ) {

        if (medications == null) {
            return;
        }

        for (Medication medication : medications) {
            createRemindersForMedication(medication);
        }
    }

    // =========================================================
    // FREQUENCY → TIMES
    // =========================================================

    private List<LocalTime> getReminderTimes(
            String frequency
    ) {

        List<LocalTime> times = new ArrayList<>();

        if (frequency == null) {
            times.add(LocalTime.of(9, 0));
            return times;
        }

        String value =
                frequency
                        .trim()
                        .toLowerCase();

        // -----------------------------------------
        // ONCE A DAY
        // -----------------------------------------

        if (
                value.contains("once") ||
                value.contains("daily") ||
                value.equals("1")
        ) {

            times.add(LocalTime.of(9, 0));

            return times;
        }

        // -----------------------------------------
        // TWICE A DAY
        // -----------------------------------------

        if (
                value.contains("twice") ||
                value.contains("2 times") ||
                value.contains("2x") ||
                value.contains("two")
        ) {

            times.add(LocalTime.of(9, 0));
            times.add(LocalTime.of(21, 0));

            return times;
        }

        // -----------------------------------------
        // THREE TIMES A DAY
        // -----------------------------------------

        if (
                value.contains("thrice") ||
                value.contains("three") ||
                value.contains("3 times") ||
                value.contains("3x")
        ) {

            times.add(LocalTime.of(8, 0));
            times.add(LocalTime.of(14, 0));
            times.add(LocalTime.of(20, 0));

            return times;
        }

        // -----------------------------------------
        // FOUR TIMES A DAY
        // -----------------------------------------

        if (
                value.contains("four") ||
                value.contains("4 times") ||
                value.contains("4x")
        ) {

            times.add(LocalTime.of(8, 0));
            times.add(LocalTime.of(12, 0));
            times.add(LocalTime.of(16, 0));
            times.add(LocalTime.of(20, 0));

            return times;
        }

        // -----------------------------------------
        // DEFAULT
        // -----------------------------------------

        times.add(LocalTime.of(9, 0));

        return times;
    }
}