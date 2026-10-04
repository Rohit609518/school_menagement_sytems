import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserRound,
  Menu,
} from "lucide-react";
import Sidebar from "../component/Sidebare";
import Navbar from "../component/Navbare";

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const bottomTabs = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Students", path: "/admin/students", icon: Users },
    { name: "Teachers", path: "/admin/teachers", icon: GraduationCap },
    { name: "Parents", path: "/admin/parents", icon: UserRound },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 md:ml-64 ml-0 transition-all duration-300 min-w-0 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

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
                isActive ? "text-indigo-600 font-semibold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? "bg-indigo-50" : ""}`}>
                <Icon size={20} className={isActive ? "text-indigo-600" : "text-slate-500"} />
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

export default AdminLayout;
