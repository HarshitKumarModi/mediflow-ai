package com.mediflow.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AppointmentRequest {

    @NotBlank(message = "Patient email is required")
    @Email(message = "Invalid patient email")
    private String patientEmail;

    @NotBlank(message = "Doctor email is required")
    @Email(message = "Invalid doctor email")
    private String doctorEmail;

    @NotBlank(message = "Appointment date is required")
    private String appointmentDate;

    @NotBlank(message = "Appointment time is required")
    private String appointmentTime;

    @Size(max = 1000, message = "Symptoms cannot exceed 1000 characters")
    private String symptoms;

    public AppointmentRequest() {
    }

    public AppointmentRequest(
            String patientEmail,
            String doctorEmail,
            String appointmentDate,
            String appointmentTime,
            String symptoms
    ) {
        this.patientEmail = patientEmail;
        this.doctorEmail = doctorEmail;
        this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime;
        this.symptoms = symptoms;
    }

    public String getPatientEmail() {
        return patientEmail;
    }

    public void setPatientEmail(String patientEmail) {
        this.patientEmail = patientEmail;
    }

    public String getDoctorEmail() {
        return doctorEmail;
    }

    public void setDoctorEmail(String doctorEmail) {
        this.doctorEmail = doctorEmail;
    }

    public String getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(String appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public String getAppointmentTime() {
        return appointmentTime;
    }

    public void setAppointmentTime(String appointmentTime) {
        this.appointmentTime = appointmentTime;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }
}