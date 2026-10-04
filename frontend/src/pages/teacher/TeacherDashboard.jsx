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
  FileText,
  Award,
  Wallet,
} from "lucide-react";
import TeacherLayout from "../../layouts/TeacherLayout";
import { getMyTeacherProfile } from "../../services/teacherService";
import { getStudents } from "../../services/adminService";
import { getAllHomework } from "../../services/homeworkService";
import { getAllExams } from "../../services/examService";
import { getAllResults } from "../../services/resultService";
import { getAllAttendance } from "../../services/attendanceService";
import { getMeetings } from "../../services/meetingService";

function TeacherDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [homeworkCount, setHomeworkCount] = useState(0);
  const [examsCount, setExamsCount] = useState(0);
  const [resultsCount, setResultsCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [meetings, setMeetings] = useState([]);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        profileRes,
        studentsRes,
        hwRes,
        examRes,
        resRes,
        attRes,
        meetRes,
      ] = await Promise.allSettled([
        getMyTeacherProfile(),
        getStudents(),
        getAllHomework(),
        getAllExams(),
        getAllResults(),
        getAllAttendance(),
        getMeetings(),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value) {
        setTeacher(profileRes.value.teacher);
      }

      if (studentsRes.status === "fulfilled" && studentsRes.value) {
        setStudents(studentsRes.value.students || []);
      }

      if (hwRes.status === "fulfilled" && hwRes.value) {
        setHomeworkCount((hwRes.value.homework || []).length);
      }

      if (examRes.status === "fulfilled" && examRes.value) {
        setExamsCount((examRes.value.exams || []).length);
      }

      if (resRes.status === "fulfilled" && resRes.value) {
        setResultsCount((resRes.value.results || []).length);
      }

      if (attRes.status === "fulfilled" && attRes.value) {
        setAttendanceCount((attRes.value.attendance || []).length);
      }

      if (meetRes.status === "fulfilled" && meetRes.value) {
        setMeetings((meetRes.value.meeting || []).slice(0, 4));
      }
    } catch (err) {
      console.error("TEACHER DASHBOARD ERROR:", err);
      setError("Failed to load some teacher dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  return (
    <TeacherLayout
      title="Teacher Command Center"
      subtitle={`Welcome back, ${teacher?.name || "Faculty Member"}`}
    >
      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="h-44 bg-white rounded-3xl border border-slate-200/80 animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 bg-white rounded-2xl border border-slate-200/80 animate-pulse"
              />
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
          <p className="text-xs sm:text-sm text-rose-600 mt-1 mb-4">{error}</p>
          <button
            onClick={fetchTeacherData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-rose-700 transition"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-teal-700/15 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold text-emerald-100 mb-3 border border-white/20">
                  <GraduationCap size={14} className="text-emerald-200" />
                  <span>
                    Faculty Portal • {teacher?.subject || "Curriculum & Academics"}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
                  Welcome, {teacher?.name || "Teacher"} 👋
                </h1>

                <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
                  Manage assigned students, record daily attendance, distribute coursework homework, schedule tests, and submit grades.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => navigate("/teacher/attendance")}
                  className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2"
                >
                  <CalendarCheck size={16} />
                  <span>Mark Attendance</span>
                </button>
                <button
                  onClick={() => navigate("/teacher/homework")}
                  className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-xs sm:text-sm font-bold transition flex items-center gap-2"
                >
                  <BookOpen size={16} />
                  <span>Assign Homework</span>
                </button>
              </div>
            </div>
          </div>

          {/* Core Functional Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* My Students */}
            <div
              onClick={() => navigate("/teacher/students")}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  My Students
                </span>
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition">
                  <Users size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-800">
                  {students.length}
                </span>
                <p className="text-[11px] text-indigo-600 font-semibold mt-0.5 flex items-center gap-1">
                  <span>View directory</span>
                  <ArrowRight size={11} />
                </p>
              </div>
            </div>

            {/* Attendance */}
            <div
              onClick={() => navigate("/teacher/attendance")}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Attendance
                </span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition">
                  <CalendarCheck size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-800">
                  {attendanceCount}
                </span>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <span>Mark & review</span>
                  <ArrowRight size={11} />
                </p>
              </div>
            </div>

            {/* Homework */}
            <div
              onClick={() => navigate("/teacher/homework")}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Homework
                </span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition">
                  <BookOpen size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-800">
                  {homeworkCount}
                </span>
                <p className="text-[11px] text-blue-600 font-semibold mt-0.5 flex items-center gap-1">
                  <span>Course tasks</span>
                  <ArrowRight size={11} />
                </p>
              </div>
            </div>

            {/* Exams */}
            <div
              onClick={() => navigate("/teacher/exams")}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Exams
                </span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition">
                  <FileText size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-800">
                  {examsCount}
                </span>
                <p className="text-[11px] text-amber-600 font-semibold mt-0.5 flex items-center gap-1">
                  <span>Assessments</span>
                  <ArrowRight size={11} />
                </p>
              </div>
            </div>

            {/* Results */}
            <div
              onClick={() => navigate("/teacher/results")}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition cursor-pointer group col-span-2 lg:col-span-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Results
                </span>
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition">
                  <Award size={18} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-800">
                  {resultsCount}
                </span>
                <p className="text-[11px] text-purple-600 font-semibold mt-0.5 flex items-center gap-1">
                  <span>Grade scorecards</span>
                  <ArrowRight size={11} />
                </p>
              </div>
            </div>
          </div>

          {/* Quick Academic Actions Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => navigate("/teacher/students")}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 transition cursor-pointer shadow-xs space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Student Academic Management
              </h3>
              <p className="text-xs text-slate-500">
                Register new students, update contact details, and view full class rosters
              </p>
            </div>

            <div
              onClick={() => navigate("/teacher/fees")}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 transition cursor-pointer shadow-xs space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Class Fees Clearance (View-Only)
              </h3>
              <p className="text-xs text-slate-500">
                Check student tuition clearance status and identify pending fee records
              </p>
            </div>

            <div
              onClick={() => navigate("/teacher/meetings")}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-300 transition cursor-pointer shadow-xs space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Handshake size={20} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Parent Consultations
              </h3>
              <p className="text-xs text-slate-500">
                Schedule and manage parent-teacher consultations and academic progress reviews
              </p>
            </div>
          </div>

          {/* Upcoming Parent-Teacher Consultations */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Handshake size={20} className="text-emerald-600" />
                <h3 className="text-base font-bold text-slate-800">
                  Scheduled Parent Consultations
                </h3>
              </div>
              <button
                onClick={() => navigate("/teacher/meetings")}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {meetings.length === 0 ? (
              <div className="text-center py-8 text-xs sm:text-sm text-slate-500">
                No meetings currently scheduled.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {meetings.map((m) => (
                  <div
                    key={m._id}
                    onClick={() => navigate("/teacher/meetings")}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-300 transition cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                        {m.status || "Scheduled"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {m.meetingTime || "10:00 AM"}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {m.reson || "Academic Consultation"}
                    </h4>

                    <p className="text-[11px] text-slate-500 truncate">
                      Parent: <span className="font-semibold text-slate-700">{m.parentName || "Guardian"}</span>
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1 border-t border-slate-200/50">
                      <Clock size={12} />
                      <span>{new Date(m.meetingDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}

export default TeacherDashboard;
