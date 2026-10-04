import { useEffect, useState, useMemo } from "react";
import {
  BookOpen,
  Calendar,
  User,
  Search,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  AlertCircle,
  FileText,
} from "lucide-react";
import StudentLayout from "../../layouts/StudentLayout";
import { getMyStudentProfile } from "../../services/studentservice";
import { getMyHomework } from "../../services/homeworkService";

function Homework() {
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");

  const fetchHomeworkData = async () => {
    try {
      setLoading(true);
      setError("");

      let studentId = null;
      try {
        const profile = await getMyStudentProfile();
        studentId = profile?.student?._id;
      } catch (e) {
        console.log("Profile fetch note:", e.message);
      }

      const data = await getMyHomework(studentId);
      setHomework(data.homework || []);
    } catch (err) {
      console.log("HOMEWORK ERROR:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load homework assignments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeworkData();
  }, []);

  // Extract unique subjects for filter tabs
  const subjects = useMemo(() => {
    const set = new Set();
    homework.forEach((h) => {
      if (h.subject) set.add(h.subject);
    });
    return ["All", ...Array.from(set)];
  }, [homework]);

  // Filtered homework list
  const filteredHomework = useMemo(() => {
    return homework.filter((item) => {
      const matchSubject =
        selectedSubject === "All" || item.subject === selectedSubject;
      const matchQuery =
        !searchQuery ||
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.subject && item.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSubject && matchQuery;
    });
  }, [homework, selectedSubject, searchQuery]);

  // Subject pill color helper
  const getSubjectColor = (subject = "") => {
    const s = subject.toLowerCase();
    if (s.includes("math")) return "bg-indigo-100 text-indigo-700 border-indigo-200";
    if (s.includes("sci") || s.includes("bio") || s.includes("chem"))
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (s.includes("eng") || s.includes("lit"))
      return "bg-blue-100 text-blue-700 border-blue-200";
    if (s.includes("hist") || s.includes("social"))
      return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-purple-100 text-purple-700 border-purple-200";
  };

  return (
    <StudentLayout
      title="Homework & Assignments"
      subtitle="View assignments, instructions, and submission deadlines"
    >
      {/* Header Controls: Search & Filter */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs mb-6 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search homework by subject or title..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Assignment count badge */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 self-start sm:self-center">
            <span className="p-1 rounded bg-indigo-50 text-indigo-600">
              <BookOpen size={15} />
            </span>
            <span>
              {filteredHomework.length} {filteredHomework.length === 1 ? "Assignment" : "Assignments"}
            </span>
          </div>
        </div>

        {/* Subject Filter Pills */}
        {subjects.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter size={12} />
              Filter:
            </span>
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition ${
                  selectedSubject === sub
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs animate-pulse h-56"
            >
              <div className="h-5 bg-slate-200 rounded w-24 mb-4" />
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-full mb-4" />
              <div className="h-10 bg-slate-100 rounded-xl mt-auto" />
            </div>
          ))}
        </div>
      )}

      {/* Error View */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-rose-800">
            Error Loading Homework
          </h3>
          <p className="text-xs sm:text-sm text-rose-600 mt-1 mb-4">
            {error}
          </p>
          <button
            onClick={fetchHomeworkData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-rose-700 transition"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredHomework.length === 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            All Caught Up!
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            {searchQuery || selectedSubject !== "All"
              ? "No homework assignments match your current search filters."
              : "You have no pending homework assignments right now. Great job!"}
          </p>
          {(searchQuery || selectedSubject !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedSubject("All");
              }}
              className="mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Homework Cards Grid */}
      {!loading && !error && filteredHomework.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredHomework.map((item) => {
            const dueDate = item.duedate || item.dueDate;
            const isDueSoon =
              dueDate &&
              new Date(dueDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 &&
              new Date(dueDate).getTime() - Date.now() > 0;
            const isPastDue = dueDate && new Date(dueDate).getTime() < Date.now();

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Subject Badge & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getSubjectColor(
                        item.subject
                      )}`}
                    >
                      {item.subject || "Academic"}
                    </span>

                    {dueDate && (
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          isPastDue
                            ? "bg-rose-50 text-rose-600 border border-rose-200"
                            : isDueSoon
                            ? "bg-amber-50 text-amber-600 border border-amber-200"
                            : "bg-slate-50 text-slate-500 border border-slate-200"
                        }`}
                      >
                        <Clock size={12} />
                        {isPastDue
                          ? "Past Due"
                          : isDueSoon
                          ? "Due Soon"
                          : "Scheduled"}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-800 leading-snug break-words">
                    {item.title || item.subject || "Assignment"}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 line-clamp-3 break-words leading-relaxed">
                    {item.description || item.question || "No detailed instructions provided."}
                  </p>
                </div>

                {/* Footer Meta: Teacher & Due Date */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                  {item.teacher && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <User size={13} />
                      </div>
                      <span className="truncate">
                        Assigned by <span className="font-semibold text-slate-800">{item.teacher.name || "Teacher"}</span>
                      </span>
                    </div>
                  )}

                  {dueDate && (
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>Due:</span>
                        <span className="font-semibold text-slate-700">
                          {new Date(dueDate).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <span className="text-[11px] font-bold text-indigo-600">
                        Pending
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StudentLayout>
  );
}

export default Homework;