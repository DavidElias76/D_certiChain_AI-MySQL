import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useCertificates } from "../../context/CertificateContext";

export default function Analytics() {
  const { certificates, loading, error } = useCertificates();

  const analytics = useMemo(() => {
    const now = new Date();
    const issued = certificates.filter((certificate) => certificate.status === "issued");
    const revoked = certificates.filter((certificate) => certificate.status === "revoked");
    const thisMonth = certificates.filter((certificate) => {
      const date = new Date(certificate.issued_at);
      return (
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });

    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString("en", { month: "short" }),
        count: 0,
      };
    });
    const monthCounts = new Map(months.map((month) => [month.key, month]));

    certificates.forEach((certificate) => {
      const date = new Date(certificate.issued_at);
      if (Number.isNaN(date.getTime())) return;
      const month = monthCounts.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (month) month.count += 1;
    });

    const courseCounts = new Map<string, number>();
    certificates.forEach((certificate) => {
      const course = certificate.course.trim() || "Unspecified course";
      courseCounts.set(course, (courseCounts.get(course) ?? 0) + 1);
    });

    return {
      total: certificates.length,
      issued: issued.length,
      revoked: revoked.length,
      thisMonth: thisMonth.length,
      months,
      maxMonthlyCount: Math.max(...months.map((month) => month.count), 1),
      topCourses: [...courseCounts.entries()]
        .map(([course, count]) => ({ course, count }))
        .sort((a, b) => b.count - a.count || a.course.localeCompare(b.course))
        .slice(0, 5),
    };
  }, [certificates]);

  return (
    <div className="w-full space-y-6 pb-8">
      <section className="flex min-h-32 flex-col justify-center gap-4 px-1 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <div className="mb-2 flex items-center gap-3">
            <Activity size={24} className="text-indigo-600 dark:text-indigo-400" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Institution insights
            </p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Certificate Analytics
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Review certificate activity and issuance trends for your institution.
          </p>
        </div>
        <Link
          to="/admin/manage-certificates"
          className="inline-flex w-fit shrink-0 rounded-md items-center justify-center gap-2 border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
        >
          Manage Certificates <ArrowRight size={15} />
        </Link>
      </section>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          <span>{error}</span>
          <Link
            to="/admin/manage-certificates"
            className="inline-flex items-center gap-1 font-semibold underline underline-offset-2"
          >
            Open certificates <ArrowRight size={13} />
          </Link>
        </div>
      )}

      <section aria-label="Certificate metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <FileText size={20} />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : analytics.total.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total certificates</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {loading ? "—" : analytics.issued.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Currently issued</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <XCircle size={20} />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {loading ? "—" : analytics.revoked.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Revoked</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Clock3 size={20} />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {loading ? "—" : analytics.thisMonth.toLocaleString()}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Issued this month</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <span className="flex h-9 w-9 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Activity size={18} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Issuance Activity</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Certificates issued over the last six months
              </p>
            </div>
          </div>
          {loading ? (
            <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 size={18} className="animate-spin text-indigo-600 dark:text-indigo-400" />
              Loading certificate analytics...
            </div>
          ) : analytics.total === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
              <span className="mb-3 flex h-10 w-10 items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <Award size={20} />
              </span>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">No certificate activity yet</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Issuance activity will appear here after your first certificate.
              </p>
            </div>
          ) : (
            <div className="p-5">
              <div className="flex h-44 items-end gap-3 border-b border-slate-200 pb-2 dark:border-slate-800 sm:gap-5">
                {analytics.months.map((month) => (
                  <div key={month.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {month.count || ""}
                    </span>
                    <div
                      className="w-full max-w-12 bg-indigo-500 transition-[height] dark:bg-indigo-400"
                      style={{
                        height: `${month.count === 0 ? 3 : Math.max(10, (month.count / analytics.maxMonthlyCount) * 100)}%`,
                      }}
                      role="img"
                      aria-label={`${month.label}: ${month.count} certificates`}
                    />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{month.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <span className="flex h-9 w-9 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <ShieldCheck size={18} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Certificate status</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Current issued and revoked certificate counts
              </p>
            </div>
          </div>
          {loading ? (
            <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 size={18} className="animate-spin text-indigo-600 dark:text-indigo-400" />
              Loading status metrics...
            </div>
          ) : (
            <div className="space-y-5 p-5">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                    <span className="h-2.5 w-2.5 bg-emerald-500" />
                    Issued
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {analytics.issued.toLocaleString()}{" "}
                    <span className="text-slate-400">
                      ({analytics.total ? Math.round((analytics.issued / analytics.total) * 100) : 0}%)
                    </span>
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Issued certificates"
                  aria-valuemin={0}
                  aria-valuemax={analytics.total}
                  aria-valuenow={analytics.issued}
                  className="h-2.5 bg-slate-100 dark:bg-slate-800"
                >
                  <div
                    className="h-full bg-emerald-500 transition-[width]"
                    style={{ width: `${analytics.total ? (analytics.issued / analytics.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                    <span className="h-2.5 w-2.5 bg-red-500" />
                    Revoked
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {analytics.revoked.toLocaleString()}{" "}
                    <span className="text-slate-400">
                      ({analytics.total ? Math.round((analytics.revoked / analytics.total) * 100) : 0}%)
                    </span>
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Revoked certificates"
                  aria-valuemin={0}
                  aria-valuemax={analytics.total}
                  aria-valuenow={analytics.revoked}
                  className="h-2.5 bg-slate-100 dark:bg-slate-800"
                >
                  <div
                    className="h-full bg-red-500 transition-[width]"
                    style={{ width: `${analytics.total ? (analytics.revoked / analytics.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              {!analytics.total && (
                <p className="border border-indigo-100 bg-indigo-50/70 px-3 py-2.5 text-xs text-slate-600 dark:border-indigo-950 dark:bg-indigo-950/20 dark:text-slate-400">
                  Certificate status metrics will appear after certificates are issued.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Award size={18} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Top courses</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Courses with the most certificates from your institution
              </p>
            </div>
          </div>
          <Link
            to="/admin/manage-certificates"
            className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400"
          >
            View certificates <ArrowRight size={13} />
          </Link>
        </div>
        {loading ? (
          <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 size={18} className="animate-spin text-indigo-600 dark:text-indigo-400" />
            Loading course metrics...
          </div>
        ) : analytics.topCourses.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Course breakdowns will appear after certificates are issued.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {analytics.topCourses.map((course) => (
              <div key={course.course} className="flex items-center justify-between gap-4 px-5 py-3">
                <p className="min-w-0 truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                  {course.course}
                </p>
                <span className="shrink-0 border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {course.count.toLocaleString()} {course.count === 1 ? "certificate" : "certificates"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
