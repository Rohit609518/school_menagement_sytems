import { useEffect, useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  PlusCircle,
  Calendar,
  User,
  Trash2,
  Edit3,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Clock,
} from "lucide-react";
import TeacherLayout from "../../layouts/TeacherLayout";
import {
  getAllHomework,
  createHomework,
  updateHomework,
  deleteHomework,
} from "../../services/homeworkService";
import { getStudents } from "../../services/adminService";
import { getMyTeacherProfile } from "../../services/teacherService";

function TeacherHomework() {
  const [homeworkList, setHomeworkList] = useState([]);
  const [students, setStudents] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    student: "",
    subject: "",
    title: "",
    description: "",
    dueDate: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [hwRes, studRes, profRes] = await Promise.allSettled([
        getAllHomework(),
        getStudents(),
        getMyTeacherProfile(),
      ]);

      if (hwRes.status === "fulfilled" && hwRes.value) {
        setHomeworkList(hwRes.value.homework || []);
      }

      if (studRes.status === "fulfilled" && studRes.value) {
        const sList = studRes.value.students || [];
        setStudents(sList);
        if (sList.length > 0 && !formData.student) {
          setFormData((prev) => ({ ...prev, student: sList[0]._id }));
        }
      }

      if (profRes.status === "fulfilled" && profRes.value) {
        const t = profRes.value.teacher;
        setTeacher(t);
        if (t?.subject && !formData.subject) {
          setFormData((prev) => ({ ...prev, subject: t.subject }));
        }
      }
    } catch (err) {
      console.error("TEACHER HOMEWORK FETCH ERROR:", err);
      setError("Failed to load homework records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      student: "ALL",
      subject: teacher?.subject || "Mathematics",
      title: "",
      description: "",
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (hw) => {
    setEditingId(hw._id);
    setFormData({
      student: hw.student?._id || "",
      subject: hw.subject || "",
      title: hw.title || "",
      description: hw.description || "",
      dueDate: hw.duedate ? new Date(hw.duedate).toISOString().split("T")[0] : "",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student || !formData.title || !formData.description) {
      setModalError("Please complete all required fields");
      return;
    }

    try {
      setModalLoading(true);
      setModalError("");

      const payload = {
        ...formData,
        teacher: teacher?._id,
      };

      if (editingId) {
        await updateHomework(editingId, payload);
        setSuccessMsg("Homework assignment updated successfully!");
      } else {
        const res = await createHomework(payload);
        if (formData.student === "ALL") {
          setSuccessMsg(res?.message || `Homework successfully broadcasted to all ${students.length} students!`);
        } else {
          setSuccessMsg("Homework assignment created successfully!");
        }
      }

      setIsModalOpen(false);
      await fetchData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setModalError(
        err.response?.data?.message || err.message || "Failed to save homework"
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this homework?")) return;

    try {
      await deleteHomework(id);
      setHomeworkList((prev) => prev.filter((h) => h._id !== id));
      setSuccessMsg("Homework deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete homework");
      setTimeout(() => setError(""), 4000);
    }
  };

  const filteredHomework = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return homeworkList;
    return homeworkList.filter(
      (h) =>
        (h.title || "").toLowerCase().includes(q) ||
        (h.subject || "").toLowerCase().includes(q) ||
        (h.student?.name || "").toLowerCase().includes(q)
    );
  }, [homeworkList, searchQuery]);

  return (
    <TeacherLayout
      title="Homework Management"
      subtitle="Assign, modify, and track curriculum coursework"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <BookOpen className="text-emerald-600" size={26} />
            <span>Class Homework Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create coursework assignments, set submission due dates, and monitor student academic tasks
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/25 self-start sm:self-center"
        >
          <PlusCircle size={17} />
          <span>Assign Homework</span>
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

      {/* Directory Table Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h2 className="text-base font-bold text-slate-800">
            Active Assignments ({filteredHomework.length})
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
              placeholder="Search homework or student..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Title & Details</th>
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-3">Assigned Student</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredHomework.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No homework assignments found. Click "Assign Homework" to add coursework.
                  </td>
                </tr>
              ) : (
                filteredHomework.map((hw) => (
                  <tr key={hw._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-800">{hw.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-xs">
                        {hw.description}
                      </p>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-700">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px]">
                        {hw.subject}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-800">
                        {hw.student?.name || "All Class"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Class {hw.student?.studentclass || "10th"}
                      </p>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-amber-500" />
                        <span>
                          {hw.duedate
                            ? new Date(hw.duedate).toLocaleDateString()
                            : "No due date"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(hw)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                          title="Edit Homework"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(hw._id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                          title="Delete Homework"
                        >
                          <Trash2 size={15} />
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

      {/* Modal: Create or Edit Homework */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BookOpen size={20} className="text-emerald-600" />
                <span>{editingId ? "Update Homework" : "Assign Homework"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Target Student *
                  </label>
                  {!editingId && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          student: formData.student === "ALL" ? (students[0]?._id || "") : "ALL",
                        })
                      }
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                        formData.student === "ALL"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      <span>{formData.student === "ALL" ? "✓ All Selected" : "📢 Select All Students"}</span>
                    </button>
                  )}
                </div>

                <select
                  required
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  className={`w-full px-3.5 py-2.5 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium ${
                    formData.student === "ALL"
                      ? "bg-emerald-50/80 border-emerald-300 text-emerald-900 font-bold"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  {!editingId && (
                    <option value="ALL" className="font-bold text-emerald-800 bg-emerald-50">
                      📢 ALL STUDENTS ({students.length} Enrolled) — Broadcast to Whole Class
                    </option>
                  )}
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} (Class {s.studentclass || "10th"})
                    </option>
                  ))}
                </select>

                {formData.student === "ALL" && (
                  <p className="mt-1 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <span>✨ This homework will be sent to all {students.length} students at once.</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics, Science"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Homework Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trigonometry Exercise 3.2"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description & Instructions *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Solve questions 1 through 15 and submit solution sheet..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Submission Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 disabled:opacity-50"
                >
                  {modalLoading ? "Saving..." : editingId ? "Save Changes" : "Assign Homework"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}

export default TeacherHomework;
