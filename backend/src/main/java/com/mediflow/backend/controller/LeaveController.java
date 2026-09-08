package com.mediflow.backend.controller;

import com.mediflow.backend.dto.LeaveRequest;
import com.mediflow.backend.entity.Leave;
import com.mediflow.backend.service.LeaveService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "http://localhost:5173")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    // =========================================================
    // APPLY FOR LEAVE
    // =========================================================

    @PostMapping
    public ResponseEntity<?> applyLeave(
            @Valid @RequestBody LeaveRequest request) {

        // Only doctors can apply for leave
        if (!hasRole("DOCTOR")) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Only doctors can apply for leave.");
        }

        // Doctor can only apply for their own leave
        if (!isCurrentUser(request.getDoctorEmail())) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You can only apply for your own leave.");
        }

        LocalDate fromDate;
        LocalDate toDate;

        try {

            fromDate = LocalDate.parse(request.getFromDate());
            toDate = LocalDate.parse(request.getToDate());

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Invalid date format. Use YYYY-MM-DD.");
        }

        // From date cannot be after to date
        if (fromDate.isAfter(toDate)) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("From date cannot be after to date.");
        }

        // Leave cannot start in the past
        if (fromDate.isBefore(LocalDate.now())) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Leave cannot start in the past.");
        }

        Leave leave =
                leaveService.applyLeave(
                        request.getDoctorEmail(),
                        fromDate,
                        toDate,
                        request.getReason()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(leave);
    }

    // =========================================================
    // GET DOCTOR LEAVES
    // =========================================================

    @GetMapping("/doctor/{email}")
    public ResponseEntity<?> getDoctorLeaves(
            @PathVariable String email) {

        if (!hasRole("DOCTOR")) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Only doctors can access doctor leave records.");
        }

        if (!isCurrentUser(email)) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("You can only access your own leave records.");
        }

        List<Leave> leaves =
                leaveService.getDoctorLeaves(email);

        return ResponseEntity.ok(leaves);
    }

    // =========================================================
    // GET PENDING LEAVES
    // ADMIN ONLY
    // =========================================================

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingLeaves() {

        if (!hasRole("ADMIN")) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Only administrators can view pending leave requests.");
        }

        List<Leave> leaves =
                leaveService.getPendingLeaves();

        return ResponseEntity.ok(leaves);
    }

    // =========================================================
    // UPDATE LEAVE STATUS
    // ADMIN ONLY
    // =========================================================

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateLeaveStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        if (!hasRole("ADMIN")) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Only administrators can update leave status.");
        }

        if (status == null || status.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Leave status is required.");
        }

        String normalizedStatus =
                status.trim().toUpperCase();

        if (!normalizedStatus.equals("APPROVED") &&
                !normalizedStatus.equals("REJECTED")) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Status must be APPROVED or REJECTED.");
        }

        Leave leave =
                leaveService.updateLeaveStatus(
                        id,
                        normalizedStatus
                );

        return ResponseEntity.ok(leave);
    }

    // =========================================================
    // SECURITY HELPERS
    // =========================================================

    private boolean isCurrentUser(String email) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null ||
                email == null) {

            return false;
        }

        return authentication
                .getName()
                .equalsIgnoreCase(email);
    }

    private boolean hasRole(String role) {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            return false;
        }

        return authentication
                .getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority()
                                .equals("ROLE_" + role)
                );
    }
}