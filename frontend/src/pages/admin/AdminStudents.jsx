import { useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  RefreshCw,
  X,
  Check,
  User,
  GraduationCap,
  ShieldAlert,
  Save,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../../services/adminService";

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("All");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [activeStudent, setActiveStudent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const initialFormState = {
    name: "",
    email: "",
    password: "",
    studentclass: "10th",
    age: 18,
    gender: "Male",
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchStudentList = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getStudents();
      setStudents(data.students || []);
    } catch (err) {
      console.log("FETCH STUDENTS ERROR:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load students"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentList();
  }, []);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass =
        classFilter === "All" || s.studentclass === classFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q)) ||
        (s.studentclass && s.studentclass.toLowerCase().includes(q));
      return matchClass && matchSearch;
    });
  }, [students, classFilter, searchQuery]);

  // Unique classes for filtering
  const availableClasses = useMemo(() => {
    const set = new Set();
    students.forEach((s) => {
      if (s.studentclass) set.add(s.studentclass);
    });
    return ["All", ...Array.from(set)];
  }, [students]);

  // Handle Create Student
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      setModalError("");

      await createStudent({
        ...formData,
        age: Number(formData.age),
      });

      setIsCreateOpen(false);
      setFormData(initialFormState);
      setSuccessMsg("Student created successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchStudentList();
    } catch (err) {
      console.log("CREATE STUDENT ERROR:", err);
      setModalError(
        err.response?.data?.message ||
        err.message ||
        "Failed to create student"
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
      studentclass: student.studentclass || "10th",
      age: student.age || 18,
      gender: student.gender || "Male",
    });
    setModalError("");
    setIsEditOpen(true);
  };

  // Handle Update Student
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!activeStudent?._id) return;

    try {
      setModalLoading(true);
      setModalError("");

      await updateStudent(activeStudent._id, {
        name: formData.name,
        email: formData.email,
        studentclass: formData.studentclass,
        age: Number(formData.age),
        gender: formData.gender,
      });

      setIsEditOpen(false);
      setSuccessMsg("Student updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchStudentList();
    } catch (err) {
      console.log("UPDATE STUDENT ERROR:", err);
      setModalError(
        err.response?.data?.message ||
        err.message ||
        "Failed to update student"
      );
    } finally {
      setModalLoading(false);
    }
  };

  // Open Delete Confirmation
  const openDeleteModal = (student) => {
    setActiveStudent(student);
    setIsDeleteOpen(true);
  };

  // Handle Delete Student
  const handleDelete = async () => {
    if (!activeStudent?._id) return;

    try {
      setModalLoading(true);
      await deleteStudent(activeStudent._id);
      setIsDeleteOpen(false);
      setSuccessMsg(`Student "${activeStudent.name}" deleted.`);
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchStudentList();
    } catch (err) {
      console.log("DELETE STUDENT ERROR:", err);
      alert(err.response?.data?.message || "Failed to delete student");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <AdminLayout>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="text-indigo-600" size={26} />
            <span>Student Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, view, update, and manage all enrolled students in your institution
          </p>
        </div>

        <button
          onClick={() => {
            setFormData(initialFormState);
            setModalError("");
            setIsCreateOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md shadow-indigo-600/25 self-start sm:self-center"
        >
          <PlusCircle size={17} />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <Check size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Quick Stats Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Students
          </span>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {students.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Filtered Count
          </span>
          <p className="text-2xl font-black text-indigo-600 mt-1">
            {filteredStudents.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Classes Represented
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {Math.max(1, availableClasses.length - 1)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Enrollment Status
          </span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            Active
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name, email, or class..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Class:
          </span>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {availableClasses.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Classes" : `Class ${c}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error View */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-rose-800">
            Error Loading Students
          </h3>
          <p className="text-xs sm:text-sm text-rose-600 mt-1 mb-4">
            {error}
          </p>
          <button
            onClick={fetchStudentList}
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
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Users size={32} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            No Students Found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            {searchQuery || classFilter !== "All"
              ? "No students match your search filters."
              : "No students have been enrolled yet. Click 'Add New Student' to get started."}
          </p>
        </div>
      )}

      {/* Student List View (Mobile Cards & Desktop Table) */}
      {!loading && !error && filteredStudents.length > 0 && (
        <>
          {/* Mobile Card List (< 768px) */}
          <div className="space-y-3 md:hidden">
            {filteredStudents.map((st) => (
              <div
                key={st._id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold flex items-center justify-center text-sm shrink-0">
                      {st.name ? st.name.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {st.name}
                      </h4>
                      <p className="text-xs text-slate-500 break-all">
                        {st.email}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 shrink-0">
                    Class {st.studentclass || "10th"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>
                    {st.gender || "Male"} • {st.age || 18} Yrs
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setActiveStudent(st);
                        setIsViewOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                      title="View Details"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => openEditModal(st)}
                      className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      title="Edit Student"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(st)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                      title="Delete Student"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= 768px) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Student</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Age / Gender</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {st.name ? st.name.charAt(0).toUpperCase() : "S"}
                        </div>
                        <span className="font-bold text-slate-800">
                          {st.name}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-slate-600 break-all">
                      {st.email}
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700">
                        Class {st.studentclass || "10th"}
                      </span>
                    </td>

                    <td className="p-4 text-slate-600 capitalize">
                      {st.gender || "Male"} • {st.age || 18} Yrs
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setActiveStudent(st);
                            setIsViewOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(st)}
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                          title="Edit Student"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(st)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                          title="Delete Student"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* CREATE STUDENT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-indigo-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  Add New Student
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Johnson"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@school.edu"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Class
                  </label>
                  <input
                    type="text"
                    value={formData.studentclass}
                    onChange={(e) => setFormData({ ...formData, studentclass: e.target.value })}
                    placeholder="e.g. 10th"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="30"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-sm disabled:opacity-60"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Edit2 size={20} className="text-indigo-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  Update Student
                </h3>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Class
                  </label>
                  <input
                    type="text"
                    value={formData.studentclass}
                    onChange={(e) => setFormData({ ...formData, studentclass: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="30"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-sm disabled:opacity-60 flex items-center gap-1.5"
                >
                  <Save size={15} />
                  <span>{modalLoading ? "Saving..." : "Update Student"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW STUDENT DETAILS MODAL */}
      {isViewOpen && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <h3 className="text-base font-bold text-slate-800">
                Student Profile Information
              </h3>
              <button
                onClick={() => setIsViewOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-extrabold text-2xl flex items-center justify-center mx-auto mb-2 shadow-md">
                {activeStudent.name ? activeStudent.name.charAt(0).toUpperCase() : "S"}
              </div>
              <h4 className="text-lg font-bold text-slate-800">{activeStudent.name}</h4>
              <p className="text-xs text-slate-500 break-all">{activeStudent.email}</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Class:</span>
                <span className="font-bold">Class {activeStudent.studentclass || "10th"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Age:</span>
                <span className="font-bold">{activeStudent.age || 18} Years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gender:</span>
                <span className="font-bold capitalize">{activeStudent.gender || "Male"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Database ID:</span>
                <span className="font-mono text-[11px] text-slate-500">{activeStudent._id}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={28} />
            </div>

            <h3 className="text-base font-bold text-slate-800">
              Delete Student?
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to delete <span className="font-bold text-slate-800">{activeStudent.name}</span>? This action removes the student from the database.
            </p>

            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={modalLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm disabled:opacity-60"
              >
                {modalLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminStudents;
