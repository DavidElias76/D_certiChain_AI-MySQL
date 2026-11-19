import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  EyeOff,
  Loader2,
  Eye,
  ShieldCheck,
  ArrowLeft,
  Lock,
  Mail,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/common/ThemeToggle";
import ForgotPasswordModal from "../../components/modals/ForgotPasswordModal";

type LoginForm = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [showPass, setShowPass] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showForgot, setShowForgot] = useState(false);

  const { logIn, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await logIn(form);
      toast.success("Login successful");

      if (data?.user?.role === "systemAdmin") {
        navigate("/system/admin/dashboard", { replace: true });
      } else if (data?.user?.role === "admin" || data?.user?.role === "main_admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast("Google sign-in is coming soon.", { icon: "🔜" });
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 size={40} className="animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans transition-colors duration-300 dark:bg-slate-950 lg:flex">
      <div className="relative hidden min-h-screen overflow-hidden border-r border-slate-200 bg-white px-12 pb-12 pt-24 transition-colors dark:border-slate-800 dark:bg-slate-900 lg:flex lg:w-2/5 lg:items-center lg:justify-center">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_85%,rgba(99,102,241,0.13),transparent_52%)] dark:bg-[radial-gradient(ellipse_at_15%_85%,rgba(79,70,229,0.2),transparent_52%)]" />
        <div className="absolute left-0 top-0 z-10 flex w-full items-center justify-between p-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
          >
            <ArrowLeft size={18} /> Back
          </Link>
          <span className="flex h-9 w-9 items-center justify-center bg-indigo-600">
            <ShieldCheck size={19} className="text-white" />
          </span>
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <span className="mb-5 inline-flex items-center gap-2 border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
            <ShieldCheck size={14} /> Secure credential access
          </span>
          <h2 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-slate-950 dark:text-white">
            Welcome back to CertiChain
          </h2>
          <p className="mb-8 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Sign in to securely access verified academic credentials and the tools built for your next step.
          </p>
          <div className="space-y-4">
            {[
              "Blockchain-backed certificate ownership",
              "Instant verification for employers",
              "AI-driven career path analysis",
              "Secure institutional digital issuance",
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
          <div className="mb-7 text-center lg:hidden">
            <div className="mb-4 inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center bg-indigo-600">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                CertiChain AI
              </span>
            </div>
          </div>

          <div className="mb-7">
            <h1 className="mb-2 mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7 rounded-md">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    size={20}
                  />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="name@institution.ac.ke"
                    required
                    className="w-full border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-3 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 rounded-md"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>

                  <a
                    href="#"
                    className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    onClick={() => setShowForgot(true)}
                  >
                    Forgot password?

                  </a>
                    <ForgotPasswordModal
                      showModal={showForgot}
                      onClose={() => setShowForgot(false)}
                      onReset={(email) => {
                        // navigate to a "set new password" screen
                        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
                      }}
                  />
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    size={20}
                  />
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="••••••••"
                    required
                    className="w-full border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-10 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-300 rounded-md"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 bg-indigo-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-800 dark:hover:bg-indigo-500 rounded-md"
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

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-sm uppercase">
                <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:bg-slate-900 dark:text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-indigo-800 dark:hover:bg-slate-800 rounded-md"
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
              <span>Sign in with Google</span>
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 underline underline-offset-4 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
