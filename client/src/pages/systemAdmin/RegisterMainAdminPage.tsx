import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  ShieldCheck,
  UserPlus,
  // Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useUsers } from "../../context/UsersContext";

type AdminForm = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "main_admin" | "admin";
  institution_name?: string;
};

export default function RegisterMainAdminPage() {
  // const navigate = useNavigate();
  const { user } = useAuth();
  const { addUsers } = useUsers()

  const isSystemAdmin = user?.role === "systemAdmin";

  const [form, setForm] = useState<AdminForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: user?.role === "systemAdmin" ? "main_admin" : "admin",
    institution_name: "" // update the instituion name based on the user.institution_name - check first
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto-fill wallet address from connected wallet - This needs to be deleted
  useEffect(() => {
    const stored = localStorage.getItem("walletAddress");
    if (stored) {
      setForm((prev) => ({ ...prev, walletAddress: stored }));
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await addUsers(form); // the request is not being sent to the user route - error adding the user because of the admin email differes
      toast.success(`Main_admin ${form.username} registered successfully`);
      // navigate("/system/admin/manage-admins", {
      //   replace: true,
      // });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to register admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <Link
          to={isSystemAdmin ? "/system/admin/dashboard" : "/admin/dashboard"}
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-2"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <UserPlus className="text-indigo-600 dark:text-indigo-400" size={28} />
          {isSystemAdmin ? "Register Main Admin" : "Register Admin"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {isSystemAdmin
            ? "Create a main admin account for an institution."
            : "Add a new administrator to your institution."}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-3xl">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-600" />
            Admin Details
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 rounded-md">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              required
              className="w-full px-4 py-3.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name.admin@short-code.ac.ke"
                  required
                  className="w-full pl-10 pr-4 py-3.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Role
              </label>
              <input
                type="text"
                value={form.role}
                readOnly
                className="w-full px-4 py-3.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full px-4 pr-12 py-3.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  required
                  className="w-full px-4 pr-12 py-3.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  aria-label={
                    showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                  }
                  aria-pressed={showConfirmPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-3 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Ethereum Wallet Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Wallet
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                name="walletAddress"
                value={form.walletAddress}
                onChange={handleChange}
                placeholder="0x... (auto-filled from connected wallet)"
                required
                className="w-full pl-10 pr-4 py-3.5.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Connect your wallet to auto-fill this field.
            </p>
          </div> */}

          {/* This is not needed the systemadmin has this page and the main_admin has its own page */}

          {isSystemAdmin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Institution Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  name="institution_name"
                  value={form.institution_name}
                  onChange={handleChange}
                  placeholder="Enter institution Name"
                  required
                  className="w-full pl-10 pr-4 py-3.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold transition-colors text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Register Admin
                </>
              )}
            </button>
            <Link
              to={isSystemAdmin ? "/system/admin/dashboard" : "/admin/dashboard"}
              className="px-5 py-3.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors text-sm rounded-md"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}