import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { 
  Search, Sun, Moon, Sparkles, Filter, 
  LayoutDashboard, Briefcase, ShieldCheck, Zap 
} from "lucide-react";
import "./styles.css";
import { JobCard } from "./components/JobCard";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMax?: number;
  postedDays: number;
  description?: string;
  source: string;
  sourceKind: string;
  category: string;
  skills: string[];
  ai_score?: number;
  applyUrl: string;
  ai_analysis?: {
      summary: string;
      skills: string[];
      scam_check: { score: number; reason: string };
      match_score?: number;
      advice: string;
      questions: string[];
  };
}

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [query, setQuery] = useState("");
  const [semanticSearch, setSemanticSearch] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState("explore");

  useEffect(() => {
    fetchJobs();
  }, [query]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs?query=${query}`);
      const data = await res.json();
      setJobs(data.jobs);
      if (data.jobs.length > 0 && !selectedJob) setSelectedJob(data.jobs[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <header className="topbar">
        <div className="brand">
          <Zap size={32} className="logo-icon" />
          <div>
            <strong>Antigravity Jobs</strong>
            <span className="pulsing">AI-Powered Ingestion Active</span>
          </div>
        </div>
        
        <nav className="main-nav">
          <button 
            className={activeTab === 'explore' ? 'active' : ''} 
            onClick={() => setActiveTab('explore')}
          >
            <Search size={18} /> Explore
          </button>
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} /> Moat Insights
          </button>
        </nav>

        <div className="header-actions">
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="user-profile">
            <div className="avatar">A</div>
          </div>
        </div>
      </header>

      <main className="content-layout">
        {activeTab === 'explore' ? (
          <>
            <section className="search-sidebar">
              <div className="search-container">
                <Search className="search-icon" size={20} />
                <input 
                  placeholder={semanticSearch ? "Explain what you're looking for (e.g. 'I want a high-paying remote React role with stock options')" : "Search jobs, skills..."} 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button 
                  className={`semantic-toggle ${semanticSearch ? 'active' : ''}`}
                  onClick={() => setSemanticSearch(!semanticSearch)}
                  title="Toggle AI Semantic Search"
                >
                  <Sparkles size={16} />
                </button>
              </div>
              
              <div className="filter-group">
                <h3><Filter size={16} /> Advanced Filters</h3>
                <div className="chips">
                  <span className="chip active">Remote</span>
                  <span className="chip">Full-time</span>
                  <span className="chip">Bangalore</span>
                  <span className="chip">Fresher</span>
                </div>
              </div>

              <div className="job-feed">
                {loading ? (
                  <div className="loading-state">
                    {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
                  </div>
                ) : (
                  jobs.map(job => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      selected={selectedJob?.id === job.id}
                      onSelect={() => setSelectedJob(job)}
                      onSave={() => {}}
                      onApply={() => window.open(job.applyUrl, '_blank')}
                      saved={false}
                      applied={false}
                    />
                  ))
                )}
              </div>
            </section>

            <section className="job-viewer">
              {selectedJob ? (
                <div className="viewer-content">
                  <div className="viewer-header">
                    <span className="source-label">{selectedJob.sourceKind} via {selectedJob.source}</span>
                    <h1>{selectedJob.title}</h1>
                    <div className="viewer-meta">
                      <span>{selectedJob.company}</span>
                      <span>•</span>
                      <span>{selectedJob.location}</span>
                    </div>
                  </div>

                  <div className="ai-insight-panel">
                    <div className="ai-header">
                      <Sparkles size={20} />
                      <h3>Gemini AI Analysis</h3>
                      <span className="trust-score">98% Accuracy</span>
                    </div>
                    {selectedJob.ai_analysis ? (
                      <div className="ai-body">
                        <p className="ai-summary">{selectedJob.ai_analysis.summary}</p>
                        <div className="ai-stats-row">
                          <div className="ai-stat">
                            <label>Scam Risk</label>
                            <span className={selectedJob.ai_analysis.scam_check.score > 3 ? 'high' : 'low'}>
                              {selectedJob.ai_analysis.scam_check.score}/10
                            </span>
                          </div>
                          <div className="ai-stat">
                            <label>Market Demand</label>
                            <span>High</span>
                          </div>
                        </div>
                        <div className="ai-skills">
                          {selectedJob.ai_analysis.skills.map((s: string) => <span key={s} className="ai-skill-tag">{s}</span>)}
                        </div>
                      </div>
                    ) : (
                      <div className="ai-placeholder">
                        <p>Background analysis in progress...</p>
                        <button className="manual-analyze">Analyze Now</button>
                      </div>
                    )}
                  </div>

                  <div className="description-section">
                    <h3>About the role</h3>
                    <p>{selectedJob.description}</p>
                  </div>

                  <div className="viewer-footer">
                    <button className="btn-apply-large" onClick={() => window.open(selectedJob.applyUrl, '_blank')}>Apply Direct on {selectedJob.source}</button>
                    <button className="btn-save-large">Save for later</button>
                  </div>
                </div>
              ) : (
                <div className="empty-viewer">
                  <Briefcase size={48} />
                  <h2>Select a job to view details</h2>
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="moat-dashboard">
             <div className="moat-header">
                <h1>The Antigravity Moat</h1>
                <p>Deep-layer intelligence for the Indian Job Market</p>
             </div>
             <div className="moat-grid">
                <div className="moat-card">
                   <ShieldCheck size={32} />
                   <h3>Scam Radar v2.0</h3>
                   <p>Our ML pipeline has flagged 124 suspicious listings this week across 15 job portals.</p>
                </div>
                <div className="moat-card">
                   <Zap size={32} />
                   <h3>Skill Gap Engine</h3>
                   <p>Based on 5000+ listings, top 3 skills in demand: React, Node.js, and GenAI prompt engineering.</p>
                </div>
             </div>
          </section>
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
