import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Users, Mail, Phone } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

interface Appointment {
  id: number;
  appointmentDate: string;
  appointmentTime: string;
  status: string;

  patient: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
}

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
}

function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  // LOAD PATIENTS
  // ============================================================

  useEffect(() => {
    const doctorEmail = getDoctorEmail();
    const token = localStorage.getItem("token");

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

    fetch(
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
    )
      .then(async (response) => {
        if (!response.ok) {
          let message = "Failed to load patients.";

          try {
            const errorData = await response.json();

            if (errorData?.message) {
              message = errorData.message;
            } else if (errorData?.error) {
              message = errorData.error;
            }
          } catch {
            // Keep default message
          }

          throw new Error(message);
        }

        return response.json();
      })
      .then((data: Appointment[]) => {
        const patientMap = new Map<number, Patient>();

        data.forEach((appointment) => {
          if (appointment.patient) {
            patientMap.set(appointment.patient.id, appointment.patient);
          }
        });

        setPatients(Array.from(patientMap.values()));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading patients:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load patients."
        );

        setLoading(false);
      });
  }, []);

  return (
    <DashboardLayout role="doctor">
      {/* Heading */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          My Patients
        </h1>

        <p className="mt-2 text-slate-500">
          View patients who have appointments with you.
        </p>
      </div>

      {/* Loading */}

      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-slate-500">
            Loading patients...
          </p>
        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <p className="text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* No patients */}

      {!loading &&
        !error &&
        patients.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-slate-500">
              No patients found.
            </p>
          </div>
        )}

      {/* Patient list */}

      {!loading &&
        !error &&
        patients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="bg-white rounded-2xl border border-slate-200 p-6"
              >
                {/* Patient heading */}

                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-full bg-teal-100 flex items-center justify-center">
                    <Users
                      size={26}
                      className="text-teal-600"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {patient.name}
                    </h2>

                    <p className="text-sm text-teal-600">
                      Patient
                    </p>
                  </div>
                </div>

                {/* Email */}

                <div className="flex items-center gap-3 text-sm text-slate-600 mb-4">
                  <Mail size={17} />

                  <span>
                    {patient.email}
                  </span>
                </div>

                {/* Phone */}

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={17} />

                  <span>
                    {patient.phone}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
    </DashboardLayout>
  );
}

export default Patients;
