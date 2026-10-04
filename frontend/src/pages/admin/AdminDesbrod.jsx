import {
  Users,
  GraduationCap,
  UserRound,
  Wallet,
  ArrowRight,
  PlusCircle,
  CalendarCheck,
  BookOpen,
  FileText,
  Award,
  ShieldCheck,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSystemStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getStudents,
  getTeachers,
} from "../../services/adminService";
import AdminLayout from "../../layouts/AdminLayout";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalAttendance: 0,
    attendanceRate: 100,
    totalHomework: 0,
    totalExams: 0,
    totalResults: 0,
    totalMeetings: 0,
    totalFeesExpected: 0,
    totalFeesCollected: 0,
    pendingFees: 0,
  });

  const [users, setUsers] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentTeachers, setRecentTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [roleUpdatingId, setRoleUpdatingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const [statsRes, usersRes, studentsRes, teachersRes] = await Promise.allSettled([
        getSystemStats(),
        getAllUsers(),
        getStudents(),
        getTeachers(),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value) {
        setStats(statsRes.value.stats || {});
      }

      if (usersRes.status === "fulfilled" && usersRes.value) {
        setUsers(usersRes.value.users || []);
      }

      if (studentsRes.status === "fulfilled" && studentsRes.value) {
        setRecentStudents((studentsRes.value.students || []).slice(0, 5));
      }

      if (teachersRes.status === "fulfilled" && teachersRes.value) {
        setRecentTeachers((teachersRes.value.teachers || []).slice(0, 5));
      }
    } catch (err) {
      console.error("ADMIN DASHBOARD ERROR:", err);
      setErrorMsg("Failed to load some dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setRoleUpdatingId(userId);
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      setSuccessMsg(`User role updated to ${newRole}`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update role");
      setTimeout(() => setErrorMsg(""), 4000);
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user account?")) return;
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setSuccessMsg("User account deleted successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to delete user");
      setTimeout(() => setErrorMsg(""), 4000);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.role || "").toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete institutional overview, academic intelligence, and role governance
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md transition self-start sm:self-center"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2">
          <Check size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Core Institutional Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Total Students */}
        <div
          onClick={() => navigate("/admin/students")}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Students
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-800">
              {stats.totalStudents}
            </span>
            <p className="text-[11px] text-indigo-600 font-semibold mt-1 flex items-center gap-1">
              <span>Manage directory</span>
              <ArrowRight size={12} />
            </p>
          </div>
        </div>

        {/* Total Teachers */}
        <div
          onClick={() => navigate("/admin/teachers")}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Teachers
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition">
              <GraduationCap size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-800">
              {stats.totalTeachers}
            </span>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <span>Faculty roster</span>
              <ArrowRight size={12} />
            </p>
          </div>
        </div>

        {/* Total Parents */}
        <div
          onClick={() => navigate("/admin/parents")}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Parents
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition">
              <UserRound size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-800">
              {stats.totalParents}
            </span>
            <p className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
              <span>Parent links</span>
              <ArrowRight size={12} />
            </p>
          </div>
        </div>

        {/* Fees Overview */}
        <div
          onClick={() => navigate("/admin/fees")}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-violet-300 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Fees Collected
            </span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600 group-hover:scale-110 transition">
              <Wallet size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-slate-800">
              ₹{stats.totalFeesCollected?.toLocaleString() || 0}
            </span>
            <p className="text-[11px] text-rose-500 font-semibold mt-1">
              ₹{stats.pendingFees?.toLocaleString() || 0} Pending
            </p>
          </div>
        </div>
      </div>

      {/* 2. Academic Overviews Grid (Attendance, Homework, Exams, Results) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Attendance Overview */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CalendarCheck size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Attendance</h3>
            </div>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {stats.attendanceRate}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.attendanceRate)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            {stats.totalAttendance} Total sessions marked across all sections
          </p>
        </div>

        {/* Homework Overview */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <BookOpen size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Homework</h3>
            </div>
            <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {stats.totalHomework} Tasks
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Active curriculum assignments managed by subject teachers
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Continuous homework tracking across departments
          </p>
        </div>

        {/* Exam Overview */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <FileText size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Exams</h3>
            </div>
            <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {stats.totalExams} Tests
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Weekly assessments & term examinations scheduled
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Standardized evaluation records
          </p>
        </div>

        {/* Results Overview */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Award size={18} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Results</h3>
            </div>
            <span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              {stats.totalResults} Logged
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Term scorecards and GPA distributions recorded
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Published to student & parent portals
          </p>
        </div>
      </div>

      {/* 3. User Accounts & Role Governance Section (Admin Only Feature) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                User Accounts & Role-Based Governance (RBAC)
              </h2>
              <p className="text-xs text-slate-500">
                Directly manage access levels, assign roles, or revoke user permissions
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search user, email, or role..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Email Address</th>
                <th className="py-3 px-3">Current Role</th>
                <th className="py-3 px-3">Change Role</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
                    No users matching search query
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleColors = {
                    Admin: "bg-indigo-100 text-indigo-800 border-indigo-200",
                    Teacher: "bg-emerald-100 text-emerald-800 border-emerald-200",
                    Student: "bg-blue-100 text-blue-800 border-blue-200",
                    Parent: "bg-amber-100 text-amber-800 border-amber-200",
                  };

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {u.name}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {u.email}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            roleColors[u.role] || "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={u.role}
                          disabled={roleUpdatingId === u._id}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Teacher">Teacher</option>
                          <option value="Student">Student</option>
                          <option value="Parent">Parent</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Student & Teacher Roster Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-indigo-600" />
              <span>Enrolled Students</span>
            </h3>
            <button
              onClick={() => navigate("/admin/students")}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentStudents.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No students registered yet</p>
            ) : (
              recentStudents.map((s) => (
                <div
                  key={s._id}
                  onClick={() => navigate("/admin/students")}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 flex items-center justify-between transition cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">{s.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Class {s.studentclass || "10th"} • {s.email}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">
                    Active
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Teachers */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              <GraduationCap size={18} className="text-emerald-600" />
              <span>Faculty Staff</span>
            </h3>
            <button
              onClick={() => navigate("/admin/teachers")}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTeachers.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No teachers registered yet</p>
            ) : (
              recentTeachers.map((t) => (
                <div
                  key={t._id}
                  onClick={() => navigate("/admin/teachers")}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 flex items-center justify-between transition cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800">{t.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {t.subject || "Subject"} • {t.phone}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-600">
                    Staff
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;