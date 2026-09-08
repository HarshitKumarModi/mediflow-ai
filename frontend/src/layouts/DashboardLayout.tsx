import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "patient" | "doctor" | "admin";
}

function DashboardLayout({
  children,
  role,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex">

      <Sidebar role={role} />

      <div className="flex-1 flex flex-col">

        <Navbar role={role} />

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;