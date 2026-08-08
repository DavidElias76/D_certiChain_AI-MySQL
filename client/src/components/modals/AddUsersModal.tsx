import { createPortal } from "react-dom";
import { X, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import useUsers from "../../context/UsersContext";

export type UserRole = 'admin' | "student" | "employer";

export type IUser = {
  id?: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  institutionName?: string;
  wallet_address?: string;
  isVerified?: boolean;
};

export type AddUserData = {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  institutionName?: string;
  wallet_address?: string;
};

interface UsersModalProps {
  showAddModal: boolean;
  user?: IUser | null;
  setShowAddModal: () => void;
}

export default function UsersModal({ showAddModal, user, setShowAddModal }: UsersModalProps) {
  const isEditing = !!user;
  const { addUsers, updateUsersById, loading } = useUsers();

  const [userData, setUserData] = useState<AddUserData>({
    username: "",
    email: "",
    password: "",
    role: "student",
    institutionName: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (user && isEditing) {
      setUserData({
        username: user.username || "",
        email: user.email || "",
        password: "",                    
        role: user.role || "student",
        institutionName: user.institutionName || "",
      });
    } else {
      setUserData({
        username: "",
        email: "",
        password: "",
        role: "student",
        institutionName: "",
      });
    }
    setConfirmPassword("");
    setError("");
  }, [user, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!userData.username || !userData.email || !userData.role) {
      setError("Please fill in all required fields.");
      return;
    }

    // Password validation (only when password is provided)
    if (userData.password || !isEditing) {
      if (userData.password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (userData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
    }

    try {
      if (isEditing && user?.id) {
        await updateUsersById(user.id, userData);
      } else {
        await addUsers(userData);
      }
      setShowAddModal();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save user");
    }
  };

  if (!showAddModal) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-slate-900">
            {isEditing ? "Edit User" : "Add New User"}
          </h2>
          <button onClick={setShowAddModal} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-4 border border-red-200 bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userData.username}
                  onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 focus:outline-none focus:border-slate-400"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 focus:outline-none focus:border-slate-400"
                  placeholder="student.number@students.kca.ac.ke"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Role</label>
                <select
                  required
                  value={userData.role}
                  onChange={(e) => setUserData({ ...userData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-3 border border-slate-200 focus:outline-none focus:border-slate-400"
                >
                  <option value="">Select Role</option>
                  <option value="student">Student</option>
                  <option value="employer">Employer / Verifier</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {(userData.role === "student" || userData.role === "admin") && (
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Institution Name</label>
                  <input
                    type="text"
                    required
                    value={userData.institutionName}
                    onChange={(e) => setUserData({ ...userData, institutionName: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 focus:outline-none focus:border-slate-400"
                    placeholder="KCA University"
                  />
                </div>
              )}

              {/* Password Fields - Always visible */}
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  {isEditing ? "New Password (leave blank to keep current)" : "Password"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={userData.password}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 focus:outline-none focus:border-slate-400 pr-12"
                    placeholder={isEditing ? "Enter new password" : "Minimum 6 characters"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 focus:outline-none focus:border-slate-400 pr-12"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-8">
            <button
              type="button"
              onClick={setShowAddModal}
              className="flex-1 py-3 border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-70 transition-colors"
            >
              {loading ? "Saving..." : isEditing ? "Update User" : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}