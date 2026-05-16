# 🌌 Ayush's Job Intelligence
### The Future of Career Discovery in India 🚀

[![CI/CD Pipeline](https://github.com/Minato95-ayu/job-finder/actions/workflows/main.yml/badge.svg)](https://github.com/Minato95-ayu/job-finder/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Engine: Gemini 1.5 Pro](https://img.shields.io/badge/AI-Gemini--1.5--Pro-blue?logo=google-gemini)](https://ai.google.dev/)
[![Infra: Terraform](https://img.shields.io/badge/Infra-Terraform-623CE4?logo=terraform)](./terraform)

**Ayush's Job Intelligence** is a high-performance, enterprise-grade career platform designed to solve the noise and fraud in the modern job market. Built with a distributed architecture and powered by advanced Generative AI, it transforms how candidates discover, analyze, and apply for roles.

---

## 🖼️ Interface
![Platform Dashboard](./public/mockup.png)

---

## 💡 Why I Built This? (The Motivation)
In the current Indian job market, candidates face two major issues: **Information Overload** and **Job Scams**. 
I built this platform to:
- **Bring Transparency**: Use AI to verify the legitimacy of every job listing.
- **Empower Candidates**: Provide a real ATS-style resume matcher so candidates know exactly where they stand.
- **Scale Responsibly**: Use a distributed worker system to ingest thousands of jobs without crashing the core API.

---

## 🚀 Key Engineering Highlights

### 🧠 1. Multi-Agent AI Workflow
The system doesn't just "search" for jobs. It runs a series of AI agents:
- **The Profiler**: Extracts deep semantics from your resume.
- **The Auditor**: Scrutinizes job listings for "Red Flags" (scam detection).
- **The Strategist**: Generates a 6-month roadmap based on the gap between your skills and the market demand.

### ⛓️ 2. Distributed Task Processing
To handle thousands of job postings, I implemented a **BullMQ + Redis** pipeline. 
- Heavy tasks (scraping, AI analysis, vectorization) are offloaded to background workers.
- This ensures the main API remains responsive with sub-100ms latency.

### 🔍 3. Vector-Semantic Search
Moved beyond basic SQL `LIKE` queries. By converting jobs into **Vector Embeddings**, the platform understands intent. Searching for "High paying remote React roles" returns roles that match the *context*, not just the keywords.

---

## 🏗️ System Architecture & Design

```mermaid
graph TD
    User((User)) -->|HTTPS| API[Ayush's Job API]
    API -->|Cache| Redis[(Redis Cluster)]
    
    subgraph "AI Intelligence Layer"
        API -->|Match| Resume[Resume Engine]
        API -->|Insights| Agent[Career Agent]
        Resume -->|Prompt| Gemini[Gemini 1.5 Pro]
    end

    subgraph "Distributed Ingestion"
        API -->|Enqueue| Queue[BullMQ / Redis]
        Queue -->|Fetch| Worker[Distributed Workers]
        Worker -->|Clean| Cleaner[Data Sanitizer]
        Worker -->|Store| DB[(PostgreSQL + Vector Store)]
    end
```

---

## 🛠️ Technical Stack

- **Backend**: Node.js (Express), BullMQ, IORedis.
- **Frontend**: React 19, Framer Motion, Lucide.
- **Database**: PostgreSQL (Relational) + Redis (Cache/Queue).
- **AI Stack**: Google Gemini 1.5 Pro (LLM), Text-Embedding-004.
- **DevOps**: Docker, Kubernetes (K8s), Terraform, GitHub Actions.

---

## 🗺️ Future Roadmap
- [ ] **Interview Copilot**: Real-time AI mock interviews for specific jobs.
- [ ] **Salary Heatmaps**: Interactive visualization of tech salaries across India.
- [ ] **WhatsApp Integration**: Real-time job alerts via a secure AI bot.

---

## 📄 License
This project is licensed under the **MIT License**.
*Developed and maintained by [Ayush](https://github.com/Minato95-ayu).*