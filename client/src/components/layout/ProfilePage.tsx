import { useState } from "react";
import { Building2, LockKeyhole, Mail, ShieldCheck, UserRound, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const updatePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Your new password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("The new passwords do not match");
      return;
    }

    try {
      setSaving(true);
      const response = await api.post(
        "/auth/change-password",
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      toast.success(response.data.message || "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = user?.role
    ?.replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Account</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          View your account details and keep your password up to date.
        </p>
      </div>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4 p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
            <span className="text-xl font-semibold">{user?.username?.[0]?.toUpperCase() || "?"}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{user?.username || "User"}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{roleLabel || "Account"}</p>
          </div>
        </div>

        <dl className="grid gap-px bg-slate-200 dark:bg-slate-800 sm:grid-cols-2">
          <div className="flex items-start gap-3 bg-white dark:bg-slate-900 p-5">
            <UserRound size={18} className="mt-0.5 text-indigo-500 shrink-0" />
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Username</dt>
              <dd className="mt-1 wrap-break-word text-sm text-slate-900 dark:text-white">{user?.username || "Not available"}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white dark:bg-slate-900 p-5">
            <Mail size={18} className="mt-0.5 text-indigo-500 shrink-0" />
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</dt>
              <dd className="mt-1 wrap-break-word text-sm text-slate-900 dark:text-white">{user?.email || "Not available"}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white dark:bg-slate-900 p-5">
            <ShieldCheck size={18} className="mt-0.5 text-indigo-500 shrink-0" />
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Role</dt>
              <dd className="mt-1 text-sm text-slate-900 dark:text-white">{roleLabel || "Not available"}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white dark:bg-slate-900 p-5">
            <Building2 size={18} className="mt-0.5 text-indigo-500 shrink-0" />
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Institution</dt>
              <dd className="mt-1 wrap-break-word text-sm text-slate-900 dark:text-white">{user?.institution_name || "Not available"}</dd>
            </div>
          </div>
        </dl>
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
            <LockKeyhole size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Change password</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter your current password and choose a new one.</p>
          </div>
        </div>

        <form onSubmit={updatePassword} className="space-y-5 p-6">
          <div>
            <label htmlFor="current-password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Current password
            </label>
            <div className="relative">
              <input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full border rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                aria-pressed={showCurrentPassword}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 rounded-md"
              >
                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                New password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full border rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                  aria-pressed={showNewPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  aria-pressed={showConfirmPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
