import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleAlert,
  Loader2,
  PlusCircle,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";
import { useInstitution } from "../../context/InstitutionContext";

export default function AdminAnalytics() {
  const { institutions, loading, error } = useInstitution();

  const total = institutions.length;
  const active = institutions.filter((institution) => institution.is_active).length;
  const inactive = total - active;
  const walletsConnected = institutions.filter(
    (institution) => Boolean(institution.wallet_address?.trim())
  ).length;
  const walletsMissing = total - walletsConnected;
  const percentage = (count: number) => (total === 0 ? 0 : Math.round((count / total) * 100));

  return (
    <div className="w-full space-y-6 pb-8">
      <section className="flex min-h-32 flex-col justify-center gap-4 px-1 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <div className="mb-2 flex items-center gap-3">
            <Activity size={24} className="text-indigo-600 dark:text-indigo-400" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Platform insights
            </p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Institution Analytics
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Monitor institution onboarding, issuer status, and wallet readiness across the platform.
          </p>
        </div>
        <Link
          to="/system/admin/manage-institutions"
          className="inline-flex w-fit shrink-0 items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300 rounded-md"
        >
          Manage Institutions <ArrowRight size={15} />
        </Link>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          <CircleAlert size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <section aria-label="Institution metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Building2 size={20} />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : total.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Registered institutions</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : active.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Active issuers</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <XCircle size={20} />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : inactive.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Inactive institutions</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Wallet size={20} />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : walletsConnected.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Wallets connected</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <span className="flex h-9 w-9 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <ShieldCheck size={18} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Issuer status</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Active and inactive institution share
              </p>
            </div>
          </div>
          {loading ? (
            <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 size={18} className="animate-spin text-indigo-600 dark:text-indigo-400" />
              Loading institution analytics...
            </div>
          ) : (
            <div className="space-y-5 p-5">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                    <span className="h-2.5 w-2.5 bg-emerald-500" />
                    Active issuers
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {active.toLocaleString()} <span className="text-slate-400">({percentage(active)}%)</span>
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Active issuers"
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={active}
                  className="h-2.5 bg-slate-100 dark:bg-slate-800"
                >
                  <div className="h-full bg-emerald-500 transition-[width]" style={{ width: `${percentage(active)}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                    <span className="h-2.5 w-2.5 bg-amber-500" />
                    Inactive institutions
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {inactive.toLocaleString()} <span className="text-slate-400">({percentage(inactive)}%)</span>
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Inactive institutions"
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={inactive}
                  className="h-2.5 bg-slate-100 dark:bg-slate-800"
                >
                  <div className="h-full bg-amber-500 transition-[width]" style={{ width: `${percentage(inactive)}%` }} />
                </div>
              </div>
              {total === 0 && (
                <p className="border border-indigo-100 bg-indigo-50/70 px-3 py-2.5 text-xs text-slate-600 dark:border-indigo-950 dark:bg-indigo-950/20 dark:text-slate-400">
                  Institution status metrics will appear after an institution is registered.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <span className="flex h-9 w-9 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Wallet size={18} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Wallet readiness</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Issuer wallet connection coverage
              </p>
            </div>
          </div>
          {loading ? (
            <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 size={18} className="animate-spin text-indigo-600 dark:text-indigo-400" />
              Loading wallet analytics...
            </div>
          ) : (
            <div className="space-y-5 p-5">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                    <span className="h-2.5 w-2.5 bg-indigo-500" />
                    Wallet connected
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {walletsConnected.toLocaleString()} <span className="text-slate-400">({percentage(walletsConnected)}%)</span>
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Wallet-connected institutions"
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={walletsConnected}
                  className="h-2.5 bg-slate-100 dark:bg-slate-800"
                >
                  <div className="h-full bg-indigo-500 transition-[width]" style={{ width: `${percentage(walletsConnected)}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                    <span className="h-2.5 w-2.5 bg-slate-400" />
                    Wallet not set
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {walletsMissing.toLocaleString()} <span className="text-slate-400">({percentage(walletsMissing)}%)</span>
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Institutions without a wallet"
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={walletsMissing}
                  className="h-2.5 bg-slate-100 dark:bg-slate-800"
                >
                  <div className="h-full bg-slate-400 transition-[width]" style={{ width: `${percentage(walletsMissing)}%` }} />
                </div>
              </div>
              {total === 0 ? (
                <Link
                  to="/system/admin/register"
                  className="inline-flex items-center gap-2 border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
                >
                  <PlusCircle size={14} />
                  Register an institution
                </Link>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Wallet connections are completed by each institution&apos;s main admin.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {!loading && total > 0 && walletsMissing > 0 && (
        <section className="flex flex-col gap-3 border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-950 dark:bg-indigo-950/20 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {walletsMissing} {walletsMissing === 1 ? "institution needs" : "institutions need"} wallet setup
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Follow up with institutions without a connected issuing wallet.
            </p>
          </div>
          <Link
            to="/system/admin/manage-institutions"
            className="inline-flex w-fit shrink-0 items-center gap-2 bg-indigo-600 px-4 rounded-md py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          >
            View institutions <ArrowRight size={15} />
          </Link>
        </section>
      )}
    </div>
  );
}
