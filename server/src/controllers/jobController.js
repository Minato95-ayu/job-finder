import db from "../config/db.js";
import { analyzeJob as analyzeJobAI } from "../services/aiService.js";

export const getJobs = async (req, res) => {
  try {
    const { query = "", category = "All", experience = "All", type = "All", location = "All", posted = "30" } = req.query;

    let sql = "SELECT * FROM jobs WHERE is_scam = 0";
    const params = [];

    if (query) {
      sql += " AND (title LIKE ? OR company LIKE ? OR description LIKE ?)";
      const q = `%${query}%`;
      params.push(q, q, q);
    }

    if (category !== "All") {
      sql += " AND category = ?";
      params.push(category);
    }

    if (experience !== "All") {
      sql += " AND experience = ?";
      params.push(experience);
    }

    if (location !== "All") {
      sql += " AND location LIKE ?";
      params.push(`%${location}%`);
    }

    sql += " AND postedDays <= ?";
    params.push(Number(posted));

    sql += " ORDER BY fetchedAt DESC LIMIT 100";

    const jobs = db.prepare(sql).all(...params).map(job => ({
      ...job,
      skills: JSON.parse(job.skills || "[]"),
      ai_analysis: job.ai_analysis ? JSON.parse(job.ai_analysis) : null
    }));

    res.json({
      jobs,
      fetchedAt: new Date().toISOString(),
      total: jobs.length,
      note: "Served from robust modular backend with AI pre-analysis."
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const analyzeJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(id);

    if (!job) return res.status(404).json({ error: "Job not found" });

    // Check if cached
    if (job.ai_analysis) {
        return res.json(JSON.parse(job.ai_analysis));
    }

    const analysis = await analyzeJobAI(job);
    if (analysis) {
        db.prepare("UPDATE jobs SET ai_analysis = ?, is_scam = ?, ai_score = ? WHERE id = ?")
          .run(JSON.stringify(analysis), analysis.scam_check.score > 7 ? 1 : 0, analysis.match_score || 0, id);
        res.json(analysis);
    } else {
        res.status(500).json({ error: "AI analysis failed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
