import { useEffect, useState, useMemo } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Search,
  Calendar,
  AlertCircle,
  RefreshCw,
  X,
  Check,
  User,
} from "lucide-react";
import TeacherLayout from "../../layouts/TeacherLayout";
import { getStudents } from "../../services/adminService";
import {
  getAllAttendance,
  markStudentAttendance,
} from "../../services/attendanceService";

function TeacherAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    student: "",
    date: new Date().toISOString().split("T")[0],
    status: "Present",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [attRes, studRes] = await Promise.allSettled([
        getAllAttendance(),
        getStudents(),
      ]);

      if (attRes.status === "fulfilled" && attRes.value) {
        setAttendance(attRes.value.attendance || []);
      }
      if (studRes.status === "fulfilled" && studRes.value) {
        const sList = studRes.value.students || [];
        setStudents(sList);
        if (sList.length > 0 && !formData.student) {
          setFormData((prev) => ({ ...prev, student: sList[0]._id }));
        }
      }
    } catch (err) {
      console.log("FETCH ATTENDANCE ERROR:", err);
      setError("Failed to load attendance logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!formData.student) {
      setModalError("Please select a student.");
      return;
    }

    try {
      setModalLoading(true);
      setModalError("");

      await markStudentAttendance(formData);

      setIsModalOpen(false);
      setSuccessMsg("Student attendance marked successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchData();
    } catch (err) {
      console.log("MARK ATTENDANCE ERROR:", err);
      setModalError(
        err.response?.data?.message ||
        err.message ||
        "Failed to mark attendance"
      );
    } finally {
      setModalLoading(false);
    }
  };

  const filteredAttendance = useMemo(() => {
    return attendance.filter((item) => {
      const matchStatus =
        statusFilter === "All" || item.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const sName = item.student?.name ? item.student.name.toLowerCase() : "";
      const matchSearch = !searchQuery || sName.includes(q);
      return matchStatus && matchSearch;
    });
  }, [attendance, statusFilter, searchQuery]);

  return (
    <TeacherLayout
      title="Classroom Attendance"
      subtitle="Log student attendance records, daily roll call, and presence"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <CalendarCheck className="text-emerald-600" size={26} />
            <span>Mark Student Attendance</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Conduct daily roll call and register student attendance
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              student: students[0]?._id || "",
              date: new Date().toISOString().split("T")[0],
              status: "Present",
            });
            setModalError("");
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/25 self-start sm:self-center"
        >
          <PlusCircle size={17} />
          <span>Mark Attendance</span>
        </button>
      </div>

      {successMsg && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2">
          <Check size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search & Filter Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student name..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2">
          {["All", "Present", "Absent"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === st
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error View */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-rose-800">Error Loading Attendance</h3>
          <p className="text-xs sm:text-sm text-rose-600 mt-1 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-rose-700 transition"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredAttendance.length === 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CalendarCheck size={32} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">No Attendance Records</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Click "Mark Attendance" to log a student's daily attendance.
          </p>
        </div>
      )}

      {/* Attendance Logs List */}
      {!loading && !error && filteredAttendance.length > 0 && (
        <>
          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {filteredAttendance.map((item) => {
              const isPresent = item.status === "Present";
              return (
                <div key={item._id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPresent ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                      {isPresent ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{item.student?.name || "Student"}</h4>
                      <p className="text-[11px] text-slate-400">Class {item.student?.studentclass || "10th"} • {new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${isPresent ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {item.status}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Student</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 pr-6 text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendance.map((item) => {
                  const isPresent = item.status === "Present";
                  return (
                    <tr key={item._id} className="hover:bg-slate-50/60 transition">
                      <td className="p-4 pl-6">
                        <p className="font-bold text-slate-800">{item.student?.name || "Student"}</p>
                        <p className="text-xs text-slate-400">{item.student?.email}</p>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">Class {item.student?.studentclass || "10th"}</td>
                      <td className="p-4 text-slate-600">{new Date(item.date).toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</td>
                      <td className="p-4 pr-6 text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${isPresent ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MARK ATTENDANCE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">Mark Student Attendance</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleMarkAttendance} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Student</label>
                <select
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {students.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name} ({st.studentclass || "Class 10th"}) - {st.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "Present" })}
                    className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition ${
                      formData.status === "Present"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <CheckCircle2 size={16} />
                    <span>Present</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "Absent" })}
                    className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition ${
                      formData.status === "Absent"
                        ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <XCircle size={16} />
                    <span>Absent</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm disabled:opacity-60"
                >
                  {modalLoading ? "Saving..." : "Save Attendance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}

export default TeacherAttendance;
