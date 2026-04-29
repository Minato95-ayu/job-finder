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
  Sparkles,
  Star,
  Sun,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import "./styles.css";

type Category = "Engineer" | "Teacher" | "Cashier" | "IT" | "HR" | "Sales" | "Marketing" | "Government";
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

const sampleJobs: Job[] = [
  {
    id: "tcs-se-blr",
    title: "Software Engineer - Java Full Stack",
    company: "TCS",
    category: "Engineer",
    location: "Bengaluru",
    state: "Karnataka",
    salaryMin: 6,
    salaryMax: 12,
    type: "Full-time",
    experience: "1-3 years",
    postedDays: 2,
    source: "TCS Careers",
    sourceKind: "Direct Company",
    description:
      "Build resilient enterprise applications for banking and retail clients using Java, React, REST APIs, and cloud deployment pipelines.",
    responsibilities: ["Develop reusable backend services", "Partner with QA on release readiness", "Improve application performance"],
    requirements: ["Java, Spring Boot, React", "Strong SQL fundamentals", "Agile delivery experience"],
    companyInfo: "TCS is one of India's largest IT services firms with hiring across major Indian technology hubs.",
    applyUrl: "https://www.tcs.com/careers",
    appliedCount: 1830,
    rating: 4.1,
    skills: ["Java", "React", "Spring Boot", "SQL"],
  },
  {
    id: "infosys-data-pune",
    title: "Data Engineer",
    company: "Infosys",
    category: "Engineer",
    location: "Pune",
    state: "Maharashtra",
    salaryMin: 8,
    salaryMax: 16,
    type: "Full-time",
    experience: "3-5 years",
    postedDays: 5,
    source: "Infosys Careers",
    sourceKind: "Direct Company",
    description:
      "Design ETL pipelines, data models, and cloud data workflows for analytics teams supporting global enterprise clients.",
    responsibilities: ["Build batch and streaming pipelines", "Maintain data quality checks", "Document data contracts"],
    requirements: ["Python and SQL", "Spark or Databricks", "Cloud data platform exposure"],
    companyInfo: "Infosys hires technology, consulting, and operations talent through its official careers portal.",
    applyUrl: "https://www.infosys.com/careers",
    appliedCount: 1254,
    rating: 4.0,
    skills: ["Python", "SQL", "Spark", "Azure"],
  },
  {
    id: "google-swe-hyd",
    title: "Software Engineer, Payments",
    company: "Google India",
    category: "Engineer",
    location: "Hyderabad",
    state: "Telangana",
    salaryMin: 28,
    salaryMax: 55,
    type: "Full-time",
    experience: "3-5 years",
    postedDays: 1,
    source: "Google Careers India",
    sourceKind: "Direct Company",
    description:
      "Work on payment reliability, transaction safety, and scalable systems serving millions of users across India.",
    responsibilities: ["Design high-throughput services", "Review architecture and code", "Collaborate with product teams"],
    requirements: ["Data structures and algorithms", "Distributed systems experience", "C++, Java, Go, or Python"],
    companyInfo: "Google India hires engineering, sales, support, and operations roles across Bengaluru, Hyderabad, Mumbai, and Gurugram.",
    applyUrl: "https://careers.google.com/locations/india/",
    appliedCount: 3412,
    rating: 4.6,
    skills: ["Distributed Systems", "Go", "Java", "Reliability"],
  },
  {
    id: "delhi-teacher",
    title: "PGT Mathematics Teacher",
    company: "Delhi Public School",
    category: "Teacher",
    location: "Delhi",
    state: "Delhi",
    salaryMin: 4,
    salaryMax: 8,
    type: "Full-time",
    experience: "1-3 years",
    postedDays: 3,
    source: "Teaching Jobs India",
    sourceKind: "Specialized",
    description:
      "Teach senior secondary mathematics, prepare board-exam plans, run doubt-solving sessions, and track student progress.",
    responsibilities: ["Create lesson plans", "Conduct assessments", "Mentor students for board exams"],
    requirements: ["B.Ed. with Mathematics specialization", "CBSE curriculum familiarity", "Strong classroom communication"],
    companyInfo: "A private school network hiring teachers and academic coordinators across NCR.",
    applyUrl: "https://www.dpsfamily.org/careers",
    appliedCount: 486,
    rating: 4.2,
    skills: ["Mathematics", "CBSE", "Lesson Planning", "Mentoring"],
  },
  {
    id: "mumbai-cashier",
    title: "Part-time Retail Cashier",
    company: "Reliance Retail",
    category: "Cashier",
    location: "Mumbai",
    state: "Maharashtra",
    salaryMin: 1.8,
    salaryMax: 3.2,
    type: "Part-time",
    experience: "Fresher",
    postedDays: 0,
    source: "Indeed India",
    sourceKind: "Job Portal",
    description:
      "Handle billing, customer assistance, stock counter support, and daily cash reconciliation for a high-footfall store.",
    responsibilities: ["Operate POS billing", "Assist customers at checkout", "Maintain cash register accuracy"],
    requirements: ["Basic computer knowledge", "Comfortable with shifts", "Customer-first attitude"],
    companyInfo: "Reliance Retail operates stores across groceries, fashion, electronics, and lifestyle formats.",
    applyUrl: "https://in.indeed.com/",
    appliedCount: 920,
    rating: 3.9,
    skills: ["POS", "Customer Service", "Cash Handling"],
  },
  {
    id: "rrb-engineer",
    title: "Junior Engineer - Civil Cadre",
    company: "Indian Railways RRB",
    category: "Government",
    location: "Lucknow",
    state: "Uttar Pradesh",
    salaryMin: 4.2,
    salaryMax: 7.5,
    type: "Full-time",
    experience: "Fresher",
    postedDays: 8,
    source: "RRB Official",
    sourceKind: "Government",
    description:
      "Government engineering role for civil works, track maintenance coordination, technical reports, and site inspections.",
    responsibilities: ["Inspect public infrastructure works", "Coordinate maintenance schedules", "Prepare compliance reports"],
    requirements: ["Civil engineering diploma or degree", "RRB eligibility criteria", "Document verification readiness"],
    companyInfo: "Indian Railways recruits through regional Railway Recruitment Boards and official notifications.",
    applyUrl: "https://www.rrbcdg.gov.in/",
    appliedCount: 4120,
    rating: 4.4,
    skills: ["Civil Engineering", "Public Works", "Inspection"],
  },
  {
    id: "hdfc-cashier",
    title: "Bank Cashier and Teller",
    company: "HDFC Bank",
    category: "Cashier",
    location: "Ahmedabad",
    state: "Gujarat",
    salaryMin: 3,
    salaryMax: 5.5,
    type: "Full-time",
    experience: "1-3 years",
    postedDays: 6,
    source: "HDFC Bank Careers",
    sourceKind: "Direct Company",
    description:
      "Manage teller operations, account service requests, branch cash controls, and customer issue resolution.",
    responsibilities: ["Process cash deposits and withdrawals", "Support KYC documentation", "Maintain branch service standards"],
    requirements: ["Graduate degree", "Banking operations knowledge", "Numeracy and customer service skills"],
    companyInfo: "HDFC Bank recruits branch, operations, digital, and relationship management talent across India.",
    applyUrl: "https://www.hdfcbank.com/personal/about-us/careers",
    appliedCount: 740,
    rating: 4.0,
    skills: ["Banking", "KYC", "Cash Handling"],
  },
  {
    id: "sales-gurgaon",
    title: "B2B Sales Executive",
    company: "Freshworks Partner Network",
    category: "Sales",
    location: "Gurugram",
    state: "Haryana",
    salaryMin: 5,
    salaryMax: 10,
    type: "Full-time",
    experience: "1-3 years",
    postedDays: 12,
    source: "LinkedIn Jobs",
    sourceKind: "Job Portal",
    description:
      "Drive SaaS pipeline generation, demo scheduling, CRM hygiene, and account follow-ups for mid-market customers.",
    responsibilities: ["Qualify inbound and outbound leads", "Maintain CRM notes", "Coordinate product demos"],
    requirements: ["B2B sales experience", "Strong English and Hindi communication", "CRM familiarity"],
    companyInfo: "A SaaS partner organization hiring sales and customer success professionals in NCR.",
    applyUrl: "https://www.linkedin.com/jobs/",
    appliedCount: 610,
    rating: 4.1,
    skills: ["Sales", "CRM", "SaaS", "Lead Generation"],
  },
  {
    id: "ssc-analyst",
    title: "Assistant Section Officer",
    company: "SSC CGL",
    category: "Government",
    location: "New Delhi",
    state: "Delhi",
    salaryMin: 5.4,
    salaryMax: 9,
    type: "Full-time",
    experience: "Fresher",
    postedDays: 14,
    source: "SSC Official",
    sourceKind: "Government",
    description:
      "Central government administrative role involving file processing, policy support, correspondence, and departmental coordination.",
    responsibilities: ["Prepare administrative notes", "Maintain official records", "Coordinate interdepartmental responses"],
    requirements: ["Bachelor's degree", "SSC CGL eligibility", "Typing and documentation skills"],
    companyInfo: "Staff Selection Commission conducts recruitment for central government ministries and departments.",
    applyUrl: "https://ssc.nic.in/",
    appliedCount: 5220,
    rating: 4.5,
    skills: ["Administration", "Documentation", "Government Exams"],
  },
  {
    id: "teacher-online",
    title: "Online Coding Teacher",
    company: "BYJU'S Tuition Centre",
    category: "Teacher",
    location: "Remote",
    state: "Pan India",
    salaryMin: 3.5,
    salaryMax: 7,
    type: "Freelance",
    experience: "Fresher",
    postedDays: 4,
    source: "Naukri.com",
    sourceKind: "Job Portal",
    description:
      "Teach coding fundamentals to school students through interactive online classes and project-based learning modules.",
    responsibilities: ["Run live coding sessions", "Review student projects", "Share progress updates with parents"],
    requirements: ["Programming basics", "Teaching confidence", "Stable internet and laptop"],
    companyInfo: "Education technology company with online and offline learning programs across India.",
    applyUrl: "https://www.naukri.com/",
    appliedCount: 1320,
    rating: 3.8,
    skills: ["Teaching", "Scratch", "Python", "Communication"],
  },
  {
    id: "marketing-chennai",
    title: "Digital Marketing Specialist",
    company: "Zoho",
    category: "Marketing",
    location: "Chennai",
    state: "Tamil Nadu",
    salaryMin: 6,
    salaryMax: 13,
    type: "Full-time",
    experience: "3-5 years",
    postedDays: 9,
    source: "Zoho Careers",
    sourceKind: "Direct Company",
    description:
      "Plan campaigns across SEO, paid search, email, and product-led growth channels for SaaS products.",
    responsibilities: ["Run multi-channel campaigns", "Analyze funnel metrics", "Coordinate content launches"],
    requirements: ["SEO and SEM knowledge", "Analytics tooling experience", "Strong copy judgement"],
    companyInfo: "Zoho builds SaaS products and hires across engineering, design, marketing, support, and sales.",
    applyUrl: "https://www.zoho.com/careers/",
    appliedCount: 530,
    rating: 4.3,
    skills: ["SEO", "SEM", "Analytics", "Content"],
  },
  {
    id: "amazon-ops",
    title: "Operations Manager",
    company: "Amazon India",
    category: "IT",
    location: "Hyderabad",
    state: "Telangana",
    salaryMin: 14,
    salaryMax: 26,
    type: "Full-time",
    experience: "5+ years",
    postedDays: 7,
    source: "Amazon Jobs India",
    sourceKind: "Direct Company",
    description:
      "Lead logistics operations, productivity programs, people management, and delivery performance improvements.",
    responsibilities: ["Own site performance metrics", "Lead shift managers", "Drive process improvements"],
    requirements: ["Operations leadership", "Excel and analytics fluency", "People management experience"],
    companyInfo: "Amazon India hires for operations, engineering, advertising, cloud, and customer experience roles.",
    applyUrl: "https://www.amazon.jobs/en/locations/india",
    appliedCount: 1660,
    rating: 4.2,
    skills: ["Operations", "Analytics", "Leadership"],
  },
];

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

