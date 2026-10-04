import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">
            Verifying permissions...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const role = (user.role || "").toLowerCase();

  // Super Admin has master administrative access
  if (role === "admin") {
    return children;
  }

  // Role validation check
  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map((r) => (r || "").toLowerCase());
    if (!normalizedAllowed.includes(role)) {
      // Redirect to their respective authorized home
      if (role === "teacher") return <Navigate to="/teacher" replace />;
      if (role === "student") return <Navigate to="/student" replace />;
      if (role === "parent") return <Navigate to="/parent" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;