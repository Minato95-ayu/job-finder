import * as cheerio from "cheerio";
import { XMLParser } from "fast-xml-parser";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import db from "../config/db.js";
import * as helpers from "../utils/helpers.js";
import { analyzeJob } from "./aiService.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const xmlParser = new XMLParser({ ignoreAttributes: false });

const userAgents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
];

const indianCities = ["india", "bengaluru", "bangalore", "delhi", "mumbai", "hyderabad", "pune", "chennai", "gurugram", "gurgaon", "ahmedabad", "lucknow", "noida", "kolkata", "jaipur", "kochi", "indore", "remote", "chandigarh", "bhubaneswar", "coimbatore", "nagpur", "surat", "thiruvananthapuram", "visakhapatnam", "varanasi", "patna", "guwahati"];

function getHeaders(url) {
  return {
    "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
    "Accept": "application/json, text/html, */*",
  };
}

async function fetchJson(url, options = {}) {
    const res = await fetch(url, { ...options, headers: { ...getHeaders(url), ...options.headers } });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
}

async function fetchText(url, options = {}) {
    const res = await fetch(url, { ...options, headers: { ...getHeaders(url), ...options.headers } });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.text();
}

function toAppJob(raw, source, sourceKind) {
  const title = helpers.cleanHtml(raw.title || raw.job_title || "Job opening");
  const description = helpers.cleanHtml(raw.description || raw.job_description || raw.content || "Open role.");
  const company = helpers.cleanHtml(raw.company_name || raw.company || raw.employer_name || "Company");
  const loc = helpers.cityStateFromLocation(raw.location || raw.candidate_required_location || "Remote");
  const url = raw.url || raw.job_apply_link || "#";

  return {
    id: `${source}-${Buffer.from(`${title}-${company}-${url}`).toString("base64url").slice(0, 18)}`,
    title,
    company,
    category: helpers.inferCategory(title, description),
    location: loc.location,
    state: loc.state,
    type: helpers.inferJobType(`${raw.job_employment_type || ""} ${title} ${description}`),
    experience: helpers.inferExperience(title, description),
    postedDays: helpers.daysAgo(raw.created_at || raw.publication_date || raw.date),
    source,
    sourceKind,
    description,
    applyUrl: url,
    skills: (description.match(/\b(JavaScript|TypeScript|React|Node|Python|Java|SQL|AWS|Azure|Excel)\b/gi) || []).slice(0, 5)
  };
}

async function fetchHimalayas(query) {
    try {
        const url = `https://himalayas.app/jobs/api?limit=50${query ? `&query=${query}` : ""}`;
        const data = await fetchJson(url);
        return (data.jobs || []).map(j => toAppJob(j, "Himalayas", "Job Portal"));
    } catch (e) { return []; }
}

async function fetchJobicy(query) {
    try {
        const url = `https://jobicy.com/api/v2/remote-jobs?count=50&geo=india${query ? `&tag=${query}` : ""}`;
        const data = await fetchJson(url);
        return (data.jobs || []).map(j => toAppJob(j, "Jobicy", "Job Portal"));
    } catch (e) { return []; }
}

export async function runScrapers(query = "jobs", location = "India") {
  console.log(`[Pipeline] Ingesting jobs for: ${query}`);
  
  const results = await Promise.allSettled([
    fetchHimalayas(query),
    fetchJobicy(query)
  ]);

  const allJobs = results.flatMap(r => r.status === "fulfilled" ? r.value : []);
  
  const insert = db.prepare(`
    INSERT OR REPLACE INTO jobs (
      id, title, company, category, location, state, type, experience, 
      postedDays, source, sourceKind, description, applyUrl, skills
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction((jobs) => {
    for (const job of jobs) {
      insert.run(
        job.id, job.title, job.company, job.category, job.location, job.state,
        job.type, job.experience, job.postedDays, job.source, job.sourceKind,
        job.description, job.applyUrl, JSON.stringify(job.skills)
      );
    }
  });

  transaction(allJobs);
  console.log(`[Pipeline] Saved ${allJobs.length} jobs to DB`);

  // Background Analysis for "Unique Moat" & ML Pipeline
  // Analyze top 3 new jobs that don't have analysis yet
  const unanalyzed = db.prepare("SELECT * FROM jobs WHERE ai_analysis IS NULL LIMIT 3").all();
  for (const job of unanalyzed) {
      console.log(`[ML] Pre-analyzing: ${job.title}`);
      const analysis = await analyzeJob(job);
      if (analysis) {
          db.prepare("UPDATE jobs SET ai_analysis = ?, is_scam = ?, ai_score = ? WHERE id = ?")
            .run(JSON.stringify(analysis), analysis.scam_check.score > 7 ? 1 : 0, analysis.match_score || 0, job.id);
      }
  }
}
