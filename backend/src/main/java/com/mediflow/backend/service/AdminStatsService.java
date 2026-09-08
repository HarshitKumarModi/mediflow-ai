package com.mediflow.backend.service;

import com.mediflow.backend.dto.AdminStats;
import com.mediflow.backend.entity.Role;
import com.mediflow.backend.repository.AppointmentRepository;
import com.mediflow.backend.repository.UserRepository;

import org.springframework.stereotype.Service;

@Service
public class AdminStatsService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;


    public AdminStatsService(
            UserRepository userRepository,
            AppointmentRepository appointmentRepository) {

        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
    }


    public AdminStats getStats() {

        long totalPatients =
                userRepository.findByRole(Role.PATIENT).size();

        long totalDoctors =
                userRepository.findByRole(Role.DOCTOR).size();

        long totalAppointments =
                appointmentRepository.count();


        long confirmedAppointments =
                appointmentRepository.countByStatus("CONFIRMED");

        long pendingAppointments =
                appointmentRepository.countByStatus("PENDING");

        long rejectedAppointments =
                appointmentRepository.countByStatus("REJECTED");

        long completedAppointments =
                appointmentRepository.countByStatus("COMPLETED");


        int completionRate = 0;

        if (totalAppointments > 0) {

            completionRate =
                    (int) ((completedAppointments * 100) / totalAppointments);
        }


        return new AdminStats(
                totalPatients,
                totalDoctors,
                totalAppointments,
                completionRate,
                confirmedAppointments,
                pendingAppointments,
                rejectedAppointments,
                completedAppointments
        );
    }
}