import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { API_BASE_URL } from "../../config/api";
import {
  CalendarDays,
  Clock,
  Trash2,
  Plus,
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
}

interface DoctorSchedule {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

function Schedule() {
  // ==========================================
  // STATE
  // ==========================================

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [schedules, setSchedules] =
    useState<DoctorSchedule[]>([]);

  const [loadingAppointments, setLoadingAppointments] =
    useState(true);

  const [loadingSchedules, setLoadingSchedules] =
    useState(true);

  const [appointmentError, setAppointmentError] =
    useState("");

  const [scheduleError, setScheduleError] =
    useState("");

  const [deleteLoading, setDeleteLoading] =
    useState<number | null>(null);

  const [selectedDay, setSelectedDay] =
    useState("MONDAY");

  const [startTime, setStartTime] =
    useState("09:00");

  const [endTime, setEndTime] =
    useState("17:00");

  const [addingSchedule, setAddingSchedule] =
    useState(false);

  const [addScheduleError, setAddScheduleError] =
    useState("");

  // ==========================================
  // DAYS OF WEEK
  // ==========================================

  const daysOfWeek = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  // ==========================================
  // LOAD APPOINTMENTS + SCHEDULE
  // ==========================================

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    let doctorEmail =
      localStorage.getItem("email") || "";

    // Prefer email from logged-in user object
    if (user) {
      try {
        const parsedUser = JSON.parse(user);

        if (parsedUser.email) {
          doctorEmail = parsedUser.email;
        }
      } catch {
        // Keep localStorage email fallback
      }
    }

    if (!doctorEmail) {
      doctorEmail = "doctor@gmail.com";
    }

    const authHeaders: HeadersInit = token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : {
          "Content-Type": "application/json",
        };

    // ========================================
    // LOAD APPOINTMENTS
    // ========================================

    fetch(
      `${API_BASE_URL}/api/appointments/doctor/${encodeURIComponent(
        doctorEmail
      )}`,
      {
        headers: authHeaders,
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to load appointments"
          );
        }

        return response.json();
      })
      .then((data) => {
        setAppointments(data);
        setLoadingAppointments(false);
      })
      .catch(() => {
        setAppointmentError(
          "Unable to load appointments"
        );

        setLoadingAppointments(false);
      });

    // ========================================
    // LOAD DOCTOR SCHEDULE
    // ========================================

    fetch(
      `${API_BASE_URL}/api/schedules/doctor/${encodeURIComponent(
        doctorEmail
      )}`,
      {
        headers: authHeaders,
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Failed to load schedule"
          );
        }

        return response.json();
      })
      .then((data) => {
        setSchedules(data);
        setLoadingSchedules(false);

        // Automatically select first available day
        if (data.length > 0) {
          const configuredDays = data.map(
            (schedule: DoctorSchedule) =>
              schedule.dayOfWeek.toUpperCase()
          );

          const firstAvailableDay =
            daysOfWeek.find(
              (day) =>
                !configuredDays.includes(day)
            );

          if (firstAvailableDay) {
            setSelectedDay(firstAvailableDay);
          }
        }
      })
      .catch(() => {
        setScheduleError(
          "Unable to load working schedule"
        );

        setLoadingSchedules(false);
      });
  }, []);

  // ==========================================
  // TODAY'S DATE
  // ==========================================

  const today = new Date()
    .toISOString()
    .split("T")[0];

  // ==========================================
  // UPCOMING APPOINTMENTS
  // ==========================================

  const upcomingAppointments =
    appointments
      .filter(
        (appointment) =>
          appointment.appointmentDate >= today &&
          appointment.status?.toUpperCase() !==
            "REJECTED"
      )
      .sort((a, b) => {
        const dateA =
          `${a.appointmentDate} ${a.appointmentTime}`;

        const dateB =
          `${b.appointmentDate} ${b.appointmentTime}`;

        return dateA.localeCompare(dateB);
      });

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime = (time: string) => {
    if (!time) {
      return "";
    }

    const [hours, minutes] =
      time.split(":").map(Number);

    const date = new Date();

    date.setHours(hours);
    date.setMinutes(minutes);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // ADD WORKING SCHEDULE
  // ==========================================

  const addSchedule = () => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    let doctorEmail =
      localStorage.getItem("email") || "";

    if (user) {
      try {
        const parsedUser = JSON.parse(user);

        if (parsedUser.email) {
          doctorEmail = parsedUser.email;
        }
      } catch {
        // Keep email fallback
      }
    }

    if (!doctorEmail) {
      doctorEmail = "doctor@gmail.com";
    }

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    if (!token) {
      setAddScheduleError(
        "Please login again."
      );
      return;
    }

    if (!startTime || !endTime) {
      setAddScheduleError(
        "Please select both start and end time."
      );

      return;
    }

    if (startTime >= endTime) {
      setAddScheduleError(
        "End time must be after start time."
      );

      return;
    }

    // ------------------------------------------
    // PREVENT DUPLICATE DAY
    // ------------------------------------------

    const alreadyExists =
      schedules.some(
        (schedule) =>
          schedule.dayOfWeek.toUpperCase() ===
          selectedDay.toUpperCase()
      );

    if (alreadyExists) {
      setAddScheduleError(
        `${selectedDay} already has a working schedule.`
      );

      return;
    }

    setAddingSchedule(true);
    setAddScheduleError("");

    // ------------------------------------------
    // CREATE REQUEST URL
    // ------------------------------------------

    const url =
      `${API_BASE_URL}/api/schedules` +
      `?doctorEmail=${encodeURIComponent(
        doctorEmail
      )}` +
      `&dayOfWeek=${encodeURIComponent(
        selectedDay
      )}` +
      `&startTime=${encodeURIComponent(
        startTime + ":00"
      )}` +
      `&endTime=${encodeURIComponent(
        endTime + ":00"
      )}`;

    // ------------------------------------------
    // POST REQUEST
    // ------------------------------------------

    fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          const message =
            await response.text();

          throw new Error(
            message ||
              "Failed to add schedule"
          );
        }

        return response.json();
      })
      .then((newSchedule) => {
        setSchedules((currentSchedules) => [
          ...currentSchedules,
          newSchedule,
        ]);

        // Find next available day
        const updatedSchedules = [
          ...schedules,
          newSchedule,
        ];

        const configuredDays =
          updatedSchedules.map(
            (schedule) =>
              schedule.dayOfWeek.toUpperCase()
          );

        const nextAvailableDay =
          daysOfWeek.find(
            (day) =>
              !configuredDays.includes(day)
          );

        if (nextAvailableDay) {
          setSelectedDay(nextAvailableDay);
        }

        setStartTime("09:00");
        setEndTime("17:00");
        setAddScheduleError("");
        setAddingSchedule(false);
      })
      .catch((error: Error) => {
        setAddScheduleError(
          error.message ||
            "Unable to add working schedule."
        );

        setAddingSchedule(false);
      });
  };

  // ==========================================
  // DELETE SCHEDULE
  // ==========================================

  const deleteSchedule = (id: number) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to remove this working schedule?"
      );

    if (!confirmed) {
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      alert("Please login again.");
      return;
    }

    setDeleteLoading(id);
    setAddScheduleError("");

    fetch(
      `${API_BASE_URL}/api/schedules/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then(async (response) => {
        if (!response.ok) {
          const message =
            await response.text();

          throw new Error(
            message ||
              "Failed to delete schedule"
          );
        }
      })
      .then(() => {
        setSchedules(
          (currentSchedules) =>
            currentSchedules.filter(
              (schedule) =>
                schedule.id !== id
            )
        );

        setDeleteLoading(null);
      })
      .catch((error: Error) => {
        alert(
          error.message ||
            "Unable to delete schedule"
        );

        setDeleteLoading(null);
      });
  };

  // ==========================================
  // AVAILABLE DAYS
  // ==========================================

  const availableDays =
    daysOfWeek.filter(
      (day) =>
        !schedules.some(
          (schedule) =>
            schedule.dayOfWeek.toUpperCase() ===
            day
        )
    );

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <DashboardLayout role="doctor">

      {/* PAGE HEADER */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          My Schedule
        </h1>

        <p className="mt-2 text-slate-500">
          View your working hours and upcoming
          consultations.
        </p>
      </div>

      {/* OVERVIEW CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

        {/* UPCOMING APPOINTMENTS */}

        <div className="bg-white rounded-2xl border border-slate-200 p-6">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Upcoming Appointments
              </p>

              <p className="text-3xl font-bold text-slate-900 mt-2">
                {loadingAppointments
                  ? "..."
                  : upcomingAppointments.length}
              </p>
            </div>

            <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CalendarDays size={23} />
            </div>

          </div>

        </div>

        {/* WORKING HOURS */}

        <div className="bg-white rounded-2xl border border-slate-200 p-6">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Working Hours
              </p>

              {loadingSchedules ? (

                <p className="text-2xl font-bold text-slate-900 mt-2">
                  Loading...
                </p>

              ) : schedules.length > 0 ? (

                <p className="text-2xl font-bold text-slate-900 mt-2">

                  {formatTime(
                    schedules[0].startTime
                  )}

                  {" - "}

                  {formatTime(
                    schedules[0].endTime
                  )}

                </p>

              ) : (

                <p className="text-lg font-semibold text-slate-400 mt-2">
                  Not configured
                </p>

              )}
            </div>

            <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock size={23} />
            </div>

          </div>

        </div>

      </div>

      {/* WEEKLY AVAILABILITY */}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">

        <div className="mb-6">

          <h2 className="text-lg font-semibold text-slate-900">
            Weekly Availability
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Your configured working days and hours.
          </p>

        </div>

        {/* LOADING */}

        {loadingSchedules && (

          <div className="bg-slate-50 rounded-xl p-5">

            <p className="text-slate-500">
              Loading working schedule...
            </p>

          </div>

        )}

        {/* ERROR */}

        {!loadingSchedules &&
          scheduleError && (

            <div className="bg-red-50 border border-red-200 rounded-xl p-5">

              <p className="text-red-600">
                {scheduleError}
              </p>

            </div>

          )}

        {/* EMPTY */}

        {!loadingSchedules &&
          !scheduleError &&
          schedules.length === 0 && (

            <div className="bg-slate-50 rounded-xl p-5">

              <p className="text-slate-500">
                No working schedule configured.
              </p>

            </div>

          )}

        {/* SCHEDULE LIST */}

        {!loadingSchedules &&
          !scheduleError &&
          schedules.length > 0 && (

            <div className="space-y-3">

              {schedules
                .slice()
                .sort(
                  (a, b) =>
                    daysOfWeek.indexOf(
                      a.dayOfWeek.toUpperCase()
                    ) -
                    daysOfWeek.indexOf(
                      b.dayOfWeek.toUpperCase()
                    )
                )
                .map((schedule) => (

                  <div
                    key={schedule.id}
                    className="flex items-center justify-between border border-slate-200 rounded-xl p-5"
                  >

                    <div>

                      <p className="font-semibold text-slate-900">
                        {schedule.dayOfWeek}
                      </p>

                      <p className="text-sm text-slate-500 mt-1">

                        {formatTime(
                          schedule.startTime
                        )}

                        {" - "}

                        {formatTime(
                          schedule.endTime
                        )}

                      </p>

                    </div>

                    <button
                      onClick={() =>
                        deleteSchedule(
                          schedule.id
                        )
                      }
                      disabled={
                        deleteLoading ===
                        schedule.id
                      }
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                      title="Remove schedule"
                    >

                      {deleteLoading ===
                      schedule.id ? (
                        "..."
                      ) : (
                        <Trash2 size={18} />
                      )}

                    </button>

                  </div>

                ))}

            </div>

          )}

        {/* ADD WORKING HOURS */}

        {!loadingSchedules &&
          !scheduleError && (

            <div className="mt-6 pt-6 border-t border-slate-200">

              <div className="flex items-center gap-3 mb-5">

                <div className="h-9 w-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Plus size={18} />
                </div>

                <div>

                  <h3 className="font-semibold text-slate-900">
                    Add Working Hours
                  </h3>

                  <p className="text-sm text-slate-500">
                    Set your availability for another day.
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* DAY */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Day
                  </label>

                  <select
                    value={selectedDay}
                    onChange={(e) => {
                      setSelectedDay(
                        e.target.value
                      );

                      setAddScheduleError("");
                    }}
                    disabled={
                      availableDays.length === 0
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:bg-slate-100"
                  >

                    {availableDays.length === 0 ? (

                      <option>
                        All days configured
                      </option>

                    ) : (

                      availableDays.map((day) => (

                        <option
                          key={day}
                          value={day}
                        >
                          {day}
                        </option>

                      ))

                    )}

                  </select>

                </div>

                {/* START TIME */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Time
                  </label>

                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(
                        e.target.value
                      );

                      setAddScheduleError("");
                    }}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />

                </div>

                {/* END TIME */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Time
                  </label>

                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(
                        e.target.value
                      );

                      setAddScheduleError("");
                    }}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />

                </div>

              </div>

              {/* ERROR */}

              {addScheduleError && (

                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">

                  <p className="text-sm text-red-600">
                    {addScheduleError}
                  </p>

                </div>

              )}

              {/* ADD BUTTON */}

              <button
                onClick={addSchedule}
                disabled={
                  addingSchedule ||
                  availableDays.length === 0
                }
                className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition disabled:opacity-50"
              >

                <Plus size={18} />

                {addingSchedule
                  ? "Adding..."
                  : "Add Working Hours"}

              </button>

            </div>

          )}

      </div>

      {/* UPCOMING APPOINTMENTS */}

      <div className="bg-white rounded-2xl border border-slate-200 p-6">

        <h2 className="text-lg font-semibold text-slate-900">
          Upcoming Appointments
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Your upcoming scheduled consultations.
        </p>

        {/* LOADING */}

        {loadingAppointments && (

          <div className="mt-6 bg-slate-50 rounded-xl p-5">

            <p className="text-slate-500">
              Loading appointments...
            </p>

          </div>

        )}

        {/* ERROR */}

        {!loadingAppointments &&
          appointmentError && (

            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-5">

              <p className="text-red-600">
                {appointmentError}
              </p>

            </div>

          )}

        {/* EMPTY */}

        {!loadingAppointments &&
          !appointmentError &&
          upcomingAppointments.length === 0 && (

            <div className="mt-6 bg-slate-50 rounded-xl p-5">

              <p className="text-slate-500">
                No upcoming appointments.
              </p>

            </div>

          )}

        {/* APPOINTMENT LIST */}

        {!loadingAppointments &&
          !appointmentError &&
          upcomingAppointments.length > 0 && (

            <div className="mt-6 space-y-4">

              {upcomingAppointments.map(
                (appointment) => (

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
                          appointment.status?.toUpperCase() ===
                          "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : appointment.status?.toUpperCase() ===
                              "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {appointment.status}
                      </span>

                    </div>

                    <div className="flex gap-10 mt-5">

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

                )
              )}

            </div>

          )}

      </div>

    </DashboardLayout>
  );
}

export default Schedule;