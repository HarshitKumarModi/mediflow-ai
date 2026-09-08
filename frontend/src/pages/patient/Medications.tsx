import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { API_BASE_URL } from "../../config/api";
import {
  Pill,
  RefreshCw,
  CalendarDays,
  Clock3,
  UserRound,
  CheckCircle2,
  XCircle,
  Bell,
} from "lucide-react";

interface Medication {
  id: number;
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays: number | null;
  instructions: string | null;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string | null;

  medicalRecord?: {
    id: number;
    appointment?: {
      id: number;
      appointmentDate?: string;
      appointmentTime?: string;
      doctor?: {
        name?: string;
        email?: string;
      };
    };
  };
}

interface MedicationReminder {
  id: number;
  reminderDate: string;
  reminderTime: string;
  status: string;
  takenAt: string | null;

  medication?: {
    id: number;
    medicineName: string;
    dosage: string;
    frequency: string;
  };
}

function Medications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);

  const [loading, setLoading] = useState(true);
  const [remindersLoading, setRemindersLoading] = useState(true);

  const [error, setError] = useState("");
  const [reminderError, setReminderError] = useState("");

  const [takingReminderId, setTakingReminderId] =
    useState<number | null>(null);

  // ============================================================
  // GET LOGGED-IN PATIENT EMAIL
  // ============================================================

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

      return null;
    } catch (error) {
      console.error("Unable to read logged-in patient:", error);
      return localStorage.getItem("email");
    }
  };

  // ============================================================
  // LOAD MEDICATIONS
  // ============================================================

  const loadMedications = async () => {
    setLoading(true);
    setError("");

    const patientEmail = getPatientEmail();
    const token = localStorage.getItem("token");

    if (!patientEmail) {
      setError("Patient information not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/medications/patient/${encodeURIComponent(
          patientEmail
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load medications.");
      }

      const data = await response.json();

      setMedications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading medications:", error);
      setError("Unable to load medications.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD TODAY'S REMINDERS
  // ============================================================

  const loadReminders = async () => {
    setRemindersLoading(true);
    setReminderError("");

    const patientEmail = getPatientEmail();
    const token = localStorage.getItem("token");

    if (!patientEmail) {
      setReminderError("Patient information not found.");
      setRemindersLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/medication-reminders/patient/${encodeURIComponent(
          patientEmail
        )}/today`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load medication reminders.");
      }

      const data = await response.json();

      setReminders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading reminders:", error);
      setReminderError("Unable to load today's reminders.");
    } finally {
      setRemindersLoading(false);
    }
  };

  // ============================================================
  // LOAD EVERYTHING
  // ============================================================

  const loadPageData = async () => {
    await Promise.all([
      loadMedications(),
      loadReminders(),
    ]);
  };

  // ============================================================
  // LOAD WHEN PAGE OPENS
  // ============================================================

  useEffect(() => {
    loadPageData();
  }, []);

  // ============================================================
  // MARK REMINDER AS TAKEN
  // ============================================================

  const markReminderAsTaken = async (
    reminderId: number
  ) => {
    const token = localStorage.getItem("token");

    setTakingReminderId(reminderId);
    setReminderError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/medication-reminders/${reminderId}/taken`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark reminder as taken.");
      }

      const updatedReminder = await response.json();

      setReminders((currentReminders) =>
        currentReminders.map((reminder) =>
          reminder.id === reminderId
            ? updatedReminder
            : reminder
        )
      );
    } catch (error) {
      console.error("Error marking reminder as taken:", error);
      setReminderError(
        "Unable to mark the reminder as taken."
      );
    } finally {
      setTakingReminderId(null);
    }
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date: string | null) => {
    if (!date) {
      return "Not specified";
    }

    try {
      return new Date(`${date}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return date;
    }
  };

  // ============================================================
  // FORMAT REMINDER TIME
  // ============================================================

  const formatReminderTime = (time: string) => {
    if (!time) {
      return "Time not specified";
    }

    try {
      const [hours, minutes] = time.split(":");

      const date = new Date();
      date.setHours(
        Number(hours),
        Number(minutes),
        0,
        0
      );

      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return time;
    }
  };

  // ============================================================
  // GET REMINDERS FOR A MEDICATION
  // ============================================================

  const getMedicationReminders = (medicationId: number) => {
    return reminders
      .filter(
        (reminder) =>
          reminder.medication?.id === medicationId
      )
      .sort((a, b) =>
        a.reminderTime.localeCompare(b.reminderTime)
      );
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <DashboardLayout role="patient">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            My Medications
          </h1>

          <p className="mt-2 text-slate-500">
            View your prescribed medicines, dosage and instructions.
          </p>
        </div>

        <button
          onClick={loadPageData}
          disabled={loading || remindersLoading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={
              loading || remindersLoading
                ? "animate-spin"
                : ""
            }
          />

          {loading || remindersLoading
            ? "Loading..."
            : "Refresh"}
        </button>

      </div>

      {/* ======================================================
          REMINDER SUMMARY
      ====================================================== */}

      {!remindersLoading && !reminderError && (
        <div className="mb-6 bg-teal-50 border border-teal-100 rounded-2xl p-5">

          <div className="flex items-center gap-3">

            <div className="h-11 w-11 rounded-full bg-white text-teal-600 flex items-center justify-center">
              <Bell size={21} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Today's Medication Reminders
              </h2>

              <p className="text-sm text-slate-600 mt-1">
                {reminders.length === 0
                  ? "No medication reminders for today."
                  : `${reminders.length} reminder${
                      reminders.length > 1 ? "s" : ""
                    } scheduled for today.`}
              </p>
            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          REMINDER ERROR
      ====================================================== */}

      {!remindersLoading && reminderError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-5">

          <div className="flex items-center gap-3">

            <XCircle
              size={22}
              className="text-red-500"
            />

            <p className="text-red-600">
              {reminderError}
            </p>

          </div>

        </div>
      )}

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8">

          <div className="flex items-center gap-3 text-slate-500">

            <RefreshCw
              size={20}
              className="animate-spin"
            />

            <span>
              Loading your medications...
            </span>

          </div>

        </div>
      )}

      {/* ======================================================
          ERROR
      ====================================================== */}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">

          <div className="flex items-center gap-3">

            <XCircle
              size={22}
              className="text-red-500"
            />

            <p className="text-red-600">
              {error}
            </p>

          </div>

        </div>
      )}

      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {!loading &&
        !error &&
        medications.length === 0 && (

          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">

            <div className="mx-auto h-16 w-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
              <Pill size={30} />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              No medications found
            </h2>

            <p className="mt-2 text-slate-500">
              Your prescribed medicines will appear here after a
              completed appointment.
            </p>

          </div>
        )}

      {/* ======================================================
          MEDICATION LIST
      ====================================================== */}

      {!loading &&
        !error &&
        medications.length > 0 && (

          <div className="space-y-5">

            {medications.map((medication) => {

              const doctorName =
                medication.medicalRecord
                  ?.appointment
                  ?.doctor
                  ?.name || "Doctor";

              const medicationReminders =
                getMedicationReminders(
                  medication.id
                );

              return (

                <div
                  key={medication.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                >

                  {/* ==================================================
                      TOP SECTION
                  ================================================== */}

                  <div className="p-6 border-b border-slate-100">

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                      <div className="flex items-center gap-4">

                        <div className="h-14 w-14 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                          <Pill size={26} />
                        </div>

                        <div>

                          <h2 className="text-xl font-semibold text-slate-900">
                            {medication.medicineName}
                          </h2>

                          <p className="mt-1 text-slate-500">
                            {medication.dosage}
                          </p>

                        </div>

                      </div>

                      {/* ACTIVE STATUS */}

                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                          medication.active
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >

                        {medication.active ? (
                          <>
                            <CheckCircle2 size={16} />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle size={16} />
                            Inactive
                          </>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* ==================================================
                      MEDICATION DETAILS
                  ================================================== */}

                  <div className="p-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      {/* FREQUENCY */}

                      <div className="bg-slate-50 rounded-xl p-4">

                        <div className="flex items-center gap-2 text-slate-500 text-sm">

                          <Clock3 size={17} />

                          <span>
                            Frequency
                          </span>

                        </div>

                        <p className="mt-2 font-semibold text-slate-900">
                          {medication.frequency}
                        </p>

                      </div>

                      {/* DURATION */}

                      <div className="bg-slate-50 rounded-xl p-4">

                        <div className="flex items-center gap-2 text-slate-500 text-sm">

                          <CalendarDays size={17} />

                          <span>
                            Duration
                          </span>

                        </div>

                        <p className="mt-2 font-semibold text-slate-900">

                          {medication.durationDays
                            ? `${medication.durationDays} days`
                            : "Not specified"}

                        </p>

                      </div>

                      {/* START DATE */}

                      <div className="bg-slate-50 rounded-xl p-4">

                        <p className="text-sm text-slate-500">
                          Start Date
                        </p>

                        <p className="mt-2 font-semibold text-slate-900">
                          {formatDate(
                            medication.startDate
                          )}
                        </p>

                      </div>

                      {/* END DATE */}

                      <div className="bg-slate-50 rounded-xl p-4">

                        <p className="text-sm text-slate-500">
                          End Date
                        </p>

                        <p className="mt-2 font-semibold text-slate-900">
                          {formatDate(
                            medication.endDate
                          )}
                        </p>

                      </div>

                    </div>

                    {/* ==================================================
                        TODAY'S REMINDERS FOR THIS MEDICATION
                    ================================================== */}

                    {medicationReminders.length > 0 && (

                      <div className="mt-6">

                        <div className="flex items-center gap-2 mb-3">

                          <Bell
                            size={18}
                            className="text-teal-600"
                          />

                          <h3 className="text-sm font-semibold text-slate-900">
                            Today's Reminders
                          </h3>

                        </div>

                        <div className="space-y-3">

                          {medicationReminders.map(
                            (reminder) => {

                              const isTaken =
                                reminder.status?.toUpperCase() ===
                                "TAKEN";

                              const isTaking =
                                takingReminderId ===
                                reminder.id;

                              return (

                                <div
                                  key={reminder.id}
                                  className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border p-4 ${
                                    isTaken
                                      ? "bg-green-50 border-green-200"
                                      : "bg-amber-50 border-amber-200"
                                  }`}
                                >

                                  <div className="flex items-center gap-3">

                                    <div
                                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                        isTaken
                                          ? "bg-green-100 text-green-600"
                                          : "bg-amber-100 text-amber-600"
                                      }`}
                                    >

                                      {isTaken ? (
                                        <CheckCircle2
                                          size={20}
                                        />
                                      ) : (
                                        <Clock3
                                          size={20}
                                        />
                                      )}

                                    </div>

                                    <div>

                                      <p className="font-semibold text-slate-900">
                                        {formatReminderTime(
                                          reminder.reminderTime
                                        )}
                                      </p>

                                      <p
                                        className={`text-sm mt-1 ${
                                          isTaken
                                            ? "text-green-700"
                                            : "text-amber-700"
                                        }`}
                                      >
                                        {isTaken
                                          ? "Medication taken"
                                          : "Medication pending"}
                                      </p>

                                    </div>

                                  </div>

                                  {!isTaken && (

                                    <button
                                      onClick={() =>
                                        markReminderAsTaken(
                                          reminder.id
                                        )
                                      }
                                      disabled={isTaking}
                                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition disabled:opacity-50"
                                    >

                                      {isTaking ? (
                                        <>
                                          <RefreshCw
                                            size={17}
                                            className="animate-spin"
                                          />
                                          Updating...
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle2
                                            size={17}
                                          />
                                          Mark as Taken
                                        </>
                                      )}

                                    </button>

                                  )}

                                  {isTaken && (

                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-100 text-green-700 font-medium text-sm">

                                      <CheckCircle2
                                        size={17}
                                      />

                                      Taken

                                    </div>

                                  )}

                                </div>

                              );
                            }
                          )}

                        </div>

                      </div>

                    )}

                    {/* ==================================================
                        NO REMINDERS FOR THIS MEDICATION
                    ================================================== */}

                    {!remindersLoading &&
                      medicationReminders.length === 0 &&
                      medication.active && (

                        <div className="mt-6 bg-slate-50 border border-slate-100 rounded-xl p-4">

                          <div className="flex items-center gap-2 text-slate-500">

                            <Bell size={17} />

                            <p className="text-sm">
                              No reminders scheduled for this medication today.
                            </p>

                          </div>

                        </div>

                      )}

                    {/* ==================================================
                        INSTRUCTIONS
                    ================================================== */}

                    {medication.instructions && (

                      <div className="mt-5">

                        <h3 className="text-sm font-semibold text-slate-900">
                          Instructions
                        </h3>

                        <div className="mt-2 bg-teal-50 border border-teal-100 rounded-xl p-4">

                          <p className="text-slate-700">
                            {medication.instructions}
                          </p>

                        </div>

                      </div>

                    )}

                    {/* ==================================================
                        DOCTOR
                    ================================================== */}

                    <div className="mt-5 flex items-center gap-3 text-sm text-slate-500">

                      <UserRound size={17} />

                      <span>

                        Prescribed by{" "}

                        <span className="font-medium text-slate-800">
                          {doctorName}
                        </span>

                      </span>

                    </div>

                  </div>

                </div>

              );
            })}

          </div>

        )}

    </DashboardLayout>
  );
}

export default Medications;