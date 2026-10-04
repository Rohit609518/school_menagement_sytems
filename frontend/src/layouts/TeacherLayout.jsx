import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck,
  Handshake,
  LogOut,
  X,
  Menu,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function TeacherLayout({ children, title = "Teacher Portal", subtitle = "" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/teacher",
    },
    {
      name: "Students",
      icon: Users,
      path: "/teacher/students",
    },
    {
      name: "Attendance",
      icon: CalendarCheck,
      path: "/teacher/attendance",
    },
    {
      name: "Results & Grades",
      icon: BookOpen,
      path: "/teacher/results",
    },
    {
      name: "Meetings",
      icon: Handshake,
      path: "/teacher/meetings",
    },
  ];

  const bottomTabs = [
    {
      name: "Dashboard",
      path: "/teacher",
      icon: LayoutDashboard,
    },
    {
      name: "Students",
      path: "/teacher/students",
      icon: Users,
    },
    {
      name: "Attendance",
      path: "/teacher/attendance",
      icon: CalendarCheck,
    },
    {
      name: "Results",
      path: "/teacher/results",
      icon: BookOpen,
    },
    {
      name: "Meetings",
      path: "/teacher/meetings",
      icon: Handshake,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar (Desktop pinned, Mobile drawer) */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          h-screen w-72 md:w-64
          bg-slate-950 text-slate-100
          border-r border-slate-800/80
          flex flex-col justify-between
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          shadow-2xl md:shadow-none
        `}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md text-white">
                <GraduationCap size={20} />
              </div>
              <div>
                <h1 className="text-base font-bold text-white flex items-center gap-1.5">
                  FacultyPortal
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                    Teacher
                  </span>
                </h1>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Teacher Pill */}
          <div className="px-4 pt-4 pb-2">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-inner shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : "T"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || "Teacher"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  Faculty Member
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            <p className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Faculty Menu
            </p>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between
                    px-3.5 py-2.5 rounded-xl
                    text-sm font-medium transition
                    ${
                      active
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-semibold"
                        : "text-slate-300 hover:bg-slate-900 hover:text-white"
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={18} className={active ? "text-white" : "text-slate-400"} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
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

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 ml-0 transition-all duration-300 min-w-0 flex flex-col">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-1 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-xl md:hidden transition"
            >
              <Menu size={22} />
            </button>

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-slate-500 truncate hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {user?.name || "Teacher"}
              </p>
              <p className="text-[11px] text-slate-500 capitalize">
                {user?.role || "Teacher"}
              </p>
            </div>

            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-semibold flex items-center justify-center text-sm shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : <GraduationCap size={18} />}
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 shadow-lg md:hidden flex items-center justify-around safe-area-bottom">
        {bottomTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          return (
            <button
              key={tab.name}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition ${
                isActive ? "text-emerald-600 font-semibold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? "bg-emerald-50" : ""}`}>
                <Icon size={20} className={isActive ? "text-emerald-600" : "text-slate-500"} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.name}</span>
            </button>
          );
        })}

        <button
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl text-slate-500"
        >
          <div className="p-1 rounded-lg">
            <Menu size={20} />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">More</span>
        </button>
      </nav>
    </div>
  );
}

export default TeacherLayout;
