import { useEffect, useState, useMemo } from "react";
import {
  Trophy,
  Award,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import StudentLayout from "../../layouts/StudentLayout";
import { getMyStudentProfile } from "../../services/studentservice";
import { getMyResults } from "../../services/resultService";

function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("All");

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");

      const profile = await getMyStudentProfile();
      const studentId = profile?.student?._id;

      if (!studentId) {
        throw new Error("Student profile could not be identified");
      }

      const data = await getMyResults(studentId);
      setResults(data.results || data.result || []);
    } catch (err) {
      console.log("RESULT ERROR:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load academic results"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Compute metrics
  const stats = useMemo(() => {
    if (results.length === 0) {
      return { totalSubjects: 0, overallPercentage: 0, topGrade: "N/A" };
    }

    let totalScore = 0;
    let totalMax = 0;

    results.forEach((r) => {
      const max = r.totalmarks || r.totalsmark || 100;
      const obt = r.obtainedMarks || 0;
      totalScore += obt;
      totalMax += max;
    });

    const overallPct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

    let grade = "C";
    if (overallPct >= 90) grade = "+A";
    else if (overallPct >= 80) grade = "A";
    else if (overallPct >= 70) grade = "B+";
    else if (overallPct >= 60) grade = "B";

    return {
      totalSubjects: results.length,
      overallPercentage: overallPct,
      topGrade: grade,
    };
  }, [results]);

  // Unique semesters
  const semesters = useMemo(() => {
    const set = new Set();
    results.forEach((r) => {
      if (r.Semester) set.add(r.Semester);
    });
    return ["All", ...Array.from(set)];
  }, [results]);

  const filteredResults = useMemo(() => {
    if (selectedSemester === "All") return results;
    return results.filter((r) => r.Semester === selectedSemester);
  }, [results, selectedSemester]);

  // Letter Grade color helper
  const getGradeBadge = (grade = "", pct = 0) => {
    const g = grade.toUpperCase();
    if (g.includes("A") || pct >= 80)
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (g.includes("B") || pct >= 65)
      return "bg-blue-100 text-blue-800 border-blue-200";
    if (g.includes("C") || pct >= 50)
      return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-rose-100 text-rose-800 border-rose-200";
  };

  return (
    <StudentLayout
      title="Academic Results"
      subtitle="View your semester report cards, subject scores, and grades"
    >
      {/* GPA & Performance Hero Card */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-purple-600/15 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <Trophy size={32} />
            </div>

            <div>
              <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
                Overall Standing
              </span>
              <h2 className="text-xl sm:text-2xl font-black mt-0.5">
                Grade {stats.topGrade} • {stats.overallPercentage}%
              </h2>
              <p className="text-xs text-purple-100/90 mt-1">
                Calculated across {stats.totalSubjects} recorded academic modules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-purple-200 block uppercase">Status</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-300 flex items-center gap-1">
                <Sparkles size={13} />
                Passed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Semester Filter Tabs */}
      {semesters.length > 1 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs mb-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Semester:
          </span>
          {semesters.map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                selectedSemester === sem
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {sem === "All" ? "All Semesters" : `Semester ${sem}`}
            </button>
          ))}
        </div>
      )}

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
            Error Loading Results
          </h3>
          <p className="text-xs sm:text-sm text-rose-600 mt-1 mb-4">
            {error}
          </p>
          <button
            onClick={fetchResults}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-rose-700 transition"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty View */}
      {!loading && !error && filteredResults.length === 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            No Results Found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            Report cards or examination results have not been published yet.
          </p>
        </div>
      )}

      {/* Results View */}
      {!loading && !error && filteredResults.length > 0 && (
        <>
          {/* Mobile Card List */}
          <div className="space-y-3 md:hidden">
            {filteredResults.map((result) => {
              const total = result.totalmarks || result.totalsmark || 100;
              const obtained = result.obtainedMarks || 0;
              const percentage =
                result.percentage !== undefined
                  ? result.percentage
                  : total > 0
                  ? Number(((obtained / total) * 100).toFixed(1))
                  : 0;

              let grade = result.grade;
              if (!grade) {
                if (percentage >= 90) grade = "+A";
                else if (percentage >= 80) grade = "A";
                else if (percentage >= 70) grade = "B+";
                else if (percentage >= 60) grade = "B";
                else if (percentage >= 50) grade = "C";
                else grade = "D";
              }

              return (
                <div
                  key={result._id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {result.Semester && (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md uppercase">
                          Semester {result.Semester}
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-slate-800 mt-1">
                        {result.Subject || result.subject || "Subject"}
                      </h4>
                    </div>

                    <span
                      className={`text-xs font-extrabold px-2.5 py-1 rounded-full border ${getGradeBadge(
                        grade,
                        percentage
                      )}`}
                    >
                      Grade {grade}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Score</span>
                      <span className="font-semibold text-slate-800">
                        {obtained} / {total} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Semester</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Marks Obtained</th>
                  <th className="p-4">Percentage</th>
                  <th className="p-4 pr-6">Letter Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredResults.map((result) => {
                  const total = result.totalmarks || result.totalsmark || 100;
                  const obtained = result.obtainedMarks || 0;
                  const percentage =
                    result.percentage !== undefined
                      ? result.percentage
                      : total > 0
                      ? Number(((obtained / total) * 100).toFixed(1))
                      : 0;

                  let grade = result.grade;
                  if (!grade) {
                    if (percentage >= 90) grade = "+A";
                    else if (percentage >= 80) grade = "A";
                    else if (percentage >= 70) grade = "B+";
                    else if (percentage >= 60) grade = "B";
                    else if (percentage >= 50) grade = "C";
                    else grade = "D";
                  }

                  return (
                    <tr key={result._id} className="hover:bg-slate-50/60 transition">
                      <td className="p-4 pl-6 font-semibold text-slate-800">
                        {result.Semester ? `Semester ${result.Semester}` : "-"}
                      </td>
                      <td className="p-4 text-slate-700 font-medium">
                        {result.Subject || result.subject || "N/A"}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800">{obtained}</span>
                        <span className="text-slate-400 text-xs"> / {total}</span>
                      </td>
                      <td className="p-4 font-semibold text-indigo-600">
                        {percentage}%
                      </td>
                      <td className="p-4 pr-6">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getGradeBadge(
                            grade,
                            percentage
                          )}`}
                        >
                          Grade {grade}
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
    </StudentLayout>
  );
}

export default Results;