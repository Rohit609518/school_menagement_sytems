import { useEffect, useState, useMemo } from "react";
import {
  FileText,
  TrendingUp,
  Award,
  Calendar,
  AlertCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import StudentLayout from "../../layouts/StudentLayout";
import { getMyStudentProfile } from "../../services/studentservice";
import { getMyExams } from "../../services/examService";

function Exams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError("");

      const profile = await getMyStudentProfile();
      const studentId = profile?.student?._id;

      if (!studentId) {
        throw new Error("Student profile could not be identified");
      }

      const data = await getMyExams(studentId);
      setExams(data.exams || data.exam || []);
    } catch (err) {
      console.log("EXAMS ERROR:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load exams"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // Compute metrics
  const stats = useMemo(() => {
    if (exams.length === 0) {
      return { total: 0, average: 0, highest: 0 };
    }

    let totalPct = 0;
    let maxPct = 0;

    exams.forEach((e) => {
      const total = e.totalsmark ?? e.totalMarks ?? 100;
      const obtained = e.obtainedMarks ?? 0;
      const pct = e.percentage ?? (total > 0 ? (obtained / total) * 100 : 0);
      totalPct += pct;
      if (pct > maxPct) maxPct = pct;
    });

    return {
      total: exams.length,
      average: Math.round(totalPct / exams.length),
      highest: Math.round(maxPct),
    };
  }, [exams]);

  // Filtered exams
  const filteredExams = useMemo(() => {
    if (!searchQuery) return exams;
    const q = searchQuery.toLowerCase();
    return exams.filter(
      (e) =>
        (e.subject && e.subject.toLowerCase().includes(q)) ||
        ((e.examname || e.examName) && (e.examname || e.examName).toLowerCase().includes(q))
    );
  }, [exams, searchQuery]);

  return (
    <StudentLayout
      title="Examinations & Marks"
      subtitle="View your exam schedules, marks obtained, and percentages"
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Tests
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-800">
              {loading ? "--" : stats.total}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Exams recorded</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average Score
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {loading ? "--" : `${stats.average}%`}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Overall percentage</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs col-span-2 lg:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Top Score
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Award size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {loading ? "--" : `${stats.highest}%`}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">Highest score achieved</p>
          </div>
        </div>
      </div>

      {/* Search Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exam or subject..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredExams.length} tests
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error View */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-rose-800">
            Error Loading Exams
          </h3>
          <p className="text-xs sm:text-sm text-rose-600 mt-1 mb-4">
            {error}
          </p>
          <button
            onClick={fetchExams}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-rose-700 transition"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty View */}
      {!loading && !error && filteredExams.length === 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            No Exam Records Found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            {searchQuery
              ? "No exams match your search query."
              : "No exam records have been posted yet."}
          </p>
        </div>
      )}

      {/* Exam Records View */}
      {!loading && !error && filteredExams.length > 0 && (
        <>
          {/* Mobile Card List */}
          <div className="space-y-3 md:hidden">
            {filteredExams.map((exam) => {
              const total = exam.totalsmark ?? exam.totalMarks ?? 100;
              const obtained = exam.obtainedMarks ?? 0;
              const percentage =
                exam.percentage ?? (total > 0 ? Number(((obtained / total) * 100).toFixed(1)) : 0);
              const examName = exam.examname || exam.examName || "Term Exam";

              return (
                <div
                  key={exam._id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md uppercase">
                        {exam.subject || "Subject"}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 mt-1.5">
                        {examName}
                      </h4>
                    </div>

                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                        percentage >= 75
                          ? "bg-emerald-100 text-emerald-700"
                          : percentage >= 50
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Score</span>
                      <span className="font-semibold text-slate-800">
                        {obtained} / {total} Marks
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentage >= 75
                            ? "bg-emerald-500"
                            : percentage >= 50
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {exam.examDate && (
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Calendar size={12} />
                      <span>
                        Date: {new Date(exam.examDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Exam Title</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Marks Obtained</th>
                  <th className="p-4">Percentage</th>
                  <th className="p-4 pr-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredExams.map((exam) => {
                  const total = exam.totalsmark ?? exam.totalMarks ?? 100;
                  const obtained = exam.obtainedMarks ?? 0;
                  const percentage =
                    exam.percentage ?? (total > 0 ? Number(((obtained / total) * 100).toFixed(1)) : 0);
                  const examName = exam.examname || exam.examName || "Term Exam";

                  return (
                    <tr key={exam._id} className="hover:bg-slate-50/60 transition">
                      <td className="p-4 pl-6 font-semibold text-slate-800">
                        {examName}
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {exam.subject}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800">{obtained}</span>
                        <span className="text-slate-400 text-xs"> / {total}</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            percentage >= 75
                              ? "bg-emerald-100 text-emerald-700"
                              : percentage >= 50
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {percentage}%
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-xs text-slate-500">
                        {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : "-"}
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

export default Exams;