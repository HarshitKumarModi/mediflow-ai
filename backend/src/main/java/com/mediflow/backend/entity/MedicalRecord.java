package com.mediflow.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "medical_records",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "appointment_id")
        }
)
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One completed appointment can have one medical record
    @OneToOne
    @JoinColumn(
            name = "appointment_id",
            nullable = false,
            unique = true
    )
    private Appointment appointment;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    @Column(columnDefinition = "TEXT")
    private String doctorNotes;

    @Column(columnDefinition = "TEXT")
    private String prescription;

    @Column(columnDefinition = "TEXT")
    private String medicines;

    @Column(columnDefinition = "TEXT")
    private String dosage;

    @Column(columnDefinition = "TEXT")
    private String followUpInstructions;

    private LocalDateTime createdAt;

    // =========================
    // CONSTRUCTORS
    // =========================

    public MedicalRecord() {
    }

    public MedicalRecord(
            Appointment appointment,
            String diagnosis,
            String symptoms,
            String doctorNotes,
            String prescription,
            String medicines,
            String dosage,
            String followUpInstructions
    ) {
        this.appointment = appointment;
        this.diagnosis = diagnosis;
        this.symptoms = symptoms;
        this.doctorNotes = doctorNotes;
        this.prescription = prescription;
        this.medicines = medicines;
        this.dosage = dosage;
        this.followUpInstructions = followUpInstructions;
        this.createdAt = LocalDateTime.now();
    }

    // =========================
    // GETTERS AND SETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getDoctorNotes() {
        return doctorNotes;
    }

    public void setDoctorNotes(String doctorNotes) {
        this.doctorNotes = doctorNotes;
    }

    public String getPrescription() {
        return prescription;
    }

    public void setPrescription(String prescription) {
        this.prescription = prescription;
    }

    public String getMedicines() {
        return medicines;
    }

    public void setMedicines(String medicines) {
        this.medicines = medicines;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public String getFollowUpInstructions() {
        return followUpInstructions;
    }

    public void setFollowUpInstructions(String followUpInstructions) {
        this.followUpInstructions = followUpInstructions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}