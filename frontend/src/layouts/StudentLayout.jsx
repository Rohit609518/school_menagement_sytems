import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  BookOpen,
  CalendarCheck,
  Menu,
} from "lucide-react";
import StudentSidebar from "../component/StudentSidebar";
import StudentNavbar from "../component/StudentNavbar";

function StudentLayout({ children, title = "Student Portal", subtitle = "" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close sidebar automatically when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Mobile bottom navigation tabs
  const bottomTabs = [
    {
      name: "Dashboard",
      path: "/student",
      icon: LayoutDashboard,
    },
    {
      name: "Profile",
      path: "/student/details",
      icon: User,
    },
    {
      name: "Homework",
      path: "/student/homework",
      icon: BookOpen,
    },
    {
      name: "Attendance",
      path: "/student/attendance",
      icon: CalendarCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Sidebar (Desktop pinned, Mobile slide-in drawer) */}
      <StudentSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 ml-0 transition-all duration-300 min-w-0 flex flex-col">
        {/* Top Navbar */}
        <StudentNavbar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          subtitle={subtitle}
        />

        {/* Page Content Container */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Shown on screens < 768px) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 shadow-lg md:hidden flex items-center justify-around safe-area-bottom"
      >
        {bottomTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          return (
            <button
              key={tab.name}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition ${
                isActive
                  ? "text-indigo-600 font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div
                className={`p-1 rounded-lg transition ${
                  isActive ? "bg-indigo-50" : ""
                }`}
              >
                <Icon size={20} className={isActive ? "text-indigo-600" : "text-slate-500"} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.name}</span>
            </button>
          );
        })}

        {/* More Button to trigger the full drawer menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition ${
            sidebarOpen ? "text-indigo-600 font-semibold" : "text-slate-500 hover:text-slate-800"
          }`}
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

export default StudentLayout;
