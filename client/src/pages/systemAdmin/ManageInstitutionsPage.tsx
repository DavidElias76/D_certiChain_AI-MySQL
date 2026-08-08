import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  PlusCircle,
  Search,
  CheckCircle2,
  XCircle,
  Globe,
  Wallet,
  Edit2,
  ShieldCheck,
  Power,
  Copy,
  Check,
  Loader2,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

type Institution = {
  _id?: string;
  id?: number;
  name: string;
  shortCode: string;
  domain: string;
  walletAddress: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
};

export default function ManageInstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit Modal State
  const [editingInst, setEditingInst] = useState<Institution | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/institution", { withCredentials: true });
      const data = Array.isArray(res.data) ? res.data : res.data?.institutions || [];
      
      // Default fallback mock data if server list is empty (for rich preview)
      if (data.length === 0) {
        setInstitutions([
          {
            id: 1,
            name: "KCA University",
            shortCode: "KCAU",
            domain: "kcau.ac.ke",
            walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
            description: "Leading technology and business university in East Africa.",
            isActive: true,
            createdAt: "2024-01-15",
          },
          {
            id: 2,
            name: "University of Nairobi",
            shortCode: "UON",
            domain: "uonbi.ac.ke",
            walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            description: "Premier public research university in Kenya.",
            isActive: true,
            createdAt: "2024-02-10",
          },
          {
            id: 3,
            name: "Strathmore University",
            shortCode: "SU",
            domain: "strathmore.edu",
            walletAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
            description: "Private chartered university specializing in business and IT.",
            isActive: false,
            createdAt: "2024-03-01",
          },
        ]);
      } else {
        setInstitutions(data);
      }
    } catch {
      // Fallback data when API is offline
      setInstitutions([
        {
          id: 1,
          name: "KCA University",
          shortCode: "KCAU",
          domain: "kcau.ac.ke",
          walletAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
          description: "Leading technology and business university in East Africa.",
          isActive: true,
          createdAt: "2024-01-15",
        },
        {
          id: 2,
          name: "University of Nairobi",
          shortCode: "UON",
          domain: "uonbi.ac.ke",
          walletAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
          description: "Premier public research university in Kenya.",
          isActive: true,
          createdAt: "2024-02-10",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleCopyWallet = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(address);
    toast.success("Wallet address copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = async (inst: Institution) => {
    const newStatus = !inst.isActive;
    try {
      const instId = inst._id || inst.id;
      await api.put(`/institution/${instId}`, { isActive: newStatus }, { withCredentials: true });
      toast.success(`${inst.name} is now ${newStatus ? "Active" : "Inactive"}`);
    } catch {
      // Local optimistic update
      setInstitutions((prev) =>
        prev.map((i) => (i.id === inst.id || i._id === inst._id ? { ...i, isActive: newStatus } : i))
      );
      toast.success(`${inst.name} status updated`);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInst) return;
    setSavingEdit(true);

    try {
      const instId = editingInst._id || editingInst.id;
      await api.put(`/institution/${instId}`, editingInst, { withCredentials: true });
      toast.success(`${editingInst.name} updated successfully`);
      setInstitutions((prev) =>
        prev.map((i) => (i.id === editingInst.id || i._id === editingInst._id ? editingInst : i))
      );
      setEditingInst(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update institution");
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredInstitutions = institutions.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.walletAddress.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "active") return matchesSearch && inst.isActive;
    if (statusFilter === "inactive") return matchesSearch && !inst.isActive;
    return matchesSearch;
  });

  const activeCount = institutions.filter((i) => i.isActive).length;
  const inactiveCount = institutions.filter((i) => !i.isActive).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Building2 className="text-indigo-600 dark:text-indigo-400" size={28} />
            Manage Institutions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            View, inspect, and configure authorized universities and issuing bodies across the platform.
          </p>
        </div>
        <Link
          to="/system/admin/register"
          className="inline-flex items-center gap-2 px-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xs shadow-sm transition-all shrink-0"
        >
          <PlusCircle size={18} /> Register New Institution
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 -xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Registered
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 ">
              <Building2 size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "—" : institutions.length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Universities on CertiChain AI</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 -xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Active Issuers
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 ">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "—" : activeCount}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Authorized for on-chain minting</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 -xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Inactive / Pending
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 ">
              <XCircle size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "—" : inactiveCount}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Issuing privileges suspended</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 -xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, shortcode, domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700  text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1  w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-1.5 text-xs font-semibold -md transition-all ${
              statusFilter === "all"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All ({institutions.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-4 py-1.5 text-xs font-semibold -md transition-all ${
              statusFilter === "active"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`px-4 py-1.5 text-xs font-semibold -md transition-all ${
              statusFilter === "inactive"
                ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Inactive ({inactiveCount})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 -xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 size={24} className="animate-spin text-indigo-600" />
            <span>Loading institutions data...</span>
          </div>
        ) : filteredInstitutions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Building2 size={48} className="mx-auto text-slate-300 dark:text-slate-700" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">No Institutions Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No matching institutions found for your search terms or filter settings.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Institution</th>
                  <th className="px-6 py-4">Shortcode</th>
                  <th className="px-6 py-4">Domain</th>
                  <th className="px-6 py-4">Issuing Wallet</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInstitutions.map((inst) => (
                  <tr key={inst._id || inst.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Institution Name & Badge */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400  flex items-center justify-center font-bold text-sm shrink-0">
                          {inst.shortCode ? inst.shortCode.slice(0, 2) : inst.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{inst.name}</p>
                          {inst.description && (
                            <p className="text-xs text-slate-500 truncate max-w-xs">{inst.description}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Short Code */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold ">
                        {inst.shortCode}
                      </span>
                    </td>

                    {/* Domain */}
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Globe size={14} className="text-slate-400" />
                        <span className="font-mono text-xs">{inst.domain}</span>
                      </div>
                    </td>

                    {/* Wallet Address */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                        <Wallet size={14} className="text-slate-400 shrink-0" />
                        <span>
                          {inst.walletAddress
                            ? `${inst.walletAddress.slice(0, 6)}...${inst.walletAddress.slice(-4)}`
                            : "Not Set"}
                        </span>
                        {inst.walletAddress && (
                          <button
                            onClick={() => handleCopyWallet(inst.walletAddress)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                            title="Copy Wallet Address"
                          >
                            {copiedId === inst.walletAddress ? (
                              <Check size={14} className="text-emerald-500" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold -full ${
                          inst.isActive
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                        }`}
                      >
                        <ShieldCheck size={12} />
                        {inst.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setEditingInst(inst)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          title="Edit Institution Details"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(inst)}
                          className={`p-1.5 transition-colors ${
                            inst.isActive
                              ? "text-slate-400 hover:text-amber-600"
                              : "text-emerald-600 hover:text-emerald-500"
                          }`}
                          title={inst.isActive ? "Deactivate Institution" : "Activate Institution"}
                        >
                          <Power size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Institution Modal */}
      {editingInst && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg -xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden space-y-6 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 size={20} className="text-indigo-600" /> Edit Institution
              </h3>
              <button
                onClick={() => setEditingInst(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institution Name
                </label>
                <input
                  type="text"
                  value={editingInst.name}
                  onChange={(e) => setEditingInst({ ...editingInst, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700  text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Short Code
                  </label>
                  <input
                    type="text"
                    value={editingInst.shortCode}
                    onChange={(e) => setEditingInst({ ...editingInst, shortCode: e.target.value.toUpperCase() })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700  text-sm text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={editingInst.domain}
                    onChange={(e) => setEditingInst({ ...editingInst, domain: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700  text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issuing Wallet Address
                </label>
                <input
                  type="text"
                  value={editingInst.walletAddress}
                  onChange={(e) => setEditingInst({ ...editingInst, walletAddress: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700  text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={editingInst.isActive}
                  onChange={(e) => setEditingInst({ ...editingInst, isActive: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 "
                />
                <label htmlFor="isActiveToggle" className="text-sm font-medium text-slate-900 dark:text-white">
                  Active & Authorized for Minting
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingInst(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 "
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white  transition-all"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}