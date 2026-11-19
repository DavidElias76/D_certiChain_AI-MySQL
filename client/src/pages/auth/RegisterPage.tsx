import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { isAxiosError } from "axios";
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
      const registrationData = form.role === "employer"
        ? { ...form, institution_name: "employer" }
        : form;
      await register(registrationData);
      toast.success("Account created successfully!");
      navigate(form.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err: unknown) {
      const message = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      toast.error(message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    toast("Google sign-up is coming soon.", { icon: "🔜" });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans dark:bg-slate-950 lg:flex">
      <div className="relative hidden min-h-screen overflow-hidden border-r border-slate-200 bg-white px-12 pb-12 pt-24 dark:border-slate-800 dark:bg-slate-900 lg:flex lg:w-2/5 lg:items-center lg:justify-center">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_85%,rgba(99,102,241,0.13),transparent_52%)] dark:bg-[radial-gradient(ellipse_at_15%_85%,rgba(79,70,229,0.2),transparent_52%)]" />
        <div className="absolute left-0 top-0 z-10 flex w-full items-center justify-between p-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
          >
            <ArrowLeft size={18} /> Back
          </Link>
          <span className="flex h-9 w-9 items-center justify-center bg-indigo-600"><CheckCircle2 size={19} className="text-white" /></span>
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <span className="mb-5 inline-flex items-center gap-2 border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
            <GraduationCap size={14} /> Trusted digital credentials
          </span>
          <h2 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-slate-950 dark:text-white">
            Join the Future of Academic Integrity
          </h2>
          <p className="mb-8 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Create your account to securely manage credentials and access the tools built for your role.
          </p>

          <div className="space-y-4">
            {[
              "Blockchain-backed certificate ownership",
              "Instant verification for employers",
              "AI-driven career path analysis",
              "Secure institutional digital issuance"
            ].map((text, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-indigo-100 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/50">
                  <CheckCircle2
                    size={16}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="relative flex flex-1 items-center justify-center px-5 py-12 sm:px-10 sm:py-16 lg:px-12">
        <div className="absolute right-5 top-5 sm:right-8 sm:top-8">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-xl pt-8">
          <div className="mb-7">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Get started</span>
            <h1 className="mb-2 mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Create Account</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Select your role and fill in your details.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7 rounded-md">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: 'student', label: 'Student', icon: GraduationCap },
                { id: 'employer', label: 'Employer', icon: Briefcase },
                { id: 'alumni', label: 'alumni', icon: GraduationCap },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.id, institution_name: "" })}
                  className={`flex flex-col items-center gap-2 border p-3 transition-colors sm:p-4 ${
                    form.role === r.id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 rounded-md'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-indigo-800 rounded-md'
                  }`}
                >
                  <r.icon size={21} />
                  <span className="text-[9px] font-bold uppercase tracking-wider sm:text-[10px]">{r.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="w-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm rounded-md text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => { setForm({ ...form, email: e.target.value }) }}
                    placeholder={form.role === "student" ? "student name/student number@students.institution.name.ac.ke" : "you@gmail/outlook.com"}
                    required
                    className={`w-full border bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:bg-slate-950 dark:text-white ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} rounded-md`}
                  />
                </div>
                {error && <p className="ml-1 mt-2 text-sm text-red-500">{error}</p>}
              </div>

              {form.role === "student" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Institution Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input
                      type="text"
                      value={form.institution_name}
                      onChange={(e) => setForm({ ...form, institution_name: e.target.value })}
                      placeholder="e.g. KCA University"
                      required
                      className="w-full border border-slate-200 bg-slate-50 py-3 rounded-md pl-11 pr-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); setConfirmError(""); }}
                    placeholder="Minimum 6 characters"
                    required
                    className="w-full border border-slate-200 bg-slate-50 py-3 rounded-md pl-11 pr-11 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-300"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError(""); }}
                    placeholder="Re-enter your password"
                    required
                    className={`w-full border bg-slate-50 py-3 rounded-md pl-11 pr-11 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:bg-slate-950 dark:text-white ${confirmError ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-300"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmError && <p className="ml-1 mt-2 text-sm text-red-500">{confirmError}</p>}
                {!confirmError && confirmPassword && form.password === confirmPassword && (
                  <p className="ml-1 mt-2 text-sm text-emerald-600 dark:text-emerald-400">Passwords match</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 bg-indigo-600 py-3.5 rounded-md text-sm font-semibold text-white shadow-lg shadow-indigo-950/10 transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-800"
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-3 font-semibold tracking-wider text-slate-400 dark:bg-slate-900 dark:text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleRegister}
              className="flex w-full items-center justify-center gap-3 border border-slate-200 bg-white py-3 rounded-md text-sm font-semibold text-slate-700 transition-colors hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-indigo-800 dark:hover:bg-slate-800"
            >
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

          <p className="mt-7 text-center text-sm text-slate-600 dark:text-slate-400">
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
