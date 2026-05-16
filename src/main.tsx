import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { 
  Search, Sun, Moon, Sparkles, Filter, 
  LayoutDashboard, Briefcase, ShieldCheck, Zap,
  UserCircle, MessageSquare
} from "lucide-react";
import "./styles.css";
import { JobCard } from "./components/JobCard";
import { ResumeMatcher } from "./components/ResumeMatcher";
import { CareerAgent } from "./components/CareerAgent";

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
  // Theme and Tab Management - Handled locally for performance
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState("explore");
  
  // Job Data and Search State
  const [query, setQuery] = useState("");
  const [semanticSearch, setSemanticSearch] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Initial Data Fetch
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
            <strong>Ayush's Job Intelligence</strong>
            <span className="pulsing">Enterprise Career Platform</span>
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
            className={activeTab === 'agent' ? 'active' : ''} 
            onClick={() => setActiveTab('agent')}
          >
            <MessageSquare size={18} /> Career Agent
          </button>
          <button 
            className={activeTab === 'metrics' ? 'active' : ''} 
            onClick={() => setActiveTab('metrics')}
          >
            <LayoutDashboard size={18} /> Analytics
          </button>
        </nav>

        <div className="header-actions">
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="user-profile">
            <UserCircle size={24} />
          </div>
        </div>
      </header>

      <main className="content-layout">
        {activeTab === 'explore' && (
          <>
            <section className="search-sidebar">
              <div className="search-container">
                <Search className="search-icon" size={20} />
                <input 
                  placeholder={semanticSearch ? "e.g. 'Remote React roles with ₹20LPA+ salary'" : "Search jobs..."} 
                  value={query}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                />
                <button 
                  className={`semantic-toggle ${semanticSearch ? 'active' : ''}`}
                  onClick={() => setSemanticSearch(!semanticSearch)}
                >
                  <Sparkles size={16} />
                </button>
              </div>
              
              <div className="job-feed">
                {loading ? (
                  <div className="loading-state">
                    {[1,2,3,4].map(i => <div key={i} className="skeleton-card" />)}
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
                    <h1>{selectedJob.title}</h1>
                    <div className="viewer-meta">
                      <span>{selectedJob.company}</span>
                      <span>•</span>
                      <span>{selectedJob.location}</span>
                    </div>
                  </div>

                  <div className="intelligence-grid">
                    <div className="ai-insight-panel">
                       <div className="ai-header">
                          <Sparkles size={18} />
                          <h3>AI Analysis</h3>
                       </div>
                       {selectedJob?.ai_analysis ? (
                          <div className="ai-body">
                             <p>{selectedJob.ai_analysis?.summary || "No summary available."}</p>
                             <div className="scam-meter">
                                <label>Scam Risk: {selectedJob.ai_analysis?.scam_check?.score ?? "N/A"}/10</label>
                                <div className="meter-bg">
                                  <div 
                                    className="meter-fill" 
                                    style={{
                                      width: `${(selectedJob.ai_analysis?.scam_check?.score || 0) * 10}%`, 
                                      background: (selectedJob.ai_analysis?.scam_check?.score || 0) > 5 ? '#ef4444' : '#22c55e'
                                    }}
                                  ></div>
                                </div>
                             </div>
                          </div>
                        ) : (
                           <div className="loading-ai">
                              <button 
                                className="btn-analyze"
                                onClick={async () => {
                                  try {
                                    const res = await fetch("/api/jobs/analyze", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify(selectedJob)
                                    });
                                    const data = await res.json();
                                    setSelectedJob({ ...selectedJob, ai_analysis: data });
                                  } catch (e) {
                                    console.error("Analysis failed", e);
                                  }
                                }}
                              >
                                <Sparkles size={16} /> Analyze Job with Gemini
                              </button>
                              <div className="pulsing-hint">Click to unlock AI insights</div>
                           </div>
                        )}
                    </div>

                    <ResumeMatcher jobId={selectedJob.id} jobTitle={selectedJob.title} />
                  </div>

                  <div className="description-section">
                    <h3>About the role</h3>
                    <p>{selectedJob.description}</p>
                  </div>
                </div>
              ) : (
                <div className="empty-viewer">
                  <Briefcase size={48} />
                  <h2>Select a job to unlock AI matching</h2>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'agent' && (
          <section className="agent-hub">
            <CareerAgent />
          </section>
        )}

        {activeTab === 'metrics' && (
          <section className="metrics-dashboard">
             <h1>Platform Intelligence</h1>
             <div className="metrics-grid">
                <div className="metric-card">
                   <h3>Jobs Ingested</h3>
                   <div className="value">14,208</div>
                   <div className="trend">+12% this week</div>
                </div>
                <div className="metric-card">
                   <h3>AI Matches Completed</h3>
                   <div className="value">856</div>
                   <div className="trend">+45% this week</div>
                </div>
                <div className="metric-card">
                   <h3>Scams Prevented</h3>
                   <div className="value">192</div>
                   <div className="trend">High protection</div>
                </div>
             </div>
          </section>
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
