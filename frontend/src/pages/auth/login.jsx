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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../services/authservice";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Admin",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      // Navigate based on user role
      switch (data.user?.role) {
        case "Admin":
          navigate("/admin");
          break;
        case "Teacher":
          navigate("/teacher");
          break;
        case "Student":
          navigate("/student");
          break;
        case "Parent":
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
      {/* Subtle background decoration */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/25">
            <GraduationCap size={28} />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            EduPortal Sign In
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access your student or administrative dashboard
          </p>
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
          {/* Role Selector */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Your Role
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
              {["Admin", "Teacher", "Student", "Parent"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r })}
                  className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer text-center ${
                    formData.role === r
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              New user? We'll automatically register your account in the database!
            </p>
          </div>

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
                placeholder="name@school.edu"
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
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition duration-200 shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 text-sm mt-2 disabled:opacity-60 cursor-pointer"
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

          {/* Quick Demo Fill */}
          <div className="pt-4 mt-2 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Default Admin Account
            </p>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  email: "admin@school.com",
                  password: "admin123",
                });
                setError("");
              }}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs text-slate-700 hover:text-indigo-700 transition flex items-center justify-between cursor-pointer"
            >
              <div className="flex flex-col text-left">
                <span className="font-semibold text-indigo-600">Administrator</span>
                <span className="text-[11px] text-slate-500">admin@school.com (pass: admin123)</span>
              </div>
              <span className="text-[11px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                Auto-fill
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;