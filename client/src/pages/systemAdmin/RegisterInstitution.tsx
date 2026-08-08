import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Building2,
  Wallet,
  Globe,
  Hash,
  FileText,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";

type InstitutionForm = {
  name: string;
  shortCode: string;
  domain: string;
  walletAddress: string;
  description: string;
};

export default function RegisterInstitution() {
  const navigate = useNavigate();
  const [form, setForm] = useState<InstitutionForm>({
    name: "",
    shortCode: "",
    domain: "",
    walletAddress: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/institution/add", form, { withCredentials: true });
      toast.success(`${form.name} has been registered successfully`);
      navigate("/system/admin/dashboard", { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to register institution");
    } finally {
      setLoading(false);
    }
  };

  const isValid =
    form.name.trim() &&
    form.shortCode.trim() &&
    form.domain.trim() &&
    form.walletAddress.trim() &&
    /^0x[a-fA-F0-9]{40}$/.test(form.walletAddress);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/system/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-2"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Building2 className="text-indigo-600 dark:text-indigo-400" size={28} />
            Register New Institution
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Add a university or organization to the CertiChain AI platform. They will be able to issue
            and manage certificates on-chain.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-3xl">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-600" /> Institution Details
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Institution Name */}
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
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. KCA University"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Short Code + Domain — side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Short Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  name="shortCode"
                  value={form.shortCode}
                  onChange={handleChange}
                  placeholder="e.g. KCAU"
                  maxLength={10}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all uppercase"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Used in certificate numbers. 2–10 uppercase alphanumeric chars.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Domain <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Globe
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  name="domain"
                  value={form.domain}
                  onChange={handleChange}
                  placeholder="e.g. kcau.ac.ke"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Used to auto-assign students by email domain.</p>
            </div>
          </div>

          {/* Wallet Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Issuing Wallet Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Wallet
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                name="walletAddress"
                value={form.walletAddress}
                onChange={handleChange}
                placeholder="0x..."
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ethereum address authorized to issue certificates on-chain. Must be a valid{" "}
              <span className="font-mono">0x...</span> address.
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <div className="relative">
              <FileText
                size={18}
                className="absolute left-3.5 top-3 text-slate-400"
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Brief description, motto, or vision of the institution..."
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center gap-4">
            <button
              type="submit"
              disabled={loading || !isValid}
              className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold transition-colors text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Building2 size={16} />
                  Register Institution
                </>
              )}
            </button>
            <Link
              to="/system/admin/dashboard"
              className="px-5 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors text-sm"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
