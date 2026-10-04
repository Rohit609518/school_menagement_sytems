import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserRound,
  CalendarCheck,
  BookOpen,
  FileText,
  Trophy,
  Wallet,
  Handshake,
  X,
  School,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const [localOpen, setLocalOpen] = useState(false);
  const isDrawerOpen = isOpen !== undefined ? isOpen : localOpen;

  const handleClose = () => {
    if (onClose) onClose();
    else setLocalOpen(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userRole = (user?.role || "").toLowerCase();

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Students", path: "/admin/students", icon: Users },
    ...(userRole === "admin"
      ? [{ name: "Teachers", path: "/admin/teachers", icon: GraduationCap }]
      : []),
    { name: "Parents", path: "/admin/parents", icon: UserRound },
    { name: "Fees & Dues", path: "/admin/fees", icon: Wallet },
    { name: "Meetings", path: "/teacher/meetings", icon: Handshake },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isDrawerOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          h-screen w-64 bg-slate-950 text-white
          flex flex-col justify-between
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}
          border-r border-slate-800 shadow-2xl md:shadow-none
        `}
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md">
                <School size={20} />
              </div>
              <h1 className="text-base font-bold text-white">
                School Admin
              </h1>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-4 pt-4 pb-2">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600 font-bold flex items-center justify-center text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.name || "Administrator"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">Super Admin</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1.5 overflow-y-auto flex-1">
            <p className="px-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Admin Navigation
            </p>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;