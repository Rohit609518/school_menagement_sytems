import {
  Users,
  GraduationCap,
  UserRound,
  Wallet,
  ArrowRight,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudents, getTeachers } from "../../services/adminService";
import { getAllFees } from "../../services/feesService";
import AdminLayout from "../../layouts/AdminLayout";

function AdminDashboard() {
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [feesTotal, setFeesTotal] = useState({ collected: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const [studentsData, teachersData, feesData] = await Promise.allSettled([
          getStudents(),
          getTeachers(),
          getAllFees(),
        ]);

        if (studentsData.status === "fulfilled" && studentsData.value) {
          setStudentCount(studentsData.value.students?.length || 0);
        }

        if (teachersData.status === "fulfilled" && teachersData.value) {
          setTeacherCount(teachersData.value.teachers?.length || 0);
        }

        if (feesData.status === "fulfilled" && feesData.value) {
          const fList = feesData.value.fees || [];
          let col = 0;
          let bil = 0;
          fList.forEach((f) => {
            col += Number(f.paidAmount || 0);
            bil += Number(f.totalAmount || 0);
          });
          setFeesTotal({ collected: col, pending: Math.max(0, bil - col) });
        }
      } catch (error) {
        console.log("ADMIN STATS FETCH ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  const stats = [
    {
      title: "Manage Students",
      value: studentCount,
      icon: Users,
      trend: "Click to View & Manage →",
      path: "/admin/students",
      color: "from-blue-600 to-indigo-600",
      lightColor: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Faculty & Teachers",
      value: teacherCount,
      icon: GraduationCap,
      trend: "Click to View & Manage →",
      path: "/admin/teachers",
      color: "from-emerald-600 to-teal-600",
      lightColor: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Parents Directory",
      value: "Linked",
      icon: UserRound,
      trend: "Click to View & Manage →",
      path: "/admin/parents",
      color: "from-amber-600 to-orange-600",
      lightColor: "bg-amber-50 text-amber-600",
    },
    {
      title: "Fees Ledger & Dues",
      value: `₹${feesTotal.collected.toLocaleString()}`,
      icon: Wallet,
      trend: `₹${feesTotal.pending.toLocaleString()} pending ping dues →`,
      path: "/admin/fees",
      color: "from-rose-600 to-red-600",
      lightColor: "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <AdminLayout>
      {/* Welcome Banner */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-indigo-700/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-indigo-200 mb-3 border border-white/15">
              <Sparkles size={14} className="text-amber-300" />
              <span>Institutional Administration Control</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome, Administrator 👋
            </h1>
            <p className="text-indigo-100/90 text-xs sm:text-sm mt-1 max-w-xl">
              Create, update, and manage student admissions, teacher appointments, parent accounts, and academic operations.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 self-start sm:self-center">
            <button
              onClick={() => navigate("/admin/students")}
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle size={16} />
              <span>Add Student</span>
            </button>
            <button
              onClick={() => navigate("/admin/teachers")}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs sm:text-sm font-bold transition flex items-center gap-1.5"
            >
              <PlusCircle size={16} />
              <span>Add Teacher</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              onClick={() => navigate(stat.path)}
              className="group bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 hover:shadow-md hover:border-indigo-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {stat.title}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">
                    {loading ? "--" : stat.value}
                  </h2>
                </div>

                <div className={`p-3 sm:p-3.5 rounded-xl ${stat.lightColor} group-hover:scale-105 transition-transform`}>
                  <Icon size={24} />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>{stat.trend}</span>
                <ArrowRight size={14} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Shortcuts & Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div
          onClick={() => navigate("/admin/students")}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 transition cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <Users size={20} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800">
            Student Management
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Enroll students, view academic records, edit class info, or remove records.
          </p>
        </div>

        <div
          onClick={() => navigate("/admin/teachers")}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <GraduationCap size={20} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800">
            Faculty Directory
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Register teachers, update departments, manage contact numbers and salaries.
          </p>
        </div>

        <div
          onClick={() => navigate("/admin/parents")}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-300 transition cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <UserRound size={20} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800">
            Parent Links
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Connect guardians with student profiles for attendance and meeting notifications.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;