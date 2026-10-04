import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Handshake,
  Clock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  Phone,
  Mail,
  Award,
} from "lucide-react";
import TeacherLayout from "../../layouts/TeacherLayout";
import { getMyTeacherProfile } from "../../services/teacherService";
import { getStudents } from "../../services/adminService";
import { getMeetings } from "../../services/meetingService";

function TeacherDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [meetings, setMeetings] = useState([]);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      setError("");

      const [profileRes, studentsRes, meetingsRes] = await Promise.allSettled([
        getMyTeacherProfile(),
        getStudents(),
        getMeetings(),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value) {
        setTeacher(profileRes.value.teacher);
      }

      if (studentsRes.status === "fulfilled" && studentsRes.value) {
        setStudents(studentsRes.value.students || []);
      }

      if (meetingsRes.status === "fulfilled" && meetingsRes.value) {
        setMeetings(meetingsRes.value.meeting || []);
      }
    } catch (err) {
      console.log("TEACHER DASHBOARD ERROR:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load teacher dashboard information"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  return (
    <TeacherLayout
      title="Teacher Dashboard"
      subtitle={`Welcome, ${teacher?.name || "Teacher"}`}
    >
      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="h-44 bg-white rounded-3xl border border-slate-200/80 animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* Error View */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-rose-800">
            Error Loading Teacher Portal
          </h3>
          <p className="text-xs sm:text-sm text-rose-600 mt-1 mb-4">
            {error}
          </p>
          <button
            onClick={fetchTeacherData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-rose-700 transition"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-teal-700/15 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold text-emerald-100 mb-3 border border-white/20">
                  <GraduationCap size={14} className="text-emerald-200" />
                  <span>Faculty Department • {teacher?.subject || "Academics"}</span>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
                  Welcome, {teacher?.name || "Teacher"} 👋
                </h1>

                <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
                  Manage class schedules, review enrolled students, and organize meetings with parents.
                </p>
              </div>

              <button
                onClick={() => navigate("/teacher/meetings")}
                className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-xs sm:text-sm font-bold transition flex items-center gap-2"
              >
                <PlusCircle size={16} />
                <span>Schedule Meeting</span>
              </button>
            </div>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Enrolled Students
                </span>
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Users size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-800">
                  {students.length}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Across all classes
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Specialization
                </span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <BookOpen size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-xl sm:text-2xl font-black text-emerald-700 truncate block">
                  {teacher?.subject || "Mathematics"}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Primary subject
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Parent Meetings
                </span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Handshake size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-800">
                  {meetings.length}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Scheduled sessions
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Experience
                </span>
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Award size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-purple-700">
                  {teacher?.experience ? `${teacher.experience} Yrs` : "5+ Yrs"}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Academic service
                </p>
              </div>
            </div>
          </div>

          {/* Quick Operations Section */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center justify-between">
              <span>Faculty Operations & Quick Actions</span>
              <span className="text-xs font-normal text-slate-400">Classroom Management</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <button
                onClick={() => navigate("/teacher/students")}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200/70 hover:border-emerald-200 text-left transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Users size={20} />
                </div>
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition">
                  Students & Classes
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Enroll, manage & track pending fees
                </p>
              </button>

              <button
                onClick={() => navigate("/teacher/attendance")}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200/70 hover:border-indigo-200 text-left transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <CalendarCheck size={20} />
                </div>
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition">
                  Mark Attendance
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Daily roll call & student presence
                </p>
              </button>

              <button
                onClick={() => navigate("/teacher/results")}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200/70 hover:border-amber-200 text-left transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <BookOpen size={20} />
                </div>
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-amber-700 transition">
                  Results & Grades
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Semester exams & score entry
                </p>
              </button>

              <button
                onClick={() => navigate("/teacher/meetings")}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-purple-50/80 border border-slate-200/70 hover:border-purple-200 text-left transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Handshake size={20} />
                </div>
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-purple-700 transition">
                  Parent Meetings
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Schedule time, date & agenda
                </p>
              </button>
            </div>
          </div>

          {/* Teacher Profile Info Card */}
          {teacher && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <GraduationCap size={20} className="text-emerald-600" />
                <span>Faculty Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <GraduationCap size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Instructor</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{teacher.name}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Email</p>
                    <p className="text-sm font-bold text-slate-800 break-all">{teacher.email || "teacher@school.edu"}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Phone size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Contact</p>
                    <p className="text-sm font-bold text-slate-800">{teacher.phone || "+91 9876543210"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enrolled Students Roster Preview */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Classroom Students Roster
                </h3>
                <p className="text-xs text-slate-500">
                  {students.length} students currently registered in institution
                </p>
              </div>

              <button
                onClick={() => navigate("/teacher/students")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline self-start sm:self-center"
              >
                <span>View Full Roster & Fees</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {students.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No students enrolled yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] border-b border-slate-100">
                    <tr>
                      <th className="p-3 pl-4">Student Name</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Email</th>
                      <th className="p-3 pr-4 text-right">Gender</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.slice(0, 5).map((st) => (
                      <tr key={st._id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3 pl-4 font-bold text-slate-800">
                          {st.name}
                        </td>
                        <td className="p-3 text-slate-600">
                          Class {st.studentclass || "10th"}
                        </td>
                        <td className="p-3 text-slate-500 break-all">
                          {st.email}
                        </td>
                        <td className="p-3 pr-4 text-right capitalize text-slate-600">
                          {st.gender || "Male"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}

export default TeacherDashboard;
