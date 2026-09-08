package com.mediflow.backend.controller;

import com.mediflow.backend.dto.AppointmentRequest;
import com.mediflow.backend.dto.AppointmentResponse;
import com.mediflow.backend.entity.Appointment;
import com.mediflow.backend.entity.DoctorSchedule;
import com.mediflow.backend.entity.Leave;
import com.mediflow.backend.entity.User;
import com.mediflow.backend.repository.AppointmentRepository;
import com.mediflow.backend.repository.DoctorScheduleRepository;
import com.mediflow.backend.repository.LeaveRepository;
import com.mediflow.backend.repository.UserRepository;
import com.mediflow.backend.service.AppointmentNotificationService;
import com.mediflow.backend.service.PreVisitSummaryService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")

public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final LeaveRepository leaveRepository;
    private final AppointmentNotificationService notificationService;
    private final PreVisitSummaryService preVisitSummaryService;

    public AppointmentController(
            AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            DoctorScheduleRepository doctorScheduleRepository,
            LeaveRepository leaveRepository,
            AppointmentNotificationService notificationService,
            PreVisitSummaryService preVisitSummaryService) {

        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.doctorScheduleRepository = doctorScheduleRepository;
        this.leaveRepository = leaveRepository;
        this.notificationService = notificationService;
        this.preVisitSummaryService = preVisitSummaryService;
    }

    // =========================================================
    // GET PATIENT APPOINTMENTS
    // =========================================================

    @GetMapping("/patient/{email}")
    public ResponseEntity<?> getPatientAppointments(
            @PathVariable String email) {

        if (!isCurrentUser(email)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You are not allowed to access these appointments.");
        }

        User patient =
                userRepository.findByEmail(email).orElse(null);

        if (patient == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Patient not found.");
        }

        return ResponseEntity.ok(
                appointmentRepository.findByPatient(patient)
        );
    }

    // =========================================================
    // GET DOCTOR APPOINTMENTS
    // =========================================================

    @GetMapping("/doctor/{email}")
    public ResponseEntity<?> getDoctorAppointments(
            @PathVariable String email) {

        if (!isCurrentUser(email)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You are not allowed to access these appointments.");
        }

        User doctor =
                userRepository.findByEmail(email).orElse(null);

        if (doctor == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Doctor not found.");
        }

        return ResponseEntity.ok(
                appointmentRepository.findByDoctor(doctor)
        );
    }

    // =========================================================
    // BOOK APPOINTMENT
    // =========================================================

    @PostMapping
    public ResponseEntity<?> bookAppointment(
            @RequestBody AppointmentRequest request) {

        // Only patients can book appointments
        if (!hasRole("PATIENT")) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Only patients can book appointments.");
        }

        // -----------------------------------------------------
        // CHECK REQUEST
        // -----------------------------------------------------

        if (request == null
                || request.getPatientEmail() == null
                || request.getDoctorEmail() == null
                || request.getAppointmentDate() == null
                || request.getAppointmentTime() == null
                || request.getPatientEmail().isBlank()
                || request.getDoctorEmail().isBlank()
                || request.getAppointmentDate().isBlank()
                || request.getAppointmentTime().isBlank()) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("All appointment fields are required.");
        }

        // -----------------------------------------------------
        // VERIFY LOGGED-IN PATIENT
        // -----------------------------------------------------

        if (!isCurrentUser(request.getPatientEmail())) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You can only book appointments for yourself.");
        }

        // -----------------------------------------------------
        // CHECK SYMPTOMS
        // -----------------------------------------------------

        if (request.getSymptoms() == null
                || request.getSymptoms().isBlank()) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Symptoms are required before booking an appointment.");
        }

        // -----------------------------------------------------
        // FIND PATIENT
        // -----------------------------------------------------

        User patient =
                userRepository
                        .findByEmail(request.getPatientEmail())
                        .orElse(null);

        // -----------------------------------------------------
        // FIND DOCTOR
        // -----------------------------------------------------

        User doctor =
                userRepository
                        .findByEmail(request.getDoctorEmail())
                        .orElse(null);

        // -----------------------------------------------------
        // CHECK PATIENT / DOCTOR
        // -----------------------------------------------------

        if (patient == null || doctor == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Patient or doctor not found.");
        }

        // -----------------------------------------------------
        // VERIFY TARGET USER IS A DOCTOR
        // -----------------------------------------------------

        if (doctor.getRole() == null
                || !"DOCTOR".equalsIgnoreCase(
                        doctor.getRole().name())) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Selected user is not a doctor.");
        }

        // -----------------------------------------------------
        // PARSE DATE AND TIME
        // -----------------------------------------------------

        LocalDate appointmentDate;
        LocalTime appointmentTime;

        try {

            appointmentDate =
                    LocalDate.parse(
                            request.getAppointmentDate()
                    );

            appointmentTime =
                    LocalTime.parse(
                            request.getAppointmentTime()
                    );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Invalid date or time format.");
        }

        // -----------------------------------------------------
        // CHECK PAST DATE
        // -----------------------------------------------------

        if (appointmentDate.isBefore(LocalDate.now())) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Appointment date cannot be in the past.");
        }

        // -----------------------------------------------------
        // CHECK PAST TIME
        // -----------------------------------------------------

        if (appointmentDate.equals(LocalDate.now())
                && appointmentTime.isBefore(LocalTime.now())) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Appointment time must be in the future.");
        }

        // -----------------------------------------------------
        // CHECK DOCTOR LEAVE
        // -----------------------------------------------------

        List<Leave> leaves =
                leaveRepository.findByDoctor(doctor);

        for (Leave leave : leaves) {

            if (!"APPROVED".equalsIgnoreCase(
                    leave.getStatus())) {
                continue;
            }

            LocalDate fromDate =
                    leave.getFromDate();

            LocalDate toDate =
                    leave.getToDate();

            if (fromDate != null
                    && toDate != null
                    && !appointmentDate.isBefore(fromDate)
                    && !appointmentDate.isAfter(toDate)) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                "Doctor is on approved leave on the selected date."
                        );
            }
        }

        // -----------------------------------------------------
        // CHECK DOCTOR SCHEDULE
        // -----------------------------------------------------

        DayOfWeek requestedDay =
                appointmentDate.getDayOfWeek();

        List<DoctorSchedule> schedules =
                doctorScheduleRepository.findByDoctor(doctor);

        boolean validSchedule = false;

        for (DoctorSchedule schedule : schedules) {

            if (schedule.getDayOfWeek() == requestedDay) {

                LocalTime startTime =
                        schedule.getStartTime();

                LocalTime endTime =
                        schedule.getEndTime();

                if (startTime != null
                        && endTime != null
                        && !appointmentTime.isBefore(startTime)
                        && !appointmentTime.isAfter(endTime)) {

                    validSchedule = true;
                    break;
                }
            }
        }

        if (!validSchedule) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            "Doctor is not available at the selected date and time."
                    );
        }

        // -----------------------------------------------------
        // CHECK DUPLICATE SLOT
        // -----------------------------------------------------

        boolean alreadyBooked =
                appointmentRepository
                        .existsByDoctorAndAppointmentDateAndAppointmentTimeAndStatusIn(
                                doctor,
                                appointmentDate,
                                appointmentTime,
                                List.of(
                                        "PENDING",
                                        "CONFIRMED"
                                )
                        );

        if (alreadyBooked) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(
                            "This appointment slot is already booked."
                    );
        }

        // -----------------------------------------------------
        // CREATE APPOINTMENT
        // -----------------------------------------------------

        Appointment appointment =
                new Appointment(
                        patient,
                        doctor,
                        appointmentDate,
                        appointmentTime,
                        "PENDING",
                        LocalDateTime.now()
                );

        // -----------------------------------------------------
        // SAVE APPOINTMENT
        // -----------------------------------------------------

        Appointment savedAppointment =
                appointmentRepository.save(appointment);

        // =====================================================
        // GENERATE AI PRE-VISIT SUMMARY
        // =====================================================

        preVisitSummaryService.generateAndSave(
                savedAppointment,
                request.getSymptoms()
        );

        // -----------------------------------------------------
        // SEND BOOKING NOTIFICATIONS
        // -----------------------------------------------------

        try {

            notificationService.sendBookingNotification(
                    savedAppointment
            );

        } catch (Exception e) {

            System.out.println(
                    "Booking notification failed: "
                            + e.getMessage()
            );
        }

        // -----------------------------------------------------
        // RETURN SUCCESS
        // -----------------------------------------------------

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedAppointment);
    }

    // =========================================================
    // ACCEPT APPOINTMENT
    // =========================================================

    @PutMapping("/{id}/accept")
    public ResponseEntity<?> acceptAppointment(
            @PathVariable Long id) {

        Appointment appointment =
                appointmentRepository
                        .findById(id)
                        .orElse(null);

        if (appointment == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Appointment not found.");
        }

        if (!isCurrentUser(
                appointment.getDoctor().getEmail())) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You can only accept your own appointments.");
        }

        if (!hasRole("DOCTOR")) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Only doctors can accept appointments.");
        }

        appointment.setStatus("CONFIRMED");

        Appointment updatedAppointment =
                appointmentRepository.save(appointment);

        try {

            notificationService.sendAcceptanceNotification(
                    updatedAppointment
            );

        } catch (Exception e) {

            System.out.println(
                    "Acceptance notification failed: "
                            + e.getMessage()
            );
        }

        return ResponseEntity.ok(
                updatedAppointment
        );
    }

    // =========================================================
    // REJECT APPOINTMENT
    // =========================================================

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectAppointment(
            @PathVariable Long id) {

        Appointment appointment =
                appointmentRepository
                        .findById(id)
                        .orElse(null);

        if (appointment == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Appointment not found.");
        }

        if (!hasRole("DOCTOR")) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Only doctors can reject appointments.");
        }

        if (!isCurrentUser(
                appointment.getDoctor().getEmail())) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You can only reject your own appointments.");
        }

        appointment.setStatus("REJECTED");

        Appointment updatedAppointment =
                appointmentRepository.save(appointment);

        try {

            notificationService.sendRejectionNotification(
                    updatedAppointment
            );

        } catch (Exception e) {

            System.out.println(
                    "Rejection notification failed: "
                            + e.getMessage()
            );
        }

        return ResponseEntity.ok(
                updatedAppointment
        );
    }

    // =========================================================
    // COMPLETE APPOINTMENT
    // =========================================================

    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeAppointment(
            @PathVariable Long id) {

        Appointment appointment =
                appointmentRepository
                        .findById(id)
                        .orElse(null);

        if (appointment == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Appointment not found.");
        }

        if (!hasRole("DOCTOR")) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Only doctors can complete appointments.");
        }

        if (!isCurrentUser(
                appointment.getDoctor().getEmail())) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You can only complete your own appointments.");
        }

        appointment.setStatus("COMPLETED");

        return ResponseEntity.ok(
                appointmentRepository.save(appointment)
        );
    }

    // =========================================================
    // CANCEL APPOINTMENT
    // =========================================================

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelAppointment(
            @PathVariable Long id) {

        Appointment appointment =
                appointmentRepository
                        .findById(id)
                        .orElse(null);

        if (appointment == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Appointment not found.");
        }

        // Only the patient who owns the appointment
        // can cancel it.
        if (!hasRole("PATIENT")) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Only patients can cancel appointments.");
        }

        if (!isCurrentUser(
                appointment.getPatient().getEmail())) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You can only cancel your own appointments.");
        }

        String currentStatus =
                appointment.getStatus();

        // -----------------------------------------------------
        // ONLY PENDING / CONFIRMED CAN BE CANCELLED
        // -----------------------------------------------------

        if (!"PENDING".equalsIgnoreCase(currentStatus)
                && !"CONFIRMED".equalsIgnoreCase(currentStatus)) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            "Only pending or confirmed appointments can be cancelled."
                    );
        }

        appointment.setStatus("CANCELLED");

        Appointment updatedAppointment =
                appointmentRepository.save(appointment);

        try {

            notificationService.sendCancellationNotification(
                    updatedAppointment,
                    "Patient"
            );

        } catch (Exception e) {

            System.out.println(
                    "Cancellation notification failed: "
                            + e.getMessage()
            );
        }

        return ResponseEntity.ok(
                updatedAppointment
        );
    }

    // =========================================================
    // RESCHEDULE APPOINTMENT
    // =========================================================

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<?> rescheduleAppointment(
            @PathVariable Long id,
            @RequestParam String appointmentDate,
            @RequestParam String appointmentTime) {

        Appointment appointment =
                appointmentRepository
                        .findById(id)
                        .orElse(null);

        if (appointment == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Appointment not found.");
        }

        // Only the patient who owns the appointment
        // can reschedule it.
        if (!hasRole("PATIENT")) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Only patients can reschedule appointments.");
        }

        if (!isCurrentUser(
                appointment.getPatient().getEmail())) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You can only reschedule your own appointments.");
        }

        String currentStatus =
                appointment.getStatus();

        // -----------------------------------------------------
        // ONLY PENDING / CONFIRMED CAN BE RESCHEDULED
        // -----------------------------------------------------

        if (!"PENDING".equalsIgnoreCase(currentStatus)
                && !"CONFIRMED".equalsIgnoreCase(currentStatus)) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            "Only pending or confirmed appointments can be rescheduled."
                    );
        }

        // -----------------------------------------------------
        // SAVE OLD DATE / TIME
        // -----------------------------------------------------

        String oldDate =
                appointment.getAppointmentDate() != null
                        ? appointment
                        .getAppointmentDate()
                        .toString()
                        : null;

        String oldTime =
                appointment.getAppointmentTime() != null
                        ? appointment
                        .getAppointmentTime()
                        .toString()
                        : null;

        // -----------------------------------------------------
        // PARSE NEW DATE / TIME
        // -----------------------------------------------------

        LocalDate newDate;
        LocalTime newTime;

        try {

            newDate =
                    LocalDate.parse(
                            appointmentDate
                    );

            newTime =
                    LocalTime.parse(
                            appointmentTime
                    );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            "Invalid date or time format. Use YYYY-MM-DD and HH:mm:ss."
                    );
        }

        // -----------------------------------------------------
        // CHECK PAST DATE
        // -----------------------------------------------------

        if (newDate.isBefore(LocalDate.now())) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            "Appointment date cannot be in the past."
                    );
        }

        // -----------------------------------------------------
        // CHECK PAST TIME
        // -----------------------------------------------------

        if (newDate.equals(LocalDate.now())
                && newTime.isBefore(LocalTime.now())) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            "Appointment time must be in the future."
                    );
        }

        // -----------------------------------------------------
        // CHECK SAME DATE / TIME
        // -----------------------------------------------------

        if (newDate.equals(
                appointment.getAppointmentDate())
                && newTime.equals(
                appointment.getAppointmentTime())) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            "New appointment time must be different."
                    );
        }

        // -----------------------------------------------------
        // CHECK DOCTOR LEAVE
        // -----------------------------------------------------

        User doctor =
                appointment.getDoctor();

        List<Leave> leaves =
                leaveRepository.findByDoctor(doctor);

        for (Leave leave : leaves) {

            if (!"APPROVED".equalsIgnoreCase(
                    leave.getStatus())) {
                continue;
            }

            LocalDate fromDate =
                    leave.getFromDate();

            LocalDate toDate =
                    leave.getToDate();

            if (fromDate != null
                    && toDate != null
                    && !newDate.isBefore(fromDate)
                    && !newDate.isAfter(toDate)) {

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(
                                "Doctor is on approved leave on the selected date."
                        );
            }
        }

        // -----------------------------------------------------
        // CHECK DOCTOR SCHEDULE
        // -----------------------------------------------------

        DayOfWeek requestedDay =
                newDate.getDayOfWeek();

        List<DoctorSchedule> schedules =
                doctorScheduleRepository.findByDoctor(doctor);

        boolean validSchedule = false;

        for (DoctorSchedule schedule : schedules) {

            if (schedule.getDayOfWeek()
                    == requestedDay) {

                LocalTime startTime =
                        schedule.getStartTime();

                LocalTime endTime =
                        schedule.getEndTime();

                if (startTime != null
                        && endTime != null
                        && !newTime.isBefore(startTime)
                        && !newTime.isAfter(endTime)) {

                    validSchedule = true;
                    break;
                }
            }
        }

        if (!validSchedule) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            "Doctor is not available at the selected date and time."
                    );
        }

        // -----------------------------------------------------
        // CHECK SLOT CONFLICT
        // -----------------------------------------------------

        boolean alreadyBooked =
                appointmentRepository
                        .existsByDoctorAndAppointmentDateAndAppointmentTimeAndStatusIn(
                                doctor,
                                newDate,
                                newTime,
                                List.of(
                                        "PENDING",
                                        "CONFIRMED"
                                )
                        );

        if (alreadyBooked) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(
                            "This appointment slot is already booked."
                    );
        }

        // -----------------------------------------------------
        // UPDATE APPOINTMENT
        // -----------------------------------------------------

        appointment.setAppointmentDate(
                newDate
        );

        appointment.setAppointmentTime(
                newTime
        );

        Appointment updatedAppointment =
                appointmentRepository.save(appointment);

        // -----------------------------------------------------
        // RESCHEDULE NOTIFICATION
        // -----------------------------------------------------

        try {

            notificationService.sendRescheduleNotification(
                    updatedAppointment,
                    oldDate,
                    oldTime
            );

        } catch (Exception e) {

            System.out.println(
                    "Reschedule notification failed: "
                            + e.getMessage()
            );
        }

        return ResponseEntity.ok(
                updatedAppointment
        );
    }

    // =========================================================
    // GET ALL APPOINTMENTS
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getAllAppointments() {

        // Only admin can access all appointments.
        if (!hasRole("ADMIN")) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Only admins can access all appointments.");
        }

        List<AppointmentResponse> appointments =
                appointmentRepository
                        .findAll()
                        .stream()
                        .map(this::convertToResponse)
                        .toList();

        return ResponseEntity.ok(appointments);
    }

    // =========================================================
    // SECURITY HELPERS
    // =========================================================

    private boolean isCurrentUser(String email) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || email == null) {

            return false;
        }

        return email.equalsIgnoreCase(
                authentication.getName()
        );
    }

    private boolean hasRole(String role) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            return false;
        }

        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority()
                                .equals("ROLE_" + role)
                                || authority.getAuthority()
                                .equals(role)
                );
    }

    // =========================================================
    // CONVERT APPOINTMENT → RESPONSE
    // =========================================================

    private AppointmentResponse convertToResponse(
            Appointment appointment) {

        User patient =
                appointment.getPatient();

        User doctor =
                appointment.getDoctor();

        return new AppointmentResponse(
                appointment.getId(),

                patient.getId(),
                patient.getName(),
                patient.getEmail(),

                doctor.getId(),
                doctor.getName(),
                doctor.getEmail(),

                appointment.getAppointmentDate()
                        .toString(),

                appointment.getAppointmentTime()
                        .toString(),

                appointment.getStatus(),

                appointment.getCreatedAt() != null
                        ? appointment
                        .getCreatedAt()
                        .toString()
                        : null
        );
    }
}