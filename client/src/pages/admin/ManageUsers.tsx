import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Mail,
  Building2,
  ArrowLeft,
  Filter,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import useUsers, { type IUser } from "../../context/UsersContext";
import UsersModal, {
  type IUser as ModalUser,
  type UserRole as ModalUserRole,
} from "../../components/modals/AddUsersModal";
import useAuth from "../../context/AuthContext";
// const EDITABLE_ROLES: ModalUserRole[] = ["student", "employer", "admin"];

const toModalUser = (u: IUser): ModalUser => ({
  id: String(u.id),
  username: u.username,
  email: u.email,
  role: u.role as ModalUserRole,
  registration_number: u.registration_number ?? null,
  institution_name: u.institution_name ?? undefined,
  isVerified: u.is_verified,
});

type UserRole = "admin" | "student" | "employer" | "systemAdmin";
type StatusFilter = "all" | "active" | "pending";

export default function ManageUsers() {
  const { users, loading, deleteUsersById } = useUsers();
  const { user } = useAuth()
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const main_admin = user?.role === "main_admin";

  const onUserAdded = async() => {
    toast.success('User added sucessfully')
  };

  const onUserEdited = async() => {
    toast.success('user updated successfully')
  }

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => user.role === (main_admin ? "student" : "admin"))
      .sort((a, b) => a.username.localeCompare(b.username))
  }, [users, main_admin])

  // Stats
  const stats = useMemo(() => {
    return {
      total: users.length,
      verified: users.filter((u) => u.is_verified).length,
      pending: users.filter((u) => !u.is_verified).length,
    };
  }, [users]);

  // Filter
  const filtered = useMemo(() => {
    return users.filter((user) => {
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.is_verified) ||
        (statusFilter === "pending" && !user.is_verified);

      const matchRole = roleFilter === "all" || user.role === roleFilter;

      const term = search.toLowerCase().trim();
      const matchSearch =
        !term ||
        (user.username || "").toLowerCase().includes(term) ||
        (user.email || "").toLowerCase().includes(term) ||
        (user.institution_name || "").toLowerCase().includes(term);

      return matchStatus && matchRole && matchSearch;
    });
  }, [users, search, statusFilter, roleFilter]);

  const handleEditUser = (user: IUser) => {
    setEditingUser(user);
    setShowAddModal(true);
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteUsersById(Number(deleteTarget.id));
      toast.success(`User ${deleteTarget.username} deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingUser(null);
  };

  const roleBadgeStyles: Record<UserRole, string> = {
    admin: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50",
    student: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50",
    employer: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50",
    systemAdmin: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50",
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-2"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="text-indigo-600 dark:text-indigo-400" size={28} />
            Manage Users
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Add, edit and remove users registered under your institution.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm transition-colors text-sm"
        >
          <Plus size={16} /> Add New User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40">
              <Users className="text-indigo-600 dark:text-indigo-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40">
              <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Verified</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.verified}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40">
              <AlertCircle className="text-amber-600 dark:text-amber-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by username, email, or institution..."
              className="w-full pl-10 pr-4 py-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="relative">
            <Filter size={18} className="absolute left-3.5 rounded-md top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
              className="pl-10 pr-8 py-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="admin">Admins</option>
              <option value="employer">Employers</option>
              <option value="systemAdmin">System Admins</option>
            </select>
          </div>
          <div className="relative">
            <Filter size={18} className="absolute left-3.5 rounded-md top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="pl-10 pr-8 py-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Verified Only</option>
              <option value="pending">Pending Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            Users ({filtered.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-indigo-600 mx-auto" size={32} />
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-3">Loading users...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Users className="text-slate-400" size={28} />
            </div>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-1">No users found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {search || statusFilter !== "all" || roleFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Get started by adding your first user."}
            </p>
            {!search && statusFilter === "all" && roleFilter === "all" && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
              >
                <Plus size={16} /> Add User
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registration Number</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Institution</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                {/* This dsisplays all the users i want to make the chnage and dispplay users based on the institution  */}
                
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm shrink-0">
                          {user.username?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">{user.username}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Mail size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-55">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold capitalize ${
                          roleBadgeStyles[user.role as UserRole] ||
                          "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                      <td className="px-6 py-4">
                        {user.registration_number ? (
                          <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                            {user.registration_number}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    <td className="px-6 py-4">
                      {user.institution_name ? (
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <Building2 size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-50">{user.institution_name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.is_verified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/50">
                          <ShieldCheck size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-200 dark:border-amber-800/50">
                          <AlertCircle size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
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
      </div>

      {/* Add/Edit User Modal */}
      <UsersModal
        showAddModal={showAddModal}
        user={editingUser ? toModalUser(editingUser) : null}
        authUser={user}
        setShowAddModal={closeModal}
        // filteredInstitutionUsers={filteredInstitutionUsers}
        onUserAdded={onUserAdded}
        onUserEdited={onUserEdited}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                <XCircle className="text-red-600 dark:text-red-400" size={22} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Delete User</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">User to delete</p>
                <p className="font-semibold text-slate-900 dark:text-white">{deleteTarget.username}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{deleteTarget.email}</p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                This will permanently remove the user from the system. Any certificates
                they issued will remain, but the user account will be deleted.
              </p>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleting}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-semibold transition-colors text-sm flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} /> Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
