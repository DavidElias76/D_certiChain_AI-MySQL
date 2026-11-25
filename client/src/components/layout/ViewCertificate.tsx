import { X, CheckCircle2, XCircle } from "lucide-react";
import CertificateArtwork from "./CertificateArtwork"

interface ViewCertificateProps {
  certificate: {
    student_name: string;
    institution_name: string;
    course: string;
    degree: string;
    graduation_date: string;
    certificate_number: string;
    status: "issued" | "revoked";
    revocation_reason: string | null;
  };
  onClose: () => void;
}

export default function ViewCertificate({ certificate, onClose }: ViewCertificateProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Certificate</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <CertificateArtwork certificate={certificate} />

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Status:</span>
            {certificate.status === "issued" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/50">
                <CheckCircle2 size={12} /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-800/50">
                <XCircle size={12} /> Revoked
              </span>
            )}
          </div>

          {certificate.status === "revoked" && certificate.revocation_reason && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 p-3">
              <p className="text-xs text-red-700 dark:text-red-400 font-semibold mb-1">Revocation Reason</p>
              <p className="text-sm text-red-900 dark:text-red-200">{certificate.revocation_reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}