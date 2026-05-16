import { Router } from "express";
import * as jobController from "../controllers/jobController.js";

const router = Router();

router.get("/", jobController.getJobs);
router.post("/:id/analyze", jobController.analyzeJob);

export default router;
