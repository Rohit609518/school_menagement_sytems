import { useState, useEffect } from "react";
import {
  User,
  BookOpen,
  CalendarCheck,
  FileText,
  Trophy,
  Wallet,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StudentLayout from "../../layouts/StudentLayout";

import { getMyStudentProfile } from "../../services/studentservice";
import { getMyHomework } from "../../services/homeworkService";
import { getMyAttendance } from "../../services/attendanceService";
import { getMyExams } from "../../services/examService";
import { getMyFees } from "../../services/feesService";
import FamilyModeSwitcher from "../../component/FamilyModeSwitcher";

function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    homeworkCount: 0,
    attendanceRate: 0,
    totalAttendanceDays: 0,
    examsCount: 0,
    feeStatus: "Checking...",
  });
  const [recentHomework, setRecentHomework] = useState([]);

  // Determine greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Student Profile
        const profileRes = await getMyStudentProfile();
        const student = profileRes?.student;
        setProfile(student);

        if (student?._id) {
          // 2. Fetch parallel data for live metrics
          const [hwRes, attRes, examRes, feeRes] = await Promise.allSettled([
            getMyHomework(student._id),
            getMyAttendance(student._id),
            getMyExams(student._id),
            getMyFees(student._id),
          ]);

          // Homework count
          let hwList = [];
          if (hwRes.status === "fulfilled" && hwRes.value) {
            hwList = hwRes.value.homework || [];
            setRecentHomework(hwList.slice(0, 3));
          }

          // Attendance calculation
          let attRate = 0;
          let totalDays = 0;
          if (attRes.status === "fulfilled" && attRes.value) {
            const attList = attRes.value.attendance || [];
            totalDays = attList.length;
            const presentDays = attList.filter((a) => a.status === "Present").length;
            attRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;
          }

          // Exams count
          let examCount = 0;
          if (examRes.status === "fulfilled" && examRes.value) {
            const examsList = examRes.value.exams || examRes.value.exam || [];
            examCount = examsList.length;
          }

          // Fee status
          let feeStatusStr = "Good Standing";
          if (feeRes.status === "fulfilled" && feeRes.value) {
            const feeList = feeRes.value.fees || feeRes.value.fee || [];
            if (feeList.length > 0) {
              const pendingFee = feeList.some(
                (f) => (f.status || "").toLowerCase() === "pending"
              );
              const partialFee = feeList.some(
                (f) => (f.status || "").toLowerCase() === "partial"
              );
              if (pendingFee) feeStatusStr = "Pending";
              else if (partialFee) feeStatusStr = "Partial";
              else feeStatusStr = "Paid";
            }
          }

          setStats({
            homeworkCount: hwList.length,
            attendanceRate: attRate,
            totalAttendanceDays: totalDays,
            examsCount: examCount,
            feeStatus: feeStatusStr,
          });
        }
      } catch (err) {
        console.log("DASHBOARD DATA ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const portalModules = [
    {
      title: "My Profile",
      description: "Personal and academic information, class & roll number",
      icon: User,
      path: "/student/details",
      color: "from-blue-600 to-indigo-600",
      lightColor: "bg-blue-50 text-blue-600",
    },
    {
      title: "Attendance",
      description: "Track daily presence, absence records, and rate",
      icon: CalendarCheck,
      path: "/student/attendance",
      color: "from-emerald-600 to-teal-600",
      lightColor: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Homework",
      description: "Assigned tasks, teacher notes, and due dates",
      icon: BookOpen,
      path: "/student/homework",
      color: "from-indigo-600 to-purple-600",
      lightColor: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Exams",
      description: "Exam schedules, topics, and marks achieved",
      icon: FileText,
      path: "/student/exams",
      color: "from-amber-600 to-orange-600",
      lightColor: "bg-amber-50 text-amber-600",
    },
    {
      title: "Results",
      description: "Semester scorecards, grades, and percentage summaries",
      icon: Trophy,
      path: "/student/results",
      color: "from-violet-600 to-pink-600",
      lightColor: "bg-violet-50 text-violet-600",
    },
    {
      title: "Fees",
      description: "Tuition invoices, payment receipts, and balance status",
      icon: Wallet,
      path: "/student/fees",
      color: "from-rose-600 to-red-600",
      lightColor: "bg-rose-50 text-rose-600",
    },
    {
      title: "Parent Corner",
      description: "Parent-teacher consultation meetings & guardian overview",
      icon: Trophy,
      path: "/parent",
      color: "from-amber-600 to-orange-600",
      lightColor: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <StudentLayout
      title="Student Dashboard"
      subtitle={`Welcome back, ${profile?.name || user?.name || "Student"}`}
    >
      {/* Shared Family Mobile Hub Banner */}
      <FamilyModeSwitcher compact={false} />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white p-5 sm:p-7 md:p-8 shadow-xl shadow-indigo-600/15 mb-6 sm:mb-8">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-medium text-indigo-100 mb-3 border border-white/10">
              <Sparkles size={14} className="text-amber-300" />
              <span>Academic Year 2026</span>
              <span className="w-1 h-1 rounded-full bg-indigo-200" />
              <span>{profile?.studentclass ? `Class ${profile.studentclass}` : "Enrolled"}</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              {getGreeting()},{" "}
              <span className="text-indigo-200">
                {profile?.name || user?.name || "Student"}
              </span>{" "}
              👋
            </h1>

            <p className="text-indigo-100/90 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
              Stay on track with your classes, check new homework assignments, monitor your attendance, and view your exam results.
            </p>
          </div>

          {/* Quick Profile Avatar pill on mobile/desktop */}
          <div className="self-start sm:self-center shrink-0">
            <button
              onClick={() => navigate("/student/details")}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-xs sm:text-sm font-semibold transition"
            >
              <span>View Full Profile</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Live Metric Highlight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Attendance Rate */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Attendance
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CalendarCheck size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold text-slate-800">
                {loading ? "--" : `${stats.attendanceRate}%`}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">
                {stats.attendanceRate >= 75 ? "Good" : "Needs Attention"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {stats.totalAttendanceDays} days recorded
            </p>
          </div>
        </div>

        {/* Homework Pending */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Homework
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold text-slate-800">
                {loading ? "--" : stats.homeworkCount}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Assigned</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              Check due dates below
            </p>
          </div>
        </div>

        {/* Exams */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Exams
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <FileText size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold text-slate-800">
                {loading ? "--" : stats.examsCount}
              </span>
              <span className="text-[11px] text-amber-600 font-medium">Tests</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              View upcoming tests
            </p>
          </div>
        </div>

        {/* Fee Status */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Fee Status
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Wallet size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                stats.feeStatus === "Paid"
                  ? "bg-emerald-100 text-emerald-700"
                  : stats.feeStatus === "Partial"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {loading ? "Loading..." : stats.feeStatus}
            </span>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              Tuition & academic dues
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation Modules Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              Portal Modules
            </h2>
            <p className="text-xs text-slate-500">
              Access your student tools and resources
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {portalModules.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                onClick={() => navigate(item.path)}
                className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.lightColor} group-hover:scale-105 transition-transform duration-200`}>
                      <Icon size={22} />
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition">
                      <ArrowRight size={16} />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  <span>Open module</span>
                  <ArrowRight size={13} className="ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Homework Preview Section */}
      {recentHomework.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-indigo-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                Recent Homework
              </h2>
            </div>
            <button
              onClick={() => navigate("/student/homework")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View All ({stats.homeworkCount}) →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentHomework.map((hw) => (
              <div
                key={hw._id}
                onClick={() => navigate("/student/homework")}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/60 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md uppercase">
                    {hw.subject || "Subject"}
                  </span>
                  {hw.duedate || hw.dueDate ? (
                    <span className="text-[11px] text-slate-500 font-medium">
                      Due: {new Date(hw.duedate || hw.dueDate).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-800 mt-2 truncate">
                  {hw.title || hw.subject || "Homework Assignment"}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                  {hw.description || "No description provided."}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </StudentLayout>
  );
}

export default StudentDashboard;