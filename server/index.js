import "dotenv/config";
import cors from "cors";
import express from "express";
import { XMLParser } from "fast-xml-parser";
import * as cheerio from "cheerio";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT || 4000);
const __dirname = dirname(fileURLToPath(import.meta.url));
const xmlParser = new XMLParser({ ignoreAttributes: false });

app.use(cors({ origin: ["http://127.0.0.1:5173", "http://localhost:5173"] }));

const indianCities = [
  "india",
  "bengaluru",
  "bangalore",
  "delhi",
  "mumbai",
  "hyderabad",
  "pune",
  "chennai",
  "gurugram",
  "gurgaon",
  "ahmedabad",
  "lucknow",
  "noida",
  "kolkata",
  "jaipur",
  "kochi",
  "indore",
  "remote",
];

async function loadSourceConfig() {
  try {
    const raw = await readFile(join(__dirname, "sources.json"), "utf8");
    return JSON.parse(raw);
  } catch {
    return { greenhouse: [], lever: [], rss: [], scrapers: [] };
  }
}

function inferCategory(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();
  if (/\b(teacher|faculty|tutor|professor|educator|trainer)\b/.test(text)) return "Teacher";
  if (/\b(cashier|teller|billing|pos)\b/.test(text)) return "Cashier";
  if (/\b(government|ssc|upsc|railway|rrb|public sector)\b/.test(text)) return "Government";
  if (/\b(engineer|developer|software|civil|mechanical|electrical|data|ai|ml)\b/.test(text)) return "Engineer";
  if (/\b(human resource|hr|recruiter|talent)\b/.test(text)) return "HR";
  if (/\b(sales|business development|account executive)\b/.test(text)) return "Sales";
  if (/\b(marketing|seo|content|campaign|brand)\b/.test(text)) return "Marketing";
  return "IT";
}

function inferExperience(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();
  if (/(fresher|graduate|entry level|intern|trainee)/.test(text)) return "Fresher";
  if (/(5\+|5 years|senior|lead|manager|principal)/.test(text)) return "5+ years";
  if (/(3-5|3 to 5|4 years)/.test(text)) return "3-5 years";
  return "1-3 years";
}

function inferJobType(text = "") {
  const value = text.toLowerCase();
  if (/part.time/.test(value)) return "Part-time";
  if (/contract/.test(value)) return "Contract";
  if (/freelance/.test(value)) return "Freelance";
  return "Full-time";
}

function daysAgo(dateValue) {
  if (!dateValue) return 0;
  const then = new Date(dateValue).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((Date.now() - then) / 86400000));
}

