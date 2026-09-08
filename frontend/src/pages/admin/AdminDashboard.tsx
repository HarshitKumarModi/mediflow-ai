import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { API_BASE_URL } from "../../config/api";

import {
  Users,
  Stethoscope,
  CalendarDays,
  BarChart3,
  Check,
  X,
} from "lucide-react";


// =========================
// LEAVE REQUEST INTERFACE
// =========================

interface LeaveRequest {
  id: number;
  fromDate: string;
  toDate: string;
  reason: string;
  status: string;
}


// =========================
// ADMIN STATS INTERFACE
// =========================

interface AdminStats {
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  completionRate: number;

  confirmedAppointments: number;
  pendingAppointments: number;
  rejectedAppointments: number;
  completedAppointments: number;
}


// =========================
// ADMIN DASHBOARD
// =========================

function AdminDashboard() {

  // =========================
  // STATE
  // =========================

  const [leaveRequests, setLeaveRequests] =
    useState<LeaveRequest[]>([]);

  const [stats, setStats] =
    useState<AdminStats | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [statsLoading, setStatsLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =========================
  // FETCH ADMIN STATISTICS
  // =========================

  const fetchStats = async () => {

    try {

      setStatsLoading(true);

      // Get JWT token from localStorage
      const token = localStorage.getItem("token");

      console.log("Admin stats token:", token);

      const response = await fetch(
        `${API_BASE_URL}/api/admin/stats`,
        {
          method: "GET",

          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );


      if (!response.ok) {

        throw new Error(
          `Failed to load admin statistics. Status: ${response.status}`
        );

      }


      const data = await response.json();

      console.log("Admin stats:", data);

      setStats(data);

    } catch (error) {

      console.error(
        "Admin stats error:",
        error
      );

      setError(
        "Unable to load admin statistics."
      );

    } finally {

      setStatsLoading(false);
    }
  };


  // =========================
  // FETCH PENDING LEAVES
  // =========================

  const fetchPendingLeaves = async () => {

    try {

      setLoading(true);

      setError("");

      const token =
        localStorage.getItem("token");


      const response = await fetch(
        `${API_BASE_URL}/api/leaves/pending`,
        {
          method: "GET",

          headers: {
            "Authorization":
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },
        }
      );


      if (!response.ok) {

        throw new Error(
          "Failed to load leave requests."
        );

      }


      const data =
        await response.json();


      setLeaveRequests(data);

    } catch (error) {

      console.error(error);

      setError(
        "Unable to load leave requests."
      );

    } finally {

      setLoading(false);
    }

  };


  // =========================
  // UPDATE LEAVE STATUS
  // =========================

  const updateLeaveStatus = async (
    id: number,
    status: string
  ) => {

    try {

      const token =
        localStorage.getItem("token");


      const response = await fetch(
        `${API_BASE_URL}/api/leaves/${id}/status?status=${status}`,
        {
          method: "PUT",

          headers: {
            "Authorization":
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },
        }
      );


      if (!response.ok) {

        throw new Error(
          "Failed to update leave status."
        );

      }


      // Remove the processed
      // request from pending list

      setLeaveRequests(
        (previous) =>
          previous.filter(
            (leave) =>
              leave.id !== id
          )
      );

    } catch (error) {

      console.error(error);

      setError(
        "Unable to update leave request."
      );

    }

  };


  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {

    fetchStats();

    fetchPendingLeaves();

  }, []);


  // =========================
  // UI
  // =========================

  return (

    <DashboardLayout role="admin">

      {/* =========================
          HEADING
      ========================== */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-900">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Monitor and manage the MediFlow platform.
        </p>

      </div>


      {/* =========================
          STATISTICS
      ========================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <Stat
          title="Total Patients"

          value={
            statsLoading
              ? "..."
              : stats
                ? stats.totalPatients.toString()
                : "0"
          }

          icon={
            <Users size={22} />
          }
        />


        <Stat
          title="Total Doctors"

          value={
            statsLoading
              ? "..."
              : stats
                ? stats.totalDoctors.toString()
                : "0"
          }

          icon={
            <Stethoscope size={22} />
          }
        />


        <Stat
          title="Appointments"

          value={
            statsLoading
              ? "..."
              : stats
                ? stats.totalAppointments.toString()
                : "0"
          }

          icon={
            <CalendarDays size={22} />
          }
        />


        <Stat
          title="Completion Rate"

          value={
            statsLoading
              ? "..."
              : stats
                ? `${stats.completionRate}%`
                : "0%"
          }

          icon={
            <BarChart3 size={22} />
          }
        />

      </div>


      {/* =========================
          PLATFORM OVERVIEW
      ========================== */}

      <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">

        <div>

          <h2 className="text-lg font-semibold text-slate-900">
            Platform Overview
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Healthcare platform activity and operational insights.
          </p>

        </div>


        {statsLoading ? (

          <div className="mt-6 bg-slate-50 rounded-xl p-5">

            <p className="text-slate-500">
              Loading platform statistics...
            </p>

          </div>

        ) : stats ? (

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* =========================
                COMPLETED
            ========================== */}

            <div className="bg-green-50 rounded-xl p-5">

              <p className="text-sm text-green-700">
                Completed
              </p>

              <p className="text-2xl font-bold text-green-800 mt-2">
                {stats.completedAppointments}
              </p>

            </div>


            {/* =========================
                CONFIRMED
            ========================== */}

            <div className="bg-blue-50 rounded-xl p-5">

              <p className="text-sm text-blue-700">
                Confirmed
              </p>

              <p className="text-2xl font-bold text-blue-800 mt-2">
                {stats.confirmedAppointments}
              </p>

            </div>


            {/* =========================
                PENDING
            ========================== */}

            <div className="bg-yellow-50 rounded-xl p-5">

              <p className="text-sm text-yellow-700">
                Pending
              </p>

              <p className="text-2xl font-bold text-yellow-800 mt-2">
                {stats.pendingAppointments}
              </p>

            </div>


            {/* =========================
                REJECTED
            ========================== */}

            <div className="bg-red-50 rounded-xl p-5">

              <p className="text-sm text-red-700">
                Rejected
              </p>

              <p className="text-2xl font-bold text-red-800 mt-2">
                {stats.rejectedAppointments}
              </p>

            </div>

          </div>

        ) : (

          <div className="mt-6 bg-slate-50 rounded-xl p-5">

            <p className="text-slate-500">
              No platform statistics available.
            </p>

          </div>

        )}

      </div>


      {/* =========================
          APPOINTMENT ANALYTICS
      ========================== */}

      <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">

        <div>

          <h2 className="text-lg font-semibold text-slate-900">
            Appointment Analytics
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Overview of appointment activity by status.
          </p>

        </div>


        {statsLoading ? (

          <div className="mt-6 bg-slate-50 rounded-xl p-5">

            <p className="text-slate-500">
              Loading appointment analytics...
            </p>

          </div>

        ) : stats ? (

          <div className="mt-6 space-y-5">

            {/* COMPLETED */}

            <AppointmentBar
              label="Completed"
              value={stats.completedAppointments}
              total={stats.totalAppointments}
            />


            {/* CONFIRMED */}

            <AppointmentBar
              label="Confirmed"
              value={stats.confirmedAppointments}
              total={stats.totalAppointments}
            />


            {/* PENDING */}

            <AppointmentBar
              label="Pending"
              value={stats.pendingAppointments}
              total={stats.totalAppointments}
            />


            {/* REJECTED */}

            <AppointmentBar
              label="Rejected"
              value={stats.rejectedAppointments}
              total={stats.totalAppointments}
            />

          </div>

        ) : (

          <div className="mt-6 bg-slate-50 rounded-xl p-5">

            <p className="text-slate-500">
              No appointment analytics available.
            </p>

          </div>

        )}

      </div>


      {/* =========================
          PENDING LEAVE REQUESTS
      ========================== */}

      <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-semibold text-slate-900">
              Pending Leave Requests
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Review and manage doctor leave requests.
            </p>

          </div>


          <div className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">

            {leaveRequests.length} Pending

          </div>

        </div>


        {/* =========================
            ERROR
        ========================== */}

        {error && (

          <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4">

            <p className="text-sm text-red-600">
              {error}
            </p>

          </div>

        )}


        {/* =========================
            LOADING
        ========================== */}

        {loading ? (

          <div className="mt-6 bg-slate-50 rounded-xl p-5">

            <p className="text-slate-500">
              Loading leave requests...
            </p>

          </div>

        ) : leaveRequests.length === 0 ? (

          <div className="mt-6 bg-slate-50 rounded-xl p-5">

            <p className="text-slate-500">
              No pending leave requests.
            </p>

          </div>

        ) : (

          <div className="mt-6 space-y-4">

            {leaveRequests.map(
              (leave) => (

                <div
                  key={leave.id}
                  className="border border-slate-200 rounded-xl p-5"
                >

                  <div className="flex justify-between items-start gap-5">


                    {/* =========================
                        LEAVE INFORMATION
                    ========================== */}

                    <div>

                      <h3 className="font-semibold text-slate-900">

                        {leave.fromDate}

                        {" → "}

                        {leave.toDate}

                      </h3>


                      <p className="text-sm text-slate-500 mt-2">

                        {leave.reason}

                      </p>


                      <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">

                        {leave.status}

                      </span>

                    </div>


                    {/* =========================
                        BUTTONS
                    ========================== */}

                    <div className="flex gap-3">


                      {/* APPROVE */}

                      <button
                        onClick={() =>
                          updateLeaveStatus(
                            leave.id,
                            "APPROVED"
                          )
                        }

                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
                      >

                        <Check size={17} />

                        Approve

                      </button>


                      {/* REJECT */}

                      <button
                        onClick={() =>
                          updateLeaveStatus(
                            leave.id,
                            "REJECTED"
                          )
                        }

                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
                      >

                        <X size={17} />

                        Reject

                      </button>

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


// =========================
// STAT CARD COMPONENT
// =========================

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

      <div className="flex items-center justify-between">

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


// =========================
// APPOINTMENT BAR
// =========================

interface AppointmentBarProps {
  label: string;
  value: number;
  total: number;
}


function AppointmentBar({
  label,
  value,
  total,
}: AppointmentBarProps) {

  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;


  return (

    <div>

      {/* Label */}

      <div className="flex items-center justify-between mb-2">

        <p className="text-sm font-medium text-slate-700">
          {label}
        </p>

        <p className="text-sm font-semibold text-slate-900">
          {value}
        </p>

      </div>


      {/* Bar */}

      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

        <div
          className="h-full bg-teal-500 rounded-full transition-all duration-500"

          style={{
            width: `${percentage}%`,
          }}
        />

      </div>


      {/* Percentage */}

      <p className="text-xs text-slate-400 mt-1">

        {percentage}% of total appointments

      </p>

    </div>

  );
}


export default AdminDashboard;