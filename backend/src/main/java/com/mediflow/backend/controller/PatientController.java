package com.mediflow.backend.controller;

import com.mediflow.backend.dto.PatientResponse;
import com.mediflow.backend.entity.Role;
import com.mediflow.backend.entity.User;
import com.mediflow.backend.repository.UserRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:5173")
public class PatientController {

    private final UserRepository userRepository;

    public PatientController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<PatientResponse> getPatients() {

        return userRepository.findByRole(Role.PATIENT)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private PatientResponse convertToResponse(User user) {

        return new PatientResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                user.getCreatedAt() != null
                        ? user.getCreatedAt().toString()
                        : null
        );
    }
}