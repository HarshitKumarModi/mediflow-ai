package com.mediflow.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_requests")
public class Leave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private User doctor;

    private LocalDate fromDate;

    private LocalDate toDate;

    @Column(length = 500)
    private String reason;

    private String status;

    private LocalDateTime createdAt;


    public Leave() {
    }


    public Leave(
            User doctor,
            LocalDate fromDate,
            LocalDate toDate,
            String reason,
            String status,
            LocalDateTime createdAt) {

        this.doctor = doctor;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.reason = reason;
        this.status = status;
        this.createdAt = createdAt;
    }


    public Long getId() {
        return id;
    }


    public User getDoctor() {
        return doctor;
    }


    public void setDoctor(User doctor) {
        this.doctor = doctor;
    }


    public LocalDate getFromDate() {
        return fromDate;
    }


    public void setFromDate(LocalDate fromDate) {
        this.fromDate = fromDate;
    }


    public LocalDate getToDate() {
        return toDate;
    }


    public void setToDate(LocalDate toDate) {
        this.toDate = toDate;
    }


    public String getReason() {
        return reason;
    }


    public void setReason(String reason) {
        this.reason = reason;
    }


    public String getStatus() {
        return status;
    }


    public void setStatus(String status) {
        this.status = status;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}