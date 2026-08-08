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
    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 hover:border-indigo-500 transition-colors"
  >
    <div className={`w-11 h-11 ${accent} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
      <Icon className="text-white" size={26} />
    </div>
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">{desc}</p>
    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-semibold">
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
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Activity className="text-indigo-600 dark:text-indigo-400" size={28} />
          Welcome back, {user?.username || "Student"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Your academic credentials — verified, secure, and stored on the blockchain.
        </p>
      </div>

      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 p-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 text-xs font-semibold mb-3">
              <ShieldCheck size={12} /> Blockchain Verified
            </div>
            <h2 className="text-2xl font-bold mb-1">Your academic journey, secured.</h2>
            <p className="text-indigo-100 text-sm">
              {user?.email
                ? `Viewing certificates linked to ${user.email}`
                : "Viewing all your verified academic credentials"}
            </p>
          </div>

          <div className="flex gap-8">
            <div>
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-xs text-indigo-200 mt-1 uppercase tracking-wider font-medium">Certificates</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{stats.active}</div>
              <div className="text-xs text-indigo-200 mt-1 uppercase tracking-wider font-medium">Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40">
              <Award className="text-indigo-600 dark:text-indigo-400" size={20} />
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
              <TrendingUp size={12} /> +1
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Total Issued</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {loading ? "—" : stats.total}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40">
              <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Active</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {loading ? "—" : stats.active}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40">
              <XCircle className="text-red-600 dark:text-red-400" size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mb-1">Revoked</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {loading ? "—" : stats.revoked}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-600" /> Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Certificates */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Award size={16} className="text-indigo-600" /> Recent Certificates
            </h3>
            <Link
              to="/my-certificates"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
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
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <GraduationCap size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{cert.course}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
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
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/50 shrink-0">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-800/50 shrink-0">
                      <XCircle size={12} /> Revoked
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Career Insights */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Star className="text-amber-500" size={18} />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              AI Career Insights
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p className="uppercase text-xs tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-medium">
                Recommended Role
              </p>
              <h4 className="text-slate-900 dark:text-white font-semibold text-sm">
                {certificates.length > 0
                  ? `Roles based on your ${certificates[0].course.split(" ").slice(0, 4).join(" ")}`
                  : "Complete your profile to unlock recommendations"}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
                {certificates.length > 0
                  ? "High demand roles based on your qualification."
                  : "AI suggestions need at least one verified certificate."}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p className="uppercase text-xs tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-medium">
                Suggestion
              </p>
              <p className="text-slate-700 dark:text-slate-300 text-xs">
                {certificates.length > 0
                  ? "Add more skills to your profile for better matches."
                  : "Verify your certificates to unlock better recommendations."}
              </p>
            </div>
          </div>

          <Link
            to="/career-recommendations"
            className="block w-full text-center mt-5 py-3 bg-slate-900 dark:bg-indigo-600 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors"
          >
            Open AI Career Engine
          </Link>
        </div>
      </div>
    </div>
  );
}
