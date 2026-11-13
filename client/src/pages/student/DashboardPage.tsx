import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Search,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Star,
  GraduationCap,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  TrendingUp,
  Hash,
  Activity,
  // Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface Certificate {
  id: number;
  student_name: string;
  registration_number: string;
  student_email: string;
  institution_name: string;
  course: string;
  degree: string;
  graduation_date: string;
  certificate_number: string;
  certificate_hash: string;
  status: "issued" | "revoked";
  issued_at: string;
}

const QuickAction = ({
  title,
  desc,
  icon: Icon,
  to,
  accent,
}: {
  title: string;
  desc: string;
  icon: any;
  to: string;
  accent: string;
}) => (
  <Link
    to={to}
    className="group flex flex-col border border-slate-200 bg-white p-5 transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800 sm:p-6"
  >
    <div className={`mb-5 flex h-11 w-11 items-center justify-center ${accent} transition-transform group-hover:scale-105`}>
      <Icon className="text-white" size={23} />
    </div>
    <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">{title}</h3>
    <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{desc}</p>
    <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
      Access
      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
    </div>
  </Link>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

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

  const stats = useMemo(() => {
    return {
      total: certificates.length,
      active: certificates.filter((c) => c.status === "issued").length,
      revoked: certificates.filter((c) => c.status === "revoked").length,
    };
  }, [certificates]);

  const recent = useMemo(() => {
    return [...certificates]
      .sort(
        (a, b) =>
          new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime()
      )
      .slice(0, 3);
  }, [certificates]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      {/* Header */}
      <section className="relative flex min-h-32 items-center overflow-hidden px-1 py-3">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-2 flex items-center gap-3">
            <Activity size={27} className="text-indigo-600 dark:text-indigo-400" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Student dashboard
            </p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Welcome back, {user?.username || "Student"}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Your academic credentials — verified, secure, and stored on the blockchain.
          </p>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute right-8 top-0 hidden h-36 w-64 items-center justify-center sm:flex">
          <div className="absolute inset-x-8 top-5 h-24 rounded-full bg-indigo-100/60 blur-2xl dark:bg-indigo-900/25" />
          <div className="relative flex h-20 w-36 items-center justify-center border border-indigo-200 bg-white/85 shadow-sm dark:border-indigo-800 dark:bg-slate-900/85">
            <GraduationCap size={38} className="text-indigo-500" />
            <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center bg-indigo-600 text-white shadow-lg">
              <ShieldCheck size={17} />
            </span>
          </div>
        </div>
      </section>

      {/* Welcome Banner */}
      <section className="flex flex-col gap-5 border border-indigo-100 bg-indigo-50/70 p-5 dark:border-indigo-950 dark:bg-indigo-950/20 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex w-full flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-1.5 border border-indigo-200 bg-white px-2.5 py-1 text-sm font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300">
              <ShieldCheck size={12} /> Blockchain Verified
            </div>
            <h2 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">Your academic journey, secured.</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {user?.email
                ? `Viewing certificates linked to ${user.email}`
                : "Viewing all your verified academic credentials"}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="min-w-24 border border-indigo-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Certificates</div>
            </div>
            <div className="min-w-24 border border-indigo-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Active</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat Cards */}
      <section aria-label="Certificate overview" className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Award size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-slate-900 dark:text-white">{loading ? "—" : stats.total}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total issued</p>
          </div>
          <span className="ml-auto flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={12} /> +1
          </span>
        </div>

        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{loading ? "—" : stats.active}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
          </div>
        </div>

        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{loading ? "—" : stats.revoked}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Revoked</p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" /> Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <QuickAction
            title="My Certificates"
            desc="View and download your verified academic credentials."
            icon={Award}
            to="/my-certificates"
            accent="bg-indigo-600"
          />
          <QuickAction
            title="Verify Certificate"
            desc="Check the authenticity of any certificate using blockchain."
            icon={Search}
            to="/verify-certificate"
            accent="bg-emerald-600"
          />
          <QuickAction
            title="Career Recommendations"
            desc="Get AI-powered job suggestions based on your qualifications."
            icon={Cpu}
            to="/career-recommendations"
            accent="bg-purple-600"
          />
        </div>
      </div>

      {/* Recent Certificates + AI Insights */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Certificates */}
        <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Award size={16} className="text-indigo-600 dark:text-indigo-400" /> Recent Certificates
            </h3>
            <Link
              to="/my-certificates"
              className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin text-indigo-600 mx-auto" size={28} />
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-3">Loading certificates...</p>
            </div>
          ) : recent.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="text-slate-400" size={24} />
              </div>
              <h4 className="text-slate-900 dark:text-white font-semibold mb-1">No certificates yet</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Certificates issued by your institution will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recent.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30 sm:px-6"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                      <GraduationCap size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{cert.course}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Hash size={10} /> {cert.certificate_number}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={10} /> {formatDate(cert.graduation_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {cert.status === "issued" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-sm font-semibold border border-emerald-200 dark:border-emerald-800/50 shrink-0">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-sm font-semibold border border-red-200 dark:border-red-800/50 shrink-0">
                      <XCircle size={12} /> Revoked
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Career Insights */}
        <div className="border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <Star className="text-indigo-600 dark:text-indigo-400" size={18} />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Career Insights
            </h3>
          </div>

          <div className="space-y-3">
            <div className="border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Recommended Role
              </p>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {certificates.length > 0
                  ? `Roles based on your ${certificates[0].course.split(" ").slice(0, 4).join(" ")}`
                  : "Complete your profile to unlock recommendations"}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {certificates.length > 0
                  ? "High demand roles based on your qualification."
                  : "AI suggestions need at least one verified certificate."}
              </p>
            </div>

            <div className="border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Suggestion
              </p>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {certificates.length > 0
                  ? "Add more skills to your profile for better matches."
                  : "Verify your certificates to unlock better recommendations."}
              </p>
            </div>
          </div>

          <Link
            to="/career-recommendations"
            className="mt-5 block w-full bg-indigo-600 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            Open AI Career Engine
          </Link>
        </div>
      </div>
    </div>
  );
}
