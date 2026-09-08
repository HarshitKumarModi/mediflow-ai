package com.mediflow.backend.service;

import com.mediflow.backend.entity.Appointment;
import org.springframework.stereotype.Service;

@Service
public class AppointmentNotificationService {

    private final EmailService emailService;

    public AppointmentNotificationService(EmailService emailService) {
        this.emailService = emailService;
    }

    // =========================================================
    // APPOINTMENT BOOKED
    // =========================================================

    public void sendBookingNotification(Appointment appointment) {

        try {
            String patientName = appointment.getPatient().getName();
            String patientEmail = appointment.getPatient().getEmail();

            String doctorName = appointment.getDoctor().getName();
            String doctorEmail = appointment.getDoctor().getEmail();

            String date = appointment.getAppointmentDate().toString();
            String time = appointment.getAppointmentTime().toString();

            // -------------------------
            // PATIENT EMAIL
            // -------------------------

            String patientSubject =
                    "MediFlow AI - Appointment Booking Request";

            String patientBody =
                    "Hello " + patientName + ",\n\n" +

                    "Your appointment request has been successfully submitted.\n\n" +

                    "Doctor: Dr. " + doctorName + "\n" +
                    "Date: " + date + "\n" +
                    "Time: " + time + "\n" +
                    "Status: PENDING\n\n" +

                    "The doctor will review your appointment request.\n" +
                    "You will receive another email once the appointment is accepted or rejected.\n\n" +

                    "Regards,\n" +
                    "MediFlow AI";

            sendSafely(
                    patientEmail,
                    patientSubject,
                    patientBody
            );

            // -------------------------
            // DOCTOR EMAIL
            // -------------------------

            String doctorSubject =
                    "MediFlow AI - New Appointment Request";

            String doctorBody =
                    "Hello Dr. " + doctorName + ",\n\n" +

                    "You have received a new appointment request.\n\n" +

                    "Patient: " + patientName + "\n" +
                    "Date: " + date + "\n" +
                    "Time: " + time + "\n" +
                    "Status: PENDING\n\n" +

                    "Please login to MediFlow AI to accept or reject the appointment.\n\n" +

                    "Regards,\n" +
                    "MediFlow AI";

            sendSafely(
                    doctorEmail,
                    doctorSubject,
                    doctorBody
            );

        } catch (Exception e) {

            System.err.println(
                    "Appointment booking notification failed: "
                            + e.getMessage()
            );
        }
    }


    // =========================================================
    // APPOINTMENT ACCEPTED
    // =========================================================

    public void sendAcceptanceNotification(Appointment appointment) {

        try {

            String patientName =
                    appointment.getPatient().getName();

            String patientEmail =
                    appointment.getPatient().getEmail();

            String doctorName =
                    appointment.getDoctor().getName();

            String date =
                    appointment.getAppointmentDate().toString();

            String time =
                    appointment.getAppointmentTime().toString();

            String subject =
                    "MediFlow AI - Appointment Confirmed";

            String body =
                    "Hello " + patientName + ",\n\n" +

                    "Good news! Your appointment has been accepted by the doctor.\n\n" +

                    "Doctor: Dr. " + doctorName + "\n" +
                    "Date: " + date + "\n" +
                    "Time: " + time + "\n" +
                    "Status: CONFIRMED\n\n" +

                    "Please make sure to be available at the scheduled time.\n\n" +

                    "Regards,\n" +
                    "MediFlow AI";

            sendSafely(patientEmail, subject, body);

        } catch (Exception e) {

            System.err.println(
                    "Appointment acceptance notification failed: "
                            + e.getMessage()
            );
        }
    }


    // =========================================================
    // APPOINTMENT REJECTED
    // =========================================================

