import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  BarChart3,
  Users,
  Stethoscope,
  CalendarDays,
  CheckCircle2,
  Clock3,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

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

function AdminAnalytics() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found. Please login again."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/admin/stats`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        console.error("Analytics API Error:", {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
        });

        throw new Error(
          `Analytics request failed (${response.status} ${response.statusText})`
        );
      }

      const data: AdminStats = JSON.parse(responseText);

      console.log("Analytics API Response:", data);

      setStats(data);
    } catch (error) {
      console.error("Analytics Error:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to load analytics.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (value: number) => {
    if (!stats || stats.totalAppointments === 0) {
      return 0;
    }

    return Math.round(
      (value / stats.totalAppointments) * 100
    );
  };

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Analytics
          </h1>

          <p className="mt-2 text-slate-500">
            Monitor MediFlow platform performance and activity.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="bg-slate-50 rounded-xl p-5">
            <p className="text-slate-500">
              Loading analytics...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout role="admin">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Analytics
          </h1>

          <p className="mt-2 text-slate-500">
            Monitor MediFlow platform performance and activity.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-red-600 font-medium">
            {error || "Unable to load analytics."}
          </p>

          <button
            onClick={fetchStats}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Analytics
          </h1>

          <p className="mt-2 text-slate-500">
            Monitor MediFlow platform performance and activity.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

        <AnalyticsCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={<Users size={22} />}
        />

        <AnalyticsCard
          title="Total Doctors"
          value={stats.totalDoctors}
          icon={<Stethoscope size={22} />}
        />

        <AnalyticsCard
          title="Total Appointments"
          value={stats.totalAppointments}
          icon={<CalendarDays size={22} />}
        />

      </div>

      <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">

        <div className="flex items-center gap-3">

          <div className="h-11 w-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <BarChart3 size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Appointment Performance
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Overview of appointment activity by status.
            </p>
          </div>

        </div>

        <div className="mt-8 space-y-7">

          <AppointmentBar
            label="Completed"
            value={stats.completedAppointments}
            percentage={getPercentage(stats.completedAppointments)}
            icon={<CheckCircle2 size={17} />}
          />

          <AppointmentBar
            label="Confirmed"
            value={stats.confirmedAppointments}
            percentage={getPercentage(stats.confirmedAppointments)}
            icon={<CheckCircle2 size={17} />}
          />

          <AppointmentBar
            label="Pending"
            value={stats.pendingAppointments}
            percentage={getPercentage(stats.pendingAppointments)}
            icon={<Clock3 size={17} />}
          />

          <AppointmentBar
            label="Rejected"
            value={stats.rejectedAppointments}
            percentage={getPercentage(stats.rejectedAppointments)}
            icon={<XCircle size={17} />}
          />

        </div>

      </div>

      <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">

        <h2 className="text-lg font-semibold text-slate-900">
          Completion Rate
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Percentage of appointments successfully completed.
        </p>

        <div className="mt-6">

          <div className="flex items-end justify-between">

            <p className="text-4xl font-bold text-slate-900">
              {stats.completionRate}%
            </p>

            <p className="text-sm text-slate-500">
              {stats.completedAppointments} of{" "}
              {stats.totalAppointments} appointments
            </p>

          </div>

          <div className="mt-4 h-4 bg-slate-100 rounded-full overflow-hidden">

            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  Math.max(stats.completionRate, 0),
                  100
                )}%`,
              }}
            />

          </div>

        </div>

      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        <StatusCard
          title="Completed"
          value={stats.completedAppointments}
          percentage={getPercentage(stats.completedAppointments)}
          type="completed"
        />

        <StatusCard
          title="Confirmed"
          value={stats.confirmedAppointments}
          percentage={getPercentage(stats.confirmedAppointments)}
          type="confirmed"
        />

        <StatusCard
          title="Pending"
          value={stats.pendingAppointments}
          percentage={getPercentage(stats.pendingAppointments)}
          type="pending"
        />

        <StatusCard
          title="Rejected"
          value={stats.rejectedAppointments}
          percentage={getPercentage(stats.rejectedAppointments)}
          type="rejected"
        />

      </div>

    </DashboardLayout>
  );
}

interface AnalyticsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

function AnalyticsCard({
  title,
  value,
  icon,
}: AnalyticsCardProps) {
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

interface AppointmentBarProps {
  label: string;
  value: number;
  percentage: number;
  icon: React.ReactNode;
}

function AppointmentBar({
  label,
  value,
  percentage,
  icon,
}: AppointmentBarProps) {
  return (
    <div>

      <div className="flex items-center justify-between mb-2">

        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          {icon}
          {label}
        </div>

        <span className="text-sm font-semibold text-slate-900">
          {value}
        </span>

      </div>

      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">

        <div
          className="h-full bg-teal-500 rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(
              Math.max(percentage, 0),
              100
            )}%`,
          }}
        />

      </div>

      <p className="text-xs text-slate-400 mt-2">
        {percentage}% of total appointments
      </p>

    </div>
  );
}

interface StatusCardProps {
  title: string;
  value: number;
  percentage: number;
  type:
    | "completed"
    | "confirmed"
    | "pending"
    | "rejected";
}

function StatusCard({
  title,
  value,
  percentage,
  type,
}: StatusCardProps) {

  const styles = {
    completed: {
      container: "bg-green-50 border-green-100",
      text: "text-green-700",
    },

    confirmed: {
      container: "bg-blue-50 border-blue-100",
      text: "text-blue-700",
    },

    pending: {
      container: "bg-yellow-50 border-yellow-100",
      text: "text-yellow-700",
    },

    rejected: {
      container: "bg-red-50 border-red-100",
      text: "text-red-700",
    },
  };

  const style = styles[type];

  return (
    <div
      className={`rounded-2xl border p-5 ${style.container}`}
    >

      <p className={`text-sm font-medium ${style.text}`}>
        {title}
      </p>

      <p className={`text-2xl font-bold mt-2 ${style.text}`}>
        {value}
      </p>

      <p className="text-xs text-slate-500 mt-2">
        {percentage}% of appointments
      </p>

    </div>
  );
}

export default AdminAnalytics;