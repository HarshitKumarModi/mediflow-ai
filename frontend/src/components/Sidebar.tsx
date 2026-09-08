import {
  LayoutDashboard,
  CalendarDays,
  Stethoscope,
  FileText,
  Pill,
  Bot,
  Settings,
  LogOut,
  Users,
  BarChart3,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

interface SidebarProps {
  role: "patient" | "doctor" | "admin";
}

function Sidebar({ role }: SidebarProps) {
  const navigate = useNavigate();

  // =========================
  // PATIENT NAVIGATION
  // =========================

  const patientItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/patient/dashboard",
    },
    {
      label: "Find Doctors",
      icon: Stethoscope,
      path: "/doctors",
    },
    {
      label: "Appointments",
      icon: CalendarDays,
      path: "/patient/appointments",
    },
    {
      label: "Medical Records",
      icon: FileText,
      path: "/patient/medical-records",
    },
    {
      label: "Medications",
      icon: Pill,
      path: "/patient/medications",
    },
    {
      label: "AI Assistant",
      icon: Bot,
      path: "/patient/ai-assistant",
    },
  ];

  // =========================
  // DOCTOR NAVIGATION
  // =========================

  const doctorItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/doctor/dashboard",
    },
    {
      label: "Appointments",
      icon: CalendarDays,
      path: "/doctor/appointments",
    },
    {
      label: "Patients",
      icon: Users,
      path: "/doctor/patients",
    },
    {
      label: "Schedule",
      icon: CalendarDays,
      path: "/doctor/schedule",
    },
    {
      label: "Leave Management",
      icon: FileText,
      path: "/doctor/leave",
    },
  ];

  // =========================
  // ADMIN NAVIGATION
  // =========================

  const adminItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      label: "Doctors",
      icon: Stethoscope,
      path: "/admin/doctors",
    },
    {
      label: "Patients",
      icon: Users,
      path: "/admin/patients",
    },
    {
      label: "Appointments",
      icon: CalendarDays,
      path: "/admin/appointments",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      path: "/admin/analytics",
    },
  ];

  // =========================
  // SELECT NAVIGATION
  // =========================

  const items =
    role === "patient"
      ? patientItems
      : role === "doctor"
      ? doctorItems
      : adminItems;

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");

    navigate("/login");
  };

  return (
    <aside className="w-64 min-h-screen border-r bg-white flex flex-col">

      {/* =========================
          LOGO
      ========================== */}

      <div className="h-20 flex items-center px-6 border-b">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Medi
            <span className="text-teal-600">Flow</span>
          </h1>

          <p className="text-xs text-slate-500">
            AI Healthcare Platform
          </p>
        </div>
      </div>

      {/* =========================
          NAVIGATION
      ========================== */}

      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition text-left"
            >
              <Icon size={19} />

              <span className="text-sm font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* =========================
          BOTTOM NAVIGATION
      ========================== */}

      <div className="p-4 border-t space-y-2">

        {/* Settings */}

        <button
          onClick={() => {
            // Settings page can be connected later
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition text-left"
        >
          <Settings size={19} />

          <span className="text-sm font-medium">
            Settings
          </span>
        </button>

        {/* Logout */}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={19} />

          <span className="text-sm font-medium">
            Logout
          </span>
        </button>

      </div>
    </aside>
  );
}

export default Sidebar;