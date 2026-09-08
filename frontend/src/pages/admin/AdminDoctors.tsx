import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { Stethoscope, Mail, Phone, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/api/doctors`
      );

      if (!response.ok) {
        throw new Error("Failed to load doctors.");
      }

      const data = await response.json();

      setDoctors(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load doctors.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">

      {/* Heading */}
      <div className="mb-8 flex items-start justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Doctors
          </h1>

          <p className="mt-2 text-slate-500">
            View and manage doctors registered on the MediFlow platform.
          </p>
        </div>

        <button
          onClick={fetchDoctors}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </div>


      {/* Doctor Count */}
      <div className="mb-6 bg-white rounded-2xl border border-slate-200 p-5">

        <div className="flex items-center gap-4">

          <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Stethoscope size={23} />
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Total Doctors
            </p>

            <p className="text-2xl font-bold text-slate-900">
              {doctors.length}
            </p>
          </div>

        </div>

      </div>


      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>
      )}


      {/* Loading */}
      {loading ? (

        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-slate-500">
            Loading doctors...
          </p>
        </div>

      ) : doctors.length === 0 ? (

        /* No Doctors */
        <div className="bg-white rounded-2xl border border-slate-200 p-8">

          <div className="flex flex-col items-center justify-center text-center py-10">

            <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
              <Stethoscope size={26} />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No doctors found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              There are currently no doctors registered on the platform.
            </p>

          </div>

        </div>

      ) : (

        /* Doctors List */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

          {/* Table Header */}
          <div className="px-6 py-5 border-b border-slate-200">

            <h2 className="text-lg font-semibold text-slate-900">
              Registered Doctors
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Doctors currently registered in MediFlow.
            </p>

          </div>


          {/* Doctor Cards */}
          <div className="divide-y divide-slate-200">

            {doctors.map((doctor) => (

              <div
                key={doctor.id}
                className="p-6 hover:bg-slate-50 transition"
              >

                <div className="flex items-center justify-between gap-6">

                  {/* Doctor Information */}
                  <div className="flex items-center gap-4">

                    <div className="h-12 w-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Stethoscope size={22} />
                    </div>

                    <div>

                      <h3 className="font-semibold text-slate-900">
                        {doctor.name}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        Doctor ID: #{doctor.id}
                      </p>

                    </div>

                  </div>


                  {/* Contact Information */}
                  <div className="flex items-center gap-8">

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={16} className="text-slate-400" />
                      {doctor.email}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={16} className="text-slate-400" />
                      {doctor.phone || "Not provided"}
                    </div>

                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      {doctor.role}
                    </span>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      )}

    </DashboardLayout>
  );
}

export default AdminDoctors;