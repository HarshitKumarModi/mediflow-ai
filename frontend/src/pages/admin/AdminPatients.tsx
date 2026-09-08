import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { API_BASE_URL } from "../../config/api";
import {
  Users,
  Mail,
  Phone,
  RefreshCw,
} from "lucide-react";

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

function AdminPatients() {

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================
  // FETCH PATIENTS
  // =========================

  const fetchPatients = async () => {

    try {

      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/patients`,
        {
          method: "GET",

          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );


      if (!response.ok) {

        throw new Error("Failed to load patients.");

      }


      const data = await response.json();

      setPatients(data);

    } catch (error) {

      console.error(error);

      setError("Unable to load patients.");

    } finally {

      setLoading(false);

    }

  };


  // =========================
  // LOAD PATIENTS ON PAGE LOAD
  // =========================

  useEffect(() => {

    fetchPatients();

  }, []);


  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date: string) => {

    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  return (
    <DashboardLayout role="admin">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="mb-8">

        <div className="flex items-start justify-between gap-5">

          <div>

            <h1 className="text-3xl font-bold text-slate-900">
              Patients
            </h1>

            <p className="mt-2 text-slate-500">
              View and manage patients registered on the MediFlow platform.
            </p>

          </div>


          {/* Refresh Button */}

          <button
            onClick={fetchPatients}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
          >

            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />

            Refresh

          </button>

        </div>

      </div>


      {/* =========================
          TOTAL PATIENTS
      ========================= */}

      <div className="bg-white rounded-2xl border border-slate-200 p-6">

        <div className="flex items-center gap-4">

          <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">

            <Users size={23} />

          </div>


          <div>

            <p className="text-sm text-slate-500">
              Total Patients
            </p>

            <p className="text-2xl font-bold text-slate-900 mt-1">
              {patients.length}
            </p>

          </div>

        </div>

      </div>


      {/* =========================
          ERROR
      ========================= */}

      {error && (

        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">

          <p className="text-sm text-red-600">
            {error}
          </p>

        </div>

      )}


      {/* =========================
          REGISTERED PATIENTS
      ========================= */}

      <div className="mt-7 bg-white rounded-2xl border border-slate-200 overflow-hidden">

        {/* Header */}

        <div className="p-6 border-b border-slate-200">

          <h2 className="text-lg font-semibold text-slate-900">
            Registered Patients
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Patients currently registered in MediFlow.
          </p>

        </div>


        {/* Loading */}

        {loading ? (

          <div className="p-6">

            <div className="bg-slate-50 rounded-xl p-6">

              <p className="text-slate-500">
                Loading patients...
              </p>

            </div>

          </div>

        ) : patients.length === 0 ? (

          /* No Patients */

          <div className="p-6">

            <div className="bg-slate-50 rounded-xl p-6">

              <p className="text-slate-500">
                No patients registered yet.
              </p>

            </div>

          </div>

        ) : (

          /* Patient List */

          <div>

            {patients.map((patient) => (

              <div
                key={patient.id}
                className="p-6 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition"
              >

                <div className="flex items-center justify-between gap-6">

                  {/* Left Side */}

                  <div className="flex items-center gap-4">

                    <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">

                      <Users size={22} />

                    </div>


                    <div>

                      <h3 className="font-semibold text-slate-900">
                        {patient.name}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        Patient ID: #{patient.id}
                      </p>

                    </div>

                  </div>


                  {/* Right Side */}

                  <div className="flex items-center gap-8">

                    {/* Email */}

                    <div className="flex items-center gap-2 text-slate-500">

                      <Mail size={17} />

                      <span className="text-sm">
                        {patient.email}
                      </span>

                    </div>


                    {/* Phone */}

                    <div className="flex items-center gap-2 text-slate-500">

                      <Phone size={17} />

                      <span className="text-sm">
                        {patient.phone}
                      </span>

                    </div>


                    {/* Registration Date */}

                    <div className="text-right">

                      <p className="text-xs text-slate-400">
                        Registered
                      </p>

                      <p className="text-sm text-slate-600 mt-1">
                        {formatDate(patient.createdAt)}
                      </p>

                    </div>


                    {/* Role */}

                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      {patient.role}
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


export default AdminPatients;