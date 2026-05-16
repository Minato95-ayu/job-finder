# 🌌 Antigravity: Enterprise Job Intelligence Platform

[![CI/CD Pipeline](https://github.com/Minato95-ayu/job-finder/actions/workflows/main.yml/badge.svg)](https://github.com/Minato95-ayu/job-finder/actions)
[![Infrastructure: Terraform](https://img.shields.io/badge/Infra-Terraform-623CE4?logo=terraform)](./terraform)
[![Orchestration: Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes-326CE5?logo=kubernetes)](./k8s)
[![ML: Gemini 1.5 Pro](https://img.shields.io/badge/ML-Gemini--1.5--Pro-blue?logo=google-gemini)](https://ai.google.dev/)

**Antigravity** is a FAANG-level job aggregation and intelligence engine designed for the modern Indian job market. It leverages distributed workers, vector search infra, and real-time AI analysis to provide a high-fidelity, scam-free job discovery experience.

---

## 🖼️ UI/UX Showcase

![Antigravity Dashboard](./public/mockup.png)
*Premium Glassmorphism Interface with Real-time AI Job Insights*

---

## 🏗️ System Architecture

```mermaid
graph TD
    User((User)) -->|HTTPS| GCLB[Google Cloud Load Balancer]
    GCLB -->|WAF/Armor| K8s[GKE Cluster / Cloud Run]
    
    subgraph "Core API Layer"
        K8s -->|Express.js| API[Job API Service]
        API -->|Cache| Redis[(Redis Cluster)]
        API -->|Auth| JWT[JWT/Auth Service]
    end

    subgraph "Distributed Data Pipeline"
        API -->|Enqueue| Queue[BullMQ / Redis]
        Queue -->|Fetch| Worker[Distributed Scraper Workers]
        Worker -->|Anti-Bot| Proxy[Rotating Proxy Service]
        Worker -->|Vectorize| Gemini[Gemini Embeddings]
        Worker -->|Store| DB[(PostgreSQL / Vector DB)]
    end

    subgraph "Observability"
        API -.->|Traces| OTel[OpenTelemetry / Jaeger]
        API -.->|Logs| Pino[Pino / Cloud Logging]
    end
```

---

## 🛠️ Enterprise Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Lucide, Framer Motion |
| **Backend** | Node.js, Express, BullMQ, Pino |
| **Database** | PostgreSQL, Redis (HA), Vector Embeddings |
| **AI/ML** | Gemini 1.5 Pro (Analysis), text-embedding-004 (Vector) |
| **Infrastructure** | Terraform, Kubernetes, Docker, GitHub Actions |
| **Security** | Helmet, Rate Limiting, JWT, WAF |

---

## ⚡ Key Enterprise Features

### 🔍 AI Semantic Search (Vector Infra)
Unlike traditional keyword matching, Antigravity uses **Vector Embeddings**. We convert job descriptions into high-dimensional vectors, allowing users to find roles based on *meaning* and *intent*.

### 🛡️ Distributed Worker System
Our scraping engine is decoupled from the API.
- **Queue**: BullMQ manages thousands of concurrent scraping tasks.
- **Workers**: Horizontally scalable processes that ingest data from Greenhouse, Lever, and specialized portals.
- **Anti-Bot**: Advanced header fingerprinting and proxy rotation to ensure 99.9% uptime for data ingestion.

### 📈 Observability & Tracing
Integrated **OpenTelemetry** for FAANG-level distributed tracing. Monitor request bottlenecks across microservices and DB queries in real-time.

---

## 🚀 Deployment & Operations

### Local Development
```bash
# Install dependencies
npm install

# Setup Redis & Environment
cp .env.example .env

# Run robust dev stack
npm run dev
```

### Production Hardening
- **CI/CD**: Automated via `.github/workflows/main.yml`.
- **Infrastructure**: Managed via Terraform in `/terraform`.
- **Orchestration**: Kubernetes manifests in `/k8s`.

---

## 📡 API Flow (Sequence)

```mermaid
sequenceDiagram
    participant U as User
    participant A as API Server
    participant R as Redis Cache
    participant V as Vector DB
    
    U->>A: GET /api/jobs?query="semantic query"
    A->>R: Check Cache
    alt Cache Hit
        R-->>A: Return JSON
    else Cache Miss
        A->>V: Execute Vector Search
        V-->>A: Top K Similar Jobs
        A->>R: Store in Cache
    end
    A-->>U: Return Results
```

---

## 🤝 Contributing
Antigravity is built for scale. Please review our [Enterprise Coding Standards](./CONTRIBUTING.md) before submitting PRs.

---

## 📄 License
Enterprise Core License © 2026 Antigravity Systems.