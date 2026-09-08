package com.mediflow.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class MedicationRequest {

    @NotNull(message = "Medical record ID is required")
    @Min(value = 1, message = "Medical record ID must be greater than 0")
    private Long medicalRecordId;

    @NotBlank(message = "Medicine name is required")
    @Size(max = 200, message = "Medicine name cannot exceed 200 characters")
    private String medicineName;

    @NotBlank(message = "Dosage is required")
    @Size(max = 200, message = "Dosage cannot exceed 200 characters")
    private String dosage;

    @NotBlank(message = "Frequency is required")
    @Size(max = 100, message = "Frequency cannot exceed 100 characters")
    private String frequency;

    @NotNull(message = "Duration in days is required")
    @Min(value = 1, message = "Duration must be at least 1 day")
    private Integer durationDays;

    @Size(max = 1000, message = "Instructions cannot exceed 1000 characters")
    private String instructions;

    @NotBlank(message = "Start date is required")
    private String startDate;

    // =========================
    // GETTERS AND SETTERS
    // =========================

    public Long getMedicalRecordId() {
        return medicalRecordId;
    }

    public void setMedicalRecordId(Long medicalRecordId) {
        this.medicalRecordId = medicalRecordId;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }
}