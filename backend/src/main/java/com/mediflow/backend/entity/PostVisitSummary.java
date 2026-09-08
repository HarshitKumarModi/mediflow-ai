package com.mediflow.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "post_visit_summaries",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "appointment_id")
    }
)
public class PostVisitSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String medicationSchedule;

    @Column(columnDefinition = "TEXT")
    private String followUpSteps;

    @Column(columnDefinition = "TEXT")
    private String importantNotes;

    private LocalDateTime createdAt;

    // =========================================================
    // DEFAULT CONSTRUCTOR
    // =========================================================

    public PostVisitSummary() {
        this.createdAt = LocalDateTime.now();
    }

    // =========================================================
    // FULL CONSTRUCTOR
    // =========================================================

    public PostVisitSummary(
            Appointment appointment,
            String summary,
            String medicationSchedule,
            String followUpSteps,
            String importantNotes
    ) {
        this.appointment = appointment;
        this.summary = summary;
        this.medicationSchedule = medicationSchedule;
        this.followUpSteps = followUpSteps;
        this.importantNotes = importantNotes;
        this.createdAt = LocalDateTime.now();
    }

    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getMedicationSchedule() {
        return medicationSchedule;
    }

    public void setMedicationSchedule(String medicationSchedule) {
        this.medicationSchedule = medicationSchedule;
    }

    public String getFollowUpSteps() {
        return followUpSteps;
    }

    public void setFollowUpSteps(String followUpSteps) {
        this.followUpSteps = followUpSteps;
    }

    public String getImportantNotes() {
        return importantNotes;
    }

    public void setImportantNotes(String importantNotes) {
        this.importantNotes = importantNotes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}