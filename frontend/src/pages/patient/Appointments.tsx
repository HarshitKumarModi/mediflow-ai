import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";

interface Doctor {
  name: string;
  email: string;
  phone: string;
}

interface Appointment {
  id: number;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  doctor: Doctor;
}

function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const [rescheduleError, setRescheduleError] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // =========================
  // GET PATIENT EMAIL
  // =========================

  const getPatientEmail = () => {
    try {
      const user = localStorage.getItem("user");

      if (user) {
        const parsedUser = JSON.parse(user);

        if (parsedUser?.email) {
          return parsedUser.email;
        }
      }

      const email = localStorage.getItem("email");

      if (email) {
        return email;
      }

      return "harshit123@gmail.com";
    } catch (error) {
      console.error("Unable to read logged-in user:", error);
      return "harshit123@gmail.com";
    }
  };

  // =========================
  // LOAD APPOINTMENTS
  // =========================

  const loadAppointments = async () => {
    setLoading(true);
    setError("");

    const patientEmail = getPatientEmail();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `https://mediflow-backend-ieau.onrender.com/api/appointments/patient/${encodeURIComponent(
          patientEmail
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load appointments");
      }

      const data = await response.json();

      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading appointments:", error);
      setError("Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // =========================
  // CANCEL APPOINTMENT
  // =========================

  const cancelAppointment = async (appointmentId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(appointmentId);
    setError("");

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:8080/api/appointments/${appointmentId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          responseText || "Unable to cancel appointment."
        );
      }

      const updatedAppointment: Appointment = JSON.parse(responseText);

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? updatedAppointment
            : appointment
        )
      );
    } catch (error) {
      console.error("Error cancelling appointment:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to cancel appointment."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================
  // OPEN RESCHEDULE MODAL
  // =========================

  const openReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);

    setNewDate(appointment.appointmentDate);

    setNewTime(
      appointment.appointmentTime?.substring(0, 5) || ""
    );

    setRescheduleError("");
    setShowReschedule(true);
  };

  // =========================
  // CLOSE RESCHEDULE MODAL
  // =========================

  const closeReschedule = () => {
    if (rescheduleLoading) {
      return;
    }

    setShowReschedule(false);
    setSelectedAppointment(null);
    setNewDate("");
    setNewTime("");
    setRescheduleError("");
  };

  // =========================
  // RESCHEDULE APPOINTMENT
  // =========================

  const rescheduleAppointment = async () => {
    if (!selectedAppointment) {
      return;
    }

    setRescheduleError("");

    if (!newDate) {
      setRescheduleError("Please select a new date.");
      return;
    }

    if (!newTime) {
      setRescheduleError("Please select a new time.");
      return;
    }

    const formattedTime =
      newTime.length === 5
        ? `${newTime}:00`
        : newTime;

    setRescheduleLoading(true);

    const token = localStorage.getItem("token");

    try {
      const url =
        `http://localhost:8080/api/appointments/` +
        `${selectedAppointment.id}/reschedule` +
        `?appointmentDate=${encodeURIComponent(newDate)}` +
        `&appointmentTime=${encodeURIComponent(formattedTime)}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          responseText || "Unable to reschedule appointment."
        );
      }

      const updatedAppointment: Appointment =
        JSON.parse(responseText);

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === selectedAppointment.id
            ? updatedAppointment
            : appointment
        )
      );

      closeReschedule();

      alert("Appointment rescheduled successfully.");
    } catch (error) {
      console.error("Error rescheduling appointment:", error);

      setRescheduleError(
        error instanceof Error
          ? error.message
          : "Unable to reschedule appointment."
      );
    } finally {
      setRescheduleLoading(false);
    }
  };

  // =========================
  // STATUS STYLING
  // =========================

  const getStatusClass = (status: string) => {
    const normalizedStatus = status?.toUpperCase();

    switch (normalizedStatus) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "CONFIRMED":
      case "ACCEPTED":
        return "bg-green-100 text-green-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "COMPLETED":
        return "bg-blue-100 text-blue-700";

      case "CANCELLED":
      case "CANCELED":
        return "bg-slate-200 text-slate-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // =========================
  // TODAY'S DATE
  // =========================

  const today = new Date().toISOString().split("T")[0];

  // =========================
  // PAGE
  // =========================

  return (
    <DashboardLayout role="patient">

      {/* HEADER */}

      <div className="mb-8 flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            My Appointments
          </h1>

          <p className="mt-2 text-slate-500">
            View your upcoming and previous appointments.
          </p>
        </div>

        <button
          onClick={loadAppointments}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* LOADING */}

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-500">
            Loading appointments...
          </p>
        </div>
      )}

      {/* ERROR */}

      {!loading && error && (
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <p className="text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* NO APPOINTMENTS */}

      {!loading &&
        !error &&
        appointments.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-slate-500">
              No appointments found.
            </p>
          </div>
        )}

      {/* APPOINTMENT LIST */}

      {!loading &&
        !error &&
        appointments.length > 0 && (
          <div className="space-y-5">

            {appointments.map((appointment) => {
              const normalizedStatus =
                appointment.status?.toUpperCase();

              const isPending =
                normalizedStatus === "PENDING";

              const isConfirmed =
                normalizedStatus === "CONFIRMED";

              const canModify =
                isPending || isConfirmed;

              const isUpdating =
                actionLoading === appointment.id;

              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6"
                >

                  {/* TOP SECTION */}

                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        {appointment.doctor?.name || "Doctor"}
                      </h2>

                      <p className="text-teal-600 mt-1">
                        Doctor
                      </p>

                      {appointment.doctor?.email && (
                        <p className="text-sm text-slate-500 mt-1">
                          {appointment.doctor.email}
                        </p>
                      )}
                    </div>

                    <span
                      className={`px-4 py-2 rounded-full text-xs font-medium ${getStatusClass(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  {/* DATE / TIME */}

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500">
                        Date
                      </p>

                      <p className="font-medium text-slate-900 mt-1">
                        {appointment.appointmentDate}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500">
                        Time
                      </p>

                      <p className="font-medium text-slate-900 mt-1">
                        {appointment.appointmentTime}
                      </p>
                    </div>

                  </div>

                  {/* ACTION BUTTONS */}

                  {canModify && (
                    <div className="flex flex-wrap justify-end gap-3 mt-6">

                      <button
                        onClick={() =>
                          openReschedule(appointment)
                        }
                        disabled={isUpdating}
                        className="px-5 py-2.5 rounded-xl border border-teal-200 text-teal-700 hover:bg-teal-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reschedule
                      </button>

                      <button
                        onClick={() =>
                          cancelAppointment(
                            appointment.id
                          )
                        }
                        disabled={isUpdating}
                        className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating
                          ? "Cancelling..."
                          : "Cancel Appointment"}
                      </button>

                    </div>
                  )}

                  {/* PENDING */}

                  {isPending && (
                    <div className="mt-5 bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                      <p className="text-sm text-yellow-700">
                        Your appointment is waiting for doctor confirmation.
                      </p>
                    </div>
                  )}

                  {/* CONFIRMED */}

                  {isConfirmed && (
                    <div className="mt-5 bg-green-50 border border-green-100 rounded-xl p-4">
                      <p className="text-sm text-green-700">
                        Your appointment has been confirmed by the doctor.
                      </p>
                    </div>
                  )}

                  {/* REJECTED */}

                  {normalizedStatus === "REJECTED" && (
                    <div className="mt-5 bg-red-50 border border-red-100 rounded-xl p-4">
                      <p className="text-sm text-red-700">
                        This appointment has been rejected.
                      </p>
                    </div>
                  )}

                  {/* COMPLETED */}

                  {normalizedStatus === "COMPLETED" && (
                    <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-sm text-blue-700">
                        This appointment has been completed.
                      </p>
                    </div>
                  )}

                  {/* CANCELLED */}

                  {(normalizedStatus === "CANCELLED" ||
                    normalizedStatus === "CANCELED") && (
                    <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <p className="text-sm text-slate-600">
                        This appointment has been cancelled.
                      </p>
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

      {/* RESCHEDULE MODAL */}

      {showReschedule &&
        selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">

              {/* HEADER */}

              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Reschedule Appointment
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Choose a new date and time for your appointment.
                  </p>
                </div>

                <button
                  onClick={closeReschedule}
                  disabled={rescheduleLoading}
                  className="text-slate-400 hover:text-slate-700 text-2xl disabled:opacity-50"
                >
                  ×
                </button>
              </div>

              {/* DOCTOR */}

              <div className="mt-6 bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-500">
                  Doctor
                </p>

                <p className="font-semibold text-slate-900 mt-1">
                  {selectedAppointment.doctor?.name ||
                    "Doctor"}
                </p>
              </div>

              {/* DATE */}

              <div className="mt-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Date
                </label>

                <input
                  type="date"
                  value={newDate}
                  min={today}
                  onChange={(event) =>
                    setNewDate(event.target.value)
                  }
                  disabled={rescheduleLoading}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* TIME */}

              <div className="mt-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Time
                </label>

                <input
                  type="time"
                  value={newTime}
                  onChange={(event) =>
                    setNewTime(event.target.value)
                  }
                  disabled={rescheduleLoading}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* ERROR */}

              {rescheduleError && (
                <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-600">
                    {rescheduleError}
                  </p>
                </div>
              )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 mt-7">

                <button
                  onClick={closeReschedule}
                  disabled={rescheduleLoading}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={rescheduleAppointment}
                  disabled={rescheduleLoading}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rescheduleLoading
                    ? "Rescheduling..."
                    : "Confirm Reschedule"}
                </button>

              </div>

            </div>
          </div>
        )}

    </DashboardLayout>
  );
}

export default Appointments;