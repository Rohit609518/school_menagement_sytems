import { useEffect, useState, useMemo } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  AlertCircle,
  RefreshCw,
  Search,
  GraduationCap,
} from "lucide-react";
import ParentLayout from "../../layouts/ParentLayout";
import { getChildHomework } from "../../services/homeworkService";

function ParentHomework() {
  const [homeworkList, setHomeworkList] = useState([]);
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchHomework = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getChildHomework();
      setHomeworkList(res.homework || []);
      setChild(res.child);
    } catch (err) {
      console.error("PARENT HOMEWORK ERROR:", err);
      setError("Failed to load child's homework tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework();
  }, []);

  const filteredHomework = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return homeworkList;
    return homeworkList.filter(
      (h) =>
        (h.title || "").toLowerCase().includes(q) ||
        (h.subject || "").toLowerCase().includes(q) ||
        (h.description || "").toLowerCase().includes(q)
    );
  }, [homeworkList, searchQuery]);

  return (
    <ParentLayout
      title="Child Homework Assignments"
      subtitle={child ? `Viewing coursework for ${child.name}` : "Homework monitoring"}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <BookOpen className="text-amber-600" size={26} />
            <span>Child Homework & Assignments</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track daily coursework, upcoming deadlines, and instructions from subject teachers (Read-Only)
          </p>
        </div>

        <button
          onClick={fetchHomework}
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

      {/* Homework Cards / Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h2 className="text-base font-bold text-slate-800">
            Assigned Coursework ({filteredHomework.length})
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
              placeholder="Search homework..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Title & Instructions</th>
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-3">Assigned By</th>
                <th className="py-3 px-3 text-right">Submission Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredHomework.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No homework assignments found for your child
                  </td>
                </tr>
              ) : (
                filteredHomework.map((hw) => (
                  <tr key={hw._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-800">{hw.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 max-w-md">
                        {hw.description}
                      </p>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                        {hw.subject}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      {hw.teacher?.name || "Subject Faculty"}
                    </td>

                    <td className="py-3.5 px-3 text-right font-semibold text-amber-700">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200">
                        <Clock size={12} className="text-amber-600" />
                        <span>
                          {hw.duedate
                            ? new Date(hw.duedate).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ParentLayout>
  );
}

export default ParentHomework;
