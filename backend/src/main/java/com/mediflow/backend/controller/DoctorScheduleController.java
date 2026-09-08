package com.mediflow.backend.controller;

import com.mediflow.backend.entity.DoctorSchedule;
import com.mediflow.backend.entity.User;
import com.mediflow.backend.repository.DoctorScheduleRepository;
import com.mediflow.backend.repository.UserRepository;
import com.mediflow.backend.security.JwtService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorScheduleController {

    private final DoctorScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public DoctorScheduleController(
            DoctorScheduleRepository scheduleRepository,
            UserRepository userRepository,
            JwtService jwtService) {

        this.scheduleRepository = scheduleRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    // =========================================================
    // GET DOCTOR SCHEDULE
    // GET /api/schedules/doctor/{email}
    //
    // Kept accessible because patients need doctor schedules
    // while booking an appointment.
    // =========================================================

    @GetMapping("/doctor/{email}")
    public ResponseEntity<?> getDoctorSchedule(
            @PathVariable String email) {

        User doctor = userRepository
                .findByEmail(email)
                .orElse(null);

        if (doctor == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Doctor not found.");
        }

        return ResponseEntity.ok(
                scheduleRepository.findByDoctor(doctor)
        );
    }

    // =========================================================
    // CREATE DOCTOR SCHEDULE
    // POST /api/schedules
    //
    // Only the logged-in doctor can create their own schedule.
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createSchedule(
            @RequestParam String doctorEmail,
            @RequestParam String dayOfWeek,
            @RequestParam String startTime,
            @RequestParam String endTime,
            HttpServletRequest request) {

        // -----------------------------------------------------
        // AUTHENTICATION
        // -----------------------------------------------------

        String authenticatedEmail =
                getAuthenticatedEmail(request);

        if (authenticatedEmail == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required.");
        }

        // -----------------------------------------------------
        // ROLE CHECK
        // -----------------------------------------------------

        String role = getAuthenticatedRole(request);

        if (!"DOCTOR".equalsIgnoreCase(role)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Only doctors can create schedules.");
        }

        // -----------------------------------------------------
        // OWNERSHIP CHECK
        // -----------------------------------------------------

        if (!authenticatedEmail.equalsIgnoreCase(doctorEmail)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You can only create a schedule for yourself.");
        }

        // -----------------------------------------------------
        // FIND DOCTOR
        // -----------------------------------------------------

        User doctor = userRepository
                .findByEmail(doctorEmail)
                .orElse(null);

        if (doctor == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Doctor not found.");
        }

        // -----------------------------------------------------
        // VALIDATE DAY
        // -----------------------------------------------------

        DayOfWeek requestedDay;

        try {
            requestedDay = DayOfWeek.valueOf(
                    dayOfWeek.toUpperCase()
            );
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body("Invalid day of week.");
        }

        // -----------------------------------------------------
        // VALIDATE TIME
        // -----------------------------------------------------

        LocalTime parsedStartTime;
        LocalTime parsedEndTime;

        try {
            parsedStartTime = LocalTime.parse(startTime);
            parsedEndTime = LocalTime.parse(endTime);
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body("Invalid time format.");
        }

        if (!parsedStartTime.isBefore(parsedEndTime)) {
            return ResponseEntity
                    .badRequest()
                    .body("End time must be after start time.");
        }

        // -----------------------------------------------------
        // PREVENT DUPLICATE DAY
        // -----------------------------------------------------

        List<DoctorSchedule> existingSchedules =
                scheduleRepository.findByDoctor(doctor);

        boolean alreadyExists =
                existingSchedules.stream()
                        .anyMatch(schedule ->
                                schedule.getDayOfWeek()
                                        == requestedDay
                        );

        if (alreadyExists) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("A working schedule already exists for this day.");
        }

        // -----------------------------------------------------
        // CREATE SCHEDULE
        // -----------------------------------------------------

        DoctorSchedule schedule = new DoctorSchedule();

        schedule.setDoctor(doctor);
        schedule.setDayOfWeek(requestedDay);
        schedule.setStartTime(parsedStartTime);
        schedule.setEndTime(parsedEndTime);

        DoctorSchedule savedSchedule =
                scheduleRepository.save(schedule);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedSchedule);
    }

    // =========================================================
    // DELETE DOCTOR SCHEDULE
    // DELETE /api/schedules/{id}
    //
    // Only the doctor who owns the schedule can delete it.
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSchedule(
            @PathVariable Long id,
            HttpServletRequest request) {

        // -----------------------------------------------------
        // AUTHENTICATION
        // -----------------------------------------------------

        String authenticatedEmail =
                getAuthenticatedEmail(request);

        if (authenticatedEmail == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required.");
        }

        // -----------------------------------------------------
        // ROLE CHECK
        // -----------------------------------------------------

        String role = getAuthenticatedRole(request);

        if (!"DOCTOR".equalsIgnoreCase(role)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Only doctors can delete schedules.");
        }

        // -----------------------------------------------------
        // FIND SCHEDULE
        // -----------------------------------------------------

        DoctorSchedule schedule =
                scheduleRepository.findById(id).orElse(null);

        if (schedule == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Schedule not found.");
        }

        // -----------------------------------------------------
        // OWNERSHIP CHECK
        // -----------------------------------------------------

        User scheduleDoctor =
                schedule.getDoctor();

        if (scheduleDoctor == null
                || scheduleDoctor.getEmail() == null
                || !scheduleDoctor.getEmail()
                        .equalsIgnoreCase(authenticatedEmail)) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You can only delete your own schedule.");
        }

        // -----------------------------------------------------
        // DELETE
        // -----------------------------------------------------

        scheduleRepository.delete(schedule);

        return ResponseEntity.ok(
                "Schedule deleted successfully."
        );
    }

    // =========================================================
    // JWT HELPER
    // =========================================================

    private String getAuthenticatedEmail(
            HttpServletRequest request) {

        String authHeader =
                request.getHeader("Authorization");

        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {

            return null;
        }

        String token =
                authHeader.substring(7);

        try {

            if (!jwtService.isTokenValid(token)) {
                return null;
            }

            return jwtService.extractEmail(token);

        } catch (Exception e) {
            return null;
        }
    }

    // =========================================================
    // JWT ROLE HELPER
    // =========================================================

    private String getAuthenticatedRole(
            HttpServletRequest request) {

        String authHeader =
                request.getHeader("Authorization");

        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {

            return null;
        }

        String token =
                authHeader.substring(7);

        try {

            if (!jwtService.isTokenValid(token)) {
                return null;
            }

            return jwtService.extractRole(token);

        } catch (Exception e) {
            return null;
        }
    }
}