import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { API_BASE_URL } from "../../config/api";
import {
  CalendarDays,
  Users,
  Clock,
  Activity,
} from "lucide-react";

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

  doctor: {
    id: number;
    name: string;
    email: string;
  };
}

function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const doctorEmail =
      localStorage.getItem("email") || "doctor@gmail.com";

    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in. Please login again.");
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
      .then((response) => {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Your session has expired. Please login again."
          );
        }

        if (!response.ok) {
          throw new Error("Failed to load appointments");
        }

        return response.json();
      })
      .then((data: Appointment[]) => {
        setAppointments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard appointment error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load appointments"
        );

        setLoading(false);
      });
  }, []);

  // Today's date
  const today = new Date().toISOString().split("T")[0];

  // Today's appointments
  const todaysAppointments = appointments.filter(
    (appointment) =>
      appointment.appointmentDate === today
  );

  // Upcoming appointments
  const upcomingAppointments = appointments.filter(
    (appointment) =>
      appointment.appointmentDate > today
  );

  // Pending appointments
  const pendingAppointments = appointments.filter(
    (appointment) =>
      appointment.status?.toUpperCase() === "PENDING"
  );

  // Unique patients
  const uniquePatients = new Set(
    appointments
      .map((appointment) => appointment.patient?.id)
      .filter((id) => id !== undefined && id !== null)
  );

  return (
    <DashboardLayout role="doctor">

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Good morning, Doctor 👋
        </h1>

        <p className="mt-2 text-slate-500">
          Here's your schedule and patient overview.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <Stat
          title="Today's Appointments"
          value={todaysAppointments.length.toString()}
          icon={<CalendarDays size={22} />}
        />

        <Stat
          title="Total Patients"
          value={uniquePatients.size.toString()}
          icon={<Users size={22} />}
        />

        <Stat
          title="Pending Appointments"
          value={pendingAppointments.length.toString()}
          icon={<Clock size={22} />}
        />

        <Stat
          title="AI Priority Cases"
          value="3"
          icon={<Activity size={22} />}
        />

      </div>

      {/* Today's Appointments */}
      <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">

        <h2 className="text-lg font-semibold text-slate-900">
          Today's Appointments
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Your scheduled consultations for today.
        </p>

        {/* Loading */}
        {loading && (
          <div className="mt-6">
            <p className="text-slate-500">
              Loading appointments...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* No appointments */}
        {!loading &&
          !error &&
          todaysAppointments.length === 0 && (
            <div className="mt-6 bg-slate-50 rounded-xl p-5">
              <p className="text-slate-500">
                No appointments scheduled for today.
              </p>
            </div>
          )}

        {/* Appointment list */}
        {!loading &&
          !error &&
          todaysAppointments.length > 0 && (
            <div className="mt-6 space-y-4">

              {todaysAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-slate-200 rounded-xl p-5"
                >

                  <div className="flex justify-between items-start">

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {appointment.patient?.name}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        {appointment.patient?.email}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status?.toUpperCase() === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : appointment.status?.toUpperCase() === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {appointment.status}
                    </span>

                  </div>

                  <div className="flex gap-8 mt-5">

                    <div>
                      <p className="text-xs text-slate-400">
                        Date
                      </p>

                      <p className="font-medium text-slate-900 mt-1">
                        {appointment.appointmentDate}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Time
                      </p>

                      <p className="font-medium text-slate-900 mt-1">
                        {appointment.appointmentTime}
                      </p>
                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

      </div>

      {/* Upcoming Appointments */}
      <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">

        <h2 className="text-lg font-semibold text-slate-900">
          Upcoming Appointments
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Your upcoming scheduled consultations.
        </p>

        {/* No upcoming appointments */}
        {!loading &&
          upcomingAppointments.length === 0 && (
            <div className="mt-6 bg-slate-50 rounded-xl p-5">
              <p className="text-slate-500">
                No upcoming appointments.
              </p>
            </div>
          )}

        {/* Upcoming appointment list */}
        {!loading &&
          upcomingAppointments.length > 0 && (
            <div className="mt-6 space-y-4">

              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-slate-200 rounded-xl p-5"
                >

                  <div className="flex justify-between items-start">

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {appointment.patient?.name}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        {appointment.patient?.email}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status?.toUpperCase() === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : appointment.status?.toUpperCase() === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {appointment.status}
                    </span>

                  </div>

                  <div className="flex gap-8 mt-5">

                    <div>
                      <p className="text-xs text-slate-400">
                        Date
                      </p>

                      <p className="font-medium text-slate-900 mt-1">
                        {appointment.appointmentDate}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Time
                      </p>

                      <p className="font-medium text-slate-900 mt-1">
                        {appointment.appointmentTime}
                      </p>
                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

      </div>

    </DashboardLayout>
  );
}

interface StatProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

function Stat({
  title,
  value,
  icon,
}: StatProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">

      <div className="flex justify-between items-center">

        <div>
          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="text-2xl font-bold mt-2">
            {value}
          </p>
        </div>

        <div className="h-11 w-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
          {icon}
        </div>

      </div>

    </div>
  );
}

export default DoctorDashboard;