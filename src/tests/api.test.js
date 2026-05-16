import request from "supertest";
import express from "express";
import jobRoutes from "../server/src/routes/jobRoutes.js";

const app = express();
app.use(express.json());
app.use("/api/jobs", jobRoutes);

describe("Job API Integration Tests", () => {
  it("GET /api/jobs should return a list of jobs", async () => {
    const res = await request(app).get("/api/jobs");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body.jobs)).toBe(true);
  });

  it("POST /api/jobs/:id/analyze should handle errors for invalid ID", async () => {
    const res = await request(app).post("/api/jobs/invalid-id/analyze");
    expect(res.statusCode).toEqual(404);
  });
});
