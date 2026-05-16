import { Router } from "express";
import multer from "multer";
import { parseResume, matchResumeToJob } from "../services/resumeService.js";
import db from "../config/db.js";
import logger from "../utils/logger.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/match/:jobId", upload.single("resume"), async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!req.file) return res.status(400).json({ error: "No resume file uploaded" });

    const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    logger.info({ jobId }, "Starting resume match process");
    
    const resumeText = await parseResume(req.file.buffer);
    const matchResults = await matchResumeToJob(resumeText, job);

    res.json(matchResults);
  } catch (error) {
    logger.error(error, "Resume matching endpoint failed");
    res.status(500).json({ error: error.message });
  }
});

export default router;
