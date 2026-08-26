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

// NOTE: Need to see all the institutions, users absed on the school name, institution admin, recommendations, certificates issued and verified, revocked

export default function SystemDashboardPage() {
  const { institutions, loading } = useInstitution();

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Activity className="text-indigo-600 dark:text-indigo-400" size={28} />
            Platform Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Overview of registered institutions and certificate activity.
          </p>
        </div>
        <Link
          to="/system/admin/register"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm transition-colors text-sm"
        >
          <PlusCircle size={16} />
          Register Institution
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40">
              <Building2 className="text-indigo-600 dark:text-indigo-400" size={20} />
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <TrendingUp size={12} /> +1
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Total Institutions</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {loading ? "—" : institutions.length}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40">
              <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Active</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {loading ? "—" : institutions.filter((i) => i.is_active).length}
          </p>
        </div>

        {/* delete this part or find a way to ocunt all the certificates - get the blockchain count of number of certificated 
            to be removed if not neccessary
        */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40">
              <FileText className="text-amber-600 dark:text-amber-400" size={20} />
            </div>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Certificates Issued</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-600" /> Registered Institutions
          </h2>
          <Link
            to="/system/admin/register"
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
          >
            Add New <PlusCircle size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-indigo-600 mx-auto" size={32} />
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-3">Loading institutions...</p>
          </div>
        ) : institutions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Building2 className="text-slate-400" size={28} />
            </div>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-1">No institutions yet</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              Get started by registering your first institution.
            </p>
            <Link
              to="/system/admin/register"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              <PlusCircle size={16} /> Register First Institution
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Institution</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Short Code</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Domain</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Wallet Address</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {institutions.map((inst) => (
                  <tr
                    key={inst.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm shrink-0">
                          {inst.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">{inst.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs border border-slate-200 dark:border-slate-700">
                        <Hash size={10} /> {inst.short_code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Globe size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-50">{inst.domain}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                        {inst.wallet_address
                          ? `${inst.wallet_address.slice(0, 6)}...${inst.wallet_address.slice(-4)}`
                          : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {inst.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/50">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-800/50">
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
      </div>
    </div>
  );
}
