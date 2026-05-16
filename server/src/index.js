import "dotenv/config";
import express from "express";
import cors from "cors";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Enterprise Imports
import logger from "./utils/logger.js";
import { securityMiddleware, globalRateLimit, errorHandler } from "./middleware/security.js";
import { addScrapeTask } from "./services/queue.service.js";
import { startScraperWorker } from "./workers/scraper.worker.js";
import jobRoutes from "./routes/jobRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";

const app = express();
const port = process.env.PORT || 4000;
const __dirname = dirname(fileURLToPath(import.meta.url));

// 1. Hardened Security Layer
app.use(securityMiddleware);
app.use(globalRateLimit);
app.use(cors());
app.use(express.json());

// 2. Observability: Request Logging
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url, ip: req.ip }, "Incoming Request");
  next();
});

// 3. Robust Routes
app.use("/api/jobs", jobRoutes);
app.use("/api/resume", resumeRoutes);

// 4. Production Asset Delivery
const distPath = join(__dirname, "../../../dist");
app.use(express.static(distPath));
app.get("*", (req, res) => res.sendFile(join(distPath, "index.html")));

// 5. Global Error Boundary
app.use(errorHandler);

// 6. Enterprise Scale: Start Distributed Workers
if (process.env.NODE_ENV === "production" || process.env.START_WORKERS === "true") {
  startScraperWorker();
  logger.info("Distributed Scraper Workers started");
}

app.listen(port, () => {
  logger.info({ port }, "Ayush's Job Intelligence Engine Online");
  
  // Initial enterprise task
  addScrapeTask("Software Engineer", "India");
});
