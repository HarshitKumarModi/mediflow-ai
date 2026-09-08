import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";

import {
  CalendarDays,
  Clock,
  FileText,
  Pill,
} from "lucide-react";

interface Appointment {
  id: number;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  doctor?: {
    name?: string;
    specialization?: string;
  };
  doctorName?: string;
  specialization?: string;
}

interface MedicalRecord {
  id: number;
}

interface Medication {
  id: number;
  medicineName?: string;
  active?: boolean;
}

interface User {
  name?: string;
  email?: string;
  role?: string;
}

function PatientDashboard() {

  const [user, setUser] = useState<User | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);

  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD PATIENT DATA
  // =========================

  useEffect(() => {

    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      setLoading(false);
      return;
    }

    try {

      const parsedUser: User = JSON.parse(storedUser);

      setUser(parsedUser);

      if (!parsedUser.email) {
        setLoading(false);
        return;
      }

      const email = parsedUser.email;

      // =========================
      // COMMON AUTH HEADERS
      // =========================

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      Promise.all([

        // =========================
        // APPOINTMENTS
        // =========================

        fetch(
          `http://localhost:8080/api/appointments/patient/${encodeURIComponent(email)}`,
          {
            method: "GET",
            headers,
          }
        ).then(async (response) => {

          if (!response.ok) {
            console.error(
              "Failed to load appointments:",
              response.status
            );

            return [];
          }

          return response.json();

        }),

        // =========================
        // MEDICAL RECORDS
        // =========================

        fetch(
          `http://localhost:8080/api/medical-records/patient/${encodeURIComponent(email)}`,
          {
            method: "GET",
            headers,
          }
        ).then(async (response) => {

          if (!response.ok) {
            console.error(
              "Failed to load medical records:",
              response.status
            );

            return [];
          }

          return response.json();

        }),

        // =========================
        // MEDICATIONS
        // =========================

        fetch(
          `http://localhost:8080/api/medications/patient/${encodeURIComponent(email)}`,
          {
            method: "GET",
            headers,
          }
        ).then(async (response) => {

          if (!response.ok) {
            console.error(
              "Failed to load medications:",
              response.status
            );

            return [];
          }

          return response.json();

        }),

      ])
        .then(([appointmentData, recordData, medicationData]) => {

          console.log(
            "Dashboard appointments:",
            appointmentData
          );

          console.log(
            "Dashboard medical records:",
            recordData
          );

          console.log(
            "Dashboard medications:",
            medicationData
          );

          setAppointments(
            Array.isArray(appointmentData)
              ? appointmentData
              : []
          );

          setMedicalRecords(
            Array.isArray(recordData)
              ? recordData
              : []
          );

          setMedications(
            Array.isArray(medicationData)
              ? medicationData
              : []
          );

        })
        .catch((error) => {

          console.error(
            "Failed to load patient dashboard:",
            error
          );

        })
        .finally(() => {

          setLoading(false);

        });

    } catch (error) {

      console.error(
        "Invalid user data in localStorage:",
        error
      );

      setLoading(false);
    }

  }, []);


  // =========================
  // UPCOMING APPOINTMENTS
  // =========================

  const now = new Date();

  const upcomingAppointments = appointments
    .filter((appointment) => {

      const status =
        appointment.status?.toUpperCase();

      if (
        status !== "PENDING" &&
        status !== "CONFIRMED"
      ) {
        return false;
      }

      const appointmentDateTime = new Date(
        `${appointment.appointmentDate}T${appointment.appointmentTime}`
      );

      return appointmentDateTime >= now;

    })
    .sort((a, b) => {

      const dateA = new Date(
        `${a.appointmentDate}T${a.appointmentTime}`
      ).getTime();

      const dateB = new Date(
        `${b.appointmentDate}T${b.appointmentTime}`
      ).getTime();

      return dateA - dateB;

    });


  // =========================
  // NEXT APPOINTMENT
  // =========================

  const nextAppointment =
    upcomingAppointments.length > 0
      ? upcomingAppointments[0]
      : null;


  // =========================
  // ACTIVE MEDICATIONS
  // =========================

  const activeMedications =
    medications.filter(
      (medication) =>
        Boolean(medication.active)
    );


  // =========================
  // FORMAT TIME
  // =========================

  const formatTime = (
    time?: string
  ) => {

    if (!time) {
      return "--";
    }

    const [hours, minutes] =
      time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0
    );

    return date.toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );

  };


  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (
    dateString?: string
  ) => {

    if (!dateString) {
      return "";
    }

    const date =
      new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );

  };


  // =========================
  // DOCTOR NAME
  // =========================

  const getDoctorName = (
    appointment: Appointment
  ) => {

    if (appointment.doctor?.name) {
      return appointment.doctor.name;
    }

    if (appointment.doctorName) {
      return appointment.doctorName;
    }

    return "Doctor";
  };


  // =========================
  // SPECIALIZATION
  // =========================

  const getSpecialization = (
    appointment: Appointment
  ) => {

    if (appointment.doctor?.specialization) {
      return appointment.doctor.specialization;
    }

    if (appointment.specialization) {
      return appointment.specialization;
    }

    return "Specialist";
  };


  // =========================
  // INITIALS
  // =========================

  const getInitials = (
    name: string
  ) => {

    const parts = name
      .trim()
      .split(" ")
      .filter(Boolean);

    if (parts.length === 0) {
      return "DR";
    }

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();

  };


  // =========================
  // GREETING
  // =========================

  const getGreeting = () => {

    const hour =
      new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 18) {
      return "Good afternoon";
    }

    return "Good evening";
  };


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <DashboardLayout role="patient">

        <div className="flex items-center justify-center min-h-[400px]">

          <div className="text-slate-500">
            Loading your dashboard...
          </div>

        </div>

      </DashboardLayout>
    );

  }


  // =========================
  // DASHBOARD
  // =========================

  return (

    <DashboardLayout role="patient">

      {/* PAGE HEADING */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-900">

          {getGreeting()},{" "}
          {user?.name || "Patient"} 👋

        </h1>

        <p className="mt-2 text-slate-500">

          Here's what's happening with your
          healthcare today.

        </p>

      </div>


      {/* =========================
          STATS
      ========================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

        <StatCard
          title="Upcoming Appointments"
          value={String(
            upcomingAppointments.length
          )}
          icon={
            <CalendarDays size={22} />
          }
        />

        <StatCard
          title="Medical Records"
          value={String(
            medicalRecords.length
          )}
          icon={
            <FileText size={22} />
          }
        />

        <StatCard
          title="Active Medications"
          value={String(
            activeMedications.length
          )}
          icon={
            <Pill size={22} />
          }
        />

        <StatCard
          title="Next Appointment"
          value={
            nextAppointment
              ? formatTime(
                  nextAppointment.appointmentTime
                )
              : "--"
          }
          icon={
            <Clock size={22} />
          }
        />

      </div>


      {/* =========================
          NEXT APPOINTMENT
      ========================= */}

      <div className="bg-white rounded-2xl border border-slate-200 p-6">

        <div className="flex items-center justify-between mb-6">

          <div>

            <h2 className="text-lg font-semibold text-slate-900">

              Upcoming Appointment

            </h2>

            <p className="text-sm text-slate-500 mt-1">

              Your next scheduled consultation

            </p>

          </div>


          {nextAppointment && (

            <span
              className={
                nextAppointment.status?.toUpperCase() ===
                "CONFIRMED"
                  ? "px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"
                  : "px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"
              }
            >

              {nextAppointment.status}

            </span>

          )}

        </div>


        {/* NO UPCOMING APPOINTMENT */}

        {!nextAppointment && (

          <div className="py-10 text-center">

            <CalendarDays
              size={40}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-900">

              No Upcoming Appointments

            </h3>

            <p className="mt-2 text-sm text-slate-500">

              You don't have any upcoming
              appointments scheduled.

            </p>

          </div>

        )}


        {/* UPCOMING APPOINTMENT */}

        {nextAppointment && (

          <div className="flex items-center gap-5">

            <div className="h-14 w-14 rounded-full bg-teal-100 flex items-center justify-center">

              <span className="text-lg font-bold text-teal-700">

                {getInitials(
                  getDoctorName(
                    nextAppointment
                  )
                )}

              </span>

            </div>


            <div>

              <h3 className="font-semibold text-slate-900">

                {getDoctorName(
                  nextAppointment
                )}

              </h3>

              <p className="text-sm text-slate-500">

                {getSpecialization(
                  nextAppointment
                )}

              </p>

              <p className="text-sm text-slate-600 mt-1">

                {formatDate(
                  nextAppointment.appointmentDate
                )}

                {" • "}

                {formatTime(
                  nextAppointment.appointmentTime
                )}

              </p>

            </div>

          </div>

        )}

      </div>

    </DashboardLayout>

  );
}


// =========================
// STAT CARD
// =========================

interface StatCardProps {

  title: string;

  value: string;

  icon: React.ReactNode;

}


function StatCard({
  title,
  value,
  icon,
}: StatCardProps) {

  return (

    <div className="bg-white rounded-2xl border border-slate-200 p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500">

            {title}

          </p>

          <p className="text-2xl font-bold text-slate-900 mt-2">

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


export default PatientDashboard;