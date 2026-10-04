import { useEffect, useState, useMemo } from "react";
import {
  FileText,
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
  Award,
} from "lucide-react";
import TeacherLayout from "../../layouts/TeacherLayout";
import {
  getAllExams,
  createExam,
  updateExam,
  deleteExam,
} from "../../services/examService";
import { getStudents } from "../../services/adminService";
import { getMyTeacherProfile } from "../../services/teacherService";

function TeacherExams() {
  const [exams, setExams] = useState([]);
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
    examname: "",
    totalsmark: 100,
    obtainedMarks: 0,
    examDate: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [examsRes, studRes, profRes] = await Promise.allSettled([
        getAllExams(),
        getStudents(),
        getMyTeacherProfile(),
      ]);

      if (examsRes.status === "fulfilled" && examsRes.value) {
        setExams(examsRes.value.exams || []);
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
      console.error("TEACHER EXAMS FETCH ERROR:", err);
      setError("Failed to load examination records");
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
      student: students[0]?._id || "",
      subject: teacher?.subject || "Mathematics",
      examname: "Mid-Term Assessment",
      totalsmark: 100,
      obtainedMarks: 75,
      examDate: new Date().toISOString().split("T")[0],
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (ex) => {
    setEditingId(ex._id);
    setFormData({
      student: ex.student?._id || "",
      subject: ex.subject || "",
      examname: ex.examname || "",
      totalsmark: ex.totalsmark || 100,
      obtainedMarks: ex.obtainedMarks || 0,
      examDate: ex.examDate ? new Date(ex.examDate).toISOString().split("T")[0] : "",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(formData.obtainedMarks) > Number(formData.totalsmark)) {
      setModalError("Obtained marks cannot exceed total marks");
      return;
    }

    try {
      setModalLoading(true);
      setModalError("");

      if (editingId) {
        await updateExam(editingId, formData);
        setSuccessMsg("Examination score updated successfully!");
      } else {
        await createExam(formData);
        setSuccessMsg("Examination record logged successfully!");
      }

      setIsModalOpen(false);
      await fetchData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setModalError(
        err.response?.data?.message || err.message || "Failed to record exam"
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam record?")) return;

    try {
      await deleteExam(id);
      setExams((prev) => prev.filter((e) => e._id !== id));
      setSuccessMsg("Exam record deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete exam");
      setTimeout(() => setError(""), 4000);
    }
  };

  const filteredExams = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return exams;
    return exams.filter(
      (e) =>
        (e.examname || "").toLowerCase().includes(q) ||
        (e.subject || "").toLowerCase().includes(q) ||
        (e.student?.name || "").toLowerCase().includes(q)
    );
  }, [exams, searchQuery]);

  return (
    <TeacherLayout
      title="Examination & Test Management"
      subtitle="Schedule tests, record evaluation marks, and view class scorecards"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="text-emerald-600" size={26} />
            <span>Examinations Roster</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Conduct academic evaluations, log scores, and analyze student test percentages
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/25 self-start sm:self-center"
        >
          <PlusCircle size={17} />
          <span>Record New Test</span>
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
            Recorded Tests ({filteredExams.length})
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
              placeholder="Search test, subject, student..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Exam Name</th>
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-3">Student</th>
                <th className="py-3 px-3">Score & Percentage</th>
                <th className="py-3 px-3">Exam Date</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No examination records found. Click "Record New Test" to log student exam marks.
                  </td>
                </tr>
              ) : (
                filteredExams.map((ex) => {
                  const pct = ex.percentage || (ex.totalsmark ? Math.round((ex.obtainedMarks / ex.totalsmark) * 100) : 0);
                  return (
                    <tr key={ex._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-800">{ex.examname}</p>
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-slate-700">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px]">
                          {ex.subject}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <p className="font-semibold text-slate-800">
                          {ex.student?.name || "Student"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Class {ex.student?.studentclass || "10th"}
                        </p>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">
                            {ex.obtainedMarks} / {ex.totalsmark}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              pct >= 75
                                ? "bg-emerald-100 text-emerald-700"
                                : pct >= 50
                                ? "bg-amber-100 text-amber-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {pct}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        {ex.examDate ? new Date(ex.examDate).toLocaleDateString() : "—"}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(ex)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                            title="Edit Exam"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(ex._id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                            title="Delete Exam"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create or Edit Exam */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileText size={20} className="text-emerald-600" />
                <span>{editingId ? "Update Examination" : "Record New Test"}</span>
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
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Student *
                </label>
                <select
                  required
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} (Class {s.studentclass || "10th"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics, Physics"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Exam / Test Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Exam, Chapter 2 Quiz"
                  value={formData.examname}
                  onChange={(e) => setFormData({ ...formData, examname: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Total Marks *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.totalsmark}
                    onChange={(e) => setFormData({ ...formData, totalsmark: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Obtained Marks *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.obtainedMarks}
                    onChange={(e) => setFormData({ ...formData, obtainedMarks: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Exam Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.examDate}
                  onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
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
                  {modalLoading ? "Saving..." : editingId ? "Save Changes" : "Log Exam Score"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}

export default TeacherExams;
