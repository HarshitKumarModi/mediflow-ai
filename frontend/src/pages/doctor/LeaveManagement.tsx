import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { API_BASE_URL } from "../../config/api";
import { CalendarDays, FileText } from "lucide-react";

interface LeaveRequest {
  id: number;
  fromDate: string;
  toDate: string;
  reason: string;
  status: string;
}

function LeaveManagement() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // GET LOGGED-IN DOCTOR
  // ============================================================

  const getDoctorEmail = () => {
    try {
      const user = localStorage.getItem("user");

      if (user) {
        const parsedUser = JSON.parse(user);

        if (parsedUser?.email) {
          return parsedUser.email;
        }
      }

      return localStorage.getItem("email");
    } catch (error) {
      console.error("Unable to read logged-in doctor:", error);
      return localStorage.getItem("email");
    }
  };

  // ============================================================
  // LOAD LEAVE REQUESTS
  // ============================================================

  useEffect(() => {
    const doctorEmail = getDoctorEmail();
    const token = localStorage.getItem("token");

    if (!doctorEmail) {
      setError("Doctor email not found. Please login again.");
      return;
    }

    if (!token) {
      setError("Authentication token not found. Please login again.");
      return;
    }

    fetch(
      `${API_BASE_URL}/api/leaves/doctor/${encodeURIComponent(
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
      .then(async (response) => {
        if (!response.ok) {
          const responseText = await response.text();

          console.error(
            "Load leave requests error:",
            response.status,
            responseText
          );

          throw new Error(
            response.status === 401 || response.status === 403
              ? "You are not authorized to view leave requests. Please login again."
              : "Failed to load leave requests."
          );
        }

        return response.json();
      })
      .then((data) => {
        setLeaveRequests(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error(error);
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load leave requests."
        );
      });
  }, []);

  // ============================================================
  // SUBMIT LEAVE REQUEST
  // ============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (!fromDate || !toDate || !reason.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (toDate < fromDate) {
      setError("To date cannot be before from date.");
      return;
    }

    const doctorEmail = getDoctorEmail();
    const token = localStorage.getItem("token");

    if (!doctorEmail) {
      setError("Doctor email not found. Please login again.");
      return;
    }

    if (!token) {
      setError("Authentication token not found. Please login again.");
      return;
    }

    // ----------------------------------------------------------
    // SEND REQUEST
    // ----------------------------------------------------------

    try {
      const response = await fetch(
        "${API_BASE_URL}/api/leaves",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            doctorEmail: doctorEmail,
            fromDate: fromDate,
            toDate: toDate,
            reason: reason.trim(),
          }),
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        console.error(
          "Submit leave error:",
          response.status,
          responseText
        );

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "You are not authorized to submit a leave request. Please login again."
          );
        }

        throw new Error(
          responseText || "Failed to submit leave request."
        );
      }

      const savedLeave: LeaveRequest =
        JSON.parse(responseText);

      // --------------------------------------------------------
      // UPDATE UI
      // --------------------------------------------------------

      setLeaveRequests((currentRequests) => [
        savedLeave,
        ...currentRequests,
      ]);

      setFromDate("");
      setToDate("");
      setReason("");

      setMessage("Leave request submitted successfully.");
    } catch (error) {
      console.error("Leave submission error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to submit leave request."
      );
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <DashboardLayout role="doctor">

      {/* ======================================================
          HEADING
      ====================================================== */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Leave Management
        </h1>

        <p className="mt-2 text-slate-500">
          Apply for leave and view your leave requests.
        </p>
      </div>

      {/* ======================================================
          APPLY LEAVE
      ====================================================== */}

      <div className="bg-white rounded-2xl border border-slate-200 p-6">

        <div className="flex items-center gap-3 mb-6">

          <div className="h-11 w-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <CalendarDays size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Apply for Leave
            </h2>

            <p className="text-sm text-slate-500">
              Submit a new leave request.
            </p>
          </div>

        </div>

        <form onSubmit={handleSubmit}>

          {/* DATE FIELDS */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* FROM DATE */}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                From Date
              </label>

              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
              />
            </div>

            {/* TO DATE */}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                To Date
              </label>

              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"
              />
            </div>

          </div>

          {/* ==================================================
              REASON
          ================================================== */}

          <div className="mt-5">

            <label className="block text-sm font-medium text-slate-700 mb-2">
              Reason
            </label>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for leave..."
              rows={4}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500 resize-none"
            />

          </div>

          {/* ==================================================
              ERROR MESSAGE
          ================================================== */}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* ==================================================
              SUCCESS MESSAGE
          ================================================== */}

          {message && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-600">
                {message}
              </p>
            </div>
          )}

          {/* ==================================================
              SUBMIT
          ================================================== */}

          <button
            type="submit"
            className="mt-5 px-6 py-3 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition"
          >
            Submit Leave Request
          </button>

        </form>
      </div>

      {/* ======================================================
          LEAVE HISTORY
      ====================================================== */}

      <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">

        <div className="flex items-center gap-3">

          <div className="h-11 w-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <FileText size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Leave Requests
            </h2>

            <p className="text-sm text-slate-500">
              View your submitted leave requests.
            </p>
          </div>

        </div>

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {leaveRequests.length === 0 ? (

          <div className="mt-6 bg-slate-50 rounded-xl p-5">
            <p className="text-slate-500">
              No leave requests found.
            </p>
          </div>

        ) : (

          /* ==================================================
             LEAVE LIST
          ================================================== */

          <div className="mt-6 space-y-4">

            {leaveRequests.map((leave) => (

              <div
                key={leave.id}
                className="border border-slate-200 rounded-xl p-5"
              >

                <div className="flex justify-between items-start">

                  <div>

                    <h3 className="font-semibold text-slate-900">
                      {leave.fromDate} → {leave.toDate}
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">
                      {leave.reason}
                    </p>

                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      leave.status?.toUpperCase() === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : leave.status?.toUpperCase() === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {leave.status}
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </DashboardLayout>
  );
}

export default LeaveManagement;