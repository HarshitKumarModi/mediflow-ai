import { Bell, Search, ChevronDown } from "lucide-react";

interface NavbarProps {
  role: "patient" | "doctor" | "admin";
}

function Navbar({ role }: NavbarProps) {
  const roleLabel =
    role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <header className="h-20 border-b bg-white flex items-center justify-between px-8">
      
      {/* Search */}
      <div className="relative w-80">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5">

        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-slate-100">
          <Bell size={20} className="text-slate-600" />

          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User */}
        <button className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
            <span className="font-semibold text-teal-700">
              H
            </span>
          </div>

          <div className="text-left">
            <p className="text-sm font-semibold text-slate-800">
              Harshit
            </p>

            <p className="text-xs text-slate-500">
              {roleLabel}
            </p>
          </div>

          <ChevronDown
            size={16}
            className="text-slate-400"
          />
        </button>

      </div>
    </header>
  );
}

export default Navbar;