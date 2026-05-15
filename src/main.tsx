import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell,
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Copy,
  ExternalLink,
  Filter,
  GraduationCap,
  IndianRupee,
  Linkedin,
  Mail,
  MapPin,
  Moon,
  Search,
  Send,
  Share2,
  ShieldAlert,
  Sparkles,
  Star,
  Sun,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import "./styles.css";

type Category = "Engineer" | "Teacher" | "Doctor" | "IT" | "HR" | "Sales" | "Marketing" | "Government" | "Housekeeping" | "Driver" | "Delivery" | "Security";
type Experience = "Fresher" | "1-3 years" | "3-5 years" | "5+ years";
type JobType = "Full-time" | "Part-time" | "Contract" | "Freelance";
type SourceKind = "Direct Company" | "Job Portal" | "Government" | "Specialized";

type Job = {
  id: string;
  title: string;
  company: string;
  category: Category;
  location: string;
  state: string;
  salaryMin: number;
  salaryMax: number;
  type: JobType;
  experience: Experience;
  postedDays: number;
  source: string;
  sourceKind: SourceKind;
  description: string;
  responsibilities: string[];
  requirements: string[];
  companyInfo: string;
  applyUrl: string;
  appliedCount: number;
  rating: number;
  skills: string[];
};

type JobApiResponse = {
  jobs: Job[];
  fetchedAt: string;
  sources: { name: string; type?: string; ok: boolean; count?: number; error: string | null }[];
  disabledSources?: { name: string; type: string }[];
  needsApiKey: boolean;
};

const sampleJobs: Job[] = [];

const sources = [
  "TCS Careers",
  "Infosys Careers",
  "HCL Technologies",
  "Wipro Careers",
  "Microsoft India",
  "Google India",
  "Amazon India",
  "Indian Railways RRB",
  "Bank of India",
  "ICICI Bank",
  "HDFC Bank",
  "UPSC",
  "SSC",
  "State PSCs",
  "Indeed India",
  "LinkedIn Jobs",
  "Naukri.com",
  "Monster India",
  "TimesJobs",
  "Shine.com",
  "IIM Jobs",
  "Freshersworld",
  "HireIndia",
  "GATE Central",
  "Teaching Jobs India",
  "Retail & Hospitality portals",
  "Startup job boards",
];

const categories: Category[] = ["Engineer", "Teacher", "Doctor", "IT", "HR", "Sales", "Marketing", "Government", "Housekeeping", "Driver", "Delivery", "Security"];
const experiences: Experience[] = ["Fresher", "1-3 years", "3-5 years", "5+ years"];
const jobTypes: JobType[] = ["Full-time", "Part-time", "Contract", "Freelance"];
const cityOptions = ["All", "Bengaluru", "Delhi", "Mumbai", "Hyderabad", "Pune", "Chennai", "Gurugram", "Ahmedabad", "Lucknow", "Remote"];

const sourceColors: Record<SourceKind, string> = {
  "Direct Company": "direct",
  "Job Portal": "portal",
  Government: "govt",
  Specialized: "special",
};

function formatSalary(min: number, max: number) {
  if (!min && !max) return "Not disclosed";
  return `${min}-${max} LPA`;
}

