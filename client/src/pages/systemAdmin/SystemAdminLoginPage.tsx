import { useState } from "react";
import { Link } from "react-router-dom";
import { EyeOff, Loader2, Eye, ShieldCheck, ArrowLeft, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/common/ThemeToggle";

type SystemAdminLoginForm = {
  email: string;
  password: string;
};

export default function SystemAdminLoginPage() {
  const [form, setForm] = useState<SystemAdminLoginForm>({ email: "", password: "" });
  const [showPass, setShowPass] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { logIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await logIn(form);
      // AuthContext.logIn() sets user state AND navigates to /system/admin/dashboard
      toast.success('Welcome Back, System Admin')
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col lg:flex-row font-sans transition-colors duration-300">
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-50 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
        <div className="absolute top-0 left-0 p-12 flex items-center justify-between w-full">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} /> Back
          </Link>
        </div>

        <div className="relative z-10 text-center px-12">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 inline-block mb-8">
            <ShieldCheck size={64} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">Platform Administration</h2>
          <p className="text-indigo-100 text-lg max-w-md mx-auto">
            Manage universities, monitor certificate issuance and oversee the entire CertiChain AI platform.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="bg-indigo-600 p-1.5">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                CertiChain AI
              </span>
            </div>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              System Admin Login
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Sign in to access the platform administration panel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@certichain.ai"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-8"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600 dark:text-slate-400 text-sm">
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-500 dark:hover:text-indigo-300 underline underline-offset-4 transition-colors">
              Back to user login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}