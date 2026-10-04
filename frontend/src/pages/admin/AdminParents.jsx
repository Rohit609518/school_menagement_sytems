import { useEffect, useState, useMemo } from "react";
import {
  UserRound,
  Search,
  PlusCircle,
  Trash2,
  AlertCircle,
  RefreshCw,
  X,
  Check,
  Phone,
  GraduationCap,
  Mail,
  Link as LinkIcon,
  Edit2,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getStudents,
  getParents,
  createParent,
  updateParent,
  deleteParent,
  assignStudentToParent,
} from "../../services/adminService";

function AdminParents() {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [assignStudentId, setAssignStudentId] = useState("");

  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    student: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [parentsRes, studentsRes] = await Promise.allSettled([
        getParents(),
        getStudents(),
      ]);

      if (parentsRes.status === "fulfilled" && parentsRes.value) {
        setParents(parentsRes.value.parents || []);
      }

      if (studentsRes.status === "fulfilled" && studentsRes.value) {
        const sList = studentsRes.value.students || [];
        setStudents(sList);
        if (sList.length > 0) {
          setFormData((prev) => ({ ...prev, student: sList[0]._id }));
        }
      }
    } catch (err) {
      console.error("FETCH PARENTS DATA ERROR:", err);
      setError("Failed to load parents or students directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.student) {
      setModalError("Please select an enrolled student to link to this parent.");
      return;
    }

    try {
      setModalLoading(true);
      setModalError("");

      const res = await createParent(formData);
      if (res.parent) {
        setParents((prev) => [res.parent, ...prev]);
      } else {
        await fetchData();
      }

      setIsCreateOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        student: students[0]?._id || "",
      });
      setSuccessMsg("Parent account created and child linked successfully!");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setModalError(
        err.response?.data?.message ||
        err.message ||
        "Failed to register parent"
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    if (!selectedParent || !assignStudentId) return;

    try {
      setModalLoading(true);
      setModalError("");

      const res = await assignStudentToParent(selectedParent._id, assignStudentId);
      setParents((prev) =>
        prev.map((p) => (p._id === selectedParent._id ? res.parent || p : p))
      );

      setIsAssignOpen(false);
      setSelectedParent(null);
      setSuccessMsg("Student relationship updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to assign student");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (parentId) => {
    if (!window.confirm("Are you sure you want to delete this parent account?")) return;

    try {
      await deleteParent(parentId);
      setParents((prev) => prev.filter((p) => p._id !== parentId));
      setSuccessMsg("Parent record deleted successfully");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete parent");
      setTimeout(() => setError(""), 4000);
    }
  };

  const filteredParents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return parents;
    return parents.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.phone || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q) ||
        (p.student?.name || "").toLowerCase().includes(q)
    );
  }, [parents, searchQuery]);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <UserRound className="text-amber-600" size={26} />
            <span>Parent & Guardian Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Register parent portals, manage credentials, and assign parent-student linkages
          </p>
        </div>

        <button
          onClick={() => {
            setModalError("");
            setIsCreateOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md shadow-amber-600/25 self-start sm:self-center"
        >
          <PlusCircle size={17} />
          <span>Register New Parent</span>
        </button>
      </div>

      {successMsg && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2">
          <Check size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Parents
          </span>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {parents.length}
          </p>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">
            Registered guardian accounts
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Enrolled Students
          </span>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {students.length}
          </p>
          <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
            Available for parent linkage
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Linked Ratio
          </span>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {parents.filter((p) => p.student).length} / {parents.length}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            Active child assignments
          </p>
        </div>
      </div>

      {/* Search & Directory Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h2 className="text-base font-bold text-slate-800">
            Registered Guardians ({filteredParents.length})
          </h2>

          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parent or child name..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Parent Name</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Linked Child</th>
                <th className="py-3 px-3">Child Class</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredParents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No parent accounts found. Click "Register New Parent" to create one.
                  </td>
                </tr>
              ) : (
                filteredParents.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-800">{p.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {p.email || p.user?.email || "No email login"}
                      </p>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 font-mono">
                      {p.phone}
                    </td>

                    <td className="py-3.5 px-3">
                      {p.student ? (
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <GraduationCap size={15} className="text-indigo-600 shrink-0" />
                          <span>{p.student.name}</span>
                        </div>
                      ) : (
                        <span className="text-rose-500 font-semibold text-[11px]">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-slate-500">
                      {p.student ? `Class ${p.student.studentclass || "10th"}` : "—"}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedParent(p);
                            setAssignStudentId(p.student?._id || students[0]?._id || "");
                            setIsAssignOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] flex items-center gap-1 transition"
                          title="Assign Student"
                        >
                          <LinkIcon size={12} />
                          <span>Link Student</span>
                        </button>

                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                          title="Delete Parent"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register Parent */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <UserRound size={20} className="text-amber-600" />
                <span>Register Parent Portal</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Parent / Guardian Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert Johnson"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Address (For Portal Login) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="parent@school.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Login Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters (e.g. Parent@123)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 987-6543"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Link Enrolled Child *
                </label>
                <select
                  required
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-medium"
                >
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} (Class {s.studentclass || "10th"}) - {s.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/25 disabled:opacity-50"
                >
                  {modalLoading ? "Creating..." : "Create Parent Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Link / Re-assign Student */}
      {isAssignOpen && selectedParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <LinkIcon size={18} className="text-indigo-600" />
                <span>Assign Student to Parent</span>
              </h3>
              <button
                onClick={() => setIsAssignOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Assign or update the enrolled student linked to{" "}
              <strong className="text-slate-800">{selectedParent.name}</strong>.
            </p>

            <form onSubmit={handleAssignStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Student
                </label>
                <select
                  value={assignStudentId}
                  onChange={(e) => setAssignStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} (Class {s.studentclass || "10th"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  {modalLoading ? "Saving..." : "Save Linkage"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminParents;
