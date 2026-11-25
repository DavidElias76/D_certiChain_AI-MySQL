import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  ShieldCheck,
  UserPlus,
  Users,
  // Wallet,
} from "lucide-react";

import { Edit2, Trash2, Power, X, XCircle } from "lucide-react";
import type { IUser,UserRole } from '../../context/UsersContext'
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useUsers } from "../../context/UsersContext";

type AdminForm = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "main_admin" | "admin";
  institution_name?: string;
  // is_verified?: boolean
};

type editFrom = {
  id: number
  username: string;
  email: string;
  role: UserRole
  institution_name?: string
}

export default function RegisterAdmin() {
  // const navigate = useNavigate();
  const { user } = useAuth();
  const { users, loading: usersLoading, addUsers, updateUsersById, updateAdminStatus, deleteUsersById } = useUsers()
  const isSystemAdmin = user?.role === "systemAdmin";
  const main_admin = user?.role === "main_admin";
  const adminAccounts = useMemo(
    () =>
      users
        .filter((account) => account.role === (main_admin ? "admin" : "students"))
        .sort((a, b) => a.username.localeCompare(b.username)),
    [users, isSystemAdmin],
  );

  const [form, setForm] = useState<AdminForm>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: user?.role === "systemAdmin" ? "main_admin" : "admin",
    institution_name: "" // update the instituion name based on the user.institution_name - check first
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [editingAdmin, setEditingAdmin] = useState<editFrom | null>(null);
  const [editForm, setEditForm] = useState<{ username: string; email: string; role: UserRole }>({
      username: "",
      email: "",
      role: "admin",
  });
  const [deleteTarget, setDeleteTarget] = useState<editFrom | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Auto-fill wallet address from connected wallet - This needs to be deleted
  useEffect(() => {
    const stored = localStorage.getItem("walletAddress");
    if (stored) {
      setForm((prev) => ({ ...prev, walletAddress: stored }));
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    };

    const startEditing = (admin: IUser) => {
      setEditingAdmin(admin)
      setEditForm({ username: admin.username, email: admin.email, role: admin.role });
    }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setSaving(true);
    try {
        await updateUsersById(String(editingAdmin.id), {
          username: editForm.username.trim(),
          email: editForm.email.trim(),
          role: editForm.role,
      });
      toast.success('Admin details updated')
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update admin");
    } finally{
      setSaving(false)
    }
  }

  const handleToggleActive = async(admin: IUser) => {
     const next = !admin.is_verified; // changes it to false or true
     setBusyId(admin.id);
     try {
        await updateAdminStatus(admin.id, next);
        toast.success(`${admin.username} is now ${next ? "active" : "inactive"}`);
     } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to update the status')
     }finally {
      setBusyId(null);
      setSaving(false)
     }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      await addUsers(form); // the request is not being sent to the user route - error adding the user because of the admin email differes
      toast.success(`User registered successfully`);
      // navigate(isSystemAdmin ? "/system/admin/dashboard" : "/admin/dashboard", {
      //   replace: true,
      // });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to register admin");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUsersById(deleteTarget.id);
      toast.success(`${deleteTarget.username} was removed`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete admin");
    } finally {
      setDeleting(false);
    }
};

  return (
    <div className="space-y-8 pb-12">
      <div>
        <Link
          to={isSystemAdmin ? "/system/admin/dashboard" : "/admin/dashboard"}
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-2"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <UserPlus className="text-indigo-600 dark:text-indigo-400" size={28} />
          {isSystemAdmin ? "Register Main Admin" : "Register Admin"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {isSystemAdmin
            ? "Create a main admin account for an institution."
            : "Add a new administrator to your institution."}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-3xl">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-600" />
            Admin Details
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              required
              className="w-full px-4 py-3 rounded-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name.admin@short-code.ac.ke"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Role
              </label>
              <input
                type="text"
                value={form.role}
                readOnly
                className="w-full px-4 py-3 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full px-4 pr-12 py-3 rounded-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  required
                  className="w-full px-4 rounded-sm pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  aria-label={
                    showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                  }
                  aria-pressed={showConfirmPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {isSystemAdmin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Institution Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  name="institution_name"
                  value={form.institution_name}
                  onChange={handleChange}
                  placeholder="Enter institution Name"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold transition-colors text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Register Admin
                </>
              )}
            </button>
            <Link
              to={isSystemAdmin ? "/system/admin/dashboard" : "/admin/dashboard"}
              className="px-5 py-3 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors text-sm">
              Cancel
            </Link>
          </div>
        </form>
      </div>

      <section
        aria-label={isSystemAdmin ? "Main administrator accounts" : "Administrator accounts"}
        className="overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Users size={18} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isSystemAdmin ? "Main Admins" : " Manage Administrators"}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {adminAccounts.length} account{adminAccounts.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        {usersLoading ? (
          <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 size={18} className="animate-spin text-indigo-600 dark:text-indigo-400" />
            Loading administrator accounts...
          </div>
        ) : adminAccounts.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="mx-auto mb-3 text-slate-400" size={28} />
            <p className="font-semibold text-slate-900 dark:text-white">No admin accounts yet</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Registered administrators will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    User
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Email
                  </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Institution
                    </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {adminAccounts.map((admin) => (
                  <tr
                    key={admin.id}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-indigo-100 text-sm font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                          {admin.username?.[0]?.toUpperCase() || "?"}
                        </div>

                        <span className="font-medium text-slate-900 dark:text-white">
                      {admin.username}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-2">
                        <Mail size={14} className="shrink-0 text-slate-400" />
                        {admin.email}
                      </span>
                    </td>  

                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        {admin.institution_name || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <span
                            className={`inline-flex border px-2.5 py-1 text-xs font-semibold ${
                              admin.is_verified
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                            }`}
                          >
                            {admin.is_verified ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-nowrap items-center justify-end gap-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => startEditing(admin)}
                            disabled={busyId === admin.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                          >
                            <Edit2 size={14} /> Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleToggleActive(admin)}
                            disabled={busyId === admin.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                              admin.is_verified
                                ? "text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
                                : "text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                            }`}
                          >
                          {busyId === admin.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Power size={14} />
                          )}
                            {admin.is_verified ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(admin)}
                            disabled={busyId === admin.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
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

        {editingAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-admin-title"
              className="w-full max-w-md border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <h2 id="edit-admin-title" className="text-lg font-bold text-slate-900 dark:text-white">Edit Admin</h2>
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  aria-label="Close edit dialog"
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label htmlFor="edit-username" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                  <input
                    id="edit-username"
                    required
                    value={editForm.username}
                    readOnly
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 px-3.5 py-2.5 rounded-md text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="edit-email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <input
                    id="edit-email"
                    type="email"
                    required
                    readOnly
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50 px-3.5 py-2.5 rounded-md text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="edit-role" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                  <select
                    id="edit-role"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                    className="w-full border border-slate-200 bg-slate-50 px-3.5 rounded-md py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="main_admin">Main Admin</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingAdmin(null)}
                    disabled={saving}
                    className="border border-slate-200 px-4 py-2 text-sm rounded-md font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-indigo-600 px-4 py-2 text-sm rounded-md font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
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
              <div className="space-y-1 p-5">
                <p className="font-semibold text-slate-900 dark:text-white">{deleteTarget.username}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{deleteTarget.email}</p>
                <p className="pt-2 text-sm text-slate-600 dark:text-slate-300">
                  This permanently removes the account. Continue only if you are sure.
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
                  onClick={() => void handleDelete()}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  {deleting ? "Deleting..." : "Delete Admin"}
                </button>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}