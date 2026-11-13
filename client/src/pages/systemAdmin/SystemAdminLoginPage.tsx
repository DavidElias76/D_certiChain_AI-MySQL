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
      toast.success('Welcome Back, System Admin')
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors dark:bg-slate-950 dark:text-white lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden border-r border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-28 -top-24 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl dark:bg-indigo-900/20" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-100/70 blur-3xl dark:bg-indigo-950/30" />
        </div>
        <Link
          to="/"
          className="relative z-10 inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:text-indigo-300"
        >
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div className="relative z-10 max-w-xl py-12">
          <div className="mb-7 flex h-14 w-14 items-center justify-center border border-indigo-200 bg-white text-indigo-600 dark:border-indigo-800 dark:bg-slate-950 dark:text-indigo-400">
            <ShieldCheck size={30} />
          </div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Secure platform access
          </p>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white xl:text-4xl">
            Platform Administration
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600 dark:text-slate-400">
            Manage institutions and oversee certificate activity across CertiChain AI.
          </p>
          <div className="mt-8 flex items-center gap-3 border border-indigo-100 bg-white/80 p-4 dark:border-indigo-900/60 dark:bg-slate-950/60">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Lock size={17} />
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Authorized access for system administrators.
            </p>
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500 dark:text-slate-500">
          CertiChain AI · Platform administration
        </p>
      </aside>

      <main className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 lg:hidden"
            >
              <ArrowLeft size={16} /> Back
            </Link>
            <div className="inline-flex items-center gap-2 lg:ml-auto">
              <span className="flex h-8 w-8 items-center justify-center bg-indigo-600 text-white">
                <ShieldCheck size={19} />
              </span>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                CertiChain AI
              </span>
            </div>
            <ThemeToggle />
          </div>

          <section className="border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="mb-7">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                System administration
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Sign in
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Sign in to access the platform administration panel.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="system-admin-email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="system-admin-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@certichain.ai"
                    required
                    className="w-full border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="system-admin-password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="system-admin-password"
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="w-full border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-indigo-400"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-800 dark:focus-visible:ring-offset-slate-900"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </section>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Need a user account?{" "}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 transition-colors hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Back to user login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}