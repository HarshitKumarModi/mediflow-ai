package com.mediflow.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PreVisitRequest {

    @NotBlank(message = "Symptoms are required")
    @Size(max = 2000, message = "Symptoms cannot exceed 2000 characters")
    private String symptoms;

    public PreVisitRequest() {
    }

    public PreVisitRequest(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }
}