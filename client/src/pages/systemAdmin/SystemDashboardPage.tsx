import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  FileText,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
} from "lucide-react";
import api from "../../services/api";

type Institution = {
  _id: string;
  name: string;
  shortCode: string;
  domain: string;
  walletAddress: string;
  isActive: boolean;
  createdAt: string;
};

// NOTE: Need to see all the institutions, users absed on the school name, institution admin, recommendations, certificates issued and verified, revocked

export default function SystemDashboardPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await api.get("/institution", { withCredentials: true });
        setInstitutions(res.data || []);
      } catch {
        // silently fail in dashboard
      } finally {
        setLoading(false);
      }
    };
    fetchInstitutions();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Platform Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Overview of registered institutions and certificate activity.
          </p>
        </div>
        <Link
          to="/system/admin/register"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
        >
          <PlusCircle size={18} />
          Register Institution
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30">
              <Building2 size={22} className="text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
            Registered Institutions
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "—" : institutions.length}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30">
              <ShieldCheck size={22} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
            Active Institutions
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "—" : institutions.filter((i) => i.isActive).length}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30">
              <FileText size={22} className="text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
            Total Certificates Issued
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">—</p>
        </div>
      </div>

      {/* Institutions table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">Registered Institutions</h3>
          <Link
            to="/system/admin/register"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
          >
            Add New <PlusCircle size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading...</div>
        ) : institutions.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              No institutions registered yet.
            </p>
            <Link
              to="/system/admin/register"
              className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium"
            >
              Register your first institution <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Institution
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Short Code
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Wallet Address
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {institutions.map((inst) => (
                  <tr
                    key={inst._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {inst.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">
                        {inst.shortCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{inst.domain}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-500">
                      {inst.walletAddress
                        ? `${inst.walletAddress.slice(0, 6)}...${inst.walletAddress.slice(-4)}`
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium ${
                          inst.isActive
                            ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                            : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {inst.isActive ? "Active" : "Inactive"}
                      </span>
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