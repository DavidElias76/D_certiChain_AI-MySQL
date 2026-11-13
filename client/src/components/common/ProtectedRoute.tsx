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

  //- To be changed -  if theuser is not found it will be deirected to the login page(/login) or the landing page (/) 
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role restriction logic
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user doesn't have permission, send them to their specific dashboard
    // This prevents the infinite loop by ensuring they land on a route they ARE allowed to see

    // NB: The role of the employee needs to be added missing in the allowedRoles
    const roleToPath: Record<string, string> = {
      systemAdmin: "/system/admin/dashboard",
      admin: "/admin/dashboard",
      main_admin: "/admin/dashboard",
      student: "/dashboard",
      employer: "/employer/verify-certificate",
      alumni: "/employer/verify-certificate",
    };
    const defaultPath = roleToPath[user.role] ?? "/";
    
    // If they are already on their default path but somehow failed the check, 
    // send to landing to break any potential loop
    if (location.pathname === defaultPath) {
      return <Navigate to="/" replace />;
    }
    
    return <Navigate to={defaultPath} replace />;
  }

  return <Outlet />;
}