const categories: Category[] = ["Engineer", "Teacher", "Cashier", "IT", "HR", "Sales", "Marketing", "Government"];
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
            ? `Real data loaded from ${okSources || "live public sources"}. Add Google CSE/API keys to cover companies, startups, hackathons, datathons, and placement pages.`
            : "Live sources responded, but no matching data was found. Try broader keywords or enable Google CSE/API keys in .env and server/sources.json."
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        setLiveJobs(sampleJobs);
        setSourceStatuses([]);
        setDisabledSources([]);
        setJobApiStatus("fallback");
        setJobApiMessage("Live API server is not reachable, so sample jobs are shown. Start npm run api for real data.");
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
          <span className="brandIcon"><BriefcaseBusiness size={22} /></span>
          <div>
            <strong>India Job Finder</strong>
            <span>Multi-source job search for Indian candidates</span>
          </div>
        </div>
        <nav>
          {(["jobs", "dashboard", "resume", "prep"] as const).map((panel) => (
            <button key={panel} className={activePanel === panel ? "navButton active" : "navButton"} onClick={() => setActivePanel(panel)}>
              {panel === "jobs" ? "Jobs" : panel === "prep" ? "Interview" : panel[0].toUpperCase() + panel.slice(1)}
            </button>
          ))}
        </nav>
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

        {activePanel === "dashboard" && (
          <Dashboard saved={saved} applied={applied} trending={trending} popularCompanies={popularCompanies} topCities={topCities} />
        )}

        {activePanel === "resume" && <ResumeBuilder />}

        {activePanel === "prep" && <InterviewPrep />}
      </main>
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
      <p>{job.description.slice(0, 150)}...</p>
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
      <div className="detailStats">
        <span><IndianRupee size={16} /> {formatSalary(job.salaryMin, job.salaryMax)}</span>
        <span><Users size={16} /> {job.appliedCount.toLocaleString()} applied</span>
        <span><Star size={16} /> {job.rating} rating</span>
      </div>
      <p className="description">{job.description}</p>
      <DetailList title="Key responsibilities" items={job.responsibilities} />
      <DetailList title="Requirements & qualifications" items={job.requirements} />
      <DetailList title="Skills in demand" items={job.skills} compact />
      <div className="companyInfo">
        <strong>Company info</strong>
        <p>{job.companyInfo}</p>
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

