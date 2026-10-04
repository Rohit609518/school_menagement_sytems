import { useEffect, useState, useMemo } from "react";
import {
  Handshake,
  Calendar,
  Clock,
  User,
  GraduationCap,
  PlusCircle,
  AlertCircle,
  RefreshCw,
  X,
  CheckCircle2,
  Send,
} from "lucide-react";
import TeacherLayout from "../../layouts/TeacherLayout";
import { getMeetings, createMeeting } from "../../services/meetingService";
import { getStudents } from "../../services/adminService";
import { getMyTeacherProfile } from "../../services/teacherService";

function TeacherMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [students, setStudents] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    student: "",
    parentName: "",
    meetingDate: new Date().toISOString().split("T")[0],
    meetingTime: "10:30 AM",
    reson: "",
    remarks: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [meetRes, studRes, profRes] = await Promise.allSettled([
        getMeetings(),
        getStudents(),
        getMyTeacherProfile(),
      ]);

      if (meetRes.status === "fulfilled" && meetRes.value) {
        setMeetings(meetRes.value.meeting || []);
      }
      if (studRes.status === "fulfilled" && studRes.value) {
        const sList = studRes.value.students || [];
        setStudents(sList);
        if (sList.length > 0) {
          setFormData((prev) => ({ ...prev, student: sList[0]._id }));
        }
      }
      if (profRes.status === "fulfilled" && profRes.value) {
        setTeacher(profRes.value.teacher);
      }
    } catch (err) {
      console.log("FETCH MEETINGS ERROR:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load meetings data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    if (!teacher?._id) {
      setFormError("Teacher profile is not available. Please try again.");
      return;
    }
    if (!formData.student) {
      setFormError("Please select a student.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      await createMeeting({
        ...formData,
        teacher: teacher._id,
        status: "Scheduled",
      });

      setIsModalOpen(false);
      setFormData({
        student: students[0]?._id || "",
        parentName: "",
        meetingDate: new Date().toISOString().split("T")[0],
        meetingTime: "10:30 AM",
        reson: "",
        remarks: "",
      });

      // Refresh meetings list
      const updated = await getMeetings();
      setMeetings(updated.meeting || []);
    } catch (err) {
      console.log("CREATE MEETING ERROR:", err);
      setFormError(
        err.response?.data?.message ||
        err.message ||
        "Failed to schedule meeting"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMeetings = useMemo(() => {
    if (statusFilter === "All") return meetings;
    return meetings.filter(
      (m) => (m.status || "").toLowerCase() === statusFilter.toLowerCase()
    );
  }, [meetings, statusFilter]);

  return (
    <TeacherLayout
      title="Parent-Teacher Meetings"
      subtitle="Schedule discussions, consultations, and review progress logs"
    >
      {/* Header Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {["All", "Scheduled", "Completed", "Cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === tab
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-sm"
        >
          <PlusCircle size={16} />
          <span>New Meeting</span>
        </button>
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
            onClick={fetchData}
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
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Handshake size={32} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            No Meetings Scheduled
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            You currently have no scheduled consultations. Click "New Meeting" to invite a parent.
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
                  {m.student && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <GraduationCap size={13} />
                      </div>
                      <span>
                        Student: <span className="font-semibold text-slate-800">{m.student.name || "Student"}</span>
                        {m.student.studentclass && ` (Class ${m.student.studentclass})`}
                      </span>
                    </div>
                  )}

                  {m.parentName && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <User size={13} />
                      </div>
                      <span>
                        Parent: <span className="font-semibold text-slate-800">{m.parentName}</span>
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

      {/* Schedule Meeting Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Handshake size={20} className="text-emerald-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  Schedule Parent Meeting
                </h3>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateMeeting} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Student
                </label>
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Meeting Date
                  </label>
                  <input
                    type="date"
                    value={formData.meetingDate}
                    onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Meeting Time
                  </label>
                  <input
                    type="text"
                    value={formData.meetingTime}
                    onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                    placeholder="e.g. 10:30 AM"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reason / Agenda
                </label>
                <input
                  type="text"
                  value={formData.reson}
                  onChange={(e) => setFormData({ ...formData, reson: e.target.value })}
                  placeholder="e.g. Quarterly Academic Progress Review"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Remarks / Meeting Location
                </label>
                <textarea
                  rows={3}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Room 204 or Google Meet link..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
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
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-60"
                >
                  <Send size={15} />
                  <span>{submitting ? "Scheduling..." : "Schedule Meeting"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}

export default TeacherMeetings;
