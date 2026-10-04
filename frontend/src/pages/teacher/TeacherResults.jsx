import { useEffect, useState, useMemo } from "react";
import {
  Trophy,
  PlusCircle,
  Search,
  Award,
  AlertCircle,
  RefreshCw,
  X,
  Check,
  TrendingUp,
} from "lucide-react";
import TeacherLayout from "../../layouts/TeacherLayout";
import { getStudents } from "../../services/adminService";
import { getMyTeacherProfile } from "../../services/teacherService";
import { createResult } from "../../services/resultService";
import api from "../../services/api";

function TeacherResults() {
  const [resultsList, setResultsList] = useState([]);
  const [students, setStudents] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const initialForm = {
    student: "",
    Semester: "1",
    Subject: "Mathematics",
    totalmarks: 100,
    obtainedMarks: "",
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [studRes, profRes] = await Promise.allSettled([
        getStudents(),
        getMyTeacherProfile(),
      ]);

      let sList = [];
      if (studRes.status === "fulfilled" && studRes.value) {
        sList = studRes.value.students || [];
        setStudents(sList);
        if (sList.length > 0 && !formData.student) {
          setFormData((prev) => ({ ...prev, student: sList[0]._id }));
        }
      }

      if (profRes.status === "fulfilled" && profRes.value) {
        const t = profRes.value.teacher;
        setTeacher(t);
        if (t?.subject) {
          setFormData((prev) => ({ ...prev, Subject: t.subject }));
        }
      }

      // Fetch results for the students
      if (sList.length > 0) {
        try {
          const resArr = await Promise.all(
            sList.slice(0, 10).map((s) => api.get(`/result/student/${s._id}`).catch(() => null))
          );
          const allRes = [];
          resArr.forEach((r) => {
            if (r?.data?.results) allRes.push(...r.data.results);
            else if (r?.data?.result) allRes.push(...r.data.result);
          });
          setResultsList(allRes);
        } catch (e) {
          console.log("RESULTS FETCH SILENT ERROR:", e);
        }
      }
    } catch (err) {
      console.log("FETCH RESULTS ERROR:", err);
      setError("Failed to load results information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateResult = async (e) => {
    e.preventDefault();
    if (!formData.student) {
      setModalError("Please select a student.");
      return;
    }
    if (Number(formData.obtainedMarks) > Number(formData.totalmarks)) {
      setModalError("Obtained marks cannot be greater than total marks.");
      return;
    }

    try {
      setModalLoading(true);
      setModalError("");

      await createResult({
        student: formData.student,
        Semester: formData.Semester,
        Subject: formData.Subject,
        totalmarks: Number(formData.totalmarks),
        obtainedMarks: Number(formData.obtainedMarks),
      });

      setIsModalOpen(false);
      setFormData({
        ...initialForm,
        student: students[0]?._id || "",
        Subject: teacher?.subject || "Mathematics",
      });
      setSuccessMsg("Student result recorded successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchData();
    } catch (err) {
      console.log("CREATE RESULT ERROR:", err);
      setModalError(
        err.response?.data?.message ||
        err.message ||
        "Failed to record student result"
      );
    } finally {
      setModalLoading(false);
    }
  };

  const filteredResults = useMemo(() => {
    if (!searchQuery) return resultsList;
    const q = searchQuery.toLowerCase();
    return resultsList.filter(
      (r) =>
        (r.Subject && r.Subject.toLowerCase().includes(q)) ||
        (r.student?.name && r.student.name.toLowerCase().includes(q))
    );
  }, [resultsList, searchQuery]);

  return (
    <TeacherLayout
      title="Student Results & Grading"
      subtitle="Publish exam results, letter grades, and semester marks"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Trophy className="text-emerald-600" size={26} />
            <span>Academic Results Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enter examination marks and publish report cards
          </p>
        </div>

        <button
          onClick={() => {
            setModalError("");
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/25 self-start sm:self-center"
        >
          <PlusCircle size={17} />
          <span>Enter Student Result</span>
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
            placeholder="Search by student name or subject..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredResults.length} marks entries
        </span>
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
          <h3 className="text-base font-bold text-rose-800">Error Loading Results</h3>
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
      {!loading && !error && filteredResults.length === 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">No Student Results Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Click "Enter Student Result" to publish semester marks.
          </p>
        </div>
      )}

      {/* Results Display */}
      {!loading && !error && filteredResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResults.map((r) => {
            const tot = r.totalmarks || r.totalsmark || 100;
            const obt = r.obtainedMarks || 0;
            const pct = r.percentage ?? (tot > 0 ? Number(((obt / tot) * 100).toFixed(1)) : 0);

            let grade = r.grade;
            if (!grade) {
              if (pct >= 90) grade = "+A";
              else if (pct >= 80) grade = "A";
              else if (pct >= 70) grade = "B+";
              else if (pct >= 60) grade = "B";
              else grade = "C";
            }

            return (
              <div key={r._id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md uppercase">
                      Semester {r.Semester || "1"} • {r.Subject || "Subject"}
                    </span>
                    <h4 className="text-base font-bold text-slate-800 mt-1">
                      {r.student?.name || "Student"}
                    </h4>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Grade {grade}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Score Progress</span>
                    <span className="font-bold text-slate-800">
                      {obt} / {tot} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE RESULT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">Enter Student Result</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateResult} className="space-y-3.5 text-xs sm:text-sm">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.Semester}
                    onChange={(e) => setFormData({ ...formData, Semester: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={formData.Subject}
                    onChange={(e) => setFormData({ ...formData, Subject: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    min="10"
                    value={formData.totalmarks}
                    onChange={(e) => setFormData({ ...formData, totalmarks: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Obtained Marks</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.obtainedMarks}
                    onChange={(e) => setFormData({ ...formData, obtainedMarks: e.target.value })}
                    placeholder="e.g. 85"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
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
                  {modalLoading ? "Saving..." : "Save Result"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}

export default TeacherResults;
