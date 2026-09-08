package com.mediflow.backend.service;

import com.mediflow.backend.dto.RegisterRequest;
import com.mediflow.backend.entity.Role;
import com.mediflow.backend.entity.User;
import com.mediflow.backend.repository.UserRepository;
import com.mediflow.backend.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================
    // REGISTER
    // =========================

    public User register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {

            throw new RuntimeException(
                    "Email already registered"
            );
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // New users always get a BCrypt password
        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setPhone(request.getPhone());

        user.setRole(
                Role.valueOf(
                        request.getRole().toUpperCase()
                )
        );

        user.setCreatedAt(
                LocalDateTime.now()
        );

        return userRepository.save(user);
    }

    // =========================
    // LOGIN
    // =========================

    public Map<String, Object> login(
            String email,
            String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password"
                        )
                );

        String storedPassword = user.getPassword();

        boolean passwordValid = false;

        // =========================
        // CHECK PASSWORD
        // =========================

        if (isBCryptPassword(storedPassword)) {

            // Normal BCrypt verification
            passwordValid = passwordEncoder.matches(
                    password,
                    storedPassword
            );

        } else {

            // =========================
            // LEGACY PASSWORD MIGRATION
            // =========================

            // Existing users created before BCrypt
            // may still have plaintext passwords.
            if (storedPassword != null
                    && storedPassword.equals(password)) {

                passwordValid = true;

                // Immediately upgrade the password
                // to BCrypt after successful login.
                user.setPassword(
                        passwordEncoder.encode(password)
                );

                userRepository.save(user);
            }
        }

        if (!passwordValid) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        // =========================
        // GENERATE JWT
        // =========================

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        // =========================
        // PREPARE RESPONSE
        // =========================

        Map<String, Object> response =
                new HashMap<>();

        response.put("token", token);

        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("phone", user.getPhone());
        response.put("role", user.getRole().name());

        return response;
    }

    // =========================
    // CHECK IF PASSWORD IS BCRYPT
    // =========================

    private boolean isBCryptPassword(String password) {

        if (password == null) {
            return false;
        }

        return password.startsWith("$2a$")
                || password.startsWith("$2b$")
                || password.startsWith("$2y$");
    }
}