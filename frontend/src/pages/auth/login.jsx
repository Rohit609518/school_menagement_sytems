import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  Sparkles,
  Users,
  UserCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/authservice";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    {
      role: "Admin",
      label: "Administrator",
      email: "admin@school.com",
      password: "Admin@123",
      color: "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100",
      icon: Shield,
    },
    {
      role: "Teacher",
      label: "Teacher / Faculty",
      email: "teacher@school.com",
      password: "Teacher@123",
      color: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
      icon: GraduationCap,
    },
    {
      role: "Student",
      label: "Enrolled Student",
      email: "student@school.com",
      password: "Student@123",
      color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
      icon: Users,
    },
    {
      role: "Parent",
      label: "Guardian / Parent",
      email: "parent@school.com",
      password: "Parent@123",
      color: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100",
      icon: UserRound,
    },
  ];

  const fillDemo = (acc) => {
    setFormData({
      email: acc.email,
      password: acc.password,
    });
    setError("");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await loginUser(formData);

      // Save user & token in localStorage & context
      login(data.user, data.token);

      // Navigate based on user role (case-insensitive)
      const userRole = (data.user?.role || "").toLowerCase();
      switch (userRole) {
        case "admin":
          navigate("/admin");
          break;
        case "teacher":
          navigate("/teacher");
          break;
        case "student":
          navigate("/student");
          break;
        case "parent":
          navigate("/parent");
          break;
        default:
          navigate("/student");
      }
    } catch (err) {
      console.log("LOGIN ERROR:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8 relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/25">
            <GraduationCap size={28} />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            EduPortal Sign In
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Role-Based Access Control (RBAC) School Management
          </p>
        </div>

        {/* 1-Click Demo Accounts Selector */}
        <div className="mb-5">
          <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-500" />
            <span>1-Click Demo Login</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc) => {
              const Icon = acc.icon;
              const isSelected = formData.email === acc.email;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className={`p-2 rounded-xl border text-left transition flex items-center gap-2 ${
                    acc.color
                  } ${isSelected ? "ring-2 ring-indigo-500 ring-offset-1 font-bold" : ""}`}
                >
                  <Icon size={16} className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold truncate leading-tight">
                      {acc.role}
                    </p>
                    <p className="text-[9px] opacity-75 truncate">
                      {acc.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 p-3.5 text-xs font-medium flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 mt-1 shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@school.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password
            </label>

            <div className="relative">
              <Lock
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition duration-200 shadow-md flex items-center justify-center gap-2 text-sm mt-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;