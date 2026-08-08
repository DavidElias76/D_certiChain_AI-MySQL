import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Calendar,
  GraduationCap,
  Hash,
  Eye,
  Building2,
  AlertCircle,
  Filter,
  Download,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

interface Certificate {
  id: number;
  student_name: string;
  registration_number: string;
  student_email: string;
  institution_name: string;
  course: string;
  degree: string;
  graduation_date: string;
  gpa: string | null;
  classification: string | null;
  certificate_number: string;
  certificate_hash: string;
  status: "issued" | "revoked";
  issued_at: string;
  revoked_at: string | null;
  revocation_reason: string | null;
}

type StatusFilter = "all" | "active" | "revoked";

export default function MyCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Certificate | null>(null);

  useEffect(() => {
    const fetchMyCertificates = async () => {
      try {
        setLoading(true);
        const response = await api.get("/certificate/my", { withCredentials: true });
        setCertificates(response.data || []);
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Failed to load certificates");
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCertificates();
  }, []);

  // Stats
  const stats = useMemo(() => {
    return {
      total: certificates.length,
      active: certificates.filter((c) => c.status === "issued").length,
      revoked: certificates.filter((c) => c.status === "revoked").length,
    };
  }, [certificates]);

  // Filter
  const filtered = useMemo(() => {
    return certificates.filter((cert) => {
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && cert.status === "issued") ||
        (statusFilter === "revoked" && cert.status === "revoked");

      const term = search.toLowerCase().trim();
      const matchSearch =
        !term ||
        cert.course.toLowerCase().includes(term) ||
        cert.certificate_number.toLowerCase().includes(term) ||
        cert.institution_name.toLowerCase().includes(term) ||
        cert.registration_number.toLowerCase().includes(term);

      return matchStatus && matchSearch;
    });
  }, [certificates, search, statusFilter]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Award className="text-indigo-600 dark:text-indigo-400" size={28} />
          My Certificates
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          All your academic credentials, secured on the blockchain and verified.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40">
              <Award className="text-indigo-600 dark:text-indigo-400" size={20} />
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
              <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Active</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40">
              <XCircle className="text-red-600 dark:text-red-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Revoked</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.revoked}</p>
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
              placeholder="Search by program, certificate ID, institution, or registration number..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="relative">
            <Filter size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="revoked">Revoked Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            Certificates ({filtered.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin text-indigo-600 mx-auto" size={32} />
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-3">Loading your certificates...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Award className="text-slate-400" size={28} />
            </div>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-1">No certificates found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filter."
                : "Certificates issued by your institution will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Program</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Certificate ID</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Institution</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Issued</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((cert) => (
                  <tr
                    key={cert.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                          <GraduationCap size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">{cert.course}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{cert.degree}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{cert.certificate_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Building2 size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{cert.institution_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 text-sm">
                      {formatDate(cert.issued_at)}
                    </td>
                    <td className="px-6 py-4">
                      {cert.status === "issued" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/50">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-800/50">
                          <XCircle size={12} /> Revoked
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelected(cert)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                        >
                          <Eye size={14} /> View
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

      {/* View Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="text-indigo-600" size={22} /> Certificate Details
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Status Banner */}
              <div className={`p-4 border ${
                selected.status === "issued"
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50"
                  : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50"
              }`}>
                <div className="flex items-center gap-2">
                  {selected.status === "issued" ? (
                    <>
                      <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={18} />
                      <span className="text-emerald-900 dark:text-emerald-300 font-semibold text-sm">
                        This certificate is verified and active on the blockchain.
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-600 dark:text-red-400" size={18} />
                      <span className="text-red-900 dark:text-red-300 font-semibold text-sm">
                        This certificate has been revoked by the issuing institution.
                      </span>
                    </>
                  )}
                </div>
              </div>

              <DetailRow icon={GraduationCap} label="Program" value={selected.course} subValue={selected.degree} />
              <DetailRow icon={Hash} label="Registration Number" value={selected.registration_number} mono />
              <div className="grid grid-cols-2 gap-4">
                <DetailRow icon={Calendar} label="Graduation Date" value={formatDate(selected.graduation_date)} />
                <DetailRow icon={Hash} label="Classification" value={selected.classification || "—"} />
              </div>
              <DetailRow icon={Building2} label="Institution" value={selected.institution_name} />
              <DetailRow icon={Hash} label="Certificate ID" value={selected.certificate_number} mono />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1.5">On-Chain Hash</p>
                <p className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all bg-slate-50 dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700">
                  {selected.certificate_hash}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DetailRow icon={Calendar} label="Issued On" value={formatDate(selected.issued_at)} />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1.5">Status</p>
                  {selected.status === "issued" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/50">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-800/50">
                      <XCircle size={12} /> Revoked
                    </span>
                  )}
                </div>
              </div>

              {selected.status === "revoked" && selected.revocation_reason && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 p-3">
                  <p className="text-xs text-red-700 dark:text-red-400 font-semibold mb-1 flex items-center gap-1.5">
                    <AlertCircle size={12} /> Revocation Reason
                  </p>
                  <p className="text-sm text-red-900 dark:text-red-200">{selected.revocation_reason}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelected(null)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Detail Row Helper
function DetailRow({
  icon: Icon,
  label,
  value,
  subValue,
  mono,
}: {
  icon: any;
  label: string;
  value: string;
  subValue?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <Icon size={12} /> {label}
      </p>
      <p className={`text-slate-900 dark:text-white ${mono ? "font-mono text-sm" : "font-semibold"}`}>{value}</p>
      {subValue && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subValue}</p>}
    </div>
  );
}
