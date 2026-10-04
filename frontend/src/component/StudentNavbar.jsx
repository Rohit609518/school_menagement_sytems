import { useState, useRef, useEffect } from "react";
import {
  Bell,
  User,
  Menu,
  ChevronDown,
  LogOut,
  BookOpen,
  Calendar,
  CheckCircle2,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FamilyModeSwitcher from "./FamilyModeSwitcher";

function StudentNavbar({ onMenuClick, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  
  const getDynamicTitle = () => {
    if (title) return title;
    switch (location.pathname) {
      case "/student":
        return "Student Dashboard";
      case "/student/details":
        return "My Profile";
      case "/student/attendance":
        return "Attendance Record";
      case "/student/homework":
        return "Homework & Assignments";
      case "/student/exams":
        return "Examinations & Marks";
      case "/student/results":
        return "Academic Results";
      case "/student/fees":
        return "Fee Payment Details";
      default:
        return "Student Portal";
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sampleNotifications = [
    {
      id: 1,
      title: "New Homework Assigned",
      desc: "Check your Mathematics section for chapter 4 exercises.",
      icon: BookOpen,
      time: "2h ago",
      unread: true,
    },
    {
      id: 2,
      title: "Upcoming Exam",
      desc: "Midterm physics examination scheduled next week.",
      icon: Calendar,
      time: "1d ago",
      unread: true,
    },
    {
      id: 3,
      title: "Attendance Updated",
      desc: "Your attendance record for this month has been updated.",
      icon: CheckCircle2,
      time: "2d ago",
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 h-16 flex items-center justify-between transition-all">
      {/* Left: Mobile Drawer Trigger & Page Title */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-1 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl md:hidden transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        {/* Title & Breadcrumbs */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 truncate">
              {getDynamicTitle()}
            </h1>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 truncate hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Controls: Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 1-Tap Shared Mobile Family Switcher */}
        <FamilyModeSwitcher compact={true} />

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-indigo-600 rounded-full ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                <p className="font-semibold text-sm text-slate-800">
                  Academic Alerts
                </p>
                <span className="text-[11px] font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                  2 New
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {sampleNotifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className="p-3 hover:bg-slate-50 flex items-start gap-3 transition cursor-pointer"
                    >
                      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800">
                          {n.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                          {n.desc}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {n.time}
                        </p>
                      </div>
                      {n.unread && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="px-3 pt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition focus:outline-none"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-semibold flex items-center justify-center text-sm shadow-sm shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
            </div>

            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                {user?.name || "Student"}
              </p>
              <p className="text-[11px] text-slate-500 capitalize leading-tight">
                {user?.role || "Student"}
              </p>
            </div>

            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {user?.name || "Student"}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {user?.email || "student@school.edu"}
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    navigate("/student/details");
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2.5 transition"
                >
                  <User size={15} />
                  <span>My Profile</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default StudentNavbar;