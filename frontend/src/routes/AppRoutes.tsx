import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import PatientDashboard from "../pages/patient/PatientDashboard";
import Doctors from "../pages/patient/Doctors";
import Appointments from "../pages/patient/Appointments";
import MedicalRecords from "../pages/patient/MedicalRecords";
import Medications from "../pages/patient/Medications";
import AIAssistant from "../pages/patient/AIAssistant";

import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import DoctorPatients from "../pages/doctor/Patients";
import DoctorAppointments from "../pages/doctor/Appointments";
import Schedule from "../pages/doctor/Schedule";
import LeaveManagement from "../pages/doctor/LeaveManagement";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminAppointments from "../pages/admin/AdminAppointments";
import AdminPatients from "../pages/admin/AdminPatients";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import AdminDoctors from "../pages/admin/AdminDoctors";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC
        ========================= */}

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


        {/* =========================
            PATIENT
        ========================= */}

        <Route element={<ProtectedRoute allowedRole="PATIENT" />}>

          <Route
            path="/patient/dashboard"
            element={<PatientDashboard />}
          />

          <Route
            path="/patient/appointments"
            element={<Appointments />}
          />

          <Route
            path="/patient/medical-records"
            element={<MedicalRecords />}
          />

          <Route
            path="/patient/medications"
            element={<Medications />}
          />

          <Route
            path="/patient/ai-assistant"
            element={<AIAssistant />}
          />

          <Route
            path="/doctors"
            element={<Doctors />}
          />

        </Route>


        {/* =========================
            DOCTOR
        ========================= */}

        <Route element={<ProtectedRoute allowedRole="DOCTOR" />}>

          <Route
            path="/doctor/dashboard"
            element={<DoctorDashboard />}
          />

          <Route
            path="/doctor/patients"
            element={<DoctorPatients />}
          />

          <Route
            path="/doctor/appointments"
            element={<DoctorAppointments />}
          />

          <Route
            path="/doctor/schedule"
            element={<Schedule />}
          />

          <Route
            path="/doctor/leave"
            element={<LeaveManagement />}
          />

        </Route>


        {/* =========================
            ADMIN
        ========================= */}

        <Route element={<ProtectedRoute allowedRole="ADMIN" />}>

          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/appointments"
            element={<AdminAppointments />}
          />

          <Route
            path="/admin/analytics"
            element={<AdminAnalytics />}
          />

          <Route
            path="/admin/patients"
            element={<AdminPatients />}
          />

          <Route
            path="/admin/doctors"
            element={<AdminDoctors />}
          />

        </Route>


        {/* =========================
            UNKNOWN ROUTE
        ========================= */}

        <Route
          path="*"
          element={<Login />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;