function App() {
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [experience, setExperience] = useState("All");
  const [type, setType] = useState("All");
  const [location, setLocation] = useState("All");
  const [posted, setPosted] = useState("30");
  const [salary, setSalary] = useState(60);
  const [company, setCompany] = useState("");
  const [liveJobs, setLiveJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobApiStatus, setJobApiStatus] = useState<"live" | "fallback" | "empty">("empty");
  const [jobApiMessage, setJobApiMessage] = useState("Fetching real jobs from live sources...");
  const [sourceStatuses, setSourceStatuses] = useState<JobApiResponse["sources"]>([]);
  const [disabledSources, setDisabledSources] = useState<JobApiResponse["disabledSources"]>([]);
  const [saved, setSaved] = useState<string[]>(["google-swe-hyd"]);
  const [applied, setApplied] = useState<string[]>(["mumbai-cashier"]);
  const [alerts, setAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activePanel, setActivePanel] = useState<"jobs" | "dashboard" | "resume" | "prep">("jobs");

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoadingJobs(true);
      const params = new URLSearchParams({
        query,
        category,
        experience,
        type,
        location,
        posted,
      });

      try {
        const response = await fetch(`http://127.0.0.1:4000/api/jobs?${params.toString()}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`API returned ${response.status}`);
        const data = (await response.json()) as JobApiResponse;
        setLiveJobs(data.jobs);
        setSourceStatuses(data.sources);
        setDisabledSources(data.disabledSources || []);
        setJobApiStatus(data.jobs.length ? "live" : "empty");
        const okSources = data.sources.filter((source) => source.ok).map((source) => `${source.name}${typeof source.count === "number" ? ` (${source.count})` : ""}`).join(", ");
        setJobApiMessage(
          data.jobs.length
            ? `Real data loaded from ${okSources || "live public sources"}.`
            : "No matching live jobs found. Try broader keywords."
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Frontend Fetch Error:", error);
        setLiveJobs([]);
        setSourceStatuses([]);
        setDisabledSources([]);
        setJobApiStatus("empty");
        setJobApiMessage(`Backend Connection Failed: ${error instanceof Error ? error.message : "Not reachable"}. Check if 'node server/index.js' is running.`);
      } finally {
        if (!controller.signal.aborted) setLoadingJobs(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, category, experience, type, location, posted]);

  const jobsToShow = liveJobs.length || jobApiStatus === "fallback" ? liveJobs : [];

  useEffect(() => {
    setSelectedJob((current) => {
      if (current && jobsToShow.some((job) => job.id === current.id)) return current;
      return jobsToShow[0] ?? null;
    });
  }, [jobsToShow]);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobsToShow.filter((job) => {
      const searchText = `${job.title} ${job.company} ${job.location} ${job.state} ${job.category} ${job.source} ${job.skills.join(" ")}`.toLowerCase();
      return (
        (!q || searchText.includes(q)) &&
        (category === "All" || job.category === category) &&
        (experience === "All" || job.experience === experience) &&
        (type === "All" || job.type === type) &&
        (location === "All" || job.location === location) &&
        (!company || job.company.toLowerCase().includes(company.toLowerCase())) &&
        (!job.salaryMax || job.salaryMax <= salary) &&
        job.postedDays <= Number(posted)
      );
    });
  }, [jobsToShow, query, category, experience, type, location, company, salary, posted]);

  const insightJobs = jobsToShow.length ? jobsToShow : sampleJobs;
  const displayedSources: JobApiResponse["sources"] = sourceStatuses.length
    ? sourceStatuses
    : sources.slice(0, 18).map((source) => ({ name: source, ok: false, count: undefined, error: null }));
  const enabledSourceCount = sourceStatuses.filter((source) => source.ok).length;
  const readySourceCount = sourceStatuses.length + (disabledSources?.length || 0);
  const trending = [...insightJobs].sort((a, b) => b.appliedCount - a.appliedCount).slice(0, 5);
  const popularCompanies = [...insightJobs].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const topCities = cityOptions
    .filter((city) => city !== "All")
    .map((city) => ({ city, count: insightJobs.filter((job) => job.location === city).length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  function toggleSaved(id: string) {
    setSaved((current) => (current.includes(id) ? current.filter((jobId) => jobId !== id) : [...current, id]));
  }

  function markApplied(id: string) {
    setApplied((current) => (current.includes(id) ? current : [...current, id]));
  }

  function applyToJob(job: Job) {
    markApplied(job.id);
    if (job.applyUrl && job.applyUrl !== "#") {
      window.open(job.applyUrl, "_blank", "noopener,noreferrer");
    }
  }

  function runSearch() {
    setQuery(queryInput.trim());
  }

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <header className="topbar">
        <div className="brand">
          <img src="/logo.svg" alt="India Job Finder Logo" style={{ width: 42, height: 42, borderRadius: 10 }} />
          <div>
            <strong>India Job Finder</strong>
            <span>Live job search for Indian candidates</span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button className="iconButton" title="Toggle dark mode" onClick={() => setDarkMode((value) => !value)}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <main>
        <section className="hero">
          <div>
            <span className="eyebrow"><Sparkles size={15} /> Live Indian job search</span>
            <h1>Find direct company, portal, government, and specialized jobs in one place.</h1>
            <p>
              Search engineers, teachers, cashiers, government roles, IT, HR, sales, and marketing jobs with source attribution and direct apply links.
            </p>
          </div>
          <div className="heroStats">
            <Stat icon={<BriefcaseBusiness />} label="Live jobs loaded" value={loadingJobs ? "..." : String(jobsToShow.length)} />
            <Stat icon={<Building2 />} label="Sources enabled" value={loadingJobs ? "..." : `${enabledSourceCount}/${readySourceCount || 0}`} />
            <Stat icon={<MapPin />} label="Coverage" value="India + remote" />
          </div>
        </section>

        <section className="searchBand">
          <div className="searchBox">
            <Search size={20} />
            <input
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") runSearch();
              }}
              placeholder='Try "Software Engineer jobs in Bangalore"'
              list="job-title-suggestions"
            />
            <datalist id="job-title-suggestions">
              <option value="Software Engineer jobs in Bangalore" />
              <option value="Teacher jobs in Delhi fresher" />
              <option value="Cashier jobs in Mumbai part-time" />
              <option value="Government jobs Engineer cadre" />
              <option value="Jobs from TCS Infosys Google directly" />
            </datalist>
          </div>
          <button className="searchButton" onClick={runSearch}>
            <Search size={18} /> Search
          </button>
          <button className={alerts ? "alertToggle on" : "alertToggle"} onClick={() => setAlerts((value) => !value)}>
            <Bell size={18} /> Job alerts {alerts ? "on" : "off"}
          </button>
        </section>
        <div className={`liveStatus ${jobApiStatus}`}>
          <span>{jobApiStatus === "live" ? "REAL DATA" : jobApiStatus === "fallback" ? "SAMPLE FALLBACK" : "LIVE SEARCH"}</span>
          {loadingJobs ? "Loading current jobs..." : jobApiMessage}
        </div>

        {activePanel === "jobs" && (
          <section className="workspace">
            <aside className="filters">
              <div className="sectionTitle"><Filter size={18} /> Filters</div>
              <Select label="Category" value={category} onChange={setCategory} options={["All", ...categories]} />
              <Select label="Experience" value={experience} onChange={setExperience} options={["All", ...experiences]} />
              <Select label="Job type" value={type} onChange={setType} options={["All", ...jobTypes]} />
              <Select label="Location" value={location} onChange={setLocation} options={cityOptions} />
              <Select label="Posted date" value={posted} onChange={setPosted} options={["1", "7", "30"]} labels={{ "1": "Last 24 hours", "7": "Last week", "30": "Last month" }} />
              <label className="field">
                <span>Company</span>
                <input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="TCS, Google, HDFC" />
              </label>
              <label className="field">
                <span>Salary up to {salary} LPA</span>
                <input type="range" min="3" max="60" value={salary} onChange={(event) => setSalary(Number(event.target.value))} />
              </label>
              <div className="sourcePanel">
                <strong>Live extractors</strong>
                <p>Enabled connectors fetch real data from APIs, public career boards, RSS feeds, and indexed public web. Private WhatsApp/Telegram/Instagram/Facebook data needs user-provided export or official API access.</p>
                <div className="sourceGrid">
                  {displayedSources.map((source) => (
                    <span key={source.name} className={source.ok ? "sourceOk" : "sourceOff"}>
                      {source.name}{typeof source.count === "number" ? ` · ${source.count}` : ""}
                    </span>
                  ))}
                </div>
                {disabledSources && disabledSources.length > 0 && (
                  <p>{disabledSources.length} more connectors are ready but need API keys or enabling in config.</p>
                )}
              </div>
            </aside>

            <div className="results">
              <div className="resultHeader">
                <div>
                  <strong>{loadingJobs ? "Loading real jobs..." : `${filteredJobs.length} matching jobs`}</strong>
                  <span>Results are credited to their original source and should be verified before applying.</span>
                </div>
                <button className="secondaryButton"><Copy size={16} /> Export search</button>
              </div>
              <div className="jobList">
                {filteredJobs.length === 0 && <EmptyState />}
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    selected={selectedJob?.id === job.id}
                    saved={saved.includes(job.id)}
                    applied={applied.includes(job.id)}
                    onSelect={() => setSelectedJob(job)}
                    onSave={() => toggleSaved(job.id)}
                    onApply={() => applyToJob(job)}
                  />
                ))}
              </div>
            </div>

            <JobDetails job={selectedJob} saved={saved} applied={applied} onBack={() => setSelectedJob(null)} onSave={toggleSaved} onApply={markApplied} />
          </section>
        )}
      </main>

      <footer className="footer">
        <div className="footerContent">
          <h3>Important Disclaimer</h3>
          <p>
            India Job Finder is an AI-powered automated search engine that aggregates job listings from multiple public sources, company career pages, and government portals. 
            While we employ rigorous safety filters to remove suspicious content, we do not represent any employer or recruitment agency. 
            Users are strongly advised to verify all job details, company credentials, and application requirements directly on the official source website. 
            Please fill out all application forms with extreme caution and never share sensitive financial information or pay any fees for job placements. 
            Always clear all doubts regarding job roles and company legitimacy before proceeding with any recruitment process.
          </p>
          <div className="footerBottom">
            <span>© 2026 India Job Finder · Built for Indian Candidates</span>
            <div className="footerLinks">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Safety Tips</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="stat">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Select({ label, value, onChange, options, labels = {} }: { label: string; value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string> }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{labels[option] ?? option}</option>)}
      </select>
    </label>
  );
}

function JobCard({ job, selected, saved, applied, onSelect, onSave, onApply }: { job: Job; selected: boolean; saved: boolean; applied: boolean; onSelect: () => void; onSave: () => void; onApply: () => void }) {
  return (
    <article className={selected ? "jobCard selected" : "jobCard"} onClick={onSelect}>
      <div className="cardTop">
        <div>
          <h2>{job.title}</h2>
          <span className="company"><Building2 size={15} /> {job.company}</span>
        </div>
        <button className="iconButton" title={saved ? "Unsave job" : "Save job"} onClick={(event) => { event.stopPropagation(); onSave(); }}>
          {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>
      <div className="meta">
        <span><MapPin size={14} /> {job.location}, {job.state}</span>
        <span><WalletCards size={14} /> {formatSalary(job.salaryMin, job.salaryMax)}</span>
        <span><Clock3 size={14} /> {job.postedDays === 0 ? "Today" : `${job.postedDays} days ago`}</span>
      </div>
      <p>{(job.description ?? "").slice(0, 150)}...</p>
      <div className="tagRow">
        <span className={`sourceBadge ${sourceColors[job.sourceKind]}`}>{job.source}</span>
        <span>{job.category}</span>
        <span>{job.experience}</span>
        <span>{job.type}</span>
      </div>
      <div className="cardActions">
        <button className="primaryButton" onClick={(event) => { event.stopPropagation(); onApply(); }}>
          <ExternalLink size={16} />
          {applied ? "Open Source" : "Apply on Source"}
        </button>
        <button className="secondaryButton" onClick={(event) => event.stopPropagation()}><Share2 size={16} /> Share</button>
      </div>
    </article>
  );
}

function JobDetails({ job, saved, applied, onBack, onSave, onApply }: { job: Job | null; saved: string[]; applied: string[]; onBack: () => void; onSave: (id: string) => void; onApply: (id: string) => void }) {
  const [analysis, setAnalysis] = useState<{ summary: string; skills: string[]; scam_check: { score: number; reason: string }; advice: string; questions: string[] } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    setAnalysis(null);
  }, [job?.id]);

  async function analyzeJob() {
    if (!job) return;
    setAnalyzing(true);
    try {
      const res = await fetch("http://127.0.0.1:4000/api/analyze-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: job.title, company: job.company, description: job.description }),
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  }

  if (!job) {
    return (
      <aside className="detail emptyDetail">
        <BriefcaseBusiness size={32} />
        <strong>Select a job</strong>
        <span>Open a listing to view requirements, company details, source link, and sharing options.</span>
      </aside>
    );
  }

  return (
    <aside className="detail">
      <button className="backButton" onClick={onBack}><ChevronLeft size={16} /> Back to list</button>
      <div className="detailTitle">
        <span className={`sourceBadge ${sourceColors[job.sourceKind]}`}>{job.sourceKind}</span>
        <h2>{job.title}</h2>
        <p>{job.company} · {job.location}, {job.state}</p>
      </div>

      {/* Gemini AI Card */}
      <div className="geminiCard">
        <div className="geminiHeader">
          <Sparkles size={18} color="#00f0ff" />
          <strong>Gemini AI Insights</strong>
          {analyzing ? <span className="pulsing">Analyzing...</span> : !analysis && <button className="geminiButton" onClick={analyzeJob}>Analyze Job</button>}
        </div>
        {analysis && (
          <div className="geminiContent">
            <p className="aiSummary">"{analysis.summary}"</p>
            <div className="aiGrid">
              <div className="aiStat">
                <ShieldAlert size={14} color={analysis.scam_check.score > 4 ? "#ff4d4d" : "#00ff00"} />
                <span>Scam Score: {analysis.scam_check.score}/10</span>
              </div>
              <div className="aiStat">
                <GraduationCap size={14} />
                <span>Interview Ready</span>
              </div>
            </div>
            <div className="aiAdvice">
              <strong>💡 Pro Tip:</strong> {analysis.advice}
            </div>
          </div>
        )}
      </div>

      <div className="detailStats">
        <span><IndianRupee size={16} /> {formatSalary(job.salaryMin, job.salaryMax)}</span>
        <span><Users size={16} /> {(job.appliedCount ?? 0).toLocaleString()} applied</span>
        <span><Star size={16} /> {(job.rating ?? 0).toFixed(1)} rating</span>
      </div>
      <p className="description">{job.description}</p>
      {(job.responsibilities ?? []).length > 0 && <DetailList title="Key responsibilities" items={job.responsibilities} />}
      {(job.requirements ?? []).length > 0 && <DetailList title="Requirements & qualifications" items={job.requirements} />}
      <DetailList title="Skills in demand" items={job.skills ?? []} compact />
      <div className="companyInfo">
        <strong>Company info</strong>
        <p>{job.companyInfo ?? `${job.company} listing from ${job.source}. Verify details on source.`}</p>
      </div>
      <div className="applyPanel">
        <a className="primaryButton" href={job.applyUrl} target="_blank" rel="noreferrer" onClick={() => onApply(job.id)}>
          <ExternalLink size={17} /> Direct application link
        </a>
        <button className="secondaryButton" onClick={() => onSave(job.id)}>{saved.includes(job.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />} Save</button>
      </div>
      <div className="shareRow">
        <a href={`https://wa.me/?text=${encodeURIComponent(`${job.title} at ${job.company}: ${job.applyUrl}`)}`} target="_blank" rel="noreferrer"><Send size={16} /> WhatsApp</a>
        <a href={`mailto:?subject=${encodeURIComponent(job.title)}&body=${encodeURIComponent(job.applyUrl)}`}><Mail size={16} /> Email</a>
        <a href="https://www.linkedin.com/jobs/" target="_blank" rel="noreferrer"><Linkedin size={16} /> LinkedIn</a>
      </div>
      {applied.includes(job.id) && <div className="appliedNotice"><CheckCircle2 size={16} /> Added to applied jobs tracker</div>}
    </aside>
  );
}

function DetailList({ title, items, compact = false }: { title: string; items: string[]; compact?: boolean }) {
  return (
    <div className={compact ? "detailList compact" : "detailList"}>
      <strong>{title}</strong>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="emptyState">
      <Search size={28} />
      <strong>No jobs match these filters</strong>
      <span>Try a wider salary range, more locations, or a broader category.</span>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
