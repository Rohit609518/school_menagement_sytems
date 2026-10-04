import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  GraduationCap,
  CalendarCheck,
  BookOpen,
  FileText,
  Wallet,
  Handshake,
  Clock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Heart,
} from "lucide-react";
import ParentLayout from "../../layouts/ParentLayout";
import { useAuth } from "../../context/AuthContext";
import { getMyParentProfile } from "../../services/parentService";
import { getMyStudentProfile } from "../../services/studentservice";
import { getMyHomework } from "../../services/homeworkService";
import { getMyAttendance } from "../../services/attendanceService";
import { getMyExams } from "../../services/examService";
import { getMyFees } from "../../services/feesService";
import { getMeetings } from "../../services/meetingService";
import FamilyModeSwitcher from "../../component/FamilyModeSwitcher";

function ParentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [parent, setParent] = useState(null);
  const [child, setChild] = useState(null);
  const [childStats, setChildStats] = useState({
    attendanceRate: 0,
    homeworkCount: 0,
    examsCount: 0,
    feeStatus: "Checking...",
  });
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);

  const fetchParentData = async () => {
    try {
      setLoading(true);
      setError("");

      let parentData = null;
      let linkedChild = null;

      if (user?.role === "Student") {
        try {
          const studentRes = await getMyStudentProfile();
          linkedChild = studentRes?.student;
          parentData = {
            name: `Guardian of ${linkedChild?.name || user?.name || "Student"}`,
            phone: linkedChild?.phone || "Family Phone",
            email: user?.email,
            relationship: "Parent / Guardian",
          };
          setParent(parentData);
          setChild(linkedChild);
        } catch (e) {
          console.log("STUDENT FALLBACK ERROR:", e);
        }
      } else {
        const parentRes = await getMyParentProfile();
        parentData = parentRes.parent;
        setParent(parentData);
        linkedChild = parentData?.student;
        setChild(linkedChild);
      }

      // If child is linked, fetch child's metrics
      if (linkedChild?._id) {
        const [hwRes, attRes, examRes, feeRes, meetRes] = await Promise.allSettled([
          getMyHomework(linkedChild._id),
          getMyAttendance(linkedChild._id),
          getMyExams(linkedChild._id),
          getMyFees(linkedChild._id),
          getMeetings(),
        ]);

        // Homework
        let hwCount = 0;
        if (hwRes.status === "fulfilled" && hwRes.value) {
          hwCount = (hwRes.value.homework || []).length;
        }

        // Attendance
        let attRate = 0;
        if (attRes.status === "fulfilled" && attRes.value) {
          const attList = attRes.value.attendance || [];
          const present = attList.filter((a) => a.status === "Present").length;
          attRate = attList.length > 0 ? Math.round((present / attList.length) * 100) : 100;
        }

        // Exams
        let exCount = 0;
        if (examRes.status === "fulfilled" && examRes.value) {
          exCount = (examRes.value.exams || examRes.value.exam || []).length;
        }

        // Fees
        let feeStr = "Good Standing";
        if (feeRes.status === "fulfilled" && feeRes.value) {
          const feesList = feeRes.value.fees || feeRes.value.fee || [];
          if (feesList.length > 0) {
            const hasPending = feesList.some((f) => (f.status || "").toLowerCase() === "pending");
            const hasPartial = feesList.some((f) => (f.status || "").toLowerCase() === "partial");
            if (hasPending) feeStr = "Pending";
            else if (hasPartial) feeStr = "Partial";
            else feeStr = "Paid";
          }
        }

        // Meetings
        if (meetRes.status === "fulfilled" && meetRes.value) {
          const list = meetRes.value.meeting || [];
          setUpcomingMeetings(list.slice(0, 3));
        }

        setChildStats({
          attendanceRate: attRate,
          homeworkCount: hwCount,
          examsCount: exCount,
          feeStatus: feeStr,
        });
      }
    } catch (err) {
      console.log("PARENT DASHBOARD ERROR:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load parent dashboard information"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, []);

  return (
    <ParentLayout
      title="Parent Dashboard"
      subtitle={`Welcome, ${parent?.name || "Parent"}`}
    >
      {/* Shared Family Mobile Hub Banner */}
      <FamilyModeSwitcher compact={false} />

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
            Error Loading Parent Portal
          </h3>
          <p className="text-xs sm:text-sm text-rose-600 mt-1 mb-4">
            {error}
          </p>
          <button
            onClick={fetchParentData}
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
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-orange-600/15 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold text-amber-100 mb-3 border border-white/20">
                  <Heart size={14} className="text-rose-200 fill-rose-200" />
                  <span>Guardian Monitoring Portal</span>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
                  Welcome, {parent?.name || "Parent"} 👋
                </h1>

                <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-xl">
                  {child
                    ? `Monitoring progress and attendance for ${child.name} (Class ${child.studentclass || "N/A"}).`
                    : "Track student performance, attendance records, homework assignments, and teacher meetings."}
                </p>
              </div>

              <button
                onClick={() => navigate("/parent/meetings")}
                className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-xs sm:text-sm font-bold transition flex items-center gap-2"
              >
                <Handshake size={16} />
                <span>View Meetings</span>
              </button>
            </div>
          </div>

          {/* Child Metric Highlights */}
          {child && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div
                onClick={() => navigate("/parent/attendance")}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Child's Attendance
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition">
                    <CalendarCheck size={18} />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-slate-800">
                    {childStats.attendanceRate}%
                  </span>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                    <span>{childStats.attendanceRate >= 75 ? "Consistent Presence" : "Low Attendance"}</span>
                    <ArrowRight size={11} />
                  </p>
                </div>
              </div>

              <div
                onClick={() => navigate("/parent/homework")}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Homework
                  </span>
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition">
                    <BookOpen size={18} />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-slate-800">
                    {childStats.homeworkCount}
                  </span>
                  <p className="text-[11px] text-indigo-600 font-semibold mt-0.5 flex items-center gap-1">
                    <span>Tasks assigned</span>
                    <ArrowRight size={11} />
                  </p>
                </div>
              </div>

              <div
                onClick={() => navigate("/parent/exams")}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Exams Logged
                  </span>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition">
                    <FileText size={18} />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-slate-800">
                    {childStats.examsCount}
                  </span>
                  <p className="text-[11px] text-amber-600 font-semibold mt-0.5 flex items-center gap-1">
                    <span>Tests recorded</span>
                    <ArrowRight size={11} />
                  </p>
                </div>
              </div>

              <div
                onClick={() => navigate("/parent/fees")}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Fee Status
                  </span>
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition">
                    <Wallet size={18} />
                  </div>
                </div>
                <div className="mt-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      childStats.feeStatus === "Paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : childStats.feeStatus === "Partial"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {childStats.feeStatus}
                  </span>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                    <span>Tuition records</span>
                    <ArrowRight size={11} />
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Linked Student Profile Card */}
          {child ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <GraduationCap size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      Linked Child Profile
                    </h3>
                    <p className="text-xs text-slate-500">
                      Enrolled student account linked to your parent portal
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Child Name</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{child.name}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Class</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">Class {child.studentclass || "10th"}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Email</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5 break-all">{child.email}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Gender / Age</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5 capitalize">{child.gender || "Male"} • {child.age || "18"} Yrs</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-6 text-center text-slate-500 text-sm">
              No student is currently linked to this parent account. Contact the school administrator to link your child.
            </div>
          )}

          {/* Upcoming Parent-Teacher Meetings Preview */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Handshake size={20} className="text-amber-600" />
                <h3 className="text-base font-bold text-slate-800">
                  Parent-Teacher Meetings
                </h3>
              </div>

              <button
                onClick={() => navigate("/parent/meetings")}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-8 text-xs sm:text-sm text-slate-500">
                No meetings are scheduled at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {upcomingMeetings.map((m) => (
                  <div
                    key={m._id}
                    onClick={() => navigate("/parent/meetings")}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-300 transition cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase">
                        {m.status || "Scheduled"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {m.meetingTime || "10:00 AM"}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                      {m.reson || "Academic Consultation"}
                    </h4>

                    {m.teacher && (
                      <p className="text-[11px] text-slate-500 truncate">
                        With Teacher: <span className="font-semibold text-slate-700">{m.teacher.name || "Teacher"}</span>
                      </p>
                    )}

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
    </ParentLayout>
  );
}

export default ParentDashboard;
