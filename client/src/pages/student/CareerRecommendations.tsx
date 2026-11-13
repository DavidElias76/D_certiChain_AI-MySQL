import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  ChartNoAxesColumnIncreasing,
  Code2,
  Database,
  GraduationCap,
  Lightbulb,
  LoaderCircle,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import api from "../../services/api";
import AiCareerRecommendations from "../../components/layout/AiCareerRecommendations";

interface Certificate {
  id: string | number;
  course: string;
  degree: string;
  status: "issued" | "revoked";
}

interface CareerPath {
  id: string;
  title: string;
  category: string;
  summary: string;
  keywords: string[];
  skills: string[];
  icon: typeof Code2;
}

const CAREER_PATHS: CareerPath[] = [
  {
    id: "software-developer",
    title: "Software Developer",
    category: "Technology",
    summary: "Design, build, test, and maintain applications that solve real-world problems.",
    keywords: [
      "software development",
      "software engineering",
      "computer science",
      "computer programming",
      "web development",
      "information technology",
      "computing",
    ],
    skills: ["Programming", "Problem solving", "Version control"],
    icon: Code2,
  },
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    category: "Technology",
    summary: "Help organizations protect systems and data by identifying and responding to security risks.",
    keywords: [
      "cybersecurity",
      "cyber security",
      "information security",
      "network security",
      "computer science",
      "information technology",
      "computing",
    ],
    skills: ["Network fundamentals", "Threat analysis", "Security monitoring"],
    icon: ShieldCheck,
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    category: "Data & Analytics",
    summary: "Turn data into clear findings that help teams make better decisions.",
    keywords: [
      "data analytics",
      "data science",
      "business analytics",
      "statistics",
      "mathematics",
      "economics",
    ],
    skills: ["SQL", "Data visualization", "Statistical reasoning"],
    icon: Database,
  },
  {
    id: "business-analyst",
    title: "Business Analyst",
    category: "Business",
    summary: "Connect business needs with practical improvements to products, processes, and systems.",
    keywords: [
      "business information technology",
      "business analytics",
      "information systems",
      "business administration",
      "business management",
      "economics",
    ],
    skills: ["Requirements gathering", "Process mapping", "Communication"],
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    id: "project-coordinator",
    title: "Project Coordinator",
    category: "Business",
    summary: "Keep projects organized by coordinating people, timelines, communication, and deliverables.",
    keywords: [
      "project management",
      "business administration",
      "business management",
      "construction management",
      "information systems",
    ],
    skills: ["Planning", "Stakeholder communication", "Task tracking"],
    icon: Users,
  },
  {
    id: "ux-designer",
    title: "UX Designer",
    category: "Design",
    summary: "Create useful, accessible digital experiences through research, prototyping, and testing.",
    keywords: [
      "user experience",
      "interaction design",
      "graphic design",
      "digital design",
      "human computer interaction",
    ],
    skills: ["User research", "Wireframing", "Prototyping"],
    icon: Lightbulb,
  },
];

const getQualificationMatches = (path: CareerPath, certificates: Certificate[]) => {
  const qualificationText = certificates
    .filter((certificate) => certificate.status === "issued")
    .map((certificate) => `${certificate.course} ${certificate.degree}`.toLowerCase())
    .join(" ");

  return path.keywords.filter((keyword) => qualificationText.includes(keyword));
};

