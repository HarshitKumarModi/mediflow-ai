package com.mediflow.backend.repository;

import com.mediflow.backend.entity.Appointment;
import com.mediflow.backend.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository
        extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatient(User patient);

    List<Appointment> findByDoctor(User doctor);

    long countByStatus(String status);

    boolean existsByDoctorAndAppointmentDateAndAppointmentTimeAndStatusIn(
            User doctor,
            LocalDate appointmentDate,
            LocalTime appointmentTime,
            List<String> statuses
    );
}