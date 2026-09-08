import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { API_BASE_URL } from "../../config/api";
import {
  FileText,
  CalendarDays,
  User,
  Pill,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";

interface PostVisitSummary {
  id?: number;
  summary?: string;
  medicationSchedule?: string | string[];
  followUpSteps?: string | string[];
  importantNotes?: string | string[];
  createdAt?: string;
}

interface MedicalRecord {
  id: number;
  diagnosis: string;
  symptoms: string;
  doctorNotes: string;
  prescription: string;
  medicines: string;
  dosage: string;
  followUpInstructions: string;
  createdAt?: string;
  postVisitSummary?: PostVisitSummary | null;
}

interface Appointment {
  id: number;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  doctor?: {
    name: string;
    email: string;
    phone?: string;
  };
}

function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ============================================================
  // PARSE AI LIST DATA
  // ============================================================

  const parseListValue = (
    value?: string | string[]
  ): string[] => {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }

      return [String(parsed)];
    } catch {
      return [value];
    }
  };

  // ============================================================
  // LOAD RECORDS
  // ============================================================

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const userString = localStorage.getItem("user");

      if (!userString) {
        setError("User information not found.");
        return;
      }

      const user = JSON.parse(userString);
      const email = user.email;

      if (!email) {
        setError("Patient email not found.");
        return;
      }

      // ========================================================
      // GET PATIENT APPOINTMENTS
      // ========================================================

      const appointmentResponse = await fetch(
        `${API_BASE_URL}/api/appointments/patient/${encodeURIComponent(
          email
        )}`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      if (!appointmentResponse.ok) {
        throw new Error("Unable to load appointments.");
      }

      const appointments: Appointment[] =
        await appointmentResponse.json();

      // ========================================================
      // ONLY COMPLETED APPOINTMENTS
      // ========================================================

      const completedAppointments = appointments.filter(
        (appointment) =>
          appointment.status?.toUpperCase() === "COMPLETED"
      );

      // ========================================================
      // GET MEDICAL RECORD + AI POST-VISIT SUMMARY
      // ========================================================

      const recordRequests = completedAppointments.map(
        async (appointment) => {
          try {
            // ----------------------------------------------
            // Medical record
            // ----------------------------------------------

            const response = await fetch(
              `${API_BASE_URL}/api/medical-records/appointment/${appointment.id}`,
              {
                headers: token
                  ? {
                      Authorization: `Bearer ${token}`,
                    }
                  : {},
              }
            );

            if (!response.ok) {
              return null;
            }

            const record = await response.json();

            // ----------------------------------------------
            // AI post-visit summary
            // ----------------------------------------------

            let postVisitSummary: PostVisitSummary | null =
              null;

            try {
              const aiResponse = await fetch(
                `${API_BASE_URL}/api/post-visit-summaries/medical-record/${record.id}`,
                {
                  headers: token
                    ? {
                        Authorization: `Bearer ${token}`,
                      }
                    : {},
                }
              );

              if (aiResponse.ok) {
                postVisitSummary =
                  await aiResponse.json();
              }
            } catch (error) {
              console.error(
                "Unable to load AI post-visit summary:",
                error
              );
            }

            return {
              ...record,
              appointment,
              postVisitSummary,
            };
          } catch (error) {
            console.error(
              "Unable to load medical record:",
              error
            );

            return null;
          }
        }
      );

      const results = await Promise.all(recordRequests);

      const validRecords = results.filter(
        (
          record
        ): record is MedicalRecord & {
          appointment: Appointment;
        } => record !== null
      );

      setRecords(validRecords);
    } catch (error) {
      console.error("Medical records error:", error);
      setError("Unable to load medical records.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD WHEN PAGE OPENS
  // ============================================================

  useEffect(() => {
    loadRecords();
  }, []);

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <DashboardLayout role="patient">
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Medical Records
          </h1>

          <p className="mt-2 text-slate-500">
            View your diagnosis, prescriptions, doctor's notes
            and AI-generated post-visit summaries.
          </p>
        </div>

        <button
          onClick={loadRecords}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />

          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* ========================================================
          LOADING
      ======================================================== */}

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <p className="text-slate-500">
            Loading your medical records...
          </p>
        </div>
      )}

      {/* ========================================================
          ERROR
      ======================================================== */}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle
              size={20}
              className="text-red-600"
            />

            <p className="text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          EMPTY
      ======================================================== */}

      {!loading &&
        !error &&
        records.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-teal-50 flex items-center justify-center">
              <FileText
                size={28}
                className="text-teal-600"
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              No Medical Records Yet
            </h2>

            <p className="mt-2 text-slate-500">
              Your medical records will appear here after your
              completed appointments.
            </p>
          </div>
        )}

      {/* ========================================================
          RECORDS
      ======================================================== */}

      {!loading &&
        !error &&
        records.length > 0 && (
          <div className="space-y-6">
            {records.map((record) => {
              const appointment =
                (record as MedicalRecord & {
                  appointment?: Appointment;
                }).appointment;

              const postVisitSummary =
                record.postVisitSummary;

              const medicationSchedule =
                parseListValue(
                  postVisitSummary?.medicationSchedule
                );

              const followUpSteps =
                parseListValue(
                  postVisitSummary?.followUpSteps
                );

              const importantNotes =
                parseListValue(
                  postVisitSummary?.importantNotes
                );

              return (
                <div
                  key={record.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                >
                  {/* ==================================================
                      RECORD HEADER
                  ================================================== */}

                  <div className="p-6 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-5">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
                          <FileText size={25} />
                        </div>

                        <div>
                          <h2 className="text-lg font-semibold text-slate-900">
                            Medical Record
                          </h2>

                          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <CalendarDays size={15} />

                              {appointment?.appointmentDate}
                            </span>

                            {appointment?.doctor?.name && (
                              <span className="flex items-center gap-1.5">
                                <User size={15} />

                                Dr.{" "}
                                {appointment.doctor.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                        Completed
                      </span>
                    </div>
                  </div>

                  {/* ==================================================
                      RECORD CONTENT
                  ================================================== */}

                  <div className="p-6 space-y-6">
                    {/* ==================================================
                        DIAGNOSIS
                    ================================================== */}

                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-2">
                        Diagnosis
                      </h3>

                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-slate-700">
                          {record.diagnosis ||
                            "No diagnosis provided."}
                        </p>
                      </div>
                    </div>

                    {/* ==================================================
                        SYMPTOMS
                    ================================================== */}

                    {record.symptoms && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-2">
                          Symptoms
                        </h3>

                        <div className="bg-slate-50 rounded-xl p-4">
                          <p className="text-slate-700 whitespace-pre-wrap">
                            {record.symptoms}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ==================================================
                        DOCTOR NOTES
                    ================================================== */}

                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-2">
                        Doctor's Notes
                      </h3>

                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-slate-700 whitespace-pre-wrap">
                          {record.doctorNotes ||
                            "No doctor's notes provided."}
                        </p>
                      </div>
                    </div>

                    {/* ==================================================
                        PRESCRIPTION
                    ================================================== */}

                    {record.prescription && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-2">
                          Prescription
                        </h3>

                        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                          <p className="text-slate-700 whitespace-pre-wrap">
                            {record.prescription}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ==================================================
                        MEDICINES
                    ================================================== */}

                    {(record.medicines ||
                      record.dosage) && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-2">
                          <span className="flex items-center gap-2">
                            <Pill
                              size={17}
                              className="text-teal-600"
                            />

                            Medicines
                          </span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {record.medicines && (
                            <div className="bg-slate-50 rounded-xl p-4">
                              <p className="text-xs text-slate-500 mb-1">
                                Medicine
                              </p>

                              <p className="text-slate-700 whitespace-pre-wrap">
                                {record.medicines}
                              </p>
                            </div>
                          )}

                          {record.dosage && (
                            <div className="bg-slate-50 rounded-xl p-4">
                              <p className="text-xs text-slate-500 mb-1">
                                Dosage
                              </p>

                              <p className="text-slate-700 whitespace-pre-wrap">
                                {record.dosage}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ==================================================
                        FOLLOW UP
                    ================================================== */}

                    {record.followUpInstructions && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-2">
                          Follow-up Instructions
                        </h3>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                          <p className="text-slate-700 whitespace-pre-wrap">
                            {record.followUpInstructions}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ==================================================
                        AI POST-VISIT SUMMARY
                    ================================================== */}

                    {postVisitSummary && (
                      <div className="border border-teal-200 rounded-2xl overflow-hidden">
                        {/* AI HEADER */}

                        <div className="bg-teal-50 border-b border-teal-100 p-5">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-xl bg-white text-teal-600 flex items-center justify-center">
                              <Sparkles size={22} />
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold text-slate-900">
                                AI Post-Visit Summary
                              </h3>

                              <p className="text-sm text-slate-500 mt-1">
                                A patient-friendly summary of your
                                visit.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 space-y-5">
                          {/* SUMMARY */}

                          {postVisitSummary.summary && (
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                                Visit Summary
                              </h4>

                              <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-slate-700 leading-relaxed">
                                  {postVisitSummary.summary}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* MEDICATION SCHEDULE */}

                          {medicationSchedule.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                                <span className="flex items-center gap-2">
                                  <Pill
                                    size={17}
                                    className="text-teal-600"
                                  />

                                  Medication Schedule
                                </span>
                              </h4>

                              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                                <ul className="space-y-2">
                                  {medicationSchedule.map(
                                    (item, index) => (
                                      <li
                                        key={index}
                                        className="flex gap-2 text-slate-700"
                                      >
                                        <span className="text-teal-600 font-bold">
                                          •
                                        </span>

                                        <span>{item}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* FOLLOW-UP STEPS */}

                          {followUpSteps.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                                <span className="flex items-center gap-2">
                                  <ClipboardList
                                    size={17}
                                    className="text-blue-600"
                                  />

                                  Follow-up Steps
                                </span>
                              </h4>

                              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                <ul className="space-y-2">
                                  {followUpSteps.map(
                                    (item, index) => (
                                      <li
                                        key={index}
                                        className="flex gap-2 text-slate-700"
                                      >
                                        <span className="text-blue-600 font-bold">
                                          •
                                        </span>

                                        <span>{item}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* IMPORTANT NOTES */}

                          {importantNotes.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900 mb-2">
                                <span className="flex items-center gap-2">
                                  <AlertTriangle
                                    size={17}
                                    className="text-orange-600"
                                  />

                                  Important Notes
                                </span>
                              </h4>

                              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                                <ul className="space-y-2">
                                  {importantNotes.map(
                                    (item, index) => (
                                      <li
                                        key={index}
                                        className="flex gap-2 text-slate-700"
                                      >
                                        <span className="text-orange-600 font-bold">
                                          •
                                        </span>

                                        <span>{item}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* DISCLAIMER */}

                          <div className="pt-2">
                            <p className="text-xs text-slate-400">
                              AI-generated summary is provided for
                              informational purposes. Always follow
                              your doctor's instructions.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ==================================================
                        AI SUMMARY NOT AVAILABLE
                    ================================================== */}

                    {!postVisitSummary && (
                      <div className="border border-slate-200 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                            <Sparkles size={20} />
                          </div>

                          <div>
                            <h3 className="text-sm font-semibold text-slate-700">
                              AI Post-Visit Summary
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                              An AI summary is not available for
                              this record yet.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </DashboardLayout>
  );
}

export default MedicalRecords;