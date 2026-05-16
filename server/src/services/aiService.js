import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function analyzeJob(job) {
  try {
    const prompt = `Analyze this job posting for Indian candidates:
    Title: ${job.title}
    Company: ${job.company}
    Description: ${job.description}
    
    Provide a JSON response with:
    {
      "summary": "2-sentence role summary",
      "skills": ["top 5 required technical and soft skills"],
      "scam_check": { "score": 0-10, "reason": "why this score? Be specific about Indian job market risks." },
      "match_score": 0-100,
      "advice": "1 specific tip for this role",
      "questions": ["2 relevant interview questions"]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return null;
  }
}

export async function extractSkills(text) {
  try {
    const prompt = `Extract exactly 5 key skills from this job description as a JSON array of strings:
    ${text.slice(0, 2000)}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    return [];
  }
}
