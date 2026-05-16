import { Queue } from "bullmq";
import IORedis from "ioredis";
import logger from "../utils/logger.js";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const scraperQueue = new Queue("scraper-tasks", { 
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
  }
});

export async function addScrapeTask(query, location) {
  logger.info({ query, location }, "Adding scrape task to distributed queue");
  await scraperQueue.add("fetch-jobs", { query, location });
}

connection.on("error", (err) => {
  logger.error(err, "Redis connection error. Enterprise queues may be offline.");
});
