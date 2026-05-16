import "dotenv/config";
import cors from "cors";
import express from "express";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import cron from "node-cron";
import jobRoutes from "./routes/jobRoutes.js";
import { runScrapers } from "./services/scraperService.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/jobs", jobRoutes);

// Static files (frontend build)
const distPath = join(__dirname, "../../../dist");
app.use(express.static(distPath));

app.get("*", (req, res) => {
  res.sendFile(join(distPath, "index.html"));
});

// Stable Data Pipeline: Schedule scraping every hour
cron.schedule("0 * * * *", () => {
    console.log("[Cron] Triggering hourly data ingestion");
    runScrapers("Software Engineer", "India");
    runScrapers("Web Developer", "India");
});

// Initial scrape on startup
setTimeout(() => {
    console.log("[Startup] Initializing data pipeline...");
    runScrapers("jobs", "India");
}, 5000);

app.listen(port, "0.0.0.0", () => {
  console.log(`[Server] Robust Backend Infra running at http://localhost:${port}`);
  console.log(`[ML] Pipeline initialized with Gemini 1.5 Flash`);
});
