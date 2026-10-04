import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Calendar,
  VenusAndMars,
  GraduationCap,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Hash,
} from "lucide-react";
import StudentLayout from "../../layouts/StudentLayout";
import { getMyStudentProfile } from "../../services/studentservice";

function StudentDetails() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMyStudentProfile();
      setStudent(data.student);
    } catch (err) {
      console.log("PROFILE ERROR:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to load student profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCopyEmail = (email) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <StudentLayout
      title="My Profile"
      subtitle="View your personal and academic information"
    >
      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs animate-pulse">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-200" />
              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div className="h-6 bg-slate-200 rounded-md w-48 mx-auto sm:mx-0" />
                <div className="h-4 bg-slate-200 rounded-md w-32 mx-auto sm:mx-0" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-white rounded-xl border border-slate-200/80 animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* Error View */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-rose-800">
            Unable to Load Profile
          </h3>
          <p className="text-xs sm:text-sm text-rose-600 mt-1 mb-4">
            {error}
          </p>
          <button
            onClick={fetchProfile}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-rose-700 transition"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Profile Details Content */}
      {!loading && !error && student && (
        <div className="space-y-6">
          {/* Student ID Card Banner */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Gradient Top */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 sm:p-8 text-white relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Large Avatar */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 border-4 border-white/30 backdrop-blur-md flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shrink-0">
                  {student.name ? student.name.charAt(0).toUpperCase() : <User size={40} />}
                </div>

                <div className="text-center sm:text-left flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                    <h2 className="text-xl sm:text-2xl font-bold truncate">
                      {student.name}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                      <ShieldCheck size={13} />
                      Verified
                    </span>
                  </div>

                  <p className="text-indigo-100 text-xs sm:text-sm">
                    Class {student.studentclass || "N/A"} • Student Portal
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-indigo-100/90">
                    <span className="break-all">{student.email}</span>
                    <button
                      onClick={() => handleCopyEmail(student.email)}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 transition text-indigo-100"
                      title="Copy email"
                    >
                      {copied ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Student ID:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {student._id ? student._id.slice(-8).toUpperCase() : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Status:</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Active Enrollment
                </span>
              </div>
            </div>
          </div>

          {/* Personal Information Grid */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-indigo-600" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {/* Full Name */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <User size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Full Name
                  </p>
                  <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                    {student.name || "N/A"}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </p>
                  <p className="text-sm font-semibold text-slate-800 break-all mt-0.5">
                    {student.email || "N/A"}
                  </p>
                </div>
              </div>

              {/* Age */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Calendar size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Age
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {student.age ? `${student.age} Years` : "18 Years"}
                  </p>
                </div>
              </div>

              {/* Gender */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                  <VenusAndMars size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Gender
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5 capitalize">
                    {student.gender || "Male"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <GraduationCap size={20} className="text-indigo-600" />
              <span>Academic Details</span>
            </h3>

            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                    Enrolled Class
                  </p>
                  <p className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-0.5">
                    Class {student.studentclass || "10th"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-indigo-200/60 pt-3 sm:pt-0 sm:pl-6 text-xs text-slate-600">
                <div>
                  <p className="text-slate-400 font-medium">Session</p>
                  <p className="font-semibold text-slate-800">2026-2027</p>
                </div>
                <span className="w-px h-6 bg-indigo-200 hidden sm:block" />
                <div>
                  <p className="text-slate-400 font-medium">Curriculum</p>
                  <p className="font-semibold text-slate-800">Standard CBSE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}

export default StudentDetails;