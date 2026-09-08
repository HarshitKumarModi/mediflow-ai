package com.mediflow.backend.dto;

import java.util.List;

public class PostVisitResponse {

    private String summary;

    private List<String> medicationSchedule;

    private List<String> followUpSteps;

    private List<String> importantNotes;


    public PostVisitResponse() {
    }


    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }


    public List<String> getMedicationSchedule() {
        return medicationSchedule;
    }

    public void setMedicationSchedule(
            List<String> medicationSchedule
    ) {
        this.medicationSchedule = medicationSchedule;
    }


    public List<String> getFollowUpSteps() {
        return followUpSteps;
    }

    public void setFollowUpSteps(
            List<String> followUpSteps
    ) {
        this.followUpSteps = followUpSteps;
    }


    public List<String> getImportantNotes() {
        return importantNotes;
    }

    public void setImportantNotes(
            List<String> importantNotes
    ) {
        this.importantNotes = importantNotes;
    }
}