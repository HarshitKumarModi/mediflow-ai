package com.mediflow.backend.repository;

import com.mediflow.backend.entity.Medication;
import com.mediflow.backend.entity.MedicationReminder;
import com.mediflow.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface MedicationReminderRepository
        extends JpaRepository<MedicationReminder, Long> {

    List<MedicationReminder> findByMedication_MedicalRecord_Appointment_Patient(
            User patient
    );

    List<MedicationReminder> findByMedication_MedicalRecord_Appointment_PatientAndReminderDate(
            User patient,
            LocalDate reminderDate
    );

    Optional<MedicationReminder> findByMedicationAndReminderDateAndReminderTime(
            Medication medication,
            LocalDate reminderDate,
            LocalTime reminderTime
    );

    List<MedicationReminder> findByReminderDateAndStatus(
            LocalDate reminderDate,
            String status
    );
}