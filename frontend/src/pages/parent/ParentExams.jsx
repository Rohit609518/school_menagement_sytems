import { useEffect, useState, useMemo } from "react";
import {
  FileText,
  Award,
  Search,
  AlertCircle,
  RefreshCw,
  GraduationCap,
} from "lucide-react";
import ParentLayout from "../../layouts/ParentLayout";
import { getChildExams } from "../../services/examService";
import { getChildResults } from "../../services/resultService";

function ParentExams() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("exams"); // "exams" | "results"
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [examsRes, resultsRes] = await Promise.allSettled([
        getChildExams(),
        getChildResults(),
      ]);

      if (examsRes.status === "fulfilled" && examsRes.value) {
        setExams(examsRes.value.exams || []);
        if (examsRes.value.child) setChild(examsRes.value.child);
      }

      if (resultsRes.status === "fulfilled" && resultsRes.value) {
        setResults(resultsRes.value.results || []);
        if (!child && resultsRes.value.child) setChild(resultsRes.value.child);
      }
    } catch (err) {
      console.error("PARENT EXAMS ERROR:", err);
      setError("Failed to load child's exam or result records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredExams = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return exams;
    return exams.filter(
      (e) =>
        (e.examname || "").toLowerCase().includes(q) ||
        (e.subject || "").toLowerCase().includes(q)
    );
  }, [exams, searchQuery]);

  const filteredResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return results;
    return results.filter(
      (r) =>
        (r.Subject || "").toLowerCase().includes(q) ||
        (r.Semester || "").toLowerCase().includes(q)
    );
  }, [results, searchQuery]);

  return (
    <ParentLayout
      title="Child Exams & Academic Results"
      subtitle={child ? `Viewing scores for ${child.name}` : "Examination monitoring"}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Award className="text-amber-600" size={26} />
            <span>Exams & Academic Scorecards</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review test marks, assessment percentages, and semester letter grades (Read-Only)
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md transition self-start sm:self-center"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Child Summary Pill */}
      {child && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{child.name}</p>
            <p className="text-xs text-slate-500">
              Class {child.studentclass || "10th"} • {child.email}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("exams")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            activeTab === "exams"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/25"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <FileText size={16} />
          <span>Tests & Exams ({exams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("results")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            activeTab === "results"
              ? "bg-amber-600 text-white shadow-md shadow-amber-600/25"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Award size={16} />
          <span>Semester Results ({results.length})</span>
        </button>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h2 className="text-base font-bold text-slate-800">
            {activeTab === "exams" ? "Test Evaluations" : "Semester Scorecards"}
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
              placeholder="Search subject or exam..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>
        </div>

        {activeTab === "exams" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Exam / Test</th>
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-3">Marks Obtained</th>
                  <th className="py-3 px-3 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No examination records found
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((ex) => {
                    const pct = ex.percentage || (ex.totalsmark ? Math.round((ex.obtainedMarks / ex.totalsmark) * 100) : 0);
                    return (
                      <tr key={ex._id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-3 font-bold text-slate-800">
                          {ex.examname}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-700">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px]">
                            {ex.subject}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-800">
                          {ex.obtainedMarks} / {ex.totalsmark}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                              pct >= 75
                                ? "bg-emerald-100 text-emerald-800"
                                : pct >= 50
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-3">Semester</th>
                  <th className="py-3 px-3">Marks</th>
                  <th className="py-3 px-3 text-right">Grade Awarded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No semester results found
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-3 font-bold text-slate-800">
                        {r.Subject}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        {r.Semester}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        {r.obtainedMarks} / {r.totalmarks}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className="inline-block px-3 py-1 rounded-xl bg-purple-100 text-purple-800 font-black text-xs border border-purple-200">
                          {r.grade || "+A"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ParentLayout>
  );
}

export default ParentExams;
