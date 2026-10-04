import { useEffect, useState, useMemo } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Award,
  GraduationCap,
} from "lucide-react";
import ParentLayout from "../../layouts/ParentLayout";
import { getChildAttendance } from "../../services/attendanceService";

function ParentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getChildAttendance();
      setAttendance(res.attendance || []);
      setChild(res.child);
    } catch (err) {
      console.error("PARENT ATTENDANCE ERROR:", err);
      setError("Failed to load child's attendance records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const stats = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter((a) => a.status === "Present").length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;
    return { total, present, absent, percentage };
  }, [attendance]);

  const filteredAttendance = useMemo(() => {
    if (statusFilter === "All") return attendance;
    return attendance.filter((a) => a.status === statusFilter);
  }, [attendance, statusFilter]);

  return (
    <ParentLayout
      title="Child Attendance"
      subtitle={child ? `Viewing attendance logs for ${child.name}` : "Attendance monitoring"}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <CalendarCheck className="text-amber-600" size={26} />
            <span>Child Attendance History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time daily presence and absence records for your enrolled child (Read-Only)
          </p>
        </div>

        <button
          onClick={fetchAttendance}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md transition self-start sm:self-center"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Child Summary Pill */}
      {child && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{child.name}</p>
            <p className="text-xs text-slate-500">
              Class {child.studentclass || "10th"} • {child.email}
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Overall Rate
          </span>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {stats.percentage}%
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {stats.percentage >= 75 ? "Satisfactory" : "Needs Attention"}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Sessions
          </span>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {stats.total}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tracked school days</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Present
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {stats.present}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Days attended</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Absent
          </span>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {stats.absent}
          </p>
          <p className="text-[11px] text-rose-500 font-semibold mt-0.5">Missed sessions</p>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h2 className="text-base font-bold text-slate-800">
            Attendance Log ({filteredAttendance.length})
          </h2>

          <div className="flex gap-1.5">
            {["All", "Present", "Absent"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  statusFilter === status
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Recorded Time</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((a) => {
                  const isPresent = a.status === "Present";
                  return (
                    <tr key={a._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        {new Date(a.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      <td className="py-3.5 px-3 text-slate-500">
                        {new Date(a.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isPresent
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {isPresent ? (
                            <CheckCircle2 size={13} />
                          ) : (
                            <XCircle size={13} />
                          )}
                          <span>{a.status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ParentLayout>
  );
}

export default ParentAttendance;
