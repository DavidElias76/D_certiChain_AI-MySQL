import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Building2, Globe, Hash, FileText, ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
// import { useWallet } from "../../context/WalletContext";
import { useInstitution } from "../../context/InstitutionContext";

 type InstitutionForm = {
     name: string;
     short_code: string;
     domain: string;
     description: string;
   };

export default function RegisterInstitution() {
  const navigate = useNavigate();
  // const { account } = useWallet()
  const { registerInstitution, loading } = useInstitution()
  
  const [form, setForm] = useState<InstitutionForm>({
     name: "",
     short_code: "",
     domain: "",
     description: "",
   });

  // const [addWalletAddress] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerInstitution(form);
      toast.success(`${form.name} has been registered successfully`);
      navigate("/admin/register-admin", { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to register institution");
      throw err;
    }
  };

    const isValid =
     form.name.trim() &&
     /^[A-Za-z0-9]{2,10}$/.test(form.short_code.trim()) &&
     form.domain.trim();

  return (
    <div className="w-full space-y-6 pb-8">
      <section className="px-1 py-3">
        <div className="max-w-2xl">
          <Link
            to="/system/admin/dashboard"
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="mb-2 flex items-center gap-3">
            <Building2 className="text-indigo-600 dark:text-indigo-400" size={24} />
            <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Institution setup
            </p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Register New Institution
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Add a university or organization to the CertiChain AI platform. They will be able to issue
            and manage certificates on-chain.
          </p>
        </div>
      </section>

      {/* Form Card */}
      <section className="w-full border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <ShieldCheck size={18} className="text-indigo-600 dark:text-indigo-400" />
            Institution Details
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-8 rounded-md">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                className="w-full border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm rounded-md text-slate-900 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Short Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  name="short_code"
                  value={form.short_code}
                  onChange={handleChange}
                  placeholder="e.g. KCAU, USIU, KU, UON"
                  maxLength={10}
                  required
                  className="w-full border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 rounded-md text-sm uppercase text-slate-900 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Used in certificate numbers. 2–10 uppercase alphanumeric chars.</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                  className="w-full border border-slate-200 bg-slate-50 py-3 rounded-md pl-10 pr-4 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Used to auto-assign students by email domain.</p>
            </div>
          </div>

             <p className="border border-indigo-100 bg-indigo-50/70 px-4 py-3 text-sm leading-relaxed text-slate-600 dark:border-indigo-950 dark:bg-indigo-950/20 dark:text-slate-400">
              The blockchain wallet is not set here. After the institution's main admin signs in,
              they connect their wallet and register the institution on-chain themselves.
            </p>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                className="w-full resize-none border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 rounded-md text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
            <button
              type="submit"
              disabled={loading || !isValid}
              className="inline-flex items-center gap-2 bg-indigo-600 px-5 py-3 rounded-md text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-800 dark:focus-visible:ring-offset-slate-900"
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
              className="border border-slate-200 px-5 py-3 rounded-md text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
