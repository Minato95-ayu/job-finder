# 🌌 Ayush's Job Intelligence: Enterprise Career Platform

[![CI/CD Pipeline](https://github.com/Minato95-ayu/job-finder/actions/workflows/main.yml/badge.svg)](https://github.com/Minato95-ayu/job-finder/actions)
[![Infrastructure: Terraform](https://img.shields.io/badge/Infra-Terraform-623CE4?logo=terraform)](./terraform)
[![Orchestration: Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes-326CE5?logo=kubernetes)](./k8s)
[![ML: Gemini 1.5 Pro](https://img.shields.io/badge/ML-Gemini--1.5--Pro-blue?logo=google-gemini)](https://ai.google.dev/)

**Ayush's Job Intelligence** is a FAANG-level career intelligence platform developed by Ayush. It’s a distributed AI ecosystem that automates resume matching, detects fraudulent listings, and provides personalized career roadmaps.

---

## 🖼️ UI/UX Showcase

![Platform Dashboard](./public/mockup.png)
*Premium Glassmorphism Interface powered by Ayush's Intelligence Engine*

---

## 🚀 Key "Intelligent" Features

### 🔥 1. AI Resume Match Engine (ATS Analysis)
Upload your resume in PDF format and get an instant **ATS Score**. Ayush's Gemini-powered engine extracts your skills and compares them directly with job requirements.

### 🤖 2. Personalized AI Career Agent
A dedicated hub for career growth. Ask the agent about salary trends, skill roadmaps, and city-specific insights for tech hubs like Bangalore and Pune.

### 🛡️ 3. AI Fraud Intelligence
A robust scam-detection pipeline that analyzes recruiter authenticity and salary anomalies using multi-agent risk scoring.

---

## 🏗️ System Architecture

```mermaid
graph TD
    User((User)) -->|HTTPS| API[Ayush's Job API]
    API -->|Cache| Redis[(Redis Cluster)]
    
    subgraph "Intelligent Core"
        API -->|Match| Resume[Resume Engine]
        API -->|Chat| Agent[Career Agent Hub]
    end

    subgraph "Distributed Data Pipeline"
        API -->|Enqueue| Queue[BullMQ / Redis]
        Queue -->|Fetch| Worker[Scraper Workers]
        Worker -->|Vectorize| Embed[Gemini Embeddings]
        Worker -->|Store| DB[(PostgreSQL / Vector DB)]
    end
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, BullMQ.
- **AI/ML**: Google Gemini 1.5 Pro, text-embedding-004.
- **Infra**: Docker, Kubernetes, Terraform, GitHub Actions.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
*Built with ❤️ by Ayush.*