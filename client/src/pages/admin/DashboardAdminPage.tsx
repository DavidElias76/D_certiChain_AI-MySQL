import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Award,
  GraduationCap,
  Building2,
  ArrowRight,
  Activity,
  XCircle,
  Clock,
  Hourglass,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

interface Certificate {
  id: number;
  student_name: string;
  registration_number: string;
  course: string;
  status: "issued" | "revoked";
  issued_at: string;
}

export default function DashboardAdminPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the certificates issued by the logged-in admin
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const response = await api.get("/certificate/", { withCredentials: true });
        setCertificates(response.data || []);
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Failed to load dashboard");
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
      thisMonth: certificates.filter((c) => {
        const issued = new Date(c.issued_at);
        const now = new Date();
        return (
          issued.getMonth() === now.getMonth() &&
          issued.getFullYear() === now.getFullYear()
        );
      }).length,
    };
  }, [certificates]);

  // Recent activity
  const recent = useMemo(() => {
    return [...certificates]
      .sort(
        (a, b) =>
          new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime()
      )
      .slice(0, 5);
  }, [certificates]);

  const formatRelative = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <Activity className="text-indigo-600 dark:text-indigo-400" size={28} />
          Dashboard Overview
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Welcome back, {user?.username}. Here&apos;s what&apos;s happening with your institution.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <FileText size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : stats.total.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Certificates</p>
          </div>
        </div>

        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : stats.issued.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
          </div>
        </div>

        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400">
            <XCircle size={20} />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : stats.revoked.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Revoked</p>
          </div>
        </div>

        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Clock size={20} />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : stats.thisMonth.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">This Month</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Hourglass size={16} className="text-indigo-600" /> Recent Activity
            </h3>
            <Link
              to="/admin/manage-certificates"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin text-indigo-600 mx-auto" size={28} />
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-3">Loading activity...</p>
            </div>
          ) : recent.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <Award className="text-slate-400" size={24} />
              </div>
              <h4 className="text-slate-900 dark:text-white font-semibold mb-1">No activity yet</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Issue your first certificate to see activity here.
              </p>
              <Link
                to="/admin/issue-certificates"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
              >
                <FileText size={14} /> Issue First Certificate
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recent.map((cert) => (
                <div
                  key={cert.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <GraduationCap size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{cert.course}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        Issued to <span className="font-medium text-slate-700 dark:text-slate-300">{cert.student_name}</span>
                        {" • "}
                        {formatRelative(cert.issued_at)}
                      </p>
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

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-5">
            <ShieldCheck size={16} className="text-indigo-600" /> Quick Actions
          </h3>
          <div className="space-y-2">
            <Link
              to="/admin/issue-certificates"
              className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/60">
                  <Award className="text-indigo-600 dark:text-indigo-400" size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Issue Certificate</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Mint a new credential</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
            </Link>

            <Link
              to="/admin/manage-certificates"
              className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/60">
                  <FileText className="text-emerald-600 dark:text-emerald-400" size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Manage Certificates</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">View, revoke, search</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
            </Link>

            <Link
              to="/admin/manage-users"
              className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/40 group-hover:bg-purple-100 dark:group-hover:bg-purple-950/60">
                  <Users className="text-purple-600 dark:text-purple-400" size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Manage Users</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Add, edit, remove</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
            </Link>

            <div className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 mt-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 size={14} className="text-slate-500 dark:text-slate-400" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Institution</p>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {user?.institution_name || "Your Institution"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Admin: {user?.username}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
