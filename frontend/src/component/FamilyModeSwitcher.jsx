import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Smartphone,
  UsersRound,
  GraduationCap,
  ArrowRightLeft,
  X,
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authservice";

function FamilyModeSwitcher({ compact = false }) {
  const { user, familyAccounts, switchFamilyRole, linkFamilyMember } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isStudentPortal = location.pathname.startsWith("/student");
  const isParentPortal = location.pathname.startsWith("/parent");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetRole, setTargetRole] = useState(isStudentPortal ? "Parent" : "Student");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if target family role is already saved in phone storage
  const hasSavedTarget = !!familyAccounts[targetRole.toLowerCase()]?.token;

  const handleQuickSwitch = (role) => {
    const roleKey = role.toLowerCase();
    const isSaved = !!familyAccounts[roleKey]?.token;

    if (isSaved) {
      // 1-Click Instant Switch!
      const ok = switchFamilyRole(role);
      if (ok) {
        navigate(role === "Parent" ? "/parent" : "/student");
      }
    } else {
      // Open quick 1-time link modal
      setTargetRole(role);
      setFormData({ email: "", password: "" });
      setError("");
      setIsModalOpen(true);
    }
  };

  const handleLinkAndSwitch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const res = await loginUser(formData);
      if (res?.user && res?.token) {
        linkFamilyMember(res.user.role || targetRole, res.user, res.token);
        switchFamilyRole(res.user.role || targetRole);
        setIsModalOpen(false);
        navigate(targetRole === "Parent" ? "/parent" : "/student");
      }
    } catch (err) {
      console.log("LINK FAMILY ERROR:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDirectPreview = () => {
    setIsModalOpen(false);
    navigate(targetRole === "Parent" ? "/parent" : "/student");
  };

  if (!isStudentPortal && !isParentPortal) return null;

  return (
    <>
      {/* Visual Switcher Pill */}
      {compact ? (
        <button
          onClick={() => handleQuickSwitch(isStudentPortal ? "Parent" : "Student")}
          className={`
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs
            ${
              isStudentPortal
                ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                : "bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200"
            }
          `}
          title="1-Click Switch between Student and Parent on shared family mobile"
        >
          <ArrowRightLeft size={13} className="shrink-0 animate-pulse" />
          <span className="truncate">
            {isStudentPortal ? "Parent View" : "Student View"}
          </span>
          <span className="text-[9px] bg-white/80 px-1 py-0.2 rounded font-semibold text-slate-700">
            1-Tap
          </span>
        </button>
      ) : (
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-200/80 rounded-2xl p-3 sm:p-4 mb-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Smartphone size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                    Shared Mobile Family Hub
                  </h4>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                    Active: {isStudentPortal ? "🎒 Student Mode" : "👨‍👩‍👦 Parent Mode"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Single family phone detected. Switch portals instantly without logging out.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                onClick={() => handleQuickSwitch(isStudentPortal ? "Parent" : "Student")}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <ArrowRightLeft size={14} className="text-indigo-600" />
                <span>Switch to {isStudentPortal ? "Parent Portal" : "Student Portal"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ONE-TIME FAMILY ACCOUNT LINK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <UsersRound size={20} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-800">
                    Link {targetRole} Profile
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    One-time link for fast 1-tap switching
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleLinkAndSwitch} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  {targetRole} Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={`${targetRole.toLowerCase()}@school.edu`}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-500/20 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck size={16} />
                  <span>{loading ? "Linking..." : `Save & Switch to ${targetRole}`}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDirectPreview}
                  className="w-full py-2 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  Or preview {targetRole} view directly →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default FamilyModeSwitcher;
