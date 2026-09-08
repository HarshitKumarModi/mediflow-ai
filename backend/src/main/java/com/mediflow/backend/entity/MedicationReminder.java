package com.mediflow.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(
        name = "medication_reminders",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "medication_id",
                                "reminder_date",
                                "reminder_time"
                        }
                )
        }
)
public class MedicationReminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==========================================
    // MEDICATION
    // ==========================================

    @ManyToOne
    @JoinColumn(name = "medication_id", nullable = false)
    private Medication medication;

    // ==========================================
    // REMINDER DATE & TIME
    // ==========================================

    @Column(nullable = false)
    private LocalDate reminderDate;

    @Column(nullable = false)
    private LocalTime reminderTime;

    // ==========================================
    // STATUS
    // ==========================================

    @Column(nullable = false)
    private String status = "PENDING";

    private LocalDateTime takenAt;

    private LocalDateTime createdAt;

    // ==========================================
    // CONSTRUCTORS
    // ==========================================

    public MedicationReminder() {
    }

    public MedicationReminder(
            Medication medication,
            LocalDate reminderDate,
            LocalTime reminderTime
    ) {
        this.medication = medication;
        this.reminderDate = reminderDate;
        this.reminderTime = reminderTime;
        this.status = "PENDING";
        this.createdAt = LocalDateTime.now();
    }

    // ==========================================
    // GETTERS
    // ==========================================

    public Long getId() {
        return id;
    }

    public Medication getMedication() {
        return medication;
    }

    public LocalDate getReminderDate() {
        return reminderDate;
    }

    public LocalTime getReminderTime() {
        return reminderTime;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getTakenAt() {
        return takenAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // ==========================================
    // SETTERS
    // ==========================================

    public void setMedication(Medication medication) {
        this.medication = medication;
    }

    public void setReminderDate(LocalDate reminderDate) {
        this.reminderDate = reminderDate;
    }

    public void setReminderTime(LocalTime reminderTime) {
        this.reminderTime = reminderTime;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setTakenAt(LocalDateTime takenAt) {
        this.takenAt = takenAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}