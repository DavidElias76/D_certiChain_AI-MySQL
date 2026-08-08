import { useState } from "react";
import { Link,} from "react-router-dom";
import {
  // FileText,
  Award,
  User,
  Mail,
  GraduationCap,
  Calendar,
  Hash,
  Sparkles,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Building2,
  QrCode,
  ArrowLeft,
  RefreshCw,
  Wallet
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

type CertificateForm = {
  student_name: string;
  registration_number: string;
  student_email: string;
  institution_name: string;
  course: string;
  degree: string;
  graduation_date: string;
  gpa: string;
  classification: string;
  skills: string;
  recipient_wallet: string;
};

export default function IssueCertificates() {
  // const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState<CertificateForm>({
    student_name: "",
    registration_number: "",
    student_email: "",
    institution_name: user?.username ? `${user.username} University` : "KCA University",
    course: "Bachelor of Science in Information Technology",
    degree: "Undergraduate Degree",
    graduation_date: new Date().toISOString().split("T")[0],
    gpa: "",
    classification: "First Class Honours",
    skills: "Software Architecture, Cloud Security, Full-Stack Development, Smart Contracts",
    recipient_wallet: "",
  });

  const [loading, setLoading] = useState(false);
  const [issuedSuccess, setIssuedSuccess] = useState(false);

  const generateCertNumber = () => {
    const prefix = form.institution_name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "CERT";
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${new Date().getFullYear()}-${randomHex}`;
  };

  const [certNumber, setCertNumber] = useState<string>(generateCertNumber());

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegenerateNumber = () => {
    setCertNumber(generateCertNumber());
    toast.success("New certificate number generated");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(
        "/certificate/issue",
        {
          ...form,
          certificate_number: certNumber,
        },
        { withCredentials: true }
      );
      toast.success(`Certificate successfully issued for ${form.student_name}!`);
      setIssuedSuccess(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to issue certificate");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    form.student_name.trim() &&
    form.registration_number.trim() &&
    form.student_email.trim() &&
    form.course.trim() &&
    form.degree.trim() &&
    form.graduation_date.trim();

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
            <Award className="text-indigo-600 dark:text-indigo-400" size={28} />
            Issue Digital Certificate
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Create and cryptographically anchor a tamper-proof degree certificate on the blockchain.
          </p>
        </div>
      </div>

      {issuedSuccess ? (
        /* Success State */
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-8 text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={36} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Certificate Issued & Anchored!
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-2">
              The credential for <span className="font-semibold text-slate-900 dark:text-white">{form.student_name}</span> has been minted on-chain.
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-left text-xs font-mono space-y-2">
            <p className="text-slate-500">Certificate ID: <span className="text-slate-900 dark:text-white font-bold">{certNumber}</span></p>
            <p className="text-slate-500">Recipient: <span className="text-slate-900 dark:text-white">{form.student_email}</span></p>
            <p className="text-slate-500">Program: <span className="text-slate-900 dark:text-white">{form.course}</span></p>
          </div>
          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={() => {
                setIssuedSuccess(false);
                setCertNumber(generateCertNumber());
                setForm((prev) => ({ ...prev, student_name: "", registration_number: "", student_email: "" }));
              }}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors"
            >
              Issue Another Certificate
            </button>
            <Link
              to="/admin/manage-certificates"
              className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              View All Certificates
            </Link>
          </div>
        </div>
      ) : (
        /* Form + Live Preview Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column — Form */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <User size={20} className="text-indigo-600" /> Student Credentials
                </h2>
                <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono px-2.5 py-1 rounded-md">
                  Step 1 of 2
                </span>
              </div>

              {/* Student Personal Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="student_name"
                      value={form.student_name}
                      onChange={handleChange}
                      placeholder="e.g. David Elias"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Registration / Student ID <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Hash size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        name="registration_number"
                        value={form.registration_number}
                        onChange={handleChange}
                        placeholder="e.g. 21/04562"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Student Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        name="student_email"
                        value={form.student_email}
                        onChange={handleChange}
                        placeholder="student@students.kca.ac.ke"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Details Section */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                  <GraduationCap size={20} className="text-indigo-600" /> Academic Degree & Program
                </h2>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Course / Program Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    placeholder="e.g. Bachelor of Science in Software Engineering"
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Degree Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="degree"
                      value={form.degree}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    >
                      <option value="Undergraduate Degree">Undergraduate Degree</option>
                      <option value="Master's Degree">Master's Degree</option>
                      <option value="Doctorate / PhD">Doctorate / PhD</option>
                      <option value="Postgraduate Diploma">Postgraduate Diploma</option>
                      <option value="Professional Certification">Professional Certification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Graduation Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="date"
                        name="graduation_date"
                        value={form.graduation_date}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Classification / Grade
                    </label>
                    <input
                      type="text"
                      name="classification"
                      value={form.classification}
                      onChange={handleChange}
                      placeholder="e.g. First Class Honours"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      GPA / Cumulative Score
                    </label>
                    <input
                      type="text"
                      name="gpa"
                      value={form.gpa}
                      onChange={handleChange}
                      placeholder="e.g. 3.85 / 4.00"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* On-chain Details & ID */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                  <ShieldCheck size={20} className="text-indigo-600" /> Blockchain Credentials & Wallet
                </h2>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Auto-Generated Certificate ID
                    </label>
                    <button
                      type="button"
                      onClick={handleRegenerateNumber}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <RefreshCw size={12} /> Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={certNumber}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm tracking-wider cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Student Wallet Address (Optional)
                  </label>
                  <div className="relative">
                    <Wallet size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="recipient_wallet"
                      value={form.recipient_wallet}
                      onChange={handleChange}
                      placeholder="0x..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Key Competencies / Skills (AI Guidance)
                  </label>
                  <textarea
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Comma-separated list of skills & topics mastered for AI career matching"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Minting & Issuing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> Issue & Anchor Certificate
                    </>
                  )}
                </button>
                <Link
                  to="/admin/dashboard"
                  className="px-6 py-3.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          {/* Right Column — Live Preview Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  Live Certificate Preview
                </h3>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 size={14} /> Ready for Minting
                </span>
              </div>

              <div className="bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden space-y-6">
                {/* Background watermark icon */}
                <ShieldCheck className="absolute -right-8 -bottom-8 text-white/5 w-64 h-64 pointer-events-none" />

                {/* Top header of certificate */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                      <Building2 size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white uppercase tracking-wider">
                        {form.institution_name || "UNIVERSITY NAME"}
                      </h4>
                      <p className="text-[11px] text-indigo-300 font-mono">OFFICIAL ACADEMIC CREDENTIAL</p>
                    </div>
                  </div>
                  <Award size={32} className="text-amber-400" />
                </div>

                {/* Body details */}
                <div className="space-y-4 text-center py-2">
                  <p className="text-xs uppercase tracking-widest text-slate-400">This is to certify that</p>
                  <h3 className="text-2xl font-bold text-white font-serif tracking-wide border-b border-indigo-500/30 pb-2 inline-block px-4">
                    {form.student_name || "STUDENT FULL NAME"}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed pt-1">
                    has successfully fulfilled all requirements and is hereby awarded the degree of
                  </p>

                  <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
                    <p className="text-base font-bold text-indigo-300">{form.course || "COURSE NAME"}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{form.classification || "Honours Classification"}</p>
                  </div>
                </div>

                {/* Footer metadata & QR */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <div className="space-y-1">
                    <p className="font-mono text-[10px]">ID: <span className="text-white">{certNumber}</span></p>
                    <p className="text-[11px]">Issued: <span className="text-slate-200">{form.graduation_date || "YYYY-MM-DD"}</span></p>
                    <p className="text-[11px]">GPA: <span className="text-slate-200">{form.gpa || "N/A"}</span></p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-white p-1 rounded-md flex items-center justify-center text-slate-900 shadow-inner">
                      <QrCode size={44} />
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 font-mono">VERIFY ON-CHAIN</span>
                  </div>
                </div>
              </div>

              {/* Information callout */}
              <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-300 flex items-start gap-3">
                <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Blockchain Guarantee</p>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    Upon submission, a SHA-256 hash of this record is generated and anchored. Employers can verify it instantly via QR code or PDF upload.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}