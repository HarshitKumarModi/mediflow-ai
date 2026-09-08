package com.mediflow.backend.controller;

import com.mediflow.backend.entity.Role;
import com.mediflow.backend.entity.User;
import com.mediflow.backend.repository.UserRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorController {

    private final UserRepository userRepository;

    public DoctorController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<User> getDoctors() {

        return userRepository.findByRole(Role.DOCTOR);
    }
}