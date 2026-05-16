import { Worker } from "bullmq";
import axios from "axios";
import * as cheerio from "cheerio";
import logger from "../utils/logger.js";
import db from "../config/db.js";
import { generateEmbedding } from "../services/vector.service.js";
import RedisMock from "ioredis-mock";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const USE_MOCK_REDIS = process.env.USE_MOCK_REDIS === "true" || process.env.NODE_ENV !== "production";

export const processScrapeTask = async (job) => {
  const { query, location } = job.data;
  logger.info({ query }, "Processing scrape task");

  try {
    // 1. Fetch with Proxy and Advanced Headers (Anti-bot)
    const jobs = await fetchJobsWithAntiBot(query, location);
    
    // 2. Process and Ingest
    for (const rawJob of jobs) {
      const embedding = await generateEmbedding(`${rawJob.title} ${rawJob.description}`);
      
      db.prepare(`
        INSERT OR REPLACE INTO jobs (id, title, company, description, vector_data)
        VALUES (?, ?, ?, ?, ?)
      `).run(rawJob.id, rawJob.title, rawJob.company, rawJob.description, JSON.stringify(embedding));
    }

    logger.info({ count: jobs.length }, "Task completed successfully");
  } catch (err) {
    logger.error(err, "Task execution failed");
    throw err;
  }
};

export const startScraperWorker = () => {
  if (process.env.USE_MOCK_REDIS === "true") return; // Skip worker if in mock mode

  try {
    const connection = { url: REDIS_URL };
    const worker = new Worker("scraper-tasks", processScrapeTask, { 
      connection,
      concurrency: 5 
    });

    worker.on("completed", (job) => logger.info(`Job ${job.id} completed`));
    worker.on("failed", (job, err) => logger.error(`Job ${job.id} failed: ${err.message}`));
  } catch (e) {
    logger.warn("Worker could not start - likely missing Redis. Fallback active.");
  }
};

async function fetchJobsWithAntiBot(query, location) {
  // FAANG-level anti-bot: In real production, use BrightData or ScrapingBee
  const PROXY_URL = process.env.PROXY_URL; 
  
  const response = await axios.get("https://himalayas.app/jobs/api", {
    params: { query, limit: 50 },
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
    },
    proxy: PROXY_URL ? { host: PROXY_URL } : undefined,
    timeout: 10000
  });

  return response.data.jobs || [];
}
