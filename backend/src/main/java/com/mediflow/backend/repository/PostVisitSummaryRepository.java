package com.mediflow.backend.repository;

import com.mediflow.backend.entity.Appointment;
import com.mediflow.backend.entity.PostVisitSummary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostVisitSummaryRepository
        extends JpaRepository<PostVisitSummary, Long> {

    Optional<PostVisitSummary> findByAppointment(Appointment appointment);

    Optional<PostVisitSummary> findByAppointmentId(Long appointmentId);
}