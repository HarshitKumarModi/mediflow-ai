import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { API_BASE_URL } from "../../config/api";

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Appointment {
  id: number;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  patient: Patient;
}

interface MedicalRecord {
  id?: number;
  appointmentId?: number;
  diagnosis: string;
  symptoms: string;
  doctorNotes: string;
  prescription: string;
  medicines: string;
  dosage: string;
  followUpInstructions: string;
}

function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // ============================================================
  // MEDICAL RECORD STATE
  // ============================================================

  const [showMedicalRecord, setShowMedicalRecord] = useState(false);

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [medicalRecordLoading, setMedicalRecordLoading] =
    useState(false);

  const [medicalRecordSaving, setMedicalRecordSaving] =
    useState(false);

  const [medicalRecordError, setMedicalRecordError] =
    useState("");

  const [existingRecord, setExistingRecord] =
    useState<MedicalRecord | null>(null);

  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord>({
    diagnosis: "",
    symptoms: "",
    doctorNotes: "",
    prescription: "",
    medicines: "",
    dosage: "",
    followUpInstructions: "",
  });

  // ============================================================
  // GET LOGGED-IN DOCTOR EMAIL
  // ============================================================

  const getDoctorEmail = () => {
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
      console.error("Unable to read logged-in user:", error);
      return localStorage.getItem("email");
    }
  };

  // ============================================================
  // GET JWT TOKEN
  // ============================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ============================================================
  // LOAD APPOINTMENTS
  // ============================================================

  const loadAppointments = async () => {
    setLoading(true);
    setError("");

    const doctorEmail = getDoctorEmail();
    const token = getToken();

    if (!doctorEmail) {
      setError("Doctor information not found. Please login again.");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Authentication token not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/appointments/doctor/${encodeURIComponent(
          doctorEmail
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
        const responseText = await response.text();

        console.error("Load appointments error:", {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
        });

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

  // ============================================================
  // LOAD APPOINTMENTS WHEN PAGE OPENS
  // ============================================================

  useEffect(() => {
    loadAppointments();
  }, []);

  // ============================================================
  // UPDATE APPOINTMENT STATUS
  // ============================================================

  const updateAppointmentStatus = async (
    appointmentId: number,
    status: "accept" | "reject"
  ) => {
    setActionLoading(appointmentId);
    setError("");

    const token = getToken();

    if (!token) {
      alert("Authentication token not found. Please login again.");
      setActionLoading(null);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/appointments/${appointmentId}/${status}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const responseText = await response.text();

        console.error("Update appointment error:", {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
        });

        throw new Error("Failed to update appointment");
      }

      const updatedAppointment = await response.json();

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? updatedAppointment
            : appointment
        )
      );
    } catch (error) {
      console.error("Error updating appointment:", error);

      alert(
        status === "accept"
          ? "Unable to accept appointment."
          : "Unable to reject appointment."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // COMPLETE APPOINTMENT
  // ============================================================

  const completeAppointment = async (appointmentId: number) => {
    setActionLoading(appointmentId);
    setError("");

    const token = getToken();

    if (!token) {
      alert("Authentication token not found. Please login again.");
      setActionLoading(null);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/appointments/${appointmentId}/complete`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const responseText = await response.text();

        console.error("Complete appointment error:", {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
        });

        throw new Error("Failed to complete appointment");
      }

      const updatedAppointment = await response.json();

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? updatedAppointment
            : appointment
        )
      );
    } catch (error) {
      console.error("Error completing appointment:", error);

      alert("Unable to complete appointment.");
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // OPEN MEDICAL RECORD
  // ============================================================

  const openMedicalRecord = async (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowMedicalRecord(true);
    setMedicalRecordLoading(true);
    setMedicalRecordError("");
    setExistingRecord(null);

    const token = getToken();

    if (!token) {
      setMedicalRecordError(
        "Authentication token not found. Please login again."
      );
      setMedicalRecordLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/medical-records/appointment/${appointment.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // 404 simply means a record has not been created yet.
      if (response.status === 404) {
        setExistingRecord(null);

        setMedicalRecord({
          diagnosis: "",
          symptoms: "",
          doctorNotes: "",
          prescription: "",
          medicines: "",
          dosage: "",
          followUpInstructions: "",
        });

        return;
      }

      if (!response.ok) {
        const responseText = await response.text();

        console.error("Medical record load error:", {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
        });

        throw new Error("Failed to load medical record.");
      }

      const data = await response.json();

      setExistingRecord(data);

      setMedicalRecord({
        diagnosis: data.diagnosis || "",
        symptoms: data.symptoms || "",
        doctorNotes: data.doctorNotes || "",
        prescription: data.prescription || "",
        medicines: data.medicines || "",
        dosage: data.dosage || "",
        followUpInstructions:
          data.followUpInstructions || "",
      });
    } catch (error) {
      console.error("Medical record error:", error);

      setMedicalRecordError(
        "Unable to load medical record."
      );
    } finally {
      setMedicalRecordLoading(false);
    }
  };

  // ============================================================
  // CLOSE MEDICAL RECORD
  // ============================================================

  const closeMedicalRecord = () => {
    setShowMedicalRecord(false);
    setSelectedAppointment(null);
    setExistingRecord(null);
    setMedicalRecordError("");

    setMedicalRecord({
      diagnosis: "",
      symptoms: "",
      doctorNotes: "",
      prescription: "",
      medicines: "",
      dosage: "",
      followUpInstructions: "",
    });
  };

  // ============================================================
  // HANDLE MEDICAL RECORD INPUT
  // ============================================================

  const handleMedicalRecordChange = (
    field: keyof MedicalRecord,
    value: string
  ) => {
    setMedicalRecord((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // ============================================================
  // SAVE MEDICAL RECORD
  // ============================================================

  const saveMedicalRecord = async () => {
    if (!selectedAppointment) {
      return;
    }

    if (!medicalRecord.diagnosis.trim()) {
      setMedicalRecordError("Please enter the diagnosis.");
      return;
    }

    if (!medicalRecord.doctorNotes.trim()) {
      setMedicalRecordError(
        "Please enter the doctor's notes."
      );
      return;
    }

    setMedicalRecordSaving(true);
    setMedicalRecordError("");

    const token = getToken();

    if (!token) {
      setMedicalRecordError(
        "Authentication token not found. Please login again."
      );
      setMedicalRecordSaving(false);
      return;
    }

    try {
      const response = await fetch(
        "${API_BASE_URL}/api/medical-records",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            appointmentId: selectedAppointment.id,
            diagnosis: medicalRecord.diagnosis,
            symptoms: medicalRecord.symptoms,
            doctorNotes: medicalRecord.doctorNotes,
            prescription: medicalRecord.prescription,
            medicines: medicalRecord.medicines,
            dosage: medicalRecord.dosage,
            followUpInstructions:
              medicalRecord.followUpInstructions,
          }),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        console.error(
          "Medical record save error:",
          response.status,
          responseText
        );

        throw new Error(
          "Failed to save medical record."
        );
      }

      const savedRecord = JSON.parse(responseText);

      setExistingRecord(savedRecord);

      alert("Medical record saved successfully.");

      closeMedicalRecord();
    } catch (error) {
      console.error("Save medical record error:", error);

      setMedicalRecordError(
        "Unable to save medical record. Please try again."
      );
    } finally {
      setMedicalRecordSaving(false);
    }
  };

  // ============================================================
  // STATUS STYLING
  // ============================================================

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

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <DashboardLayout role="doctor">

      {/* ======================================================
          HEADING
      ====================================================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          My Appointments
        </h1>

        <p className="mt-2 text-slate-500">
          View and manage your patient appointments.
        </p>
      </div>

      {/* ======================================================
          REFRESH BUTTON
      ====================================================== */}

      <div className="flex justify-end mb-5">
        <button
          onClick={loadAppointments}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-500">
            Loading appointments...
          </p>
        </div>
      )}

      {/* ======================================================
          ERROR
      ====================================================== */}

      {!loading && error && (
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <p className="text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* ======================================================
          NO APPOINTMENTS
      ====================================================== */}

      {!loading &&
        !error &&
        appointments.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-slate-500">
              No appointments found.
            </p>
          </div>
        )}

      {/* ======================================================
          APPOINTMENT LIST
      ====================================================== */}

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

              const isCompleted =
                normalizedStatus === "COMPLETED";

              const isUpdating =
                actionLoading === appointment.id;

              // ==================================================
              // CHECK WHETHER APPOINTMENT TIME HAS PASSED
              // ==================================================

              const appointmentDateTime = new Date(
                `${appointment.appointmentDate}T${appointment.appointmentTime}`
              );

              const isAppointmentOver =
                appointmentDateTime <= new Date();

              return (
                <div
                  key={appointment.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6"
                >

                  {/* ==================================================
                      TOP SECTION
                  ================================================== */}

                  <div className="flex justify-between items-start gap-5">

                    <div className="flex items-center gap-4">

                      {/* Patient Avatar */}

                      <div className="h-14 w-14 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center text-lg font-semibold">
                        {appointment.patient?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "P"}
                      </div>

                      {/* Patient Information */}

                      <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                          {appointment.patient?.name ||
                            "Unknown Patient"}
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                          {appointment.patient?.email ||
                            "Email not available"}
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          {appointment.patient?.phone ||
                            "Phone not available"}
                        </p>
                      </div>
                    </div>

                    {/* Status */}

                    <span
                      className={`px-4 py-2 rounded-full text-xs font-medium ${getStatusClass(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>

                  </div>

                  {/* ==================================================
                      APPOINTMENT DETAILS
                  ================================================== */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">

                    {/* Date */}

                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-400">
                        Appointment Date
                      </p>

                      <p className="font-semibold text-slate-900 mt-1">
                        {appointment.appointmentDate}
                      </p>
                    </div>

                    {/* Time */}

                    <div className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-400">
                        Appointment Time
                      </p>

                      <p className="font-semibold text-slate-900 mt-1">
                        {appointment.appointmentTime}
                      </p>
                    </div>

                  </div>

                  {/* ==================================================
                      PENDING ACTION BUTTONS
                  ================================================== */}

                  {isPending && (
                    <div className="flex gap-3 mt-6">

                      {/* Accept */}

                      <button
                        onClick={() =>
                          updateAppointmentStatus(
                            appointment.id,
                            "accept"
                          )
                        }
                        disabled={isUpdating}
                        className="px-5 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating
                          ? "Updating..."
                          : "Accept"}
                      </button>

                      {/* Reject */}

                      <button
                        onClick={() =>
                          updateAppointmentStatus(
                            appointment.id,
                            "reject"
                          )
                        }
                        disabled={isUpdating}
                        className="px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating
                          ? "Updating..."
                          : "Reject"}
                      </button>

                    </div>
                  )}

                  {/* ==================================================
                      CONFIRMED APPOINTMENT
                  ================================================== */}

                  {isConfirmed && (
                    <div className="mt-5">

                      <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                        <p className="text-sm text-green-700">
                          This appointment has been confirmed.
                        </p>
                      </div>

                      {/* Complete Button */}

                      {isAppointmentOver && (
                        <div className="flex justify-end mt-4">

                          <button
                            onClick={() =>
                              completeAppointment(
                                appointment.id
                              )
                            }
                            disabled={isUpdating}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating
                              ? "Completing..."
                              : "Complete Appointment"}
                          </button>

                        </div>
                      )}

                    </div>
                  )}

                  {/* ==================================================
                      REJECTED MESSAGE
                  ================================================== */}

                  {normalizedStatus === "REJECTED" && (
                    <div className="mt-5 bg-red-50 border border-red-100 rounded-xl p-4">
                      <p className="text-sm text-red-700">
                        This appointment has been rejected.
                      </p>
                    </div>
                  )}

                  {/* ==================================================
                      COMPLETED + MEDICAL RECORD
                  ================================================== */}

                  {isCompleted && (
                    <div className="mt-5">

                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <p className="text-sm text-blue-700">
                          This appointment has been completed.
                        </p>
                      </div>

                      {/* Medical Record Button */}

                      <div className="flex justify-end mt-4">

                        <button
                          onClick={() =>
                            openMedicalRecord(appointment)
                          }
                          className="px-5 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition"
                        >
                          Medical Record
                        </button>

                      </div>

                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

      {/* ============================================================
          MEDICAL RECORD MODAL
      ============================================================ */}

      {showMedicalRecord && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">

            {/* ======================================================
                MODAL HEADER
            ====================================================== */}

            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Medical Record
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Patient:{" "}
                  <span className="font-medium text-slate-700">
                    {selectedAppointment.patient?.name}
                  </span>
                </p>
              </div>

              <button
                onClick={closeMedicalRecord}
                className="h-9 w-9 rounded-full hover:bg-slate-100 text-slate-500 text-xl"
              >
                ×
              </button>

            </div>

            {/* ======================================================
                MODAL BODY
            ====================================================== */}

            <div className="p-6">

              {medicalRecordLoading ? (
                <div className="py-12 text-center">
                  <p className="text-slate-500">
                    Loading medical record...
                  </p>
                </div>
              ) : (
                <>

                  {/* Existing Record Message */}

                  {existingRecord && (
                    <div className="mb-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-sm text-blue-700">
                        A medical record already exists for this
                        appointment. You can review the details below.
                      </p>
                    </div>
                  )}

                  {/* Error */}

                  {medicalRecordError && (
                    <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-sm text-red-600">
                        {medicalRecordError}
                      </p>
                    </div>
                  )}

                  <div className="space-y-5">

                    {/* Diagnosis */}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Diagnosis *
                      </label>

                      <input
                        type="text"
                        value={medicalRecord.diagnosis}
                        onChange={(e) =>
                          handleMedicalRecordChange(
                            "diagnosis",
                            e.target.value
                          )
                        }
                        placeholder="Enter diagnosis"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Symptoms */}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Symptoms
                      </label>

                      <textarea
                        rows={3}
                        value={medicalRecord.symptoms}
                        onChange={(e) =>
                          handleMedicalRecordChange(
                            "symptoms",
                            e.target.value
                          )
                        }
                        placeholder="Describe patient's symptoms"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      />
                    </div>

                    {/* Doctor Notes */}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Doctor's Notes *
                      </label>

                      <textarea
                        rows={4}
                        value={medicalRecord.doctorNotes}
                        onChange={(e) =>
                          handleMedicalRecordChange(
                            "doctorNotes",
                            e.target.value
                          )
                        }
                        placeholder="Enter clinical notes and observations"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      />
                    </div>

                    {/* Prescription */}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Prescription
                      </label>

                      <textarea
                        rows={3}
                        value={medicalRecord.prescription}
                        onChange={(e) =>
                          handleMedicalRecordChange(
                            "prescription",
                            e.target.value
                          )
                        }
                        placeholder="Enter prescription details"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      />
                    </div>

                    {/* Medicines + Dosage */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Medicines
                        </label>

                        <textarea
                          rows={3}
                          value={medicalRecord.medicines}
                          onChange={(e) =>
                            handleMedicalRecordChange(
                              "medicines",
                              e.target.value
                            )
                          }
                          placeholder="e.g. Paracetamol, Azithromycin"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Dosage
                        </label>

                        <textarea
                          rows={3}
                          value={medicalRecord.dosage}
                          onChange={(e) =>
                            handleMedicalRecordChange(
                              "dosage",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 1 tablet twice daily"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                        />
                      </div>

                    </div>

                    {/* Follow-up Instructions */}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Follow-up Instructions
                      </label>

                      <textarea
                        rows={3}
                        value={
                          medicalRecord.followUpInstructions
                        }
                        onChange={(e) =>
                          handleMedicalRecordChange(
                            "followUpInstructions",
                            e.target.value
                          )
                        }
                        placeholder="Enter follow-up instructions"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      />
                    </div>

                  </div>

                  {/* ==================================================
                      MODAL ACTIONS
                  ================================================== */}

                  <div className="flex justify-end gap-3 mt-7 pt-5 border-t border-slate-200">

                    <button
                      onClick={closeMedicalRecord}
                      disabled={medicalRecordSaving}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={saveMedicalRecord}
                      disabled={medicalRecordSaving}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {medicalRecordSaving
                        ? "Saving..."
                        : "Save Medical Record"}
                    </button>

                  </div>

                </>
              )}

            </div>

          </div>

        </div>
      )}

    </DashboardLayout>
  );
}

export default Appointments;