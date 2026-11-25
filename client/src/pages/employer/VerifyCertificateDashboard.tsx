import { Fragment, useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import {
  AlertCircle,
  Award,
  BadgeCheck,
  CheckCircle2,
  CloudUpload,
  FileCheck2,
  FileText,
  Fingerprint,
  Hash,
  Info,
  Landmark,
  Loader2,
  LockKeyhole,
  Paperclip,
  Search,
  ShieldCheck,
  X,
  QrCode
} from "lucide-react";
import api from "../../services/api";

type VerificationMethod = "upload" | "certificate";
type VerificationOutcome = "verified" | "revoked" | "invalid";
type MatchSource = "number" | "exact_file" | "pdf_text" | "qr_code";

type VerificationResponse = {
  verified: boolean;
  result: VerificationOutcome;
  match?: MatchSource;
  reason?: "document_mismatch";
  certificate?: {
    student_name: string;
    institution_name: string;
    course: string;
    degree: string;
    graduation_date: string;
    certificate_number: string;
    status: "issued" | "revoked";
    blockchain_tx_hash?: string | null;
    revoked_at?: string | null;
  };
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const OUTCOME_STYLES: Record<VerificationOutcome, { box: string; title: string }> = {
  verified: {
    box: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
    title: "Certificate verified",
  },
  revoked: {
    box: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
    title: "This certificate has been revoked",
  },
  invalid: {
    box: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300",
    title: "Certificate could not be verified",
  },
};

const MATCH_NOTES: Partial<Record<MatchSource, { icon: typeof BadgeCheck; text: string }>> = {
  exact_file: { icon: BadgeCheck, text: "This is the original document issued by the institution." },
  pdf_text: {
    icon: FileText,
    text: "The certificate number was read from your file, and the name, course and degree in it match the official record.",
  },
  qr_code: {
    icon: QrCode,
    text: "The certificate number was read from the QR code in your image. Check that the details below match your copy.",
  },
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
};

const shortHash = (hash: string) => `${hash.slice(0, 10)}…${hash.slice(-6)}`;

export default function VerifyCertificateDashboard() {
  const [method, setMethod] = useState<VerificationMethod>("upload");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [message, setMessage] = useState("");
  
  const fileInput = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);  
  const autoRan = useRef(false);

  const resetState = () => {
    requestId.current += 1;
    setLoading(false);
    setResult(null);
    setMessage("");
  };

  const formatSize = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;



  const acceptFile = (candidate: File | undefined) => {
    resetState()
    if (!candidate) return;

    const supportedType = ALLOWED_FILE_TYPES.includes(candidate.type) ||
      /\.(pdf|jpe?g|png)$/i.test(candidate.name);
    if (!supportedType) {
      setFile(null);
      setMessage("Choose a PDF, JPG, or PNG certificate.");
      return;
    }
    if (candidate.size > MAX_FILE_SIZE) {
      setFile(null);
      setMessage("The file exceeds the 10 MB size limit.");
      return;
    }
    setFile(candidate);
  };

  const removeFile = () => {
    setFile(null);
    resetState();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    acceptFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files[0]);
  };

  const runVerification = async (
    request: () => Promise<{ data: VerificationResponse }>,
    notFoundMessage: string
  ) => {
    const id = ++requestId.current;
    setLoading(true);
    setResult(null);
    setMessage("");
    try {
      const response = await request();
      if (id === requestId.current) setResult(response.data);
    } catch (error: any) {
      if (id !== requestId.current) return;
      const status = error.response?.status;
      setMessage(
        status === 404
          ? notFoundMessage
          : status === 413
            ? "The file exceeds the 10 MB size limit."
            : status === 429
              ? "Too many verification attempts. Please wait a minute and try again."
              : error.response?.data?.error || "Certificate verification is temporarily unavailable."
      );
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };

  const verifyNumber = (value: string) =>
    runVerification(
      () => api.get<VerificationResponse>(
        `/certificate/verify/${encodeURIComponent(value)}`,
        { withCredentials: true }
      ),
      "No certificate was found with that number. Check it and try again."
    );

  const verifyByCertificateNumber = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    const value = certificateNumber.trim();
    if (!value) {
      setMessage("Enter the certificate number to continue.");
      return;
    }
   void verifyNumber(value)
  };

  const verifyUploadedFile = () => {
    if (!file || loading) return;
    const formData = new FormData();
    formData.append("file", file);
    void runVerification(
      () => api.post<VerificationResponse>("/certificate/verify/upload", formData, { withCredentials: true, headers: { "Content-Type": "multipart/form-data" }}),
      "No certificate matches the number found in this document."
    );
  };

  useEffect(() => {
    if (autoRan.current) return; 
    autoRan.current = true;
    const certId = new URLSearchParams(window.location.search).get("certId")?.trim().slice(0, 100);
    if (!certId) return;
    setMethod("certificate");
    setCertificateNumber(certId);
    void verifyNumber(certId);
  }, []);

  const selectedMethodLabel = method === "upload" ? "certificate document" : "certificate ID";

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <section className="relative flex min-h-32 items-center overflow-hidden px-1 py-3">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-2 flex items-center gap-3">
            <ShieldCheck size={29} className="text-indigo-600 dark:text-indigo-400" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Verify certificate</p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Verify an Academic Certificate
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Employers and alumni can verify the authenticity of a certificate by uploading the document or entering its certificate number.
          </p>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute right-5 top-0 hidden h-36 w-72 items-center justify-center sm:flex">
          <div className="absolute inset-x-8 top-5 h-24 rounded-full bg-indigo-100/60 blur-2xl dark:bg-indigo-900/25" />
          <div className="relative flex h-21.5 w-31.5 flex-col justify-center gap-2 border border-indigo-200 bg-white/85 p-4 shadow-sm dark:border-indigo-800 dark:bg-slate-900/85">
            <span className="flex items-center gap-2"><BadgeCheck size={14} className="text-indigo-500" /><i className="h-1 w-10 bg-indigo-100 dark:bg-indigo-900" /></span>
            <i className="h-1 w-full bg-indigo-100 dark:bg-indigo-900" />
            <i className="h-1 w-4/5 bg-indigo-100 dark:bg-indigo-900" />
            <i className="h-1 w-3/5 bg-indigo-100 dark:bg-indigo-900" />
            <Award size={17} className="absolute -bottom-2 -right-2 rounded-full bg-indigo-600 p-0.5 text-white" />
          </div>
          <span className="absolute right-5 top-3 text-indigo-200 dark:text-indigo-800"><Landmark size={30} /></span>
          <span className="absolute bottom-1 right-3 text-indigo-200 dark:text-indigo-800"><Fingerprint size={24} /></span>
          <span className="absolute bottom-5 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg"><ShieldCheck size={20} /></span>
        </div>
      </section>

      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)]">
        <section id="how-it-works" className="border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Verify Certificate</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose a method below to verify the certificate.</p>

          <div className="mt-5 grid grid-cols-2 border border-slate-200 dark:border-slate-700">
            <MethodButton
              active={method === "upload"}
              icon={CloudUpload}
              label="Upload Certificate"
              onClick={() => { setMethod("upload"); resetState(); }}
            />
            <MethodButton
              active={method === "certificate"}
              icon={Hash}
              label="Enter Certificate ID"
              onClick={() => { setMethod("certificate"); resetState(); }}
            />
          </div>

          <div className="mt-4">
            {method === "upload" && (
              <>
                <div
                  onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`flex min-h-49.5 flex-col items-center justify-center border border-dashed px-4 py-6 text-center transition-colors ${
                    dragging
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                      : "border-indigo-300 bg-slate-50/60 dark:border-indigo-900 dark:bg-slate-950/40"
                  }`}
                >
                  <input
                    ref={fileInput}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {file ? (
                    <>
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                        <FileCheck2 size={24} />
                      </span>
                      <p className="mt-3 max-w-full truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{file.name}</p>
                      <p className="mt-1 text-sm text-slate-500"> {formatSize(file.size)}· Ready to verify</p>
                      <button
                        type="button"
                        onClick={verifyUploadedFile}
                        disabled={loading}
                        className="mt-4 inline-flex items-center gap-2 bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                        {loading ? "Verifying..." : "Verify Certificate"}
                      </button>
                      <button
                        type="button"
                        onClick={removeFile}
                        disabled={loading}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        <X size={13} /> Remove file
                      </button>
                    </>
                  ) : (
                    <>
                      <CloudUpload size={38} className="text-indigo-600 dark:text-indigo-400" />
                      <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">Upload Certificate Document</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Drag and drop your file here, or click to browse</p>
                      <p className="mt-2 text-[10px] text-slate-400">Supports PDF, JPG, PNG (Max 10 MB)</p>
                      <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        className="mt-4 inline-flex items-center gap-2 bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                      >
                        <Paperclip size={14} /> Choose File
                      </button>
                    </>
                  )}
                </div>
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  Your file is not stored. Only a fingerprint of it is kept in the verification log.
                </p>
              </>
            )}

            {method === "certificate" && (
              <form onSubmit={verifyByCertificateNumber} className="border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-950 dark:bg-indigo-950/20">
                <label htmlFor="certificate-number" className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Certificate ID
                </label>
                <input
                  id="certificate-number"
                  value={certificateNumber}
                  onChange={(event) => setCertificateNumber(event.target.value)}
                  placeholder="e.g. KCA-2026-A1B2C3D4"
                  required
                  className="mt-2 w-full border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  {loading ? "Verifying..." : "Verify Certificate"}
                </button>
              </form>
            )}

            {method === "upload" && (
              <>
                <div className="my-4 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                  OR
                  <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>
                <form onSubmit={verifyByCertificateNumber} className="border border-indigo-100 bg-indigo-50/70 p-3 dark:border-indigo-950 dark:bg-indigo-950/20">
                  <label htmlFor="certificate-number-alternative" className="block text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                    Certificate Number
                  </label>
                  <input
                    id="certificate-number-alternative"
                    value={certificateNumber}
                    onChange={(event) => setCertificateNumber(event.target.value)}
                    placeholder="e.g. KCA-2026-A1B2C3D4"
                    required
                    className="mt-2 w-full border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                    {loading ? "Verifying..." : "Verify Certificate"}
                  </button>
                </form>
              </>
            )}
          </div>

          {message && (
            <div role="status" className="mt-4 flex items-start gap-2 border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {message}
            </div>
          )}

          {result && <ResultPanel result={result} />}
        </section>

        <aside className="space-y-4">
          <section className="border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <Info size={20} className="text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">How It Works</h2>
            </div>
            <ol className="space-y-4">
              <Step number="1" text={`Provide a ${selectedMethodLabel} or choose another verification method.`} />
              <Step number="2" text="We match the document or read its certificate number, find the certificate record and check it against the blockchain." />
              <Step number="3" text="You'll see the verification result instantly, along with key information about the credential. Check that it matches the document you were given." />
            </ol>

            <div className="mt-5 flex items-start gap-3 border border-emerald-100 bg-emerald-50/80 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300">
                <ShieldCheck size={20} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Secure &amp; Transparent</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  All certificates are recorded on the blockchain, ensuring authenticity, integrity and tamper-proof verification.
                </p>
              </div>
            </div>

            <div className="mt-4 border border-slate-200 p-4 dark:border-slate-800">
              <div className="mb-3 flex items-center gap-2">
                <FileText size={17} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">What You'll See</h3>
              </div>
              <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] items-center gap-3">
                <ul className="space-y-2">
                  {[
                    "Student details",
                    "Degree / Course",
                    "Graduation date",
                    "Institution information",
                    "Blockchain record",
                    "Verification status",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-1.5 text-[10px] leading-tight text-slate-600 dark:text-slate-300">
                      <CheckCircle2 size={12} className="shrink-0 text-emerald-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <footer className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 pt-1 text-[10px] text-slate-500 dark:text-slate-400">
        <LockKeyhole size={13} className="text-indigo-500" />
        <span>Powered by blockchain technology</span>
        <span className="text-slate-300">|</span>
        <span>Secure</span>
        <span>·</span>
        <span>Transparent</span>
        <span>·</span>
        <span>Reliable</span>
      </footer>
    </div>
  );
}

