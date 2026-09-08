package com.mediflow.backend.repository;

import com.mediflow.backend.entity.Appointment;
import com.mediflow.backend.entity.MedicalRecord;
import com.mediflow.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicalRecordRepository
        extends JpaRepository<MedicalRecord, Long> {

    Optional<MedicalRecord> findByAppointment(Appointment appointment);

    boolean existsByAppointment(Appointment appointment);

    List<MedicalRecord> findByAppointment_Patient(User patient);

    List<MedicalRecord> findByAppointment_Doctor(User doctor);
}