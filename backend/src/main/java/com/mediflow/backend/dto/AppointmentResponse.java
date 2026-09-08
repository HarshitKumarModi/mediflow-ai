package com.mediflow.backend.dto;

public class AppointmentResponse {

    private Long id;

    private Long patientId;
    private String patientName;
    private String patientEmail;

    private Long doctorId;
    private String doctorName;
    private String doctorEmail;

    private String appointmentDate;
    private String appointmentTime;

    private String status;

    private String createdAt;


    public AppointmentResponse() {
    }


    public AppointmentResponse(
            Long id,
            Long patientId,
            String patientName,
            String patientEmail,
            Long doctorId,
            String doctorName,
            String doctorEmail,
            String appointmentDate,
            String appointmentTime,
            String status,
            String createdAt) {

        this.id = id;

        this.patientId = patientId;
        this.patientName = patientName;
        this.patientEmail = patientEmail;

        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.doctorEmail = doctorEmail;

        this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime;

        this.status = status;

        this.createdAt = createdAt;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }


    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }


    public String getPatientEmail() {
        return patientEmail;
    }

    public void setPatientEmail(String patientEmail) {
        this.patientEmail = patientEmail;
    }


    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }


    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
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


    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}