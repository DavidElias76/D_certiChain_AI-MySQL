import { useEffect, useState } from "react";
import { LoaderCircle, Search, Sparkles, Target, TrendingUp } from "lucide-react";
import { useRecommendations } from "../../context/CarrerRecommendationsContext";

interface QualificationOption {
  id: string | number;
  course: string;
  degree: string;
}

const LABEL =
  "text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400";

export default function AiCareerRecommendations({
  certificates,
}: {
  certificates: QualificationOption[];
}) {
  const { getEntry, fetchRecommendation, generateRecommendation } = useRecommendations();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // keep a valid selection as the certificate list loads or changes
  useEffect(() => {
    if (!certificates.length) {
      setSelectedId(null);
      return;
    }
    setSelectedId((previous) =>
      previous !== null && certificates.some((c) => Number(c.id) === previous)
        ? previous
        : Number(certificates[0].id)
    );
  }, [certificates]);

  // load the saved recommendation (if any) for the selected certificate
  useEffect(() => {
    if (selectedId !== null) void fetchRecommendation(selectedId);
  }, [selectedId, fetchRecommendation]);

  if (!certificates.length || selectedId === null) return null;

  const entry = getEntry(selectedId);
  const data = entry.data;

  return (
    <section className="border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              AI career recommendations
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Personalised suggestions based on your verified qualification. Generated once and saved.
          </p>
        </div>

        {certificates.length > 1 && (
          <label className="block w-full sm:max-w-xs">
            <span className="sr-only">Choose a qualification</span>
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(Number(event.target.value))}
              className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {certificates.map((certificate) => (
                <option key={certificate.id} value={Number(certificate.id)}>
                  {certificate.course} · {certificate.degree}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {(entry.status === "idle" || entry.status === "loading") && (
        <div className="flex min-h-32 items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <LoaderCircle size={19} className="animate-spin text-indigo-600 dark:text-indigo-400" />
          Checking for saved recommendations...
        </div>
      )}

      {entry.status === "empty" && (
        <div className="mt-5 flex flex-col items-start gap-3 border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-950 dark:bg-indigo-950/20 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            You haven't generated recommendations for this qualification yet.
          </p>
          <button
            type="button"
            onClick={() => void generateRecommendation(selectedId)}
            className="inline-flex shrink-0 items-center justify-center gap-2 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            <Sparkles size={15} /> Generate recommendations
          </button>
        </div>
      )}

      {entry.status === "generating" && (
        <div className="flex min-h-32 flex-col items-center justify-center gap-2 text-center text-sm text-slate-500 dark:text-slate-400">
          <LoaderCircle size={22} className="animate-spin text-indigo-600 dark:text-indigo-400" />
          Analysing your qualification... this can take up to a minute.
        </div>
      )}

      {entry.status === "error" && (
        <div
          role="alert"
          className="mt-5 flex flex-wrap items-center justify-between gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          <span>{entry.error ?? "Something went wrong."}</span>
          <button
            type="button"
            onClick={() => void fetchRecommendation(selectedId)}
            className="font-semibold underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      {entry.status === "ready" && data && (
        <div className="mt-5 space-y-6">
          <div>
            <p className={LABEL}>Recommended roles</p>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              {(data.recommended_roles ?? []).map((role) => (
                <article
                  key={role.title}
                  className="flex flex-col border border-slate-200 p-4 dark:border-slate-800"
                >
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{role.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {role.why}
                  </p>
                  <p className={`${LABEL} mt-4`}>Next steps</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {(role.next_steps ?? []).map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>

          {(data.suggested_skills ?? []).length > 0 && (
            <div>
              <p className={`${LABEL} flex items-center gap-2`}>
                <Target size={13} /> Skills to improve
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {data.suggested_skills.map((item) => (
                  <div
                    key={item.skill}
                    className="border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950"
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.skill}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(data.market_insights ?? []).length > 0 && (
            <div>
              <p className={`${LABEL} flex items-center gap-2`}>
                <TrendingUp size={13} /> General market observations
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {data.market_insights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>
          )}

          {(data.job_matches ?? []).length > 0 && (
            <div>
              <p className={`${LABEL} flex items-center gap-2`}>
                <Search size={13} /> Job search ideas
              </p>
              <div className="mt-3 space-y-3">
                {data.job_matches.map((job) => (
                  <div key={job.title} className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {job.title}
                    </span>
                    {(job.search_keywords ?? []).map((keyword) => (
                      <span
                        key={keyword}
                        className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Generated on {new Date(data.generated_at).toLocaleDateString(undefined, { dateStyle: "medium" })} by an AI
            model from your course, degree and listed skills. Market observations are general knowledge, not live job
            data, and job ideas are search terms, not real vacancies. These are suggestions, not a guarantee of
            employment.
          </p>
        </div>
      )}
    </section>
  );
}