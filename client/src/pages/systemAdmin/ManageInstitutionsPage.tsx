import { useState } from "react";
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
  Loader2,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import { useInstitution } from "../../context/InstitutionContext";

type InstitutionInput = {
    id?: number
    name: string;
    short_code: string;
    domain: string;
    wallet_address?: string;
    description?: string | null;
    is_active?: boolean | null;
};

export default function ManageInstitutionsPage() {
  const { institutions, loading, toggleInstitutionStatus, updateInstitution } = useInstitution()
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Edit Modal State
  const [editingInst, setEditingInst] = useState<InstitutionInput | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const handleToggleStatus = async (inst: InstitutionInput) => {
    const newStatus = !inst.is_active;
    try {
      const instId = inst.id;
      toggleInstitutionStatus(String(instId), newStatus)
      toast.success(`${inst.name} is now ${newStatus ? "Active" : "Inactive"}`);
    } catch {
       toast.error("Failed to update institution status");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInst) return;
    setSavingEdit(true);

    try {
      const instId = editingInst.id;
      updateInstitution(String(instId), editingInst)
      toast.success(`${editingInst.name} updated successfully`);
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
      inst.short_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.domain.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "active") return matchesSearch && inst.is_active;
    if (statusFilter === "inactive") return matchesSearch && !inst.is_active;
    return matchesSearch;
  });

  const activeCount = institutions.filter((i) => i.is_active).length;
  const inactiveCount = institutions.filter((i) => !i.is_active).length;

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
          > Inactive ({inactiveCount})
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
                  <tr key={inst.id || inst.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Institution Name & Badge */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400  flex items-center justify-center font-bold text-sm shrink-0">
                          {inst.short_code ? inst.short_code.slice(0, 2) : inst.name.slice(0, 2).toUpperCase()}
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
                        {inst.short_code}
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
                          {inst.wallet_address
                            ? `${inst.wallet_address.slice(0, 6)}...${inst.wallet_address.slice(-4)}`
                            : "Not Set"}
                        </span>

                        {/* There is no need to copy the wallet_address */}

                        {/* {inst.wallet_address && (
                          // <button
                          //   onClick={() => handleCopyWallet(inst.wallet_address)}
                          //   className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                          //   title="Copy Wallet Address"
                          // >
                          //   {copiedId === inst.wallet_address ? (
                          //     <Check size={14} className="text-emerald-500" />
                          //   ) : (
                          //     <Copy size={14} />
                          //   )}
                          // </button>
                        )} */}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold -full ${
                          inst.is_active
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                        }`}
                      >
                        <ShieldCheck size={12} />
                        {inst.is_active ? "Active" : "Inactive"}
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
                        {/* set the institution in_active aor active */}
                        <button
                          onClick={() => handleToggleStatus(inst)}
                          className={`p-1.5 transition-colors ${
                              inst.is_active
                                  ? "text-slate-400 hover:text-amber-600"
                                  : "text-emerald-600 hover:text-emerald-500"
                          }`}
                          title={inst.is_active ? "Deactivate Institution" : "Activate Institution"}
                      >
                          <Power size={16} />
                      </button>

                      {/* add a delete button to delete the user from the databse and also add a delete */}
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
                    value={editingInst.short_code}
                    onChange={(e) => setEditingInst({ ...editingInst, short_code: e.target.value.toUpperCase() })}
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
                  value={editingInst.wallet_address}
                  onChange={(e) => setEditingInst({ ...editingInst, wallet_address: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700  text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* To be deteermined if needed at all */}

              {/* <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={editingInst.is_active}
                  onChange={(e) => setEditingInst({ ...editingInst, is_active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 "
                />
                <label htmlFor="isActiveToggle" className="text-sm font-medium text-slate-900 dark:text-white">
                  Active & Authorized for Minting
                </label>
              </div> */}

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