function ResultPanel({ result }: { result: VerificationResponse }) {
  const mismatch = result.reason === "document_mismatch";
  const style = OUTCOME_STYLES[result.result] ?? OUTCOME_STYLES.invalid;
  const title = mismatch ? "This document does not match the official record" : style.title;
  const note = result.result === "verified" && result.match ? MATCH_NOTES[result.match] : undefined;
  const c = result.certificate;

  const rows: [string, string][] = c
    ? [
        ["Student", c.student_name],
        ["Course", c.course],
        ["Degree", c.degree],
        ["Graduated", formatDate(c.graduation_date)],
        ["Institution", c.institution_name],
        ["Certificate no.", c.certificate_number],
        ["Blockchain record", c.blockchain_tx_hash ? shortHash(c.blockchain_tx_hash) : "—"],
      ]
    : [];
  if (c && result.result === "revoked" && c.revoked_at) {
    rows.push(["Revoked on", formatDate(c.revoked_at)]);
  }

  return (
    <div className={`mt-4 border p-3 text-sm ${style.box}`}>
      <div className="flex items-center gap-3">
        {result.result === "verified" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        <p className="font-semibold">{title}</p>
      </div>

      {mismatch && (
        <p className="mt-2 leading-relaxed">
          The certificate number in your file exists, but the name, course or degree in the document differ from the
          official record. The document may have been altered. Do not rely on it.
        </p>
      )}

      {note && (
        <p className="mt-2 flex items-start gap-2 leading-relaxed">
          <note.icon size={15} className="mt-0.5 shrink-0" />
          {note.text}
        </p>
      )}

      {rows.length > 0 && (
        <>
          {mismatch && <p className="mt-3 text-xs font-semibold uppercase tracking-wide opacity-70">Official record</p>}
          <dl className={`grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 ${mismatch ? "mt-1" : "mt-3"}`}>
            {rows.map(([label, value]) => (
              <Fragment key={label}>
                <dt className="opacity-70">{label}</dt>
                <dd className="wrap-break-word font-medium">{value}</dd>
              </Fragment>
            ))}
          </dl>
          {result.result === "verified" && result.match !== "exact_file" && (
            <p className="mt-3 opacity-80">Check that these details match the document you were given.</p>
          )}
        </>
      )}
    </div>
  );
}

function MethodButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof CloudUpload;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-10 items-center justify-center gap-1.5 border-r border-slate-200 px-1.5 py-2 text-[9px] font-medium leading-tight transition-colors last:border-r-0 dark:border-slate-700 sm:gap-2 sm:px-2 sm:text-[10px] ${
        active
          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"
          : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
      }`}
    >
      <Icon size={14} className="shrink-0" />
      <span>{label}</span>
    </button>
  );
}

function Step({ number, text }: { number: string; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-semibold text-white">{number}</span>
      <p className="pt-0.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{text}</p>
    </li>
  );
}