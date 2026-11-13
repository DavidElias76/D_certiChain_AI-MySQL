import { Link } from "react-router-dom";
import {
  Building2,
  FileText,
  ShieldCheck,
  PlusCircle,
  // ArrowRight,
  Globe,
  Hash,
  Activity,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { useInstitution } from "../../context/InstitutionContext";
import useCertificates from "../../context/CertificateContext";

export default function SystemDashboardPage() {
  const { institutions, loading } = useInstitution();
  const { totalCount } = useCertificates();

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <section className="relative flex min-h-32 flex-col justify-center gap-4 overflow-hidden px-1 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-2 flex items-center gap-3">
            <Activity size={24} className="text-indigo-600 dark:text-indigo-400" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              System overview
            </p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Platform Dashboard
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Overview of registered institutions and certificate activity.
          </p>
        </div>
        <Link
          to="/system/admin/register-institutions"
          className="relative z-10 inline-flex w-fit items-center justify-center gap-2 bg-indigo-600 px-4 py-2.5 text-sm rounded-md font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
        >
          <PlusCircle size={16} />
          Register Institution
        </Link>
      </section>

      <section aria-label="Platform overview" className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Building2 size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : institutions.length}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Institutions</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={12} /> +1
          </span>
        </div>

        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : institutions.filter((i) => i.is_active).length}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
          </div>
        </div>

        {/* delete this part or find a way to ocunt all the certificates - get the blockchain count of number of certificated 
            to be removed if not neccessary
        */}
        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <FileText size={20} />
          </span>
          <div>
            {/* This wil have the number of all certificates from the database and the blockchain - which will be the same */}
            {/* te requeest couut is not bing sent to the backed */}
            <p className="text-xl font-bold text-slate-900 dark:text-white">{totalCount}</p>
            <p className="text-sm  text-slate-500 dark:text-slate-400">Certificates Issued</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <ShieldCheck size={18} className="text-indigo-600 dark:text-indigo-400" />
            Registered Institutions
          </h2>
          <Link
            to="/system/admin/register"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400"
          >
            Add New <PlusCircle size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="mx-auto animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading institutions...</p>
          </div>
        ) : institutions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-slate-100 dark:bg-slate-800">
              <Building2 className="text-slate-400" size={28} />
            </div>
            <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">No institutions yet</h3>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              Get started by registering your first institution.
            </p>
            <Link
              to="/system/admin/register"
              className="inline-flex items-center gap-2 bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              <PlusCircle size={16} /> Register First Institution
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Institution</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Admin</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Short Code</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Domain</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Wallet Address</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {institutions.map((inst) => (
                  <tr
                    key={inst.id}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-indigo-100 text-sm font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                          {inst.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900 dark:text-white">{inst.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {inst.main_admin_name || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <Hash size={10} /> {inst.short_code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Globe size={14} className="text-slate-400 shrink-0" />
                        <span className="max-w-50 truncate">{inst.domain}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                        {inst.wallet_address
                          ? `${inst.wallet_address.slice(0, 6)}...${inst.wallet_address.slice(-4)}`
                          : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {inst.is_active ? (
                        <span className="inline-flex items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-400">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-400">
                          <XCircle size={12} /> Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
