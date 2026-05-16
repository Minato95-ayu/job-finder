import { Worker } from "bullmq";
import axios from "axios";
import * as cheerio from "cheerio";
import logger from "../utils/logger.js";
import db from "../config/db.js";
import { generateEmbedding } from "./vector.service.js";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

/**
 * Enterprise Scraper Worker
 * Handles distributed tasks with anti-bot logic
 */
export const startScraperWorker = () => {
  const worker = new Worker("scraper-tasks", async (job) => {
    const { query, location } = job.data;
    logger.info({ jobId: job.id, query }, "Starting distributed scrape worker");

    try {
      // 1. Fetch with Proxy and Advanced Headers (Anti-bot)
      const jobs = await fetchJobsWithAntiBot(query, location);
      
      // 2. Process and Ingest
      for (const rawJob of jobs) {
        // Generate Vector Embeddings for every job (Enterprise Search)
        const embedding = await generateEmbedding(`${rawJob.title} ${rawJob.description}`);
        
        db.prepare(`
          INSERT OR REPLACE INTO jobs (id, title, company, description, vector_data)
          VALUES (?, ?, ?, ?, ?)
        `).run(rawJob.id, rawJob.title, rawJob.company, rawJob.description, JSON.stringify(embedding));
      }

      logger.info({ count: jobs.length }, "Scrape task completed successfully");
    } catch (err) {
      logger.error(err, "Worker task failed");
      throw err; // Allow BullMQ to retry
    }
  }, { 
    connection: { url: REDIS_URL },
    concurrency: 5 // Enterprise-level parallel processing
  });

  worker.on("completed", (job) => logger.info(`Job ${job.id} completed`));
  worker.on("failed", (job, err) => logger.error(`Job ${job.id} failed: ${err.message}`));
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
