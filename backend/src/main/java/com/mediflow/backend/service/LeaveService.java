package com.mediflow.backend.service;

import com.mediflow.backend.entity.Leave;
import com.mediflow.backend.entity.User;
import com.mediflow.backend.repository.LeaveRepository;
import com.mediflow.backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final UserRepository userRepository;

    public LeaveService(
            LeaveRepository leaveRepository,
            UserRepository userRepository) {

        this.leaveRepository = leaveRepository;
        this.userRepository = userRepository;
    }

    public Leave applyLeave(
            String doctorEmail,
            LocalDate fromDate,
            LocalDate toDate,
            String reason) {

        User doctor = userRepository
                .findByEmail(doctorEmail)
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found"));

        Leave leave = new Leave(
                doctor,
                fromDate,
                toDate,
                reason,
                "PENDING",
                LocalDateTime.now()
        );

        return leaveRepository.save(leave);
    }

    public List<Leave> getDoctorLeaves(String doctorEmail) {

        User doctor = userRepository
                .findByEmail(doctorEmail)
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found"));

        return leaveRepository.findByDoctor(doctor);
    }

    public Leave updateLeaveStatus(Long id, String status) {

        Leave leave = leaveRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Leave request not found"));

        leave.setStatus(status);

        return leaveRepository.save(leave);
    }

    public List<Leave> getPendingLeaves() {

        return leaveRepository.findByStatus("PENDING");

    }
}