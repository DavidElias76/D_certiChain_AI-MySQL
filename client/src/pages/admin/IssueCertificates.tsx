import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { Award } from 'lucide-react';
import { COURSE_TO_DEGREE, COURSE_OPTIONS, CLASSIFICATION_OPTIONS } from '../../data/certificateData'
import { useUsers } from '../../context/UsersContext';
// import toast from 'react-hot-toast';
// import { formatDateForInput } from '../../utils/formatDateForInput';
// import { useInstitution } from '../../context/InstitutionContext';

// type InstitutionKey = { id?: number | null; name?: string | null };

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

const toInputDate = (v: unknown): string => {
  if (!v) return "";
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = v instanceof Date ? v : new Date(v as string);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

const IssueCertificates = () => {
  const { hasInstitutionWallet} = useWallet()
  const { user } = useAuth(); // insttituion id and the institution name = the logged in user
  const navigate = useNavigate();
  const { users, loading: usersLoading } = useUsers(); // get the users
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [form, setForm] = useState<CertificateForm>({
    student_name: '',
    student_email: '',
    registration_number: '',
    institution_name: user?.institution_name ?? '',
    course: '',
    degree: '',
    gpa: '',
    classification: '',
    graduation_date: null,
    issued_by: user?.id ? Number(user.id) : 0,
  });

  // const [txHash, setTxHash] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const institutionUsers = useMemo(() => {
      const institutionId = user?.institution_id;
      const name = user?.institution_name?.trim().toLowerCase();
      if (institutionId == null && !name) return [];

      return users.filter((u) =>
        u.institution_id != null && institutionId != null
          ? u.institution_id === Number(institutionId)
          : !!name && u.institution_name?.trim().toLowerCase() === name
      );
  }, [users, user?.institution_id, user?.institution_name]);


  const students = useMemo(() =>
      institutionUsers
        .filter((u) => u.role === "student")
        .sort((a, b) => a.username.localeCompare(b.username)),
    [institutionUsers]
  );

