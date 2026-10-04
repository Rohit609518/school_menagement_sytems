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
} from "lucide-react";
import StudentLayout from "../../layouts/StudentLayout";
import { getMyStudentProfile } from "../../services/studentservice";
import { getMyAttendance } from "../../services/attendanceService";

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError("");

      const profile = await getMyStudentProfile();
      const studentId = profile?.student?._id;

      if (!studentId) {
        throw new Error("Student profile could not be identified");
      }

      const data = await getMyAttendance(studentId);
      setAttendance(data.attendance || []);
    } catch (err) {
      console.log("ATTENDANCE ERROR:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load attendance records"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  // Stats computation
  const stats = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter((a) => a.status === "Present").length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;
    return { total, present, absent, percentage };
  }, [attendance]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    if (statusFilter === "All") return attendance;
    return attendance.filter((a) => a.status === statusFilter);
  }, [attendance, statusFilter]);

  return (
    <StudentLayout
      title="Attendance Record"
      subtitle="Monitor your class attendance rate, presence, and logs"
    >
      {/* Attendance Metric Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Attendance Percentage */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rate
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                {loading ? "--" : `${stats.percentage}%`}
              </span>
              <span
                className={`text-[11px] font-bold ${
                  stats.percentage >= 75 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {stats.percentage >= 75 ? "Eligible" : "Warning"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Min 75% required
            </p>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Days
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <Calendar size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {loading ? "--" : stats.total}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Working days logged
            </p>
          </div>
        </div>

        {/* Days Present */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Present
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {loading ? "--" : stats.present}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Classes attended
            </p>
          </div>
        </div>

        {/* Days Absent */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Absent
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <XCircle size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">
              {loading ? "--" : stats.absent}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Leaves or unexcused
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {["All", "Present", "Absent"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === tab
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredRecords.length} records
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl" />
          ))}
        </div>
      )}

      {/* Error View */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-rose-800">
            Error Loading Attendance
          </h3>
          <p className="text-xs sm:text-sm text-rose-600 mt-1 mb-4">
            {error}
          </p>
          <button
            onClick={fetchAttendanceData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-rose-700 transition"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredRecords.length === 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <CalendarCheck size={32} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            No Attendance Records
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            There are no recorded attendance entries for this filter yet.
          </p>
        </div>
      )}

      {/* Records View: Responsive Dual Representation */}
      {!loading && !error && filteredRecords.length > 0 && (
        <>
          {/* Mobile Card List (Visible on < 768px screens) */}
          <div className="space-y-2.5 md:hidden">
            {filteredRecords.map((item) => {
              const isPresent = item.status === "Present";
              const recordDate = new Date(item.date);

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isPresent
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {isPresent ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {recordDate.toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Year {recordDate.getFullYear()}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isPresent
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (Visible on >= 768px screens) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Date</th>
                  <th className="p-4">Day</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredRecords.map((item) => {
                  const isPresent = item.status === "Present";
                  const recordDate = new Date(item.date);

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/60 transition"
                    >
                      <td className="p-4 pl-6 font-semibold text-slate-800">
                        {recordDate.toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-slate-500">
                        {recordDate.toLocaleDateString(undefined, {
                          weekday: "long",
                        })}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            isPresent
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPresent ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right text-xs text-slate-400">
                        {isPresent ? "Normal presence" : "Unexcused"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </StudentLayout>
  );
}

export default Attendance;