import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Search,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  AlertCircle,
  ArrowLeft,
  Filter,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import ViewCertificate from "../../components/layout/ViewCertificate";

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

  const [deleteTarget, setDeleteTarget] = useState<Certificate | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);

        const response = await api.get("/certificate/", {
          withCredentials: true,
        });

        setCertificates(response.data || []);
      } catch (err: any) {
        toast.error(
          err.response?.data?.error || "Failed to load certificates"
        );
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

  const filtered = useMemo(() => {
    return certificates.filter((cert) => {
      const matchStatus =
        statusFilter === "all" || cert.status === statusFilter;

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

      toast.success(
        `Certificate ${revokeTarget.certificate_number} revoked`
      );

      setCertificates((prev) =>
        prev.map((c) =>
          c.id === revokeTarget.id
            ? {
                ...c,
                status: "revoked",
                revoked_at: new Date().toISOString(),
                revocation_reason: revokeReason,
              }
            : c
        )
      );

      setRevokeTarget(null);
      setRevokeReason("");
    } catch (err: any) {
      toast.error(
        err.response?.data?.error || "Failed to revoke certificate"
      );
    } finally {
      setRevoking(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      await api.delete(`/certificate/${deleteTarget.id}/permanent`, {
        withCredentials: true,
      });

      toast.success(
        `Certificate ${deleteTarget.certificate_number} deleted`
      );

      setCertificates((prev) =>
        prev.filter((c) => c.id !== deleteTarget.id)
      );

      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(
        err.response?.data?.error || "Failed to delete certificate"
      );
    } finally {
      setDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-2"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <ShieldCheck
              className="text-indigo-600 dark:text-indigo-400"
              size={28}
            />
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
          <FileText size={16} />
          Issue New Certificate
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40">
              <FileText
                className="text-indigo-600 dark:text-indigo-400"
                size={20}
              />
            </div>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                Total
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        {/* Active */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40">
              <CheckCircle2
                className="text-emerald-600 dark:text-emerald-400"
                size={20}
              />
            </div>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                Active
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.issued}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40">
              <XCircle
                className="text-red-600 dark:text-red-400"
                size={20}
              />
            </div>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                Revoked
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.revoked}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, registration number, email, or certificate ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="relative">
            <Filter
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="pl-10 pr-8 py-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="issued">Active Only</option>
              <option value="revoked">Revoked Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            Certificates ({filtered.length})
          </h2>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="p-12 text-center">
            <Loader2
              className="animate-spin text-indigo-600 mx-auto"
              size={32}
            />
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-3">
              Loading certificates...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-slate-400" size={28} />
            </div>

            <h3 className="text-slate-900 dark:text-white font-semibold mb-1">
              No certificates found
            </h3>

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
                <FileText size={16} />
                Issue First Certificate
              </Link>
            )}
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Student
                  </th>

                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Certificate ID
                  </th>

                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Program
                  </th>

                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Issued
                  </th>

                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>

                  <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((cert) => (
                  <tr
                    key={cert.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Student */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm shrink-0">
                          {cert.student_name?.[0]?.toUpperCase() || "?"}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {cert.student_name}
                          </p>

                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">
                            {cert.registration_number}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                        {cert.certificate_number}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-slate-700 dark:text-slate-300 truncate max-w-55">
                        {cert.course}
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {cert.degree}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 text-sm">
                      {formatDate(cert.issued_at)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold ${
                          cert.status === "issued"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                        }`}
                      >
                      {cert.status === "issued" ? (
                          <CheckCircle2 size={14} />
                      ) : (
                          <XCircle size={14} />
                      )}

                        {cert.status === "issued" ? "Issued" : "Revoked"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelected(cert)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                        >
                          <Eye size={14} />
                          View
                        </button>

                        {cert.status === "issued" && (
                          <button
                            onClick={() => setRevokeTarget(cert)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          >
                            <XCircle size={14} />
                            Revoke
                          </button>
                        )}

                        {cert.status === "revoked" && (
                          <button
                            onClick={() => setDeleteTarget(cert)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          >
                            <Trash2 size={14} />
                            Delete
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

      {selected && (
        <ViewCertificate
          certificate={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {revokeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center rounded-md bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                <AlertCircle
                  className="text-red-600 dark:text-red-400"
                  size={22}
                />
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Revoke Certificate
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Certificate
                </p>

                <p className="font-mono text-sm text-slate-900 dark:text-white font-semibold">
                  {revokeTarget.certificate_number}
                </p>

                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                  {revokeTarget.student_name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Reason for Revocation{" "}
                  <span className="text-red-500">*</span>
                </label>

                <textarea
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Issued in error, fraud detected, etc."
                  className="w-full px-4 py-3 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none"
                />
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                This action cannot be undone. The certificate will be marked as
                revoked and will fail any future verification.
              </p>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setRevokeTarget(null);
                  setRevokeReason("");
                }}
                disabled={revoking}
                className="px-5 py-2.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleRevoke}
                disabled={revoking || !revokeReason.trim()}
                className="px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-semibold transition-colors text-sm flex items-center gap-2"
              >
                {revoking ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Revoking...
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    Revoke Certificate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                <Trash2
                  className="text-red-600 dark:text-red-400"
                  size={20}
                />
              </div>

              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Delete Certificate
              </h2>
            </div>

            <div className="p-6 space-y-3">
              <p className="font-mono text-sm text-slate-900 dark:text-white font-semibold">
                {deleteTarget.certificate_number}
              </p>

              <p className="text-sm text-slate-700 dark:text-slate-300">
                {deleteTarget.student_name}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                This permanently removes the certificate from your records. This
                cannot be undone.
              </p>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-5 py-2.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors text-sm disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-md bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-semibold transition-colors text-sm flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
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
