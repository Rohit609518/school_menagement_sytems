import { Bell, LogOut, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-1 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl md:hidden transition"
          aria-label="Toggle Menu"
        >
          <Menu size={22} />
        </button>

        <h2 className="text-base sm:text-xl font-bold text-slate-800">
          Admin Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition">
          <Bell size={20} />
        </button>

        <div className="text-right hidden sm:block">
          <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-tight">
            {user?.name || "Admin"}
          </p>
          <p className="text-[11px] text-slate-500 capitalize leading-tight">
            {user?.role || "Administrator"}
          </p>
        </div>

        <button
          onClick={logout}
          className="p-2 rounded-xl hover:bg-rose-50 text-rose-500 transition"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;