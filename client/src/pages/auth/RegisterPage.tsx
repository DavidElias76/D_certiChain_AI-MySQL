import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  Loader2, 
  User, 
  Mail, 
  Lock, 
  Building2, 
  GraduationCap, 
  Briefcase,
  ArrowLeft,
  CheckCircle2,
  EyeOff,
  Eye
} from "lucide-react";
import toast from "react-hot-toast";
import type { RegisterData } from "../../context/AuthContext";
import ThemeToggle from "../../components/common/ThemeToggle";

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterData>({
    username: "",
    email: "",
    password: "",
    role: "",
    institution_name: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [showPass, setShowPass] = useState<boolean>(false);
  // Local-only state — confirmPassword is never sent to the server
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [confirmError, setConfirmError] = useState<string>("");

  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role) {
      toast.error("Please select a role first");
      return;
    }

    if(form.role === "employer") {
      form.institution_name = "employer"
    }

    if (form.password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setConfirmError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register(form);
      toast.success("Account created successfully!");
      navigate(form.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Placeholder for the future Google OAuth integration
  const handleGoogleRegister = () => {
    toast("Google sign-up is coming soon.", { icon: "🔜" });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col lg:flex-row font-sans transition-colors duration-300">
      <div className="hidden lg:flex lg:w-2/5 relative bg-slate-50 dark:bg-slate-900 items-center justify-center p-12 overflow-hidden transition-colors">
        <div className="absolute top-0 left-0 p-12 flex items-center justify-between w-full">
          <Link to="/" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft size={20} /> Back
          </Link>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Join the Future of Academic Integrity</h2>
          <div className="space-y-6">
            {[
              "Blockchain-backed certificate ownership",
              "Instant verification for employers",
              "AI-driven career path analysis",
              "Secure institutional digital issuance"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <div className="bg-indigo-500/10 dark:bg-indigo-500/20 p-1 rounded-full">
                  <CheckCircle2 size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h1>
            <p className="text-slate-500 dark:text-slate-400">Select your role and fill in your details.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'student', label: 'Student', icon: GraduationCap },
                { id: 'employer', label: 'Employer', icon: Briefcase },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.id, institution_name: "" })}
                  className={`p-4 rounded-md border-2 transition-all flex flex-col items-center gap-2 ${
                    form.role === r.id
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <r.icon size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{r.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => { setForm({ ...form, email: e.target.value }) }}
                    placeholder={form.role === "student" ? "student name/student number@students.institution.name.ac.ke" : "you@gmail/outlook.com"}
                    required
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-md text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all`}
                  />
                </div>
                {error && <p className="text-red-500 text-xs mt-2 ml-1">{error}</p>}
              </div>

              {form.role === "student" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Institution Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                    <input
                      type="text"
                      value={form.institution_name}
                      onChange={(e) => setForm({ ...form, institution_name: e.target.value })}
                      placeholder="e.g. KCA University"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); setConfirmError(""); }}
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError(""); }}
                    placeholder="Re-enter your password"
                    required
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border ${confirmError ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-md text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmError && <p className="text-red-500 text-xs mt-2 ml-1">{confirmError}</p>}
                {!confirmError && confirmPassword && form.password === confirmPassword && (
                  <p className="text-emerald-500 text-xs mt-2 ml-1">Passwords match</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold rounded-md shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-950 px-3 text-slate-400 dark:text-slate-500 tracking-wider font-semibold">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleRegister}
              className="w-full py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-md transition-all flex items-center justify-center gap-3"
            >
              {/* Inline Google "G" logo — official brand colors */}
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Sign up with Google</span>
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-500 dark:hover:text-indigo-300 underline underline-offset-4 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
