import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  PlusCircle,
  Edit2,
  CalendarCheck,
  BookOpen,
  Handshake,
  Wallet,
  AlertCircle,
  RefreshCw,
  X,
  Check,
  GraduationCap,
  Mail,
  User,
  CheckCircle2,
  Clock,
} from "lucide-react";
import TeacherLayout from "../../layouts/TeacherLayout";
import {
  getStudents,
  createStudent,
  updateStudent,
} from "../../services/adminService";
import api from "../../services/api";

function TeacherStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [feesMap, setFeesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("All");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const initialForm = {
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "Male",
    studentclass: "10th",
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchStudentsData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getStudents();
      const list = res.students || [];
      setStudents(list);

      // Fetch fee status for classroom students to highlight pending ping fees
      const feesRecord = {};
      await Promise.allSettled(
        list.slice(0, 20).map(async (s) => {
          try {
            const feeRes = await api.get(`/fees/student/${s._id}`);
            const fList = feeRes.data?.fees || feeRes.data?.fee || [];
            const feesArray = Array.isArray(fList) ? fList : [fList];
            let hasPending = false;
            let totalRemaining = 0;
            let totalBilled = 0;
            let totalPaid = 0;

            feesArray.forEach((f) => {
              if (f) {
                const tot = Number(f.totalAmount || 0);
                const pd = Number(f.paidAmount || 0);
                const rem = f.remaining !== undefined ? Number(f.remaining) : Math.max(0, tot - pd);
                totalBilled += tot;
                totalPaid += pd;
                totalRemaining += rem;
                if ((f.status || "").toLowerCase() !== "paid" && rem > 0) {
                  hasPending = true;
                }
              }
            });

            feesRecord[s._id] = {
              hasPending,
              totalRemaining,
              totalBilled,
              totalPaid,
              count: feesArray.length,
            };
          } catch {
            // fee record not available or not billed
          }
        })
      );
      setFeesMap(feesRecord);
    } catch (err) {
      console.log("FETCH TEACHER STUDENTS ERROR:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load students roster"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsData();
  }, []);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentclass?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchClass =
        classFilter === "All" ||
        s.studentclass?.toLowerCase() === classFilter.toLowerCase();

      return matchSearch && matchClass;
    });
  }, [students, searchQuery, classFilter]);

  // Unique Classes
  const uniqueClasses = useMemo(() => {
    const set = new Set();
    students.forEach((s) => {
      if (s.studentclass) set.add(s.studentclass);
    });
    return Array.from(set);
  }, [students]);

  // Handle Create Student
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setModalError("Please provide both name and email.");
      return;
    }

    try {
      setModalLoading(true);
      setModalError("");

      await createStudent({
        ...formData,
        age: Number(formData.age) || 16,
        password: formData.password || "12345678",
      });

      setIsCreateOpen(false);
      setFormData(initialForm);
      setSuccessMsg("Student registered successfully!");
      setTimeout(() => setSuccessMsg(""), 3500);
      fetchStudentsData();
    } catch (err) {
      console.log("CREATE STUDENT ERROR:", err);
      setModalError(
        err.response?.data?.message ||
        err.message ||
        "Failed to create student. Note: Backend requires student user role."
      );
    } finally {
      setModalLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (student) => {
    setActiveStudent(student);
    setFormData({
      name: student.name || "",
      email: student.email || "",
      password: "",
      age: student.age || "",
      gender: student.gender || "Male",
      studentclass: student.studentclass || "10th",
    });
    setModalError("");
    setIsEditOpen(true);
  };

  // Handle Update Student
  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!activeStudent?._id) return;

    try {
      setModalLoading(true);
      setModalError("");

      const payload = {
        name: formData.name,
        email: formData.email,
        age: Number(formData.age) || activeStudent.age,
        gender: formData.gender,
        studentclass: formData.studentclass,
      };

      if (formData.password?.trim()) {
        payload.password = formData.password;
      }

      await updateStudent(activeStudent._id, payload);

      setIsEditOpen(false);
      setSuccessMsg("Student details updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3500);
      fetchStudentsData();
    } catch (err) {
      console.log("UPDATE STUDENT ERROR:", err);
      setModalError(
        err.response?.data?.message ||
        err.message ||
        "Failed to update student details"
      );
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <TeacherLayout
      title="Class Students"
      subtitle="Classroom roster, student enrollment, fee clearance tracking"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="text-emerald-600" size={26} />
            <span>Classroom Students</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage student records, review class pending ping fees, and update profiles
          </p>
        </div>

        <button
          onClick={() => {
            setFormData(initialForm);
            setModalError("");
            setIsCreateOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/25 self-start sm:self-center"
        >
          <PlusCircle size={17} />
          <span>Add Student</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2 animate-fadeIn">
          <Check size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, email, or class..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setClassFilter("All")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
              classFilter === "All"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Classes ({students.length})
          </button>
          {uniqueClasses.map((cls) => (
            <button
              key={cls}
              onClick={() => setClassFilter(cls)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                classFilter === cls
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Class {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error View */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-rose-800">Error Loading Students</h3>
          <p className="text-xs sm:text-sm text-rose-600 mt-1 mb-4">{error}</p>
          <button
            onClick={fetchStudentsData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-rose-700 transition"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredStudents.length === 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Users size={32} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">No Students Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            {searchQuery ? "Try refining your search terms." : "Click 'Add Student' to enroll a student."}
          </p>
        </div>
      )}

      {/* Student Cards Grid */}
      {!loading && !error && filteredStudents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((st) => {
            const feeInfo = feesMap[st._id];
            const hasFeeData = !!feeInfo;
            const hasPendingFee = feeInfo?.hasPending;

            return (
              <div
                key={st._id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-base flex items-center justify-center shadow-xs">
                        {st.name?.charAt(0)?.toUpperCase() || "S"}
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-800 truncate">
                          {st.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            Class {st.studentclass || "10th"}
                          </span>
                          <span className="text-[11px] text-slate-400 capitalize">
                            {st.gender || "Male"} • {st.age ? `${st.age} yrs` : "Enrolled"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => openEditModal(st)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                      title="Edit Student Info"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate break-all">{st.email}</span>
                    </div>

                    {/* Class Ping Fee Clearance Status */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                        <Wallet size={12} className="text-slate-400" />
                        <span>Fees Status:</span>
                      </span>
                      {hasFeeData ? (
                        hasPendingFee ? (
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Clock size={11} />
                            <span>Pending Dues: ₹{feeInfo.totalRemaining.toLocaleString()}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 size={11} />
                            <span>All Cleared (Paid)</span>
                          </span>
                        )
                      ) : (
                        <span className="text-[11px] text-slate-400">No records</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Action Buttons for Teacher */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    onClick={() => navigate("/teacher/attendance")}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-semibold transition flex flex-col items-center gap-1 text-[10px]"
                    title="Mark Attendance"
                  >
                    <CalendarCheck size={14} />
                    <span>Attendance</span>
                  </button>

                  <button
                    onClick={() => navigate("/teacher/results")}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-semibold transition flex flex-col items-center gap-1 text-[10px]"
                    title="Enter Results"
                  >
                    <BookOpen size={14} />
                    <span>Results</span>
                  </button>

                  <button
                    onClick={() => navigate("/teacher/meetings")}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 font-semibold transition flex flex-col items-center gap-1 text-[10px]"
                    title="Schedule Parent Meeting"
                  >
                    <Handshake size={14} />
                    <span>Meeting</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE STUDENT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <PlusCircle size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Add New Student</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@school.edu"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Password (optional)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Default: 12345678"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Class *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentclass}
                    onChange={(e) => setFormData({ ...formData, studentclass: e.target.value })}
                    placeholder="e.g. 10th"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="25"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 16"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition disabled:opacity-50"
                >
                  {modalLoading ? "Creating..." : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Edit2 size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Edit Student</h3>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleUpdateStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  New Password (optional)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave blank to keep unchanged"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Class *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentclass}
                    onChange={(e) => setFormData({ ...formData, studentclass: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="25"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition disabled:opacity-50"
                >
                  {modalLoading ? "Updating..." : "Update Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}

export default TeacherStudents;
