import {
  LayoutDashboard,
  User,
  CalendarCheck,
  BookOpen,
  FileText,
  Trophy,
  Wallet,
  LogOut,
  X,
  GraduationCap,
  Sparkles,
  Handshake,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function StudentSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Support controlled mode (via props) or fallback local state
  const [localOpen, setLocalOpen] = useState(false);
  const isDrawerOpen = isOpen !== undefined ? isOpen : localOpen;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setLocalOpen(false);
    }
  };

  // Close drawer on route change
  useEffect(() => {
    handleClose();
  }, [location.pathname]);

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/student",
      badge: null,
    },
    {
      name: "My Profile",
      icon: User,
      path: "/student/details",
      badge: null,
    },
    {
      name: "Attendance",
      icon: CalendarCheck,
      path: "/student/attendance",
      badge: null,
    },
    {
      name: "Homework",
      icon: BookOpen,
      path: "/student/homework",
      badge: null,
    },
    {
      name: "Exams",
      icon: FileText,
      path: "/student/exams",
      badge: null,
    },
    {
      name: "Results",
      icon: Trophy,
      path: "/student/results",
      badge: null,
    },
    {
      name: "Fees",
      icon: Wallet,
      path: "/student/fees",
      badge: null,
    },
    {
      name: "Parent Meetings",
      icon: Handshake,
      path: "/parent/meetings",
      badge: "Family",
    },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isDrawerOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          h-screen w-72 md:w-64
          bg-slate-950 text-slate-100
          border-r border-slate-800/80
          flex flex-col justify-between
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}
          shadow-2xl md:shadow-none
        `}
      >
        {/* Top Header */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/25">
                <GraduationCap className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  EduStudent
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-400 font-semibold px-1.5 py-0.5 rounded-full border border-indigo-500/30">
                    Portal
                  </span>
                </h1>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 md:hidden transition"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Student Quick Pill (Mobile & Desktop) */}
          <div className="px-4 pt-4 pb-2">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || "Student"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-xs text-slate-400 truncate">
                    Active Student
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links with custom scrollbar */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            <p className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Main Menu
            </p>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.path)}
                  className={`
                    w-full flex items-center justify-between
                    px-3.5 py-2.5 rounded-xl
                    text-sm font-medium transition-all duration-200
                    ${
                      active
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold"
                        : "text-slate-300 hover:bg-slate-900 hover:text-white"
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      size={18}
                      className={active ? "text-white" : "text-slate-400"}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>

                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-slate-800/80">
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

export default StudentSidebar;