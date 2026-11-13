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
  X, Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import { useInstitution } from "../../context/InstitutionContext";

type InstitutionInput = {
    id?: number
    name: string;
    short_code: string;
    domain: string;
    wallet_address?: string | null;
    description?: string | null;
    is_active?: boolean | null;
    main_admin_name?: string | null;
};

export default function ManageInstitutionsPage() {
  const { institutions, loading, toggleInstitutionStatus, updateInstitution, deleteInstitution } = useInstitution()
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InstitutionInput | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit Modal State
  const [editingInst, setEditingInst] = useState<InstitutionInput | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const handleToggleStatus = async (inst: InstitutionInput) => {
    if (!inst.id) return;
    const newStatus = !inst.is_active;
    setTogglingId(inst.id);
      try {
        await toggleInstitutionStatus(String(inst.id), newStatus);
        toast.success(`${inst.name} is now ${newStatus ? "Active" : "Inactive"}`);
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Failed to update institution status");
      } finally {
        setTogglingId(null);
      }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInst?.id) return;
    setSavingEdit(true);
    try {
      // Send only the editable fields, with is_active forced to a real boolean.
      await updateInstitution(String(editingInst.id), {
        name: editingInst.name.trim(),
        short_code: editingInst.short_code.trim().toUpperCase(),
        domain: editingInst.domain.trim(),
        is_active: Boolean(editingInst.is_active),
      });
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
      inst.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inst.main_admin_name || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "active") return matchesSearch && inst.is_active;
    if (statusFilter === "inactive") return matchesSearch && !inst.is_active;
    return matchesSearch;
  });

  const activeCount = institutions.filter((i) => i.is_active).length;
  const inactiveCount = institutions.filter((i) => !i.is_active).length;

  const handleDeleteInstitution = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      await deleteInstitution(String(deleteTarget.id));
      toast.success(`${deleteTarget.name} was deleted`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete institution");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <section className="flex min-h-32 flex-col justify-center gap-4 px-1 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <div className="mb-2 flex items-center gap-3">
            <Building2 className="text-indigo-600 dark:text-indigo-400" size={24} />
            <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Institution directory
            </p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Manage Institutions
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            View, inspect, and configure authorized universities and issuing bodies across the platform.
          </p>
        </div>
        <Link
          to="/system/admin/register-main-admin"
          className="inline-flex w-fit shrink-0 items-center justify-center gap-2 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 rounded-md"
        >
          <PlusCircle size={16} /> Register Institution
        </Link>
      </section>

      <section aria-label="Institution overview" className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Building2 size={20} />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : institutions.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Registered</p>
          </div>
          <p className="ml-auto text-right text-xs text-slate-500 dark:text-slate-400">Universities on CertiChain AI</p>
        </div>

        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : activeCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Active Issuers</p>
          </div>
          <p className="ml-auto text-right text-xs text-slate-500 dark:text-slate-400">Authorized for on-chain minting</p>
        </div>

        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <XCircle size={20} />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : inactiveCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Inactive / Pending</p>
          </div>
          <p className="ml-auto text-right text-xs text-slate-500 dark:text-slate-400">Issuing privileges suspended</p>
        </div>
      </section>

      <section aria-label="Filter institutions" className="flex flex-col gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <label htmlFor="institution-search" className="sr-only">Search institutions</label>
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="institution-search"
            type="text"
            placeholder="Search by name, shortcode, domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <div aria-label="Filter by institution status" className="flex w-full items-center gap-1 border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950 sm:w-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            aria-pressed={statusFilter === "all"}
            className={`flex-1 px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 sm:flex-none ${
              statusFilter === "all"
                ? "border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
                : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
            }`}
          >
            All ({institutions.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            aria-pressed={statusFilter === "active"}
            className={`flex-1 px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 sm:flex-none ${
              statusFilter === "active"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("inactive")}
            aria-pressed={statusFilter === "inactive"}
            className={`flex-1 px-4 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 sm:flex-none ${
              statusFilter === "inactive"
                ? "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
            }`}
          >
            Inactive ({inactiveCount})
          </button>
        </div>
      </section>

      <section aria-label="Institutions" className="overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 size={24} className="animate-spin text-indigo-600 dark:text-indigo-400" />
            <span>Loading institutions data...</span>
          </div>
        ) : filteredInstitutions.length === 0 ? (
          <div className="space-y-3 p-12 text-center">
            <Building2 size={40} className="mx-auto text-slate-300 dark:text-slate-700" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">No Institutions Found</h3>
            <p className="mx-auto max-w-sm text-sm text-slate-500 dark:text-slate-400">
              No matching institutions found for your search terms or filter settings.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Institution</th>
                  <th className="px-5 py-3.5">Admin</th>
                  <th className="px-5 py-3.5">Shortcode</th>
                  <th className="px-5 py-3.5">Domain</th>
                  <th className="px-5 py-3.5">Issuing Wallet</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInstitutions.map((inst) => (
                  <tr key={inst.id || inst.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    {/* Institution Name & Badge */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                          {inst.short_code ? inst.short_code.slice(0, 2) : inst.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{inst.name}</p>
                          {inst.description && (
                            <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500 dark:text-slate-400">{inst.description}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Institution Main Admin */}
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {inst.main_admin_name || "—"}
                    </td>

                    {/* Short Code */}
                    <td className="px-5 py-4">
                      <span className="inline-flex border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {inst.short_code}
                      </span>
                    </td>

                    {/* Domain */}
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Globe size={14} className="text-slate-400" />
                        <span className="font-mono text-xs">{inst.domain}</span>
                      </div>
                    </td>

                    {/* Wallet Address */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 font-mono text-xs text-slate-600 dark:text-slate-400">
                        <Wallet size={14} className="text-slate-400 shrink-0" />
                        <span>
                          {inst.wallet_address
                            ? `${inst.wallet_address.slice(0, 6)}...${inst.wallet_address.slice(-4)}`
                            : "Not Set"}
                        </span>

                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold ${
                          inst.is_active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        <ShieldCheck size={12} />
                        {Boolean(inst.is_active) ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex flex-nowrap items-center justify-between gap-3 whitespace-nowrap">
                        <button
                          onClick={() => setEditingInst(inst)}
                          disabled={togglingId === inst.id || deleting}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                          title="Edit Institution Details"
                        >
                          <Edit2 size={14} /> Edit
                        </button>

                        <button
                          onClick={() => handleToggleStatus(inst)}
                          disabled={togglingId === inst.id || deleting}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 ${
                            inst.is_active
                              ? "text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
                              : "text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                          }`}
                          title={inst.is_active ? "Deactivate Institution" : "Activate Institution"}
                        >
                          {togglingId === inst.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Power size={14} />
                          )}
                          {inst.is_active ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          onClick={() => setDeleteTarget(inst)}
                          disabled={togglingId === inst.id || deleting}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
                          title="Delete Institution"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Edit Institution Modal */}
      {editingInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg space-y-6 overflow-hidden border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                <Building2 size={20} className="text-indigo-600 dark:text-indigo-400" /> Edit Institution
              </h3>
              <button
                onClick={() => setEditingInst(null)}
                aria-label="Close edit institution dialog"
                className="p-1 text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Institution Name
                </label>
                <input
                  type="text"
                  value={editingInst.name}
                  onChange={(e) => setEditingInst({ ...editingInst, name: e.target.value })}
                  required
                  className="w-full border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Short Code
                  </label>
                  <input
                    type="text"
                    value={editingInst.short_code}
                    onChange={(e) => setEditingInst({ ...editingInst, short_code: e.target.value.toUpperCase() })}
                    required
                    className="w-full border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-sm uppercase text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={editingInst.domain}
                    onChange={(e) => setEditingInst({ ...editingInst, domain: e.target.value })}
                    required
                    className="w-full border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              {/* <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issuing Wallet Address
                </label>
                <input
                  type="text"
                  value={editingInst.wallet_address ?? ""}
                  onChange={(e) => setEditingInst({ ...editingInst, wallet_address: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700  text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div> */}

              {/* To be deteermined if needed at all */}

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={editingInst.is_active ?? false}
                  onChange={(e) => setEditingInst({ ...editingInst, is_active: e.target.checked })}
                  className="h-4 w-4 accent-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
                <label htmlFor="isActiveToggle" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Active & Authorized for Minting
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingInst(null)}
                  className="border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="bg-indigo-600 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-200 p-5 dark:border-slate-800">
            <XCircle className="text-red-600 dark:text-red-400" size={22} />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Institution</h3>
          </div>
          <div className="space-y-3 p-5">
            <div className="border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="font-semibold text-slate-900 dark:text-white">{deleteTarget.name}</p>
              <p className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                {deleteTarget.short_code} · {deleteTarget.domain}
              </p>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              This permanently removes the institution from the system. This cannot be undone.
              If you only want to stop it from issuing certificates, deactivate it instead.
            </p>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-200 p-5 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleDeleteInstitution()}
              disabled={deleting}
              className="inline-flex items-center gap-2 bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              {deleting ? "Deleting..." : "Delete Institution"}
            </button>
          </div>
        </div>
      </div>
      )}

    </div>
  );
}