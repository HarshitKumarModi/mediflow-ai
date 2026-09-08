import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Stethoscope, Phone, Mail } from "lucide-react";

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking states
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // ============================================================
  // LOAD DOCTORS
  // ============================================================

  useEffect(() => {
    fetch("http://localhost:8080/api/doctors")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load doctors");
        }

        return response.json();
      })
      .then((data) => {
        setDoctors(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load doctors");
        setLoading(false);
      });
  }, []);

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
      console.error("Unable to read patient information:", error);
      return localStorage.getItem("email");
    }
  };

  // ============================================================
  // OPEN BOOKING MODAL
  // ============================================================

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setAppointmentDate("");
    setAppointmentTime("");
    setSymptoms("");
    setBookingMessage("");
    setBookingLoading(false);
  };

  // ============================================================
  // CLOSE BOOKING MODAL
  // ============================================================

  const handleCloseBooking = () => {
    if (bookingLoading) {
      return;
    }

    setSelectedDoctor(null);
    setAppointmentDate("");
    setAppointmentTime("");
    setSymptoms("");
    setBookingMessage("");
  };

  // ============================================================
  // CONFIRM APPOINTMENT
  // ============================================================

  const handleConfirmAppointment = () => {
    if (!selectedDoctor) {
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      setBookingMessage("Please select date and time.");
      return;
    }

    if (!symptoms.trim()) {
      setBookingMessage("Please describe your symptoms.");
      return;
    }

    const patientEmail = getPatientEmail();

    if (!patientEmail) {
      setBookingMessage("Patient information not found. Please login again.");
      return;
    }

    setBookingLoading(true);
    setBookingMessage("");

    const requestData = {
      patientEmail: patientEmail,
      doctorEmail: selectedDoctor.email,
      appointmentDate: appointmentDate,
      appointmentTime: appointmentTime,
      symptoms: symptoms.trim(),
    };

    const token = localStorage.getItem("token");

    fetch("http://localhost:8080/api/appointments", {
     method: "POST",
     headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      body: JSON.stringify(requestData),
    })
      .then(async (response) => {
        if (!response.ok) {
          let errorMessage = "Unable to book appointment.";

          try {
            const errorData = await response.json();

            if (errorData?.message) {
              errorMessage = errorData.message;
            } else if (errorData?.error) {
              errorMessage = errorData.error;
            } else if (errorData?.detail) {
              errorMessage = errorData.detail;
            }
          } catch {
            // Keep default error message
          }

          throw new Error(errorMessage);
        }

        return response.json();
      })
      .then(() => {
        setBookingMessage("Appointment booked successfully!");
        setBookingLoading(false);

        setAppointmentDate("");
        setAppointmentTime("");
        setSymptoms("");
      })
      .catch((error) => {
        console.error("Appointment booking error:", error);

        setBookingMessage(
          error instanceof Error
            ? error.message
            : "Unable to book appointment."
        );

        setBookingLoading(false);
      });
  };

  return (
    <DashboardLayout role="patient">

      {/* ======================================================
          PAGE HEADING
      ====================================================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Find Doctors
        </h1>

        <p className="mt-2 text-slate-500">
          Find the right doctor for your healthcare needs.
        </p>
      </div>


      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-500">
            Loading doctors...
          </p>
        </div>
      )}


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <p className="text-red-600">
            {error}
          </p>
        </div>
      )}


      {/* ======================================================
          NO DOCTORS
      ====================================================== */}

      {!loading && !error && doctors.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-500">
            No doctors available at the moment.
          </p>
        </div>
      )}


      {/* ======================================================
          DOCTORS
      ====================================================== */}

      {!loading && !error && doctors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl border border-slate-200 p-6"
            >

              {/* Doctor icon */}

              <div className="flex items-center gap-4 mb-5">

                <div className="h-14 w-14 rounded-full bg-teal-100 flex items-center justify-center">

                  <Stethoscope
                    size={26}
                    className="text-teal-600"
                  />

                </div>

                <div>

                  <h2 className="text-lg font-semibold text-slate-900">
                    {doctor.name}
                  </h2>

                  <p className="text-sm text-teal-600">
                    Doctor
                  </p>

                </div>

              </div>


              {/* Email */}

              <div className="flex items-center gap-3 text-sm text-slate-600 mb-3">

                <Mail size={17} />

                <span>
                  {doctor.email}
                </span>

              </div>


              {/* Phone */}

              <div className="flex items-center gap-3 text-sm text-slate-600 mb-5">

                <Phone size={17} />

                <span>
                  {doctor.phone}
                </span>

              </div>


              {/* Book button */}

              <button
                onClick={() => handleBookAppointment(doctor)}
                className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition"
              >
                Book Appointment
              </button>

            </div>
          ))}

        </div>
      )}


      {/* ======================================================
          BOOKING MODAL
      ====================================================== */}

      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl p-7 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">

            {/* Header */}

            <h2 className="text-xl font-bold text-slate-900">
              Book Appointment
            </h2>

            <p className="text-sm text-slate-500 mt-1 mb-6">
              Appointment with {selectedDoctor.name}
            </p>


            {/* ==================================================
                DATE
            ================================================== */}

            <div className="mb-4">

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Date
              </label>

              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
              />

            </div>


            {/* ==================================================
                TIME
            ================================================== */}

            <div className="mb-4">

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Time
              </label>

              <input
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
              />

            </div>


            {/* ==================================================
                SYMPTOMS
            ================================================== */}

            <div className="mb-5">

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Describe Your Symptoms
              </label>

              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Please describe what you're experiencing, including when it started and any important symptoms..."
                rows={4}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-teal-500"
              />

              <p className="text-xs text-slate-400 mt-2">
                These symptoms will be reviewed by the doctor and used to
                prepare an AI-assisted pre-visit summary.
              </p>

            </div>


            {/* ==================================================
                BOOKING MESSAGE
            ================================================== */}

            {bookingMessage && (
              <p
                className={`text-sm text-center mb-4 ${
                  bookingMessage.includes("successfully")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {bookingMessage}
              </p>
            )}


            {/* ==================================================
                BUTTONS
            ================================================== */}

            <div className="flex gap-3">

              <button
                onClick={handleCloseBooking}
                disabled={bookingLoading}
                className="flex-1 border border-slate-300 text-slate-700 py-3 rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmAppointment}
                disabled={bookingLoading}
                className="flex-1 bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition disabled:opacity-50"
              >
                {bookingLoading ? "Booking..." : "Confirm"}
              </button>

            </div>

          </div>

        </div>
      )}

    </DashboardLayout>
  );
}

export default Doctors;