function cleanHtml(value = "") {
  return String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function cityStateFromLocation(value = "") {
  const location = cleanHtml(value) || "Remote";
  const first = location.split(",")[0]?.trim() || "Remote";
  const lower = location.toLowerCase();
  if (lower.includes("india")) return { location: first, state: "India" };
  if (/(worldwide|anywhere|global)/i.test(lower)) return { location: first, state: "Global remote" };
  if (lower.includes("remote")) return { location: "Remote", state: "Pan India" };
  return { location: first, state: location.split(",").slice(1).join(",").trim() || "Location on source" };
}

function hasIndiaSignal(job) {
  const value = `${job.location || ""} ${job.candidate_required_location || ""} ${job.job_country || ""} ${job.job_city || ""}`.toLowerCase();
  if (/(worldwide|anywhere|global|remote)/i.test(value) && !/(europe|americas|us only|usa only|canada|uk only)/i.test(value)) {
    return true;
  }
  return indianCities.some((city) => new RegExp(`(^|[^a-z])${city}([^a-z]|$)`, "i").test(value));
}

function uniqueJobs(jobs) {
  const seen = new Set();
  return jobs.filter((job) => {
    // Normalize title and company for better deduplication across different sources
    const cleanTitle = job.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanCompany = job.company.toLowerCase().replace(/[^a-z0-9]/g, "");
    const key = `${cleanTitle}-${cleanCompany}`;
    
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toAppJob(raw, source, sourceKind) {
  const title = cleanHtml(raw.title || raw.job_title || "Job opening");
  const description = cleanHtml(raw.description || raw.job_description || raw.content || "Open role from a live job source.");
  const company = cleanHtml(raw.company_name || raw.company || raw.employer_name || "Company");
  const locationInfo = cityStateFromLocation(raw.location || raw.candidate_required_location || raw.job_city || raw.job_country || "Remote");
  const url = raw.url || raw.job_apply_link || raw.job_google_link || raw.redirect_url || "#";
  const category = inferCategory(title, description);
  const experience = inferExperience(title, description);
  const type = inferJobType(`${raw.job_employment_type || ""} ${title} ${description}`);

  return {
    id: `${source}-${Buffer.from(`${title}-${company}-${url}`).toString("base64url").slice(0, 18)}`,
    title,
    company,
    category,
    location: locationInfo.location,
    state: locationInfo.state,
    salaryMin: 0,
    salaryMax: 0,
    type,
    experience,
    postedDays: daysAgo(raw.created_at || raw.publication_date || raw.job_posted_at_datetime_utc || raw.date),
    source,
    sourceKind,
    description: description || `${title} at ${company}`,
    responsibilities: ["Review the original listing for full responsibilities", "Apply only through the credited source link", "Keep profile and resume updated"],
    requirements: ["Check experience and education criteria on the source page", "Verify location, salary, and application deadline", "Avoid sharing sensitive documents outside trusted portals"],
    companyInfo: `${company} listing fetched from ${source}. Always verify final details on the original job page.`,
    applyUrl: url,
    appliedCount: Math.floor(80 + Math.random() * 2400),
    rating: Number((3.7 + Math.random() * 0.9).toFixed(1)),
    skills: [...new Set((description.match(/\b(JavaScript|TypeScript|React|Node|Python|Java|SQL|AWS|Azure|Excel|Sales|Marketing|Teaching|Banking|HR|SEO)\b/gi) || []).map((skill) => skill[0].toUpperCase() + skill.slice(1).toLowerCase()))].slice(0, 5),
  };
}

function toGreenhouseJob(job, source) {
  const location = (job.offices || []).map((office) => office.name).join(", ") || job.location?.name || "Remote";
  return toAppJob(
    {
      title: job.title,
      company: source,
      description: job.content || job.metadata?.join(" "),
      location,
      url: job.absolute_url,
      created_at: job.updated_at,
    },
    source,
    "Direct Company"
  );
}

function toLeverJob(job, source) {
  return toAppJob(
    {
      title: job.text,
      company: source,
      description: `${job.descriptionPlain || ""} ${(job.lists || []).map((list) => `${list.text} ${(list.content || "").replace(/\n/g, " ")}`).join(" ")}`,
      location: job.categories?.location || "Remote",
      url: job.hostedUrl,
      created_at: job.createdAt ? new Date(job.createdAt).toISOString() : undefined,
      job_employment_type: job.categories?.commitment,
    },
    source,
    "Direct Company"
  );
}

function toRssJob(item, source) {
  return toAppJob(
    {
      title: item.title,
      company: source,
      description: item.description || item["content:encoded"],
      location: "India",
      url: item.link,
      created_at: item.pubDate,
    },
    source,
    "Government"
  );
}

function toPublicWebResult(item, source, query) {
  return toAppJob(
    {
      title: item.title,
      company: source,
      description: item.snippet || query,
      location: "India",
      url: item.link,
      created_at: undefined,
    },
    source,
    inferCategory(item.title || query, item.snippet || query) === "Government" ? "Government" : "Specialized"
  );
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "User-Agent": "IndiaJobFinder/1.0",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

async function fetchScraped(source, query, location) {
  if (!source.enabled || !source.url) return [];

  const searchUrl = source.url
    .replace("{query}", encodeURIComponent(query || "jobs"))
    .replace("{location}", encodeURIComponent(location && location !== "All" ? location : "India"));

  try {
    const html = await fetchText(searchUrl);
    const $ = cheerio.load(html);
    const jobs = [];

    $(source.container).each((_, element) => {
      const el = $(element);
      const title = el.find(source.selectors.title).text().trim();
      const company = el.find(source.selectors.company).text().trim();
      const jobLocation = el.find(source.selectors.location).text().trim();
      let link = el.find(source.selectors.link).attr("href");

      if (link && !link.startsWith("http")) {
        const base = new URL(searchUrl).origin;
        link = new URL(link, base).href;
      }

      if (title && company) {
        jobs.push(
          toAppJob(
            {
              title,
              company,
              location: jobLocation,
              url: link,
              description: el.find(source.selectors.description).text().trim(),
              date: el.find(source.selectors.posted).text().trim(),
            },
            source.name,
            "Web Scraper"
          )
        );
      }
    });

    return jobs;
  } catch (error) {
    console.error(`Scraper error for ${source.name}:`, error.message);
    throw error;
  }
}

async function fetchArbeitnow() {
  const data = await fetchJson("https://www.arbeitnow.com/api/job-board-api");
  return (data.data || [])
    .filter(hasIndiaSignal)
    .map((job) => toAppJob(job, "Arbeitnow Live", "Job Portal"));
}

async function fetchRemotive(query) {
  const url = new URL("https://remotive.com/api/remote-jobs");
  if (query) url.searchParams.set("search", query);
  const data = await fetchJson(url);
  return (data.jobs || [])
    .filter(hasIndiaSignal)
    .map((job) => toAppJob(job, "Remotive Live", "Job Portal"));
}

async function fetchJSearch(query, location) {
  if (!process.env.JSEARCH_API_KEY) return [];
  const url = new URL("https://jsearch.p.rapidapi.com/search");
  url.searchParams.set("query", `${query || "jobs"} in ${location && location !== "All" ? location : "India"}`);
  url.searchParams.set("page", "1");
  url.searchParams.set("num_pages", "1");
  url.searchParams.set("country", "in");
  const data = await fetchJson(url, {
    headers: {
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
      "x-rapidapi-key": process.env.JSEARCH_API_KEY,
    },
  });
  return (data.data || []).map((job) => toAppJob(job, "JSearch India", "Job Portal"));
}

async function fetchAdzuna(query, location) {
  if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) return [];
  const url = new URL("https://api.adzuna.com/v1/api/jobs/in/search/1");
  url.searchParams.set("app_id", process.env.ADZUNA_APP_ID);
  url.searchParams.set("app_key", process.env.ADZUNA_APP_KEY);
  url.searchParams.set("results_per_page", "50");
  url.searchParams.set("what", query || "jobs");
  url.searchParams.set("where", location && location !== "All" ? location : "India");
  url.searchParams.set("content-type", "application/json");
  const data = await fetchJson(url);
  return (data.results || []).map((job) =>
    toAppJob(
      {
        title: job.title,
        company: job.company?.display_name,
        description: job.description,
        location: job.location?.display_name,
        url: job.redirect_url,
        created_at: job.created,
      },
      "Adzuna India",
      "Job Portal"
    )
  );
}

async function fetchJooble(query, location) {
  if (!process.env.JOOBLE_API_KEY) return [];
  const data = await fetchJson(`https://jooble.org/api/${process.env.JOOBLE_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      keywords: query || "jobs",
      location: location && location !== "All" ? `${location}, India` : "India",
      page: 1,
    }),
  });
  return (data.jobs || []).map((job) =>
    toAppJob(
      {
        title: job.title,
        company: job.company,
        description: job.snippet,
        location: job.location,
        url: job.link,
        created_at: job.updated,
        job_employment_type: job.type,
      },
      "Jooble India",
      "Job Portal"
    )
  );
}

async function fetchJobicy(query) {
  const url = new URL("https://jobicy.com/api/v2/remote-jobs");
  url.searchParams.set("count", "50");
  url.searchParams.set("geo", "india");
  if (query) url.searchParams.set("tag", query);
  const data = await fetchJson(url);
  return (data.jobs || []).map((job) =>
    toAppJob(
      {
        title: job.jobTitle,
        company: job.companyName,
        description: job.jobDescription,
        location: job.jobGeo || "India remote",
        url: job.url,
        created_at: job.pubDate,
        job_employment_type: job.jobType,
      },
      "Jobicy India Remote",
      "Job Portal"
    )
  );
}

async function fetchHimalayas(query) {
  const url = new URL("https://himalayas.app/jobs/api");
  if (query) url.searchParams.set("query", query);
  url.searchParams.set("limit", "100");
  const data = await fetchJson(url);
  const items = Array.isArray(data) ? data : data.jobs || data.data || [];
  return items
    .filter((job) => {
      const location = `${job.locationRestrictions || ""} ${job.location || ""} ${job.countries || ""}`.toLowerCase();
      return !location || hasIndiaSignal({ location }) || /(worldwide|anywhere|global|remote)/i.test(location);
    })
    .map((job) =>
      toAppJob(
        {
          title: job.title,
          company: job.company?.name || job.companyName,
          description: job.description || job.excerpt,
          location: job.locationRestrictions || job.location || "Remote",
          url: job.applicationLink || job.url,
          created_at: job.pubDate || job.postedAt || job.createdAt,
          job_employment_type: job.employmentType,
        },
        "Himalayas Remote",
        "Job Portal"
      )
    );
}

async function fetchGreenhouse(source) {
  if (!source.enabled || !source.board) return [];
  const data = await fetchJson(`https://boards-api.greenhouse.io/v1/boards/${source.board}/jobs?content=true`);
  return (data.jobs || []).filter(hasIndiaSignal).map((job) => toGreenhouseJob(job, source.name || source.board));
}

async function fetchLever(source) {
  if (!source.enabled || !source.site) return [];
  const data = await fetchJson(`https://api.lever.co/v0/postings/${source.site}?mode=json`);
  return (Array.isArray(data) ? data : []).filter(hasIndiaSignal).map((job) => toLeverJob(job, source.name || source.site));
}

async function fetchRss(source) {
  if (!source.enabled || !source.url) return [];
  const text = await fetchText(source.url);
  const parsed = xmlParser.parse(text);
  const items = parsed.rss?.channel?.item || parsed.feed?.entry || [];
  return (Array.isArray(items) ? items : [items]).map((item) => toRssJob(item, source.name || "RSS Jobs"));
}

async function fetchGoogleCse(source, userQuery) {
  if (!source.enabled || !process.env.GOOGLE_CSE_API_KEY || !process.env.GOOGLE_CSE_CX) return [];
  const query = `${userQuery || ""} ${source.query || ""}`.trim();
  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", process.env.GOOGLE_CSE_API_KEY);
  url.searchParams.set("cx", process.env.GOOGLE_CSE_CX);
  url.searchParams.set("q", query || "India jobs hiring hackathon placement questions");
  url.searchParams.set("num", "10");
  url.searchParams.set("safe", "active");
  const data = await fetchJson(url);
  return (data.items || []).map((item) => toPublicWebResult(item, source.name || "Public Web", query));
}

async function buildSourceRunners(query, location) {
  const config = await loadSourceConfig();
  return [
    { name: "JSearch India", type: "Job Portal API", enabled: Boolean(process.env.JSEARCH_API_KEY), run: () => fetchJSearch(query, location) },
    { name: "Adzuna India", type: "Job Portal API", enabled: Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY), run: () => fetchAdzuna(query, location) },
    { name: "Jooble India", type: "Job Portal API", enabled: Boolean(process.env.JOOBLE_API_KEY), run: () => fetchJooble(query, location) },
    { name: "Himalayas Remote", type: "Public API", enabled: true, run: () => fetchHimalayas(query) },
    { name: "Jobicy India Remote", type: "Public API", enabled: true, run: () => fetchJobicy(query) },
    { name: "Arbeitnow Live", type: "Public API", enabled: true, run: () => fetchArbeitnow() },
    { name: "Remotive Live", type: "Public API", enabled: true, run: () => fetchRemotive(query) },
    ...(config.greenhouse || []).map((source) => ({ name: source.name || source.board, type: "Company career API", enabled: Boolean(source.enabled), run: () => fetchGreenhouse(source) })),
    ...(config.lever || []).map((source) => ({ name: source.name || source.site, type: "Company career API", enabled: Boolean(source.enabled), run: () => fetchLever(source) })),
    ...(config.rss || []).map((source) => ({ name: source.name || source.url, type: "RSS/Government feed", enabled: Boolean(source.enabled), run: () => fetchRss(source) })),
    ...(config.publicWebQueries || []).map((source) => ({
      name: source.name || "Public Web Search",
      type: "Google Programmable Search",
      enabled: Boolean(source.enabled && process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_CX),
      run: () => fetchGoogleCse(source, query),
    })),
    ...(config.scrapers || []).map((source) => ({
      name: source.name,
      type: "Web Scraper Engine",
      enabled: Boolean(source.enabled),
      run: () => fetchScraped(source, query, location),
    })),
  ];
}

function applyFilters(jobs, query, category, experience, type, location, posted) {
  const q = String(query || "").trim().toLowerCase();
  const maxPosted = Number(posted || 30);
  return jobs.filter((job) => {
    const text = `${job.title} ${job.company} ${job.location} ${job.state} ${job.category} ${job.source} ${job.description} ${job.skills.join(" ")}`.toLowerCase();
    return (
      (!q || text.includes(q)) &&
      (!category || category === "All" || job.category === category) &&
      (!experience || experience === "All" || job.experience === experience) &&
      (!type || type === "All" || job.type === type) &&
      (!location || location === "All" || job.location.toLowerCase().includes(String(location).toLowerCase())) &&
      job.postedDays <= maxPosted
    );
  });
}

app.get("/api/jobs", async (request, response) => {
  const { query = "", category = "All", experience = "All", type = "All", location = "All", posted = "30" } = request.query;
  const queryText = String(query || "").trim();
  const categoryText = String(category || "").trim();
  const search = queryText || (categoryText && categoryText !== "All" ? categoryText : "");
  const runners = await buildSourceRunners(search, String(location));
  const enabledRunners = runners.filter((runner) => runner.enabled);
  const results = await Promise.allSettled(enabledRunners.map((runner) => runner.run()));

  const jobs = uniqueJobs(results.flatMap((result) => (result.status === "fulfilled" ? result.value : [])));
  response.json({
    jobs: applyFilters(jobs, query, category, experience, type, location, posted).slice(0, 80),
    fetchedAt: new Date().toISOString(),
    sources: enabledRunners.map((runner, index) => {
      const result = results[index];
      return {
        name: runner.name,
        type: runner.type,
        ok: result.status === "fulfilled",
        count: result.status === "fulfilled" ? result.value.length : 0,
        error: result.status === "rejected" ? result.reason.message : null,
      };
    }),
    disabledSources: runners.filter((runner) => !runner.enabled).map((runner) => ({ name: runner.name, type: runner.type })),
    needsApiKey:
      !process.env.JSEARCH_API_KEY ||
      !process.env.ADZUNA_APP_ID ||
      !process.env.JOOBLE_API_KEY ||
      !process.env.GOOGLE_CSE_API_KEY ||
      !process.env.GOOGLE_CSE_CX,
  });
});

app.get("/api/sources", async (_request, response) => {
  const runners = await buildSourceRunners("jobs", "India");
  response.json({
    sources: runners.map((runner) => ({
      name: runner.name,
      type: runner.type,
      enabled: runner.enabled,
    })),
    note: "Enable more sources through .env API keys or server/sources.json. Only use APIs, RSS feeds, or career boards that allow automated access.",
  });
});

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "India Job Finder API" });
});

app.listen(port, () => {
  console.log(`India Job Finder API running at http://127.0.0.1:${port}`);
});
