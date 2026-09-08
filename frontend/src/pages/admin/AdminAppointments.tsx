import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { API_BASE_URL } from "../../config/api";
import {
  CalendarDays,
  Clock,
  User,
  Stethoscope,
  RefreshCw,
} from "lucide-react";

interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  patientEmail: string;
  doctorId: number;
  doctorName: string;
  doctorEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
}

function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/appointments`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load appointments.");
      }

      const data = await response.json();

      setAppointments(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "CANCELLED":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <DashboardLayout role="admin">

      {/* Heading */}

      <div className="flex items-start justify-between mb-8">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Appointments
          </h1>

          <p className="mt-2 text-slate-500">
            View and monitor all appointments on the MediFlow platform.
          </p>
        </div>

        <button
          onClick={fetchAppointments}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>


      {/* Summary */}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">

        <div className="flex items-center gap-4">

          <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <CalendarDays size={23} />
          </div>

          <div>

            <p className="text-sm text-slate-500">
              Total Appointments
            </p>

            <p className="text-2xl font-bold text-slate-900 mt-1">
              {appointments.length}
            </p>

          </div>

        </div>

      </div>


      {/* Error */}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}


      {/* Appointments */}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

        <div className="p-6 border-b border-slate-200">

          <h2 className="text-lg font-semibold text-slate-900">
            All Appointments
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Appointments currently registered in MediFlow.
          </p>

        </div>


        {/* Loading */}

        {loading ? (

          <div className="p-6">

            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-slate-500">
                Loading appointments...
              </p>
            </div>

          </div>

        ) : appointments.length === 0 ? (

          <div className="p-6">

            <div className="bg-slate-50 rounded-xl p-5">
              <p className="text-slate-500">
                No appointments found.
              </p>
            </div>

          </div>

        ) : (

          <div>

            {appointments.map((appointment) => (

              <div
                key={appointment.id}
                className="p-6 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition"
              >

                <div className="flex items-center justify-between gap-6">

                  {/* Left side */}

                  <div className="flex items-center gap-4">

                    <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <CalendarDays size={22} />
                    </div>

                    <div>

                      <h3 className="font-semibold text-slate-900">
                        Appointment #{appointment.id}
                      </h3>

                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                        <CalendarDays size={15} />

                        <span>
                          {appointment.appointmentDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                        <Clock size={15} />

                        <span>
                          {appointment.appointmentTime}
                        </span>
                      </div>

                    </div>

                  </div>


                  {/* Patient */}

                  <div className="min-w-[190px]">

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <User size={16} />

                      <span>
                        Patient
                      </span>
                    </div>

                    <p className="font-medium text-slate-900 mt-1">
                      {appointment.patientName}
                    </p>

                    <p className="text-sm text-slate-500">
                      {appointment.patientEmail}
                    </p>

                  </div>


                  {/* Doctor */}

                  <div className="min-w-[190px]">

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Stethoscope size={16} />

                      <span>
                        Doctor
                      </span>
                    </div>

                    <p className="font-medium text-slate-900 mt-1">
                      {appointment.doctorName}
                    </p>

                    <p className="text-sm text-slate-500">
                      {appointment.doctorEmail}
                    </p>

                  </div>


                  {/* Status */}

                  <div>

                    <span
                      className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>

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

export default AdminAppointments;