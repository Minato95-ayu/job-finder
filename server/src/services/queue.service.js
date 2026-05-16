import { Queue } from "bullmq";
import Redis from "ioredis";
import logger from "../utils/logger.js";
import { processScrapeTask } from "../workers/scraper.worker.js";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
let scrapeQueue;
let isMock = false;

try {
  // Try to connect to real Redis, if fails, use Mock mode
  const connection = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    connectTimeout: 2000,
  });

  connection.on("error", (err) => {
    if (!isMock) {
      logger.warn("Redis not found. Switching to In-Memory Fallback Mode (Ayush's Mode)");
      isMock = true;
    }
  });

  scrapeQueue = new Queue("scraper-tasks", { connection });
} catch (e) {
  isMock = true;
  logger.warn("Redis connection failed. Using In-Memory Fallback.");
}

/**
 * Adds a job to the distributed scraping queue OR executes directly in Mock mode
 */
export const addScrapeTask = async (query, location) => {
  if (isMock) {
    logger.info({ query, location }, "Executing task in In-Memory mode");
    // Directly call the processing logic
    processScrapeTask({ data: { query, location } }).catch(err => {
      logger.error(err, "In-memory task failed");
    });
    return;
  }

  try {
    await scrapeQueue.add("fetch-jobs", { query, location }, {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 }
    });
    logger.info({ query, location }, "Task added to distributed queue");
  } catch (err) {
    logger.error(err, "Failed to add task to queue, falling back to In-Memory");
    processScrapeTask({ data: { query, location } });
  }
};
