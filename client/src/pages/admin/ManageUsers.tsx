import { useState } from "react";
import { Plus, Search, Edit2, Trash2, ShieldCheck, AlertCircle } from "lucide-react";
import useUsers from "../../context/UsersContext";
import toast from "react-hot-toast";
import UsersModal from "../../components/modals/AddUsersModal";

export default function ManageUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const { users, deleteUsersById } = useUsers();

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowAddModal(true);
  };

  const handleDeleteUser = async (user: any) => {
    if (!window.confirm(`Are you sure you want to delete ${user.username}?`)) return;
    
    try {
      await deleteUsersById(user._id);
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Manage Users</h1>
          <p className="text-slate-600 text-sm mt-1">View and manage all registered users</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-500 transition-colors"
        >
          <Plus size={18} />
          Add New User
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500">NAME</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500">EMAIL</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500">ROLE</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500">INSTITUTION</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-500">STATUS</th>
              <th className="px-6 py-4 text-center text-xs font-medium text-slate-500">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{user.username}</td>
                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{user.institutionName || "—"}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {user.isVerified ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                    {user.isVerified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-6">
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium"
                    >
                      <Edit2 size={18} />
                      <span>Edit</span>
                    </button>

                    <button 
                      onClick={() => handleDeleteUser(user)}
                      className="flex items-center gap-1.5 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium"
                    >
                      <Trash2 size={18} />
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UsersModal 
        showAddModal={showAddModal}
        user={editingUser}
        setShowAddModal={closeModal}
      />
    </div>
  );
}