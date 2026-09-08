package com.mediflow.backend.dto;

public class AdminStats {

    private long totalPatients;
    private long totalDoctors;
    private long totalAppointments;
    private int completionRate;

    private long confirmedAppointments;
    private long pendingAppointments;
    private long rejectedAppointments;
    private long completedAppointments;


    public AdminStats() {
    }


    public AdminStats(
            long totalPatients,
            long totalDoctors,
            long totalAppointments,
            int completionRate,
            long confirmedAppointments,
            long pendingAppointments,
            long rejectedAppointments,
            long completedAppointments) {

        this.totalPatients = totalPatients;
        this.totalDoctors = totalDoctors;
        this.totalAppointments = totalAppointments;
        this.completionRate = completionRate;

        this.confirmedAppointments = confirmedAppointments;
        this.pendingAppointments = pendingAppointments;
        this.rejectedAppointments = rejectedAppointments;
        this.completedAppointments = completedAppointments;
    }


    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }


    public long getTotalDoctors() {
        return totalDoctors;
    }

    public void setTotalDoctors(long totalDoctors) {
        this.totalDoctors = totalDoctors;
    }


    public long getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(long totalAppointments) {
        this.totalAppointments = totalAppointments;
    }


    public int getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(int completionRate) {
        this.completionRate = completionRate;
    }


    public long getConfirmedAppointments() {
        return confirmedAppointments;
    }

    public void setConfirmedAppointments(long confirmedAppointments) {
        this.confirmedAppointments = confirmedAppointments;
    }


    public long getPendingAppointments() {
        return pendingAppointments;
    }

    public void setPendingAppointments(long pendingAppointments) {
        this.pendingAppointments = pendingAppointments;
    }


    public long getRejectedAppointments() {
        return rejectedAppointments;
    }

    public void setRejectedAppointments(long rejectedAppointments) {
        this.rejectedAppointments = rejectedAppointments;
    }


    public long getCompletedAppointments() {
        return completedAppointments;
    }

    public void setCompletedAppointments(long completedAppointments) {
        this.completedAppointments = completedAppointments;
    }
}