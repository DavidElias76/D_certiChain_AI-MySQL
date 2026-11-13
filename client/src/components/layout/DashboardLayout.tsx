import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, ShieldCheck, FileText,
  Users,
  BarChart3,
  LogOut,
  ChevronDown,
  Award,
  Search,
  Building2,
  // Wallet,
  LandmarkIcon,
  UserPlus,
  UserRound,
  // BriefcaseBusiness,
  // Info,
  // Mail,
  // Lightbulb
} from "lucide-react";
import { useState } from "react";

// import { useWallet } from "../../context/WalletContext";
import InstitutionWalletStatus from "./InstitutionWalletStatus";
// import { useWallet } from "../../context/WalletContext";
function NavItem({
  to,
  icon: Icon,
  label,
  end = false,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-xs
         ${isActive
           ? "bg-indigo-500 text-white"
           : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-white"
         }`
      }>
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function DashboardLayout() {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // const [walletPickerOpen, setWalletPickerOpen] = useState(false);
  // const { disconnectWallet, connectWallet, connecting, account, availableWallets, activeWalletLabel } = useWallet();
  // const { disconnectWallet, account }= useWallet()

  const isStudent = user?.role === "student";
  // you can use one name to make it simple
  const isEmployer = user?.role === "employer";
  const isAlumni = user?.role === "alumni";
  const isEmployerOrAlumni = isEmployer || isAlumni;
  const isAdmin = user?.role === "admin" || user?.role === "main_admin";
  // const isMainAdmin = user?.role === "main_admin";
  const isSystemAdmin = user?.role === "systemAdmin";

  const handleLogout = async () => {
    await logOut();
    navigate(isSystemAdmin ? "/system/admin/login" : "/login");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-xs flex items-center justify-center">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">CertiChain AI</h1>
              <p className="text-xs text-slate-500">
                {isSystemAdmin
                  ? "Platform Admin"
                  : isAdmin
                  ? "University Admin"
                  : isEmployerOrAlumni
                  ? "Employer & Alumni"
                  : "Student Portal"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-7 space-y-1 overflow-y-auto">
          {isSystemAdmin && (
            <>
              <p className="px-4 text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">
                System Administration
              </p>
              <NavItem to="/system/admin/dashboard" icon={LayoutDashboard} label="Dashboard" end />
              <NavItem to="/system/admin/register-institutions" icon={Building2} label="Register Institutions" />
              <NavItem to="/system/admin/register-main-admin" icon={UserPlus} label="Register Main Admin" />
              <NavItem to="/system/admin/manage-institutions" icon={LandmarkIcon} label="Manage Institutions" />
              <NavItem to="/system/admin/manage-admins" icon={Users} label="Manage Admins" />
              <NavItem to="/system/admin/analytics" icon={BarChart3} label="Analytics" />
            </>
          )}

          {isAdmin && (
            <>
              <p className="px-4 text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">
                University Administration
              </p>
              <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" end />
              <NavItem to="/admin/issue-certificates" icon={FileText} label="Issue Certificate" />
              {user?.role === "main_admin" && (
                <NavItem to="/admin/register-admin" icon={UserPlus} label="Manage Admins" />
              )}
              <NavItem to="/admin/manage-certificates" icon={ShieldCheck} label="Manage Certificates" />
              <NavItem to="/admin/manage-users" icon={Users} label="Manage Students" />
              <NavItem to="/admin/analytics" icon={BarChart3} label="Analytics" />
            </>
          )}

          {isStudent && (
            <>
              <p className="px-4 text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">
                Main
              </p>
              <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" end />
              <NavItem to="/my-certificates" icon={Award} label="My Certificates" />
              <NavItem to="/verify-certificate" icon={Search} label="Verify Certificate" />
              <NavItem to="/career-recommendations" icon={BarChart3} label="Career Recommendations" />
            </>
          )}

          {isEmployerOrAlumni && (
            <>
              <p className="px-4 text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">
                Employer Portal
              </p>
              {/* not needed at the moment */}
              {/* <NavItem to="/employer/dashboard" icon={LayoutDashboard} label="Dashboard" /> */}
              <NavItem to="/employer/verify-certificate" icon={ShieldCheck} label="Verify Certificate" end/>
            </>
          )}
        </nav>

        {/* User dropdown */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xs transition-all">
              <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900 rounded-xs flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-semibold shrink-0">
                {user?.username?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-slate-900 dark:text-white font-medium truncate text-sm">
                  {user?.username}
                </p>
                <p className="text-xs text-slate-500 capitalize">
                  {user?.role === "systemAdmin" ? "System Admin" : user?.role}
                </p>
              </div>
              <ChevronDown size={16} className="text-slate-400 shrink-0" />
            </button>

            {dropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xs shadow-sm py-1 z-50">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-colors">
                  <UserRound size={18} />
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm transition-colors">
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-medium text-slate-800 dark:text-slate-200">
            {isSystemAdmin
              ? "Platform Administration"
              : isAdmin
              ? "University Administration"
              : isEmployerOrAlumni
              ? "Employer & Alumni Portal"
              : "Student Portal"}
          </h2>

          {isAdmin && <InstitutionWalletStatus />}
            
          </header>
        {/* Page content */}
        <main className="flex-1 overflow-auto bg-slate-50 p-4 dark:bg-slate-950 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}