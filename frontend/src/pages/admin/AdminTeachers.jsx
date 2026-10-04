import { useEffect, useState, useMemo } from "react";
import {
  GraduationCap,
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  RefreshCw,
  X,
  Check,
  Phone,
  Mail,
  BookOpen,
  DollarSign,
  ShieldAlert,
  Save,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../../services/adminService";

function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [activeTeacher, setActiveTeacher] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const initialForm = {
    name: "",
    email: "",
    phone: "",
    subject: "Mathematics",
    experience: "3",
    salary: "45000",
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchTeacherList = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getTeachers();
      setTeachers(data.teachers || []);
    } catch (err) {
      console.log("FETCH TEACHERS ERROR:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load teachers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherList();
  }, []);

  const filteredTeachers = useMemo(() => {
    if (!searchQuery) return teachers;
    const q = searchQuery.toLowerCase();
    return teachers.filter(
      (t) =>
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.email && t.email.toLowerCase().includes(q)) ||
        (t.subject && t.subject.toLowerCase().includes(q))
    );
  }, [teachers, searchQuery]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setModalLoading(true);
      setModalError("");

      await createTeacher({
        ...formData,
        salary: Number(formData.salary),
      });

      setIsCreateOpen(false);
      setFormData(initialForm);
      setSuccessMsg("Teacher added successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchTeacherList();
    } catch (err) {
      console.log("CREATE TEACHER ERROR:", err);
      setModalError(
        err.response?.data?.message ||
        err.message ||
        "Failed to create teacher"
      );
    } finally {
      setModalLoading(false);
    }
  };

  const openEditModal = (t) => {
    setActiveTeacher(t);
    setFormData({
      name: t.name || "",
      email: t.email || "",
      phone: t.phone || "",
      subject: t.subject || "Mathematics",
      experience: t.experience || "3",
      salary: t.salary || "45000",
    });
    setModalError("");
    setIsEditOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!activeTeacher?._id) return;

    try {
      setModalLoading(true);
      setModalError("");

      await updateTeacher(activeTeacher._id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        experience: formData.experience,
        salary: Number(formData.salary),
      });

      setIsEditOpen(false);
      setSuccessMsg("Teacher updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchTeacherList();
    } catch (err) {
      console.log("UPDATE TEACHER ERROR:", err);
      setModalError(
        err.response?.data?.message ||
        err.message ||
        "Failed to update teacher"
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activeTeacher?._id) return;
    try {
      setModalLoading(true);
      await deleteTeacher(activeTeacher._id);
      setIsDeleteOpen(false);
      setSuccessMsg(`Teacher "${activeTeacher.name}" deleted.`);
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchTeacherList();
    } catch (err) {
      console.log("DELETE TEACHER ERROR:", err);
      alert(err.response?.data?.message || "Failed to delete teacher");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <GraduationCap className="text-emerald-600" size={26} />
            <span>Faculty & Teachers</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage instructors, subjects, salaries, and faculty records
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
          <span>Add New Teacher</span>
        </button>
      </div>

      {successMsg && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2">
          <Check size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teacher by name, email, or subject..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredTeachers.length} instructors
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-rose-800">Error Loading Teachers</h3>
          <p className="text-xs sm:text-sm text-rose-600 mt-1 mb-4">{error}</p>
          <button
            onClick={fetchTeacherList}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-rose-700 transition"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredTeachers.length === 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">No Teachers Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Click "Add New Teacher" to register faculty members.
          </p>
        </div>
      )}

      {/* Teacher Cards & Table */}
      {!loading && !error && filteredTeachers.length > 0 && (
        <>
          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {filteredTeachers.map((t) => (
              <div key={t._id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{t.name}</h4>
                    <p className="text-xs text-slate-500 break-all">{t.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                    {t.subject || "Academics"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>{t.phone || "No phone"}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => {
                        setActiveTeacher(t);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Instructor</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Experience</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 pl-6">
                      <p className="font-bold text-slate-800">{t.name}</p>
                      <p className="text-xs text-slate-400 break-all">{t.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700">
                        {t.subject || "Academics"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{t.phone || "-"}</td>
                    <td className="p-4 text-slate-600">{t.experience ? `${t.experience} Yrs` : "3 Yrs"}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setActiveTeacher(t);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                          title="Delete"
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

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">Add New Teacher</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Robert Vance"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="robert@school.edu"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Mathematics"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Experience (Yrs)</label>
                  <input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="5"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm disabled:opacity-60"
                >
                  {modalLoading ? "Saving..." : "Save Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">Update Teacher</h3>
              <button onClick={() => setIsEditOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm disabled:opacity-60 flex items-center gap-1.5"
                >
                  <Save size={15} />
                  <span>{modalLoading ? "Saving..." : "Update Teacher"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteOpen && activeTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800">Delete Teacher?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to remove <span className="font-bold text-slate-800">{activeTeacher.name}</span>?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={modalLoading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm disabled:opacity-60"
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

export default AdminTeachers;