function Dashboard({ saved, applied, trending, popularCompanies, topCities }: { saved: string[]; applied: string[]; trending: Job[]; popularCompanies: Job[]; topCities: { city: string; count: number }[] }) {
  return (
    <section className="dashboard">
      <div className="metricGrid">
        <Stat icon={<Bookmark />} label="Saved jobs" value={String(saved.length)} />
        <Stat icon={<CheckCircle2 />} label="Applied jobs" value={String(applied.length)} />
        <Stat icon={<Bell />} label="Active alerts" value="3" />
        <Stat icon={<ChartNoAxesColumnIncreasing />} label="Search to apply" value="18%" />
      </div>
      <div className="insightGrid">
        <Insight title="Trending jobs" icon={<TrendingUp />} items={trending.map((job) => `${job.title} · ${job.company}`)} />
        <Insight title="Popular companies" icon={<Building2 />} items={popularCompanies.map((job) => `${job.company} · ${job.rating}/5`)} />
        <Insight title="Top hiring cities" icon={<MapPin />} items={topCities.map((city) => `${city.city} · ${city.count || 1} active categories`)} />
        <Insight title="Salary insights" icon={<IndianRupee />} items={["Software engineer: 8-24 LPA", "PGT teacher: 4-9 LPA", "Bank cashier: 3-6 LPA", "Operations manager: 12-28 LPA"]} />
      </div>
      <div className="marketPanel">
        <strong>Source and compliance model</strong>
        <p>
          Production integrations should combine official career APIs, approved job portal APIs, and respectful crawlers with caching, deduplication, daily refreshes, attribution, and opt-out handling.
        </p>
      </div>
    </section>
  );
}