const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  if (name === "student_id") {
    setSelectedStudentId(value);
    const student = students.find((s) => String(s.id) === value);
    setForm((prev) => ({
      ...prev,
      student_name: student?.username ?? "",
      student_email: student?.email ?? "",
      registration_number: student?.email.split("@")[0] ?? "", // "2612345@students.ku.ac.ke" -> "2612345" (only if your numbers follow this pattern)
    }));
    return;
  }

  if (name === "graduation_date") {
    setForm((prev) => ({ ...prev, graduation_date: value || null }));
    return;
  }

  setForm((prev) => ({ ...prev, [name]: value }));
};

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCourse = e.target.value;
    const autoDegree = COURSE_TO_DEGREE[selectedCourse] ?? '';
    setForm(prev => ({ ...prev, course: selectedCourse, degree: autoDegree }));
  };

  const isFormValid = (): boolean => {
    return !!(
      form.student_name.trim() &&
      form.student_email.trim() &&
      form.registration_number.trim() &&
      form.course &&
      form.classification &&
      form.graduation_date
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasInstitutionWallet) {
      setMessage({ type: 'error', text: 'Connect your wallet before previewing the certificate.' });
      return;
    }    

    if (!isFormValid()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    // setTxHash(account);
    try {
      navigate('/admin/issue-certificates/preview', {
        state: { form },
      });
    } catch (error) {
      const responseError = error as { response?: { data?: { error?: string } } };
      setMessage({
        type: 'error',
        text: responseError.response?.data?.error ||
          (error instanceof Error ? error.message : 'Could not load your institution details.'),
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setForm(prev => ({
        ...prev,
        student_name: '',
        student_email: '',
        registration_number: '',
        course: '',
        degree: '',
        classification: '',
        gpa: '',
        graduation_date: "",
      }));
      setMessage(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-2"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link> */}
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Award className="text-indigo-600 dark:text-indigo-400" size={28} />
            Issue Digital Certificate
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Create and cryptographically anchor a tamper-proof degree certificate on the blockchain.
          </p>
        </div>
      </div>

      {/* Wallet + form row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Issue Form — takes 3 cols */}
        <div className="xl:col-span-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
          <div className="p-5 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Certificate Details
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Fill in the student and certificate information below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Student Name */}
            <div>
              <label
                htmlFor="student_select"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Student Name <span className="text-red-500">*</span>
              </label>
              <select
                  id="student_select"
                  name="student_id"
                  value={selectedStudentId}
                  onChange={handleChange}
                  disabled={usersLoading}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-60"
                >
                <option value="">
                  {usersLoading
                    ? "Loading students..."
                    : students.length === 0
                      ? "No students registered yet"
                      : "Select a student"}
                </option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.username} ({student.email})
                  </option>
                ))}
              </select>
              {form.student_email && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Certificate will be linked to {form.student_email}
                </p>
              )}
            </div>

            {/* Student Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Student Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="student_email"
                value={form.student_email}
                readOnly
                placeholder="student@university.ac.ke"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Registration Number + Institution Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Registration Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="registration_number"
                  value={form.registration_number}
                  readOnly
                  placeholder="e.g. SCS/2024/001"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Institution Name
                </label>
                <input
                  type="text"
                  value={form.institution_name}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-sm rounded-sm cursor-not-allowed"
                />
              </div>
            </div>
            {/* Course Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Course / Program <span className="text-red-500">*</span>
              </label>
              <select
                name="course"
                value={form.course}
                onChange={handleCourseChange}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                <option value="">Select course / program</option>
                {COURSE_OPTIONS.map(course => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            {/* Degree + GPA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Degree Awarded
                </label>
                <input
                  type="text"
                  value={form.degree}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-sm rounded-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  GPA
                </label>
                <input
                  type="text"
                  name="gpa"
                  value={form.gpa}
                  onChange={handleChange}
                  placeholder="e.g. 4.5 / 5.0"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Classification Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Classification <span className="text-red-500">*</span>
              </label>
              <select
                name="classification"
                value={form.classification}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                <option value="">Select classification</option>
                {CLASSIFICATION_OPTIONS.map(cls => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Graduation Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Graduation Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="graduation_date"
                value={toInputDate(form.graduation_date)}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-sm rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-3 text-sm rounded-sm border ${
                  message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting || !hasInstitutionWallet}
                className="flex-1 px-4 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
              >
                {submitting ? 'Loading...' : 'Preview & Issue Certificate'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md transition-colors"
              >
                Reset
              </button>
            </div>

            {!hasInstitutionWallet && (
              <div className="p-3 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
                <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                  The institution wallet is not registered yet. Certificates can be issued once the main admin completes the setup.
                </p>
              </div>
            )}
          </form>
        </div>

           {/* Certificate Preview — takes 2 cols */}
      <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Certificate Preview
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Live preview of the certificate being issued
          </p>
        </div>

        <div className="p-4">
          <div className="@container mx-auto w-full max-w-xl">
            <div className="aspect-[1.475/1] w-full border-[6px] border-double border-[#1e3a8a] bg-[#fdfaf2] p-1.5 shadow-xl">
              <div className="relative flex h-full flex-col border border-[#1e3a8a]/70 px-[4%] py-[3%] text-center text-slate-800">
                <p className="text-[max(8px,1.8cqw)] font-bold uppercase tracking-wide text-[#1e3a8a]">
                  {user?.institution_name || 'University Name'}
                </p>
                <h3 className="mt-[1.2cqw] font-serif text-[max(13px,3.2cqw)] font-bold uppercase leading-tight text-slate-900">
                  Certificate of Completion
                </h3>

                <div className="flex flex-1 flex-col items-center pt-[3.2cqw]">
                  <p className="text-[max(8px,1.5cqw)] text-slate-500">This is to certify that</p>
                  <p className="mt-[0.5cqw] font-serif text-[max(15px,3.4cqw)] font-bold italic leading-tight text-slate-900">
                    {form.student_name || '—'}
                  </p>
                  <p className="mt-[1.8cqw] text-[max(8px,1.5cqw)] text-slate-500">has been awarded</p>
                  <p className="mt-[0.4cqw] text-[max(10px,2.3cqw)] font-bold text-slate-900">
                    {form.degree || '—'}
                  </p>
                  <p className="mt-[0.3cqw] text-[max(9px,1.8cqw)] text-slate-800">in {form.course || '—'}</p>
                  {form.classification && (
                    <p className="mt-[0.7cqw] text-[max(8px,1.5cqw)] text-slate-500">
                      {form.classification}
                    </p>
                  )}
                  <p className="mt-[0.7cqw] text-[max(8px,1.5cqw)] text-slate-600">
                    Graduation date: {formatDateForDisplay(form.graduation_date)}
                  </p>
                </div>

                <div className="flex items-end justify-between gap-[3%] text-left text-[max(7px,1.3cqw)] leading-tight text-slate-500">
                  <div className="min-w-0">
                    <p>Certificate No.</p>
                    <p className="text-slate-600">Assigned on issue</p>
                    <p className="mt-[0.5cqw] text-[max(7px,1.2cqw)]">
                      Verify this certificate by scanning the QR code or entering the number on the verification page.
                    </p>
                  </div>
                  <div className="flex aspect-square w-[10%] shrink-0 items-center justify-center border border-dashed border-slate-300 bg-white text-center text-[max(6px,1cqw)] leading-tight text-slate-400">
                    QR<br />assigned<br />on issue
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hint */}
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              The certificate number and QR code are generated when the certificate is issued.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default IssueCertificates;
