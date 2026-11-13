import { useEffect, useState } from "react";
import { Link, useSearchParams, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  FileCheck2,
  Hash,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import CertificateArtwork from "../../components/layout/CertificateArtwork";

type Outcome = "verified" | "revoked" | "invalid";

interface VerifiedCertificate {
  student_name: string;
  registration_number?: string;   // only sent to the owner and the institution's staff
  institution_name: string;
  course: string;
  degree: string;
  graduation_date: string;        // "YYYY-MM-DD"
  gpa?: string | null;            // only sent to the owner and the institution's staff
  classification: string | null;
  certificate_number: string;
  certificate_hash: string;
  blockchain_tx_hash: string | null;
  status: "issued" | "revoked";
  issued_at: string;
  revoked_at: string | null;
}

interface VerificationResponse {
  verified: boolean;
  result: Outcome;
  certificate: VerifiedCertificate;
  blockchain: {
    valid: boolean;
    record: {
      issuer: string | null;
      issuedAt: number | null;
      revokedAt: number | null;
      revoked: boolean;
      exists: boolean;
    };
  };
}

// Tailwind needs full class names, so every tone is spelled out.
const OUTCOMES: Record<
  Outcome,
  {
    title: string;
    summary: string;
    detail: string;
    Icon: LucideIcon;
    PanelIcon: LucideIcon;
    bannerClass: string;
    iconWrapClass: string;
    headingClass: string;
    textClass: string;
    badgeClass: string;
    panelClass: string;
    panelIconClass: string;
  }
> = {
  verified: {
    title: "Certificate verified",
    summary: "This certificate is authentic and has been recorded on the blockchain.",
    detail: "The certificate details match the blockchain record and it has not been revoked.",
    Icon: CheckCircle2,
    PanelIcon: ShieldCheck,
    bannerClass: "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/30",
    iconWrapClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300",
    headingClass: "text-emerald-800 dark:text-emerald-300",
    textClass: "text-emerald-700 dark:text-emerald-400",
    badgeClass: "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300",
    panelClass: "border-emerald-100 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30",
    panelIconClass: "text-emerald-600 dark:text-emerald-300",
  },
  revoked: {
    title: "Certificate revoked",
    summary: "The issuing institution has revoked this certificate. It is no longer valid.",
    detail: "The blockchain record shows this certificate was revoked by the institution.",
    Icon: XCircle,
    PanelIcon: ShieldAlert,
    bannerClass: "border-red-200 bg-red-50/80 dark:border-red-900 dark:bg-red-950/30",
    iconWrapClass: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
    headingClass: "text-red-800 dark:text-red-300",
    textClass: "text-red-700 dark:text-red-400",
    badgeClass: "border-red-200 text-red-700 dark:border-red-800 dark:text-red-300",
    panelClass: "border-red-100 bg-red-50/70 dark:border-red-900 dark:bg-red-950/30",
    panelIconClass: "text-red-600 dark:text-red-300",
  },
  invalid: {
    title: "Certificate not verified",
    summary: "This certificate could not be confirmed on the blockchain.",
    detail: "No valid blockchain record was found for this certificate. Do not rely on it.",
    Icon: ShieldAlert,
    PanelIcon: ShieldAlert,
    bannerClass: "border-amber-200 bg-amber-50/80 dark:border-amber-900 dark:bg-amber-950/30",
    iconWrapClass: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300",
    headingClass: "text-amber-800 dark:text-amber-300",
    textClass: "text-amber-700 dark:text-amber-400",
    badgeClass: "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300",
    panelClass: "border-amber-100 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30",
    panelIconClass: "text-amber-600 dark:text-amber-300",
  },
};

// A moment in time (timestamps, unix seconds * 1000): local date.
const formatDate = (value: string | number) =>
  new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

// A calendar date ("YYYY-MM-DD"): UTC, so the day never shifts with the viewer's timezone.
const formatCalendarDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

export default function VerifyCertificates({ standalone = false }: { standalone?: boolean }) {
  const [searchParams] = useSearchParams();
  // `loading` is the auth context's "still restoring the session" flag.
  // If yours is named differently, rename it here.
    const { user, loading: authLoading } = useAuth();
  const certificateNumber = searchParams.get("certId") || "";
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [noCertificate, setNoCertificate] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isOwnerRole = user?.role === "student" || user?.role === "alumni";
  const redirectToDashboard =
    !authLoading && !!certificateNumber && (user?.role === "employer" || user?.role === "alumni");

  useEffect(() => {
    let active = true;

    const loadVerification = async () => {
      setResult(null);
      setNotFound(false);
      setNoCertificate(false);
      setErrorMessage("");

      // Wait until we know whether someone is logged in, so we verify once, as the right person.
      if (authLoading || redirectToDashboard) return;
      if (!certificateNumber && (!isOwnerRole || standalone)) return;

      setLoading(true);
      try {
        let idToVerify = certificateNumber;
        if (!idToVerify) {
          const certificatesResponse = await api.get("/certificate/my", { withCredentials: true });
          if (!active) return;
          const certificates = Array.isArray(certificatesResponse.data) ? certificatesResponse.data : [];
          if (certificates.length === 0) {
            setNoCertificate(true);
            return;
          }
          idToVerify = certificates[0].certificate_number;
        }

        const response = await api.get<VerificationResponse>(
          `/certificate/verify/${encodeURIComponent(idToVerify)}`,
          { withCredentials: true }
        );
        if (active) setResult(response.data);
      } catch (error: any) {
        if (!active) return;
        if (error.response?.status === 404) {
          setNotFound(true);
        } else {
          setErrorMessage(error.response?.data?.error || "Verification is temporarily unavailable. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadVerification();
    return () => {
      active = false;
    };
  }, [certificateNumber, standalone, user?.id, isOwnerRole, authLoading, redirectToDashboard]);

  if (redirectToDashboard) {
    return <Navigate to={`/employer/verify-certificate?certId=${encodeURIComponent(certificateNumber)}`} replace />;
  }

  const outcome = result ? OUTCOMES[result.result] : null;
  const showSpinner = loading || (authLoading && !!certificateNumber);
  const verifyUrl = typeof window === "undefined"
    ? ""
    : `${window.location.origin}/verify?certId=${encodeURIComponent(result?.certificate.certificate_number || "")}`;

  return (
    <div className={standalone ? "min-h-screen bg-slate-50 dark:bg-slate-950" : "mx-auto max-w-6xl space-y-7 pb-10"}>
      {standalone && (
        <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <Link to="/" className="flex w-fit items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center bg-indigo-600 text-white">
              <ShieldCheck size={21} />
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">CertiChain AI</span>
          </Link>
        </header>
      )}

      <main className={standalone ? "mx-auto max-w-6xl space-y-6 px-4 py-7 sm:px-6 lg:px-8" : "space-y-7"}>
        <header>
          {(standalone || user) && (
            <Link
              to={isOwnerRole ? "/my-certificates" : "/"}
              className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              <ArrowLeft size={15} /> {isOwnerRole ? "Back to My Certificates" : "Back to home"}
            </Link>
          )}
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Blockchain lookup</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">Certificate Verification</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Verify the authenticity and integrity of this academic certificate using blockchain technology.
          </p>
        </header>

        {errorMessage && (
          <div role="alert" className="flex items-center gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            <ShieldAlert size={19} className="shrink-0" /> {errorMessage}
          </div>
        )}

        {notFound && (
          <div role="status" className="flex items-center gap-3 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <XCircle size={19} className="shrink-0" />
            No certificate was found with ID “{certificateNumber}”.
          </div>
        )}

        {showSpinner && (
          <div className="flex items-center justify-center gap-3 border border-slate-200 bg-white p-12 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <Loader2 size={20} className="animate-spin text-indigo-600" />
            Checking the blockchain record...
          </div>
        )}

        {noCertificate && (
          <div className="border border-slate-200 bg-white px-5 py-12 text-center dark:border-slate-800 dark:bg-slate-900">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
              <FileCheck2 size={24} />
            </span>
            <h2 className="mt-4 font-semibold text-slate-900 dark:text-white">No certificate to verify yet</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
              When a certificate is issued to your account, its verification details will appear here.
            </p>
          </div>
        )}

        {result && outcome && (
          <div className="space-y-5">
            <div className={`flex flex-col gap-3 border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${outcome.bannerClass}`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${outcome.iconWrapClass}`}>
                  <outcome.Icon size={26} />
                </span>
                <div>
                  <h2 className={`font-semibold ${outcome.headingClass}`}>{outcome.title}</h2>
                  <p className={`mt-0.5 text-xs ${outcome.textClass}`}>{outcome.summary}</p>
                </div>
              </div>
              <span className={`inline-flex w-fit items-center gap-2 border px-3 py-2 text-xs font-semibold ${outcome.badgeClass}`}>
                <ShieldCheck size={15} />
                {result.blockchain.record.exists ? "On-chain record found" : "No on-chain record"}
              </span>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)]">
              <section className="flex items-center justify-center border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                <div className="w-full max-w-xs">
                  <CertificateArtwork certificate={result.certificate} />
                  <p className="mt-2 text-center text-xs text-slate-400">
                    Certificate ID · <span className="font-mono">{result.certificate.certificate_number}</span>
                  </p>
                </div>
              </section>

              <section className="border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                    <FileCheck2 size={19} />
                  </span>
                  <h2 className="font-semibold text-slate-900 dark:text-white">Certificate details</h2>
                </div>
                <dl className="space-y-3.5">
                  <Detail label="Student name" value={result.certificate.student_name} />
                  {result.certificate.registration_number && (
                    <Detail label="Registration number" value={result.certificate.registration_number} />
                  )}
                  <Detail label="Degree" value={result.certificate.degree} />
                  <Detail label="Course" value={result.certificate.course} />
                  {result.certificate.classification && <Detail label="Classification" value={result.certificate.classification} />}
                  {result.certificate.gpa && <Detail label="GPA" value={result.certificate.gpa} />}
                  <Detail label="Graduation date" value={formatCalendarDate(result.certificate.graduation_date)} />
                  <Detail label="Institution" value={result.certificate.institution_name} />
                  <Detail label="Certificate ID" value={result.certificate.certificate_number} mono />
                  {result.result === "revoked" && result.certificate.revoked_at && (
                    <Detail label="Revoked on" value={formatDate(result.certificate.revoked_at)} />
                  )}
                </dl>
                <div className={`mt-5 flex items-start gap-3 border p-4 ${outcome.panelClass}`}>
                  <outcome.PanelIcon size={20} className={`shrink-0 ${outcome.panelIconClass}`} />
                  <div>
                    <p className={`text-sm font-semibold ${outcome.headingClass}`}>Verification result</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{outcome.detail}</p>
                  </div>
                </div>
              </section>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className="border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300"><Hash size={17} /></span>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Blockchain information</h2>
                </div>
                <dl className="space-y-3 text-xs">
                  <Detail label="Transaction hash" value={result.certificate.blockchain_tx_hash || "Not available"} mono />
                  {result.blockchain.record.issuer && <Detail label="Issuer wallet" value={result.blockchain.record.issuer} mono />}
                  {result.blockchain.record.issuedAt && (
                    <Detail label="Block issue date" value={formatDate(result.blockchain.record.issuedAt * 1000)} />
                  )}
                  {result.blockchain.record.revokedAt && (
                    <Detail label="Block revoke date" value={formatDate(result.blockchain.record.revokedAt * 1000)} />
                  )}
                  <Detail label="Certificate fingerprint" value={result.certificate.certificate_hash} mono />
                </dl>
                <p className="mt-4 border border-indigo-100 bg-indigo-50/70 p-3 text-xs leading-relaxed text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300">
                  This certificate is secured with a tamper-evident fingerprint and can be independently verified.
                </p>
              </section>

              <section className="flex flex-col justify-between gap-4 border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <QRCodeSVG value={verifyUrl} size={88} level="M" includeMargin className="shrink-0 border border-slate-200 bg-white p-1 dark:border-slate-700" />
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Quick verification</h2>
                    <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      Scan this QR code to open this certificate’s public verification page.
                    </p>
                    <a href={verifyUrl} className="mt-3 inline-flex items-center gap-2 border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-950/40">
                      <Clipboard size={14} /> Open verification link
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CalendarDays size={14} />
                  Issued {formatDate(result.certificate.issued_at)}
                </div>
              </section>
            </div>
          </div>
        )}

        {!result && !notFound && !errorMessage && !noCertificate && !showSpinner && standalone && (
          <div className="border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
              <FileCheck2 size={24} />
            </span>
            <h2 className="mt-4 font-semibold text-slate-900 dark:text-white">Certificate verification</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Open the verification link or scan the QR code printed on the certificate to view its authenticity details.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[minmax(7rem,0.7fr)_minmax(0,1.3fr)] gap-3">
      <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className={`wrap-break-word text-xs text-slate-800 dark:text-slate-200 ${mono ? "font-mono" : "font-medium"}`}>{value}</dd>
    </div>
  );
}