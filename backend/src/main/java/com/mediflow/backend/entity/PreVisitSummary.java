package com.mediflow.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "pre_visit_summaries",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "appointment_id")
    }
)
public class PreVisitSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @Column(length = 20)
    private String urgency;

    @Column(length = 500)
    private String chiefComplaint;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String suggestedQuestions;

    private LocalDateTime createdAt;

    public PreVisitSummary() {
        this.createdAt = LocalDateTime.now();
    }

    public PreVisitSummary(
            Appointment appointment,
            String urgency,
            String chiefComplaint,
            String summary,
            String suggestedQuestions
    ) {
        this.appointment = appointment;
        this.urgency = urgency;
        this.chiefComplaint = chiefComplaint;
        this.summary = summary;
        this.suggestedQuestions = suggestedQuestions;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }

    public String getUrgency() {
        return urgency;
    }

    public void setUrgency(String urgency) {
        this.urgency = urgency;
    }

    public String getChiefComplaint() {
        return chiefComplaint;
    }

    public void setChiefComplaint(String chiefComplaint) {
        this.chiefComplaint = chiefComplaint;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getSuggestedQuestions() {
        return suggestedQuestions;
    }

    public void setSuggestedQuestions(String suggestedQuestions) {
        this.suggestedQuestions = suggestedQuestions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}