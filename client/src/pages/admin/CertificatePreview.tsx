import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Award } from 'lucide-react';
import { useCertificates} from "../../context/CertificateContext"
import useAuth from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import toast from 'react-hot-toast';

type CertificateForm = {
  student_name: string;
  student_email: string;
  registration_number: string;
  institution_name: string;
  course: string;
  degree: string;
  gpa: string;
  classification: string;
  graduation_date: Date | string | null;
  issued_by: number;
};

const formatDateForDisplay = (value: Date | string | null) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

interface CertificatePreviewProps {
  form: CertificateForm;
  hasInstitutionWallet: string | null;
}

const CertificatePreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { issueCertificate } = useCertificates()
  const  { user } = useAuth()
   const { hasInstitutionWallet } = useWallet()

  const [submitting, setSubmitting] = useState(false);
  const [issued, setIssued] = useState<boolean>(false)
  const [certificateNumber, setCertificateNumber] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const state = location.state as CertificatePreviewProps | null;
  if (!state?.form) {
    return <Navigate to="/admin/issue-certificates" replace />;
  }
  const { form } = state;

  const handleBack = () => {
    navigate('/admin/issue-certificates', { state: { form } });
  };

  const handleIssue = async () => {
    if (!hasInstitutionWallet) return;

    setSubmitting(true);
    setMessage(null);

    try {
      
    const payload = {
      student_name: form.student_name,
      student_email: form.student_email,
      registration_number: form.registration_number,
      course: form.course,
      degree: form.degree,
      gpa: form.gpa,
      classification: form.classification,
      graduation_date: typeof form.graduation_date === 'string'
        ? form.graduation_date
        : form.graduation_date
          ? new Date(form.graduation_date).toISOString().split('T')[0]
          : null,
    };
    
      const issuedCertificateNumber = await issueCertificate(payload);
      setCertificateNumber(issuedCertificateNumber);
      setIssued(true);
      setMessage({ type: 'success', text: 'Certificate issued and recorded on the blockchain!' });
      toast.success(message?.text ?? 'Certificate issued and recorded on the blockchain!')
      navigate('/admin/manage-certificates', { replace: true }, )
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to issue certificate. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Award className="text-indigo-600 dark:text-indigo-400" size={28} />
            Review Certificate
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Review the certificate details below before issuing on the blockchain.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-xl">
        <div className="aspect-[1.44/1] min-h-105 border-[6px] border-double border-[#1e3a8a] bg-[#fdfaf2] p-1.5 shadow-xl sm:min-h-0">
          <div className="flex h-full flex-col border border-[#1e3a8a]/70 px-4 py-5 text-center text-slate-800 sm:px-8 sm:py-6">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#1e3a8a] sm:text-xs">
              {form.institution_name || user?.institution_name || 'University Name'}
            </p>
            <h2 className="mt-2 font-serif text-xl font-bold uppercase text-slate-900 sm:text-2xl">
              Certificate of Completion
            </h2>

            <div className="mt-4 flex flex-1 flex-col items-center">
              <p className="text-xs text-slate-500">This is to certify that</p>
              <p className="mt-1 font-serif text-xl font-bold italic text-slate-900 sm:text-2xl">
                {form.student_name}
              </p>
              <p className="mt-3 text-xs text-slate-500">has been awarded</p>
              <p className="mt-1 text-base font-bold text-slate-900">{form.degree}</p>
              <p className="mt-1 text-sm text-slate-800">in {form.course}</p>
              <p className="mt-2 text-xs text-slate-500">{form.classification}</p>
              <p className="mt-2 text-xs text-slate-600">
                Graduation date: {formatDateForDisplay(form.graduation_date)}
              </p>
            </div>

            <div className="mt-4 flex items-end justify-between gap-4 text-left text-[10px] text-slate-500">
              <div className="min-w-0">
                <p>Certificate No.</p>
                <p className="font-medium text-slate-600">{certificateNumber || 'Assigned on issue'}</p>
                <p className="mt-1">Verify this certificate by scanning the QR code or entering the number on the verification page.</p>
                {issued && <p className="mt-1 font-medium text-emerald-700">Issued on Blockchain</p>}
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-dashed border-slate-300 bg-white text-center text-[9px] leading-tight text-slate-400">
                {certificateNumber ? (
                  <QRCodeSVG
                    value={`${origin}/verify?certId=${encodeURIComponent(certificateNumber)}`}
                    size={48}
                    level="M"
                    includeMargin={false}
                  />
                ) : (
                  <span>QR<br />assigned<br />on issue</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

          {message && (
            <div
              className={`mt-4 p-3 text-sm border ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleBack}
              className="flex-1 px-4 py-3 rounded-md bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm font-semibold border border-gray-200 dark:border-slate-700 transition-colors"
            >
              Back to Form
            </button>
            <button
              onClick={handleIssue}
              disabled={submitting || issued}
              className="flex-1 px-4 py-3 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              {submitting ? 'Issuing on Blockchain...' : issued ? 'Issued ✓' : 'Issue Certificate'}
            </button>
          </div>

          {!hasInstitutionWallet && (
            <div className="mt-4 p-3 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
              <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                The institution wallet is not registered yet.
              </p>
            </div>
          )}
    </div>
  );
};

export default CertificatePreview;