export default function CareerRecommendations() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All paths");
  const [savedPaths, setSavedPaths] = useState<Set<string>>(new Set());
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    const loadCertificates = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await api.get<Certificate[] | { certificates?: Certificate[] }>(
          "/certificate/my",
          { withCredentials: true }
        );
        if (!isCurrent) return;
        const data = response.data;
        setCertificates(Array.isArray(data) ? data : data.certificates ?? []);
      } catch (error) {
        console.error("Failed to load certificates for career recommendations", error);
        if (isCurrent) {
          setLoadError("Your certificates could not be loaded. Please try again.");
          setCertificates([]);
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    void loadCertificates();
    return () => {
      isCurrent = false;
    };
  }, [retryCount]);

  const issuedCertificates = useMemo(
    () => certificates.filter((certificate) => certificate.status === "issued"),
    [certificates]
  );

  const recommendations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return CAREER_PATHS
      .map((path) => ({
        ...path,
        matches: getQualificationMatches(path, issuedCertificates),
      }))
      .filter((path) => selectedCategory === "All paths" || path.category === selectedCategory)
      .filter((path) => !showSavedOnly || savedPaths.has(path.id))
      .filter((path) => {
        if (!normalizedSearch) return true;
        const searchableText = `${path.title} ${path.category} ${path.summary} ${path.skills.join(" ")}`.toLowerCase();
        return searchableText.includes(normalizedSearch);
      })
      .sort((a, b) => b.matches.length - a.matches.length || a.title.localeCompare(b.title));
  }, [issuedCertificates, savedPaths, search, selectedCategory, showSavedOnly]);

  const matchedPathCount = useMemo(
    () => CAREER_PATHS.filter((path) => getQualificationMatches(path, issuedCertificates).length > 0).length,
    [issuedCertificates]
  );

  const categories = ["All paths", ...new Set(CAREER_PATHS.map((path) => path.category))];

  const toggleSavedPath = (pathId: string) => {
    setSavedPaths((current) => {
      const updated = new Set(current);
      if (updated.has(pathId)) updated.delete(pathId);
      else updated.add(pathId);
      return updated;
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <section className="relative flex min-h-32 items-center overflow-hidden px-1 py-3">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-2 flex items-center gap-3">
            <BriefcaseBusiness size={27} className="text-indigo-600 dark:text-indigo-400" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Career explorer
            </p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Find a career path that fits
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Explore roles related to your qualifications and see skills you can build next.
          </p>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute right-8 top-0 hidden h-36 w-64 items-center justify-center sm:flex">
          <div className="absolute inset-x-8 top-5 h-24 rounded-full bg-indigo-100/60 blur-2xl dark:bg-indigo-900/25" />
          <div className="relative flex h-20 w-36 items-center justify-center border border-indigo-200 bg-white/85 shadow-sm dark:border-indigo-800 dark:bg-slate-900/85">
            <GraduationCap size={38} className="text-indigo-500" />
            <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg">
              <BriefcaseBusiness size={17} />
            </span>
          </div>
        </div>
      </section>

      {loadError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="font-semibold underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      <section aria-label="Career overview" className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <GraduationCap size={20} />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : issuedCertificates.length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Issued qualifications</p>
          </div>
        </div>
        <div className="flex items-center gap-4 border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-10 w-10 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <BriefcaseBusiness size={19} />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {loading ? "—" : matchedPathCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Paths matching your qualifications</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowSavedOnly((current) => !current)}
          aria-pressed={showSavedOnly}
          className={`flex items-center gap-4 border p-4 text-left transition-colors ${
            showSavedOnly
              ? "border-indigo-400 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/30"
              : "border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
          }`}
        >
          <span className="flex h-10 w-10 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Bookmark size={18} />
          </span>
          <span>
            <span className="block text-xl font-bold text-slate-900 dark:text-white">{savedPaths.size}</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">Saved paths · click to view</span>
          </span>
        </button>
      </section>

      {!loading && issuedCertificates.length === 0 && !loadError && (
        <section className="flex flex-col gap-3 border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-950 dark:bg-indigo-950/20 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Add a qualification to get closer matches</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              You can still explore all career paths below. Issued certificates help us highlight related roles.
            </p>
          </div>
          <Link
            to="/my-certificates"
            className="inline-flex shrink-0 items-center justify-center gap-2 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            View certificates <ArrowRight size={15} />
          </Link>
        </section>
      )}

      {!loading && issuedCertificates.length > 0 && (
        <AiCareerRecommendations certificates={issuedCertificates} />
      )}

      <section className="border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Explore career paths</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Browse roles, compare the skills involved, and save paths to revisit.
            </p>
          </div>
          <label className="relative block w-full lg:max-w-sm">
            <span className="sr-only">Search career paths and skills</span>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search roles or skills"
              className="w-full border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter by career category">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              aria-pressed={selectedCategory === category}
              className={`border px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === category
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <LoaderCircle size={19} className="animate-spin text-indigo-600 dark:text-indigo-400" />
            Loading your qualification matches...
          </div>
        ) : recommendations.length > 0 ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {recommendations.map((path) => {
              const Icon = path.icon;
              const isSaved = savedPaths.has(path.id);
              const matchingCertificate = issuedCertificates.find((certificate) =>
                path.keywords.some((keyword) =>
                  `${certificate.course} ${certificate.degree}`.toLowerCase().includes(keyword)
                )
              );

              return (
                <article
                  key={path.id}
                  className="flex flex-col border border-slate-200 bg-white p-5 transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                        <Icon size={20} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                          {path.category}
                        </p>
                        <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{path.title}</h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSavedPath(path.id)}
                      aria-label={`${isSaved ? "Remove" : "Save"} ${path.title}`}
                      aria-pressed={isSaved}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center border transition-colors ${
                        isSaved
                          ? "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300"
                          : "border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-800 dark:hover:text-indigo-300"
                      }`}
                    >
                      {isSaved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                    </button>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{path.summary}</p>

                  <div className="mt-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Skills to build
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {path.skills.map((skill) => (
                        <span
                          key={skill}
                          className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                    {matchingCertificate ? (
                      <p className="flex items-start gap-2 text-xs leading-relaxed text-emerald-700 dark:text-emerald-400">
                        <GraduationCap size={15} className="mt-0.5 shrink-0" />
                        <span>
                          Related to your qualification: <strong>{matchingCertificate.course || matchingCertificate.degree}</strong>
                        </span>
                      </p>
                    ) : (
                      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        {issuedCertificates.length
                          ? "No direct qualification match found. Explore this path if it fits your interests."
                          : "Explore this path. Add an issued certificate to see qualification matches."}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center px-4 text-center">
            <Search size={25} className="text-slate-400" />
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">No career paths found</h3>
            <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
              {showSavedOnly
                ? "You have no saved paths in this category yet."
                : "Try a different search or category to explore more roles."}
            </p>
            {(showSavedOnly || search || selectedCategory !== "All paths") && (
              <button
                type="button"
                onClick={() => {
                  setShowSavedOnly(false);
                  setSearch("");
                  setSelectedCategory("All paths");
                }}
                className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </section>

      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        The career path explorer matches your course and degree keywords in your browser. These are exploratory
        suggestions, not a job-market analysis or a guarantee of employment.
      </p>
    </div>
  );
}