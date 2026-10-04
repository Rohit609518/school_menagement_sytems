import { useEffect, useState, useMemo } from "react";
import {
  Handshake,
  Calendar,
  Clock,
  User,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from "lucide-react";
import ParentLayout from "../../layouts/ParentLayout";
import { useAuth } from "../../context/AuthContext";
import { getMeetings } from "../../services/meetingService";
import FamilyModeSwitcher from "../../component/FamilyModeSwitcher";

function ParentMeetings() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isStudentSession, setIsStudentSession] = useState(false);

  const fetchMeetingList = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMeetings();
      setMeetings(data.meeting || []);
    } catch (err) {
      console.log("MEETINGS ERROR:", err);
      if (err.response?.status === 403 && user?.role === "Student") {
        setIsStudentSession(true);
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to load meetings"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingList();
  }, []);

  const filteredMeetings = useMemo(() => {
    if (statusFilter === "All") return meetings;
    return meetings.filter(
      (m) => (m.status || "").toLowerCase() === statusFilter.toLowerCase()
    );
  }, [meetings, statusFilter]);

  return (
    <ParentLayout
      title="Parent-Teacher Meetings"
      subtitle="Scheduled consultations regarding student progress"
    >
      {/* Shared Family Mobile Hub Banner */}
      <FamilyModeSwitcher compact={false} />

      {isStudentSession && (
        <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
          <div className="flex items-start gap-3">
            <Handshake size={22} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Parent Profile Required for Confidential Meetings</h4>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                You are currently signed in as a Student on this shared mobile. Confidential teacher-parent meeting agendas and remarks require the Parent session.
              </p>
              <p className="text-xs font-semibold text-amber-800 mt-2">
                👉 Use the "Switch to Parent View" button at the top to toggle instantly in 1-tap!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {["All", "Scheduled", "Completed", "Cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === tab
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredMeetings.length} meetings
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error View */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-rose-800">
            Error Loading Meetings
          </h3>
          <p className="text-xs sm:text-sm text-rose-600 mt-1 mb-4">
            {error}
          </p>
          <button
            onClick={fetchMeetingList}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-rose-700 transition"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredMeetings.length === 0 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Handshake size={32} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            No Meetings Found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            There are no parent-teacher meetings scheduled under this category.
          </p>
        </div>
      )}

      {/* Meetings Grid */}
      {!loading && !error && filteredMeetings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredMeetings.map((m) => {
            const status = (m.status || "Scheduled").toLowerCase();

            return (
              <div
                key={m._id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                        status === "completed"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : status === "cancelled"
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {m.status || "Scheduled"}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Clock size={13} className="text-slate-400" />
                      <span>{m.meetingTime || "10:00 AM"}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 leading-snug">
                    {m.reson || "Academic Consultation"}
                  </h3>

                  {m.remarks && (
                    <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      "{m.remarks}"
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  {m.teacher && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <GraduationCap size={13} />
                      </div>
                      <span>
                        Teacher: <span className="font-semibold text-slate-800">{m.teacher.name || "Teacher"}</span>
                        {m.teacher.subject && ` (${m.teacher.subject})`}
                      </span>
                    </div>
                  )}

                  {m.student && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <User size={13} />
                      </div>
                      <span>
                        Student: <span className="font-semibold text-slate-800">{m.student.name || "Student"}</span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-slate-400 pt-1">
                    <Calendar size={13} />
                    <span>
                      Date: {new Date(m.meetingDate).toLocaleDateString(undefined, {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ParentLayout>
  );
}

export default ParentMeetings;