    public void sendRejectionNotification(Appointment appointment) {

        try {

            String patientName =
                    appointment.getPatient().getName();

            String patientEmail =
                    appointment.getPatient().getEmail();

            String doctorName =
                    appointment.getDoctor().getName();

            String date =
                    appointment.getAppointmentDate().toString();

            String time =
                    appointment.getAppointmentTime().toString();

            String subject =
                    "MediFlow AI - Appointment Rejected";

            String body =
                    "Hello " + patientName + ",\n\n" +

                    "Unfortunately, your appointment request has been rejected by the doctor.\n\n" +

                    "Doctor: Dr. " + doctorName + "\n" +
                    "Date: " + date + "\n" +
                    "Time: " + time + "\n" +
                    "Status: REJECTED\n\n" +

                    "You can login to MediFlow AI and book another available appointment.\n\n" +

                    "Regards,\n" +
                    "MediFlow AI";

            sendSafely(patientEmail, subject, body);

        } catch (Exception e) {

            System.err.println(
                    "Appointment rejection notification failed: "
                            + e.getMessage()
            );
        }
    }


    // =========================================================
    // APPOINTMENT CANCELLED
    // =========================================================

    public void sendCancellationNotification(
            Appointment appointment,
            String cancelledBy) {

        try {

            String patientName =
                    appointment.getPatient().getName();

            String patientEmail =
                    appointment.getPatient().getEmail();

            String doctorName =
                    appointment.getDoctor().getName();

            String doctorEmail =
                    appointment.getDoctor().getEmail();

            String date =
                    appointment.getAppointmentDate().toString();

            String time =
                    appointment.getAppointmentTime().toString();

            String subject =
                    "MediFlow AI - Appointment Cancelled";

            String body =
                    "Hello,\n\n" +

                    "An appointment has been cancelled.\n\n" +

                    "Patient: " + patientName + "\n" +
                    "Doctor: Dr. " + doctorName + "\n" +
                    "Date: " + date + "\n" +
                    "Time: " + time + "\n" +
                    "Cancelled by: " + cancelledBy + "\n" +
                    "Status: CANCELLED\n\n" +

                    "Regards,\n" +
                    "MediFlow AI";

            // Notify patient
            sendSafely(patientEmail, subject, body);

            // Notify doctor
            sendSafely(doctorEmail, subject, body);

        } catch (Exception e) {

            System.err.println(
                    "Appointment cancellation notification failed: "
                            + e.getMessage()
            );
        }
    }


    // =========================================================
    // APPOINTMENT RESCHEDULED
    // =========================================================

    public void sendRescheduleNotification(
            Appointment appointment,
            String oldDate,
            String oldTime) {

        try {

            String patientName =
                    appointment.getPatient().getName();

            String patientEmail =
                    appointment.getPatient().getEmail();

            String doctorName =
                    appointment.getDoctor().getName();

            String doctorEmail =
                    appointment.getDoctor().getEmail();

            String newDate =
                    appointment.getAppointmentDate().toString();

            String newTime =
                    appointment.getAppointmentTime().toString();

            String subject =
                    "MediFlow AI - Appointment Rescheduled";

            String body =
                    "Hello,\n\n" +

                    "Your MediFlow AI appointment has been rescheduled.\n\n" +

                    "Patient: " + patientName + "\n" +
                    "Doctor: Dr. " + doctorName + "\n\n" +

                    "Previous Date: " + oldDate + "\n" +
                    "Previous Time: " + oldTime + "\n\n" +

                    "New Date: " + newDate + "\n" +
                    "New Time: " + newTime + "\n" +

                    "Status: " + appointment.getStatus() + "\n\n" +

                    "Please note the new appointment date and time.\n\n" +

                    "Regards,\n" +
                    "MediFlow AI";

            // Notify patient
            sendSafely(patientEmail, subject, body);

            // Notify doctor
            sendSafely(doctorEmail, subject, body);

        } catch (Exception e) {

            System.err.println(
                    "Appointment reschedule notification failed: "
                            + e.getMessage()
            );
        }
    }


    // =========================================================
    // SAFE EMAIL SENDING
    // =========================================================

    private void sendSafely(
            String email,
            String subject,
            String body) {

        try {

            boolean sent =
                    emailService.sendEmail(
                            email,
                            subject,
                            body
                    );

            if (sent) {

                System.out.println(
                        "Appointment email sent to: "
                                + email
                );

            } else {

                System.err.println(
                        "Appointment email failed for: "
                                + email
                );
            }

        } catch (Exception e) {

            System.err.println(
                    "Email notification error for "
                            + email
                            + ": "
                            + e.getMessage()
            );
        }
    }
}