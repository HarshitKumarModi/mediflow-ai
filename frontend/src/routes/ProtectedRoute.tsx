import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRole?: "PATIENT" | "DOCTOR" | "ADMIN";
}

function ProtectedRoute({
  allowedRole,
}: ProtectedRouteProps) {

  // Get authentication data
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  // No token = not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Try to get user information
  let user: any = null;

  try {
    user = userString
      ? JSON.parse(userString)
      : null;
  } catch {
    // Invalid user data
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    return <Navigate to="/login" replace />;
  }

  // User information is missing
  if (!user) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    return <Navigate to="/login" replace />;
  }

  // Check role if a role is required
  if (allowedRole && user.role !== allowedRole) {
    // Redirect user to their own dashboard
    if (user.role === "PATIENT") {
      return <Navigate to="/patient/dashboard" replace />;
    }

    if (user.role === "DOCTOR") {
      return <Navigate to="/doctor/dashboard" replace />;
    }

    if (user.role === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    // Unknown role
    return <Navigate to="/login" replace />;
  }

  // Authentication and role are valid
  return <Outlet />;
}

export default ProtectedRoute;