import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Building2,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Loader2,
  Share2,
  ShieldCheck,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { fetchCertificatePdf, saveBlob } from "../../services/certificatePdf";
import CertificateArtwork from "../../components/layout/CertificateArtwork";

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
  blockchain_tx_hash: string | null;
  status: "issued" | "revoked";
  issued_at: string;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

const pdfFileName = (certificate: Certificate) =>
  `certificate-${certificate.certificate_number.replace(/[^A-Za-z0-9._-]/g, "_")}.pdf`;

const pdfButtonClass =
  "inline-flex items-center gap-2 border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800";

export default function MyCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<{ id: number; action: "view" | "download" } | null>(null);
  const [pdfView, setPdfView] = useState<{ url: string; certificate: Certificate } | null>(null);

  useEffect(() => {
    const fetchMyCertificates = async () => {
      try {
        setLoading(true);
        const response = await api.get("/certificate/my", { withCredentials: true });
        setCertificates(Array.isArray(response.data) ? response.data : []);
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to load certificates");
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };
    void fetchMyCertificates();
  }, []);

  useEffect(() => {
    if (!pdfView) return;
    return () => URL.revokeObjectURL(pdfView.url);
  }, [pdfView]);

  const closePdf = useCallback(() => setPdfView(null), []);

  const handleView = async (certificate: Certificate) => {
    setBusy({ id: certificate.id, action: "view" });
    try {
      const blob = await fetchCertificatePdf(certificate.id);
      setPdfView({ url: URL.createObjectURL(blob), certificate });
    } catch (error: any) {
      toast.error(error.message || "Could not open the PDF");
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = async (certificate: Certificate) => {
    setBusy({ id: certificate.id, action: "download" });
    try {
      const blob = await fetchCertificatePdf(certificate.id);
      saveBlob(blob, pdfFileName(certificate));
    } catch (error: any) {
      toast.error(error.message || "Could not download the PDF");
    } finally {
      setBusy(null);
    }
  };

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
           <Award size={22} />
          <span className="text-sm font-semibold">Academic credentials</span>
           </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Certificates</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Your academic credentials, secured and verifiable on the blockchain.
          </p>
        </div>
      </header>

      {loading ? (
        <div className="border border-slate-200 bg-white p-14 text-center dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="mx-auto animate-spin text-indigo-600" size={30} />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading your certificates...</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="border border-slate-200 bg-white p-14 text-center dark:border-slate-800 dark:bg-slate-900">
          <span className="mx-auto flex h-14 w-14 items-center justify-center bg-indigo-50 text-indigo-500 dark:bg-indigo-950/40">
            <Award size={26} />
          </span>
          <h2 className="mt-4 font-semibold text-slate-900 dark:text-white">No certificates found</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Certificates issued to your account will appear here.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {certificates.map((certificate) => {
            const verifyUrl = `${origin}/verify?certId=${encodeURIComponent(certificate.certificate_number)}`;
            const isIssued = certificate.status === "issued";
            const isBusy = busy?.id === certificate.id;

            return (
              <article
                key={certificate.id}
                className="overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                {!isIssued && (
                  <div className="flex items-center gap-3 border-b border-red-200 bg-red-50/80 px-5 py-3 dark:border-red-900 dark:bg-red-950/30">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300">
                      <XCircle size={20} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-red-800 dark:text-red-300">Certificate revoked</p>
                      <p className="text-xs text-red-700 dark:text-red-400">This credential is no longer valid.</p>
                    </div>
                  </div>
                )}

                <div className="grid gap-6 p-5 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)] lg:p-6">
                  <div className="mx-auto w-full max-w-xs min-w-0">
                    <CertificateArtwork certificate={certificate} />
                    <p className="mt-2 inline-flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                      <GraduationCap size={13} /> Academic certificate
                    </p>
                  </div>

                  <div className="flex min-w-0 flex-col">
                    <div>
                      <h2 className="text-xl font-bold leading-snug text-slate-900 dark:text-white">{certificate.course}</h2>
                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Building2 size={16} className="shrink-0 text-indigo-500" />
                        {certificate.institution_name}
                      </p>
                    </div>

                    <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 border-y border-slate-200 py-4 text-sm dark:border-slate-800">
                      <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">Awarded to</dt>
                        <dd className="mt-1 font-medium text-slate-900 dark:text-white">{certificate.student_name}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">Graduation date</dt>
                        <dd className="mt-1 font-medium text-slate-900 dark:text-white">{formatDate(certificate.graduation_date)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">Certificate ID</dt>
                        <dd className="mt-1 break-all font-mono text-xs font-medium text-slate-900 dark:text-white">{certificate.certificate_number}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500 dark:text-slate-400">Degree</dt>
                        <dd className="mt-1 font-medium text-slate-900 dark:text-white">{certificate.degree}</dd>
                      </div>
                    </dl>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        to={`/verify?certId=${encodeURIComponent(certificate.certificate_number)}`}
                        className="inline-flex items-center gap-2 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                      >
                        <ShieldCheck size={17} /> Verify certificate
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(verifyUrl);
                            toast.success("Verification link copied");
                          } catch {
                            toast.error("Could not copy the verification link");
                          }
                        }}
                        className="inline-flex items-center gap-2 border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-950/40"
                      >
                        <Share2 size={17} /> Share link
                      </button>

                      {isIssued && (
                        <>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleView(certificate)}
                            className={pdfButtonClass}
                          >
                            {isBusy && busy?.action === "view" ? (
                              <Loader2 size={17} className="animate-spin" />
                            ) : (
                              <Eye size={17} />
                            )}
                            View PDF
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleDownload(certificate)}
                            className={pdfButtonClass}
                          >
                            {isBusy && busy?.action === "download" ? (
                              <Loader2 size={17} className="animate-spin" />
                            ) : (
                              <Download size={17} />
                            )}
                            Download PDF
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <section className="border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 px-5 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <ShieldCheck size={18} className="text-indigo-500" />
                    Credential security
                  </div>
                  <div className="grid gap-4 border-t border-slate-200 px-5 py-4 text-sm dark:border-slate-800 sm:grid-cols-3">
                    <SecurityItem icon={ShieldCheck} title="On-chain record" description="Stored on the blockchain for permanent verification." />
                    <SecurityItem icon={FileText} title="Tamper-evident fingerprint" description="A cryptographic hash helps confirm the credential's integrity." />
                    <div className="flex items-center gap-3">
                      <QRCodeSVG value={verifyUrl} size={64} level="M" includeMargin className="shrink-0 border border-slate-200 bg-white p-1 dark:border-slate-700" />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">Shareable verification</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Scan the QR code or share the link to verify this certificate.</p>
                      </div>
                    </div>
                  </div>
                </section>
              </article>
            );
          })}
        </div>
      )}

      {pdfView && (
        <PdfModal
          url={pdfView.url}
          title={pdfView.certificate.certificate_number}
          downloading={busy?.id === pdfView.certificate.id && busy.action === "download"}
          onDownload={() => void handleDownload(pdfView.certificate)}
          onClose={closePdf}
        />
      )}
    </div>
  );
}

function PdfModal({
  url,
  title,
  downloading,
  onDownload,
  onClose,
}: {
  url: string;
  title: string;
  downloading: boolean;
  onDownload: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Certificate ${title}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <p className="min-w-0 truncate font-mono text-xs font-medium text-slate-700 dark:text-slate-200">{title}</p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Download
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <iframe src={url} title={`Certificate ${title}`} className="min-h-0 w-full flex-1 bg-slate-100" />
      </div>
    </div>
  );
}

function SecurityItem({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
        <Icon size={19} />
      </span>
      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}