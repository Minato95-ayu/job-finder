import pdf from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "../utils/logger.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function parseResume(buffer) {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    logger.error(error, "Failed to parse PDF resume");
    throw new Error("Could not read PDF content");
  }
}

export async function matchResumeToJob(resumeText, jobData) {
  try {
    const prompt = `You are an expert ATS (Applicant Tracking System) and Career Coach. 
    Compare this resume with the job description below.
    
    Resume: ${resumeText.slice(0, 4000)}
    
    Job Title: ${jobData.title}
    Job Description: ${jobData.description}
    
    Return a JSON response with:
    {
      "match_percentage": 0-100,
      "ats_score": 0-100,
      "missing_skills": ["skill 1", "skill 2"],
      "matched_skills": ["skill 1", "skill 2"],
      "strengths": ["point 1", "point 2"],
      "improvement_tips": ["tip 1", "tip 2"],
      "verdict": "1-sentence summary of fit"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    logger.error(error, "Resume Match AI failed");
    return null;
  }
}