function Insight({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  return (
    <article className="insight">
      <div className="sectionTitle">{icon}{title}</div>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </article>
  );
}

function ResumeBuilder() {
  return (
    <section className="resume">
      <div className="resumeForm">
        <div className="sectionTitle"><GraduationCap size={18} /> Resume builder</div>
        <label className="field"><span>Name</span><input placeholder="Aarav Sharma" /></label>
        <label className="field"><span>Target role</span><input placeholder="Software Engineer" /></label>
        <label className="field"><span>Skills</span><input placeholder="Java, React, SQL, Azure" /></label>
        <label className="field"><span>Experience summary</span><textarea placeholder="2 years building full-stack applications..." /></label>
        <button className="primaryButton"><Copy size={16} /> Generate template</button>
      </div>
      <div className="resumePreview">
        <strong>ATS-friendly template</strong>
        <p>Professional summary, skills, experience, education, certifications, projects, and links. Keep it one page for fresher roles and two pages for experienced roles.</p>
        <div className="resumeLine wide" />
        <div className="resumeLine" />
        <div className="resumeLine short" />
        <div className="resumeBlock" />
      </div>
    </section>
  );
}

function InterviewPrep() {
  const tips = [
    "Engineers: revise DSA, core projects, system design basics, and role-specific tooling.",
    "Teachers: prepare demo classes, lesson plans, assessment examples, and pedagogy answers.",
    "Cashiers: practice POS scenarios, customer handling, basic arithmetic, and integrity questions.",
    "Government roles: track official notifications, exam patterns, document requirements, and cut-off trends.",
    "Salary negotiation: compare role, city, experience, and benefits before quoting an expected CTC.",
    "Regional support: keep Hindi plus local-language resume and interview introductions ready where useful.",
  ];
  return (
    <section className="prep">
      <div className="sectionTitle"><Sparkles size={18} /> Interview preparation</div>
      <div className="prepGrid">
        {tips.map((tip) => <article key={tip}>{tip}</article>)}
      </div>
      <div className="blogBand">
        <strong>Career blog ideas</strong>
        <span>Resume tips · Salary negotiation · Company profiles · Interview questions · Tier-2 city jobs · Skill matching</span>
      </div>
    </section>
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
