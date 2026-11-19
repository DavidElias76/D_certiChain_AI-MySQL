import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center gap-3 text-white">
        <Loader2 size={40} className="animate-spin text-indigo-600" /> 
        <span>Verifying user session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {

    const roleToPath: Record<string, string> = {
      systemAdmin: "/system/admin/dashboard",
      admin: "/admin/dashboard",
      main_admin: "/admin/dashboard",
      student: "/dashboard",
      employer: "/employer/verify-certificate",
      alumni: "/employer/verify-certificate",
    };
    const defaultPath = roleToPath[user.role] ?? "/";
    
    if (location.pathname === defaultPath) {
      return <Navigate to="/" replace />;
    }
    
    return <Navigate to={defaultPath} replace />;
  }

  return <Outlet />;
}
