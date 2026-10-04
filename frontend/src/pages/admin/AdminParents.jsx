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
  ShieldAlert,
} from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getStudents,
  createParent,
  deleteParent,
} from "../../services/adminService";

function AdminParents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    student: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getStudents();
      const sList = data.students || [];
      setStudents(sList);
      if (sList.length > 0) {
        setFormData((prev) => ({ ...prev, student: sList[0]._id }));
      }
    } catch (err) {
      console.log("FETCH PARENTS DATA ERROR:", err);
      setError("Failed to load students for parent registration");
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
      setModalError("Please select a student to link to this parent.");
      return;
    }

    try {
      setModalLoading(true);
      setModalError("");

      await createParent(formData);

      setIsCreateOpen(false);
      setFormData({
        name: "",
        phone: "",
        student: students[0]?._id || "",
      });
      setSuccessMsg("Parent registered successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.log("CREATE PARENT ERROR:", err);
      setModalError(
        err.response?.data?.message ||
        err.message ||
        "Failed to register parent"
      );
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <UserRound className="text-amber-600" size={26} />
            <span>Parent Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Register guardians and link parent accounts to enrolled students
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
          <span>Register Parent</span>
        </button>
      </div>

      {successMsg && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2">
          <Check size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Available Students
          </span>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {students.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Eligible for parent link
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Parent Support
          </span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            Active
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Meetings & grade tracking enabled
          </p>
        </div>
      </div>

      {/* Eligible Students List */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-800 mb-2">
          Registered Students & Guardians
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Students currently registered in the database ready for guardian assignment
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] border-b border-slate-100">
              <tr>
                <th className="p-3 pl-4">Student</th>
                <th className="p-3">Class</th>
                <th className="p-3">Email</th>
                <th className="p-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((st) => (
                <tr key={st._id} className="hover:bg-slate-50/60 transition">
                  <td className="p-3 pl-4 font-bold text-slate-800">{st.name}</td>
                  <td className="p-3 text-slate-600">Class {st.studentclass || "10th"}</td>
                  <td className="p-3 text-slate-500 break-all">{st.email}</td>
                  <td className="p-3 pr-4 text-right">
                    <button
                      onClick={() => {
                        setFormData({
                          name: `Parent of ${st.name}`,
                          phone: "+91 9876543210",
                          student: st._id,
                        });
                        setIsCreateOpen(true);
                      }}
                      className="text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg transition"
                    >
                      Assign Guardian
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PARENT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                Register Parent
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
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
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Martha Wayne"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Child (Student)
                </label>
                <select
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  {students.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name} ({st.studentclass || "10th"}) - {st.email}
                    </option>
                  ))}
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
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-sm disabled:opacity-60"
                >
                  {modalLoading ? "Saving..." : "Register Parent"}
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
