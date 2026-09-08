package com.mediflow.backend.repository;

import com.mediflow.backend.entity.Appointment;
import com.mediflow.backend.entity.PreVisitSummary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PreVisitSummaryRepository
        extends JpaRepository<PreVisitSummary, Long> {

    Optional<PreVisitSummary> findByAppointment(Appointment appointment);

    Optional<PreVisitSummary> findByAppointmentId(Long appointmentId);
}