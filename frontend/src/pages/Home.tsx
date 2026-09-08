import { useNavigate } from "react-router-dom";
import { UserRound, Stethoscope, ShieldCheck, ArrowRight } from "lucide-react";

function Home() {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Patient",
      description: "Book appointments, manage medications, and access your medical records.",
      icon: UserRound,
      role: "PATIENT",
    },
    {
      title: "Doctor",
      description: "Manage appointments, patients, schedules, medical records, and AI insights.",
      icon: Stethoscope,
      role: "DOCTOR",
    },
    {
      title: "Admin",
      description: "Manage doctors, patients, appointments, leaves, and platform analytics.",
      icon: ShieldCheck,
      role: "ADMIN",
    },
  ];

  const handleRoleSelect = (role: string) => {
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-6xl">

        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-600 text-white shadow-lg mb-6">
            <Stethoscope size={32} />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-slate-900">
            MediFlow <span className="text-teal-600">AI</span>
          </h1>

          <p className="mt-5 text-lg text-slate-500 max-w-2xl mx-auto">
            Intelligent Healthcare Management Platform
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Secure healthcare management powered by AI
          </p>
        </div>

        {/* ROLE SELECTION */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 text-center">
            Continue as
          </h2>

          <p className="text-center text-slate-500 mt-2">
            Select your role to continue to MediFlow AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {roles.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.role}
                onClick={() => handleRoleSelect(item.role)}
                className="group text-left bg-white border border-slate-200 rounded-2xl p-7 shadow-sm hover:shadow-xl hover:border-teal-300 hover:-translate-y-1 transition-all duration-200"
              >
                {/* ICON */}
                <div className="w-14 h-14 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Icon size={28} />
                </div>

                {/* TITLE */}
                <h3 className="text-xl font-semibold text-slate-900">
                  {item.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="mt-3 text-sm leading-6 text-slate-500 min-h-[72px]">
                  {item.description}
                </p>

                {/* BUTTON */}
                <div className="mt-6 flex items-center gap-2 text-teal-600 font-medium">
                  Continue
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </button>
            );
          })}

        </div>

        {/* FOOTER */}
        <div className="text-center mt-12">
          <p className="text-xs text-slate-400">
            MediFlow AI • Intelligent Healthcare Management
          </p>
        </div>

      </div>
    </div>
  );
}

export default Home;