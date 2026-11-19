import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Edit2,
  Loader2,
  Mail,
  PlusCircle,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
  XCircle,
  Power,
  CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";
import { useUsers, type IUser } from "../../context/UsersContext";

type AdminForm = {
  username: string;
  email: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) return response.data.error;
  }
  return fallback;
};

export default function ManageAdmins() {
  const { users, loading, updateUsersById, updateAdminStatus, deleteUsersById } = useUsers();
  const [search, setSearch] = useState("");
  const [editingAdmin, setEditingAdmin] = useState<IUser | null>(null);
  const [editForm, setEditForm] = useState<AdminForm>({ username: "", email: "" });
  const [deleteTarget, setDeleteTarget] = useState<IUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const admins = useMemo(
     () =>
       users
         .filter((account) => account.role === "main_admin")
         .sort((a, b) =>
           (a.institution_name ?? "").localeCompare(b.institution_name ?? "") ||
           a.username.localeCompare(b.username)
         ),
     [users],
   );
   
  const filteredAdmins = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return admins;
    return admins.filter((admin) =>
      [admin.username, admin.email, admin.institution_name]
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [admins, search]);

  const institutionCount = useMemo(
    () => new Set(admins.map((admin) => admin.institution_id).filter(Boolean)).size,
    [admins],
  );

  const activeCount = admins.filter((i) => i.is_verified).length;
  const inactiveCount = admins.filter((i) => !i.is_verified).length;

  const startEditing = (admin: IUser) => {
    setEditingAdmin(admin);
    setEditForm({ username: admin.username, email: admin.email });
  };

  const handleToggleStatus = async (admin: IUser) => {
    if (!admin.id) return;
    const newStatus = !admin.is_verified;
    setTogglingId(admin.id);
      try {
        await updateAdminStatus(Number(admin.id), newStatus);
        toast.success(`${admin.username} is now ${newStatus ? "Active" : "Inactive"}`);
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Failed to update institution status");
      } finally {
        setTogglingId(null);
      }
  }

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingAdmin) return;

    setSaving(true);
    try {
      await updateUsersById(String(editingAdmin.id), {
        username: editForm.username.trim(),
        email: editForm.email.trim(),
      });
      toast.success("Admin details updated");
      setEditingAdmin(null);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update admin"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteUsersById(deleteTarget.id);
      toast.success(`${deleteTarget.username} was removed`);
      setDeleteTarget(null);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to delete admin"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <section className="flex flex-col justify-center gap-4 px-1 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <div className="mb-2 flex items-center gap-3">
            <Users className="text-indigo-600 dark:text-indigo-400" size={24} />
            <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              System administration
            </p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Manage Admins
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Review and manage the main administrator accounts responsible for each institution.
          </p>
        </div>
        <Link
          to="/admin/register-admin"
          className="inline-flex w-fit shrink-0 items-center justify-center gap-2 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 rounded-md"
        >
          <PlusCircle size={16} /> Register Admin
        </Link>
      </section>

      <section aria-label="Admin overview" className="grid gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Users size={20} />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : admins.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Main Admin Accounts</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : activeCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Active Admins</p>
          </div>
        </div>

        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
            <XCircle size={20} />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : inactiveCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">InActive Admins</p>
          </div>
        </div>

        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <Building2 size={20} />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : institutionCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Institutions Represented</p>
          </div>
        </div>
        
      </section>

      <section aria-label="Search admins" className="border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative w-full sm:max-w-md">
          <label htmlFor="admin-search" className="sr-only">Search admins</label>
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="admin-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or institution..."
            className="w-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>
      </section>

      <section className="overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
            Main Admins ({filteredAdmins.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="mx-auto animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading admin accounts...</p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto mb-4 text-slate-400" size={32} />
            <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">
              {search ? "No admins found" : "No admin accounts yet"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {search
                ? "Try a different name, email, or institution."
                : "Register an admin to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Admin</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email</th>
                  <th className="px-30 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Institution</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Role</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-indigo-100 text-sm font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
                          {admin.username?.[0]?.toUpperCase() || "?"}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900 dark:text-white">{admin.username}</p>
                          <p className="truncate font-mono text-xs text-slate-500 dark:text-slate-400">ID: {admin.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                      <span className="inline-flex items-center gap-2"><Mail size={14} className="shrink-0 text-slate-400" />{admin.email}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                      {admin.institution_name ? (
                        <span className="inline-flex items-center gap-2"><Building2 size={14} className="shrink-0 text-slate-400" />{admin.institution_name}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/40 dark:text-indigo-400">
                        <ShieldCheck size={12} /> Main Admin
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold ${
                          admin.is_verified
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        <ShieldCheck size={12} />
                        {Boolean(admin.is_verified) ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(admin)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(admin)}
                          disabled={togglingId === admin.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 ${
                            admin.is_verified
                              ? "text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
                              : "text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                          }`}
                          title={admin.is_verified ? "Deactivate Institution" : "Activate Institution"}
                        >
                          {togglingId === admin.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Power size={14} />
                          )}
                          {admin.is_verified ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(admin)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-red-400 dark:hover:bg-red-950/40"
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

      {editingAdmin && (
        <div className="fixed inset-0 z-50 rounded-md flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-admin-title"
            className="w-full max-w-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <h2 id="edit-admin-title" className="text-lg font-bold text-slate-900 dark:text-white">Edit Admin</h2>
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                aria-label="Close edit admin dialog"
                className="text-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-slate-200 rounded-md"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4 rounded-md">
              <div>
                <label htmlFor="admin-name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Full name</label>
                <input
                  id="admin-name"
                  required
                  value={editForm.username}
                  onChange={(event) => setEditForm({ ...editForm, username: event.target.value })}
                  className="w-full border border-slate-200 bg-slate-50 px-3.5 rounded-md py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="admin-email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(event) => setEditForm({ ...editForm, email: event.target.value })}
                  className="w-full border border-slate-200 bg-slate-50 px-3.5 rounded-md py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Institution and admin role are managed by the system and cannot be changed here.
              </p>
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  disabled={saving}
                  className="border border-slate-200 px-4 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-md text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-admin-title"
            className="w-full max-w-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 p-5 dark:border-slate-800">
              <XCircle className="text-red-600 dark:text-red-400" size={22} />
              <h2 id="delete-admin-title" className="text-lg font-bold text-slate-900 dark:text-white">Delete Admin</h2>
            </div>
            <div className="space-y-2 p-5">
              <p className="font-semibold text-slate-900 dark:text-white">{deleteTarget.username}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{deleteTarget.email}</p>
              <p className="pt-2 text-sm text-slate-600 dark:text-slate-300">
                This permanently removes the admin account. Continue only if you are sure.
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-200 p-5 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-md font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting && <Loader2 size={15} className="animate-spin" />}
                {deleting ? "Deleting..." : "Delete Admin"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
