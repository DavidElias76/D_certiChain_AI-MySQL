import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Search,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  GraduationCap,
  User,
  Hash,
  Eye,
  AlertCircle,
  ArrowLeft,
  Filter,
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

type StatusFilter = "all" | "issued" | "revoked";

export default function ManageCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Certificate | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Certificate | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [revoking, setRevoking] = useState(false);

  // Load certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const response = await api.get("/certificate/", { withCredentials: true });
        setCertificates(response.data || []);
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Failed to load certificates");
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  // Stats
  const stats = useMemo(() => {
    return {
      total: certificates.length,
      issued: certificates.filter((c) => c.status === "issued").length,
      revoked: certificates.filter((c) => c.status === "revoked").length,
    };
  }, [certificates]);

  // Filter
  const filtered = useMemo(() => {
    return certificates.filter((cert) => {
      const matchStatus = statusFilter === "all" || cert.status === statusFilter;
      const term = search.toLowerCase().trim();
      const matchSearch =
        !term ||
        cert.student_name.toLowerCase().includes(term) ||
        cert.registration_number.toLowerCase().includes(term) ||
        cert.student_email.toLowerCase().includes(term) ||
        cert.certificate_number.toLowerCase().includes(term) ||
        cert.course.toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  }, [certificates, search, statusFilter]);

  // Revoke
  const handleRevoke = async () => {
    if (!revokeTarget) return;
    if (!revokeReason.trim()) {
      toast.error("Revocation reason is required");
      return;
    }
    try {
      setRevoking(true);
      await api.delete(`/certificate/${revokeTarget.id}`, {
        data: { reason: revokeReason },
        withCredentials: true,
      });
      toast.success(`Certificate ${revokeTarget.certificate_number} revoked`);
      setCertificates((prev) =>
        prev.map((c) =>
          c.id === revokeTarget.id
            ? { ...c, status: "revoked", revoked_at: new Date().toISOString(), revocation_reason: revokeReason }
            : c
        )
      );
      setRevokeTarget(null);
      setRevokeReason("");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to revoke certificate");
    } finally {
      setRevoking(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-2"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <ShieldCheck className="text-indigo-600 dark:text-indigo-400" size={28} />
            Manage Certificates
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            View, search, and revoke certificates issued by your institution.
          </p>
        </div>
        <Link
          to="/admin/issue-certificates"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm transition-colors text-sm"
        >
          <FileText size={16} /> Issue New Certificate
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40">
              <FileText className="text-indigo-600 dark:text-indigo-400" size={20} />
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
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.issued}</p>
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
              placeholder="Search by student name, registration number, email, or certificate ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="relative">
            <Filter size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="pl-10 pr-8 py-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="issued">Active Only</option>
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
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-3">Loading certificates...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-slate-400" size={28} />
            </div>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-1">No certificates found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filter."
                : "Get started by issuing your first certificate."}
            </p>
            {!search && statusFilter === "all" && (
              <Link
                to="/admin/issue-certificates"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
              >
                <FileText size={16} /> Issue First Certificate
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Certificate ID</th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Program</th>
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
                        <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-950/40  flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm shrink-0">
                          {cert.student_name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">{cert.student_name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">{cert.registration_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{cert.certificate_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-700 dark:text-slate-300 truncate max-w-55">{cert.course}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{cert.degree}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 text-sm">
                      {formatDate(cert.issued_at)}
                    </td>
                    <td className="px-6 py-4">
                      {cert.status === "issued" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/50">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-800/50">
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
                        {cert.status === "issued" && (
                          <button
                            onClick={() => setRevokeTarget(cert)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          >
                            <XCircle size={14} /> Revoke
                          </button>
                        )}
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
              <DetailRow icon={User} label="Student" value={selected.student_name} subValue={selected.student_email} />
              <DetailRow icon={Hash} label="Registration Number" value={selected.registration_number} mono />
              <DetailRow icon={GraduationCap} label="Program" value={selected.course} subValue={selected.degree} />
              <div className="grid grid-cols-2 gap-4">
                <DetailRow icon={Calendar} label="Graduation Date" value={formatDate(selected.graduation_date)} />
                <DetailRow icon={Hash} label="Classification" value={selected.classification || "—"} />
              </div>
              <DetailRow icon={Hash} label="Certificate ID" value={selected.certificate_number} mono />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1.5">On-Chain Hash</p>
                <p className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all bg-slate-50 dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700">
                  {selected.certificate_hash}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status:</span>
                {selected.status === "issued" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/50">
                    <CheckCircle2 size={12} /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-800/50">
                    <XCircle size={12} /> Revoked
                  </span>
                )}
              </div>
              {selected.status === "revoked" && selected.revocation_reason && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 p-3">
                  <p className="text-xs text-red-700 dark:text-red-400 font-semibold mb-1">Revocation Reason</p>
                  <p className="text-sm text-red-900 dark:text-red-200">{selected.revocation_reason}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
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

      {/* Revoke Confirmation Modal */}
      {revokeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                <AlertCircle className="text-red-600 dark:text-red-400" size={22} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Revoke Certificate</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Certificate</p>
                <p className="font-mono text-sm text-slate-900 dark:text-white font-semibold">{revokeTarget.certificate_number}</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{revokeTarget.student_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Reason for Revocation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Issued in error, fraud detected, etc."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This action cannot be undone. The certificate will be marked as revoked and will fail any future verification.
              </p>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setRevokeTarget(null);
                  setRevokeReason("");
                }}
                disabled={revoking}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                disabled={revoking || !revokeReason.trim()}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-semibold transition-colors text-sm flex items-center gap-2"
              >
                {revoking ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Revoking...
                  </>
                ) : (
                  <>
                    <XCircle size={16} /> Revoke Certificate
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
