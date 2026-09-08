package com.mediflow.backend.repository;

import com.mediflow.backend.entity.MedicalRecord;
import com.mediflow.backend.entity.Medication;
import com.mediflow.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicationRepository
        extends JpaRepository<Medication, Long> {

    List<Medication> findByMedicalRecord_Appointment_Patient(User patient);

    List<Medication> findByMedicalRecord_Appointment_Doctor(User doctor);

    List<Medication> findByMedicalRecord(MedicalRecord medicalRecord);

    Optional<Medication> findByIdAndMedicalRecord_Appointment_Patient(
            Long id,
            User patient
    );
}