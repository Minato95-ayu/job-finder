import React from "react";
import { Building2, MapPin, WalletCards, Clock3, Bookmark, BookmarkCheck, ExternalLink, Share2, Sparkles } from "lucide-react";

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
}

interface JobCardProps {
  job: Job;
  selected: boolean;
  saved: boolean;
  applied: boolean;
  onSelect: () => void;
  onSave: () => void;
  onApply: () => void;
}

export function JobCard({ job, selected, saved, applied, onSelect, onSave, onApply }: JobCardProps) {
  const matchScore = job.ai_score || 0;
  
  return (
    <article 
      className={`job-card ${selected ? 'selected' : ''}`} 
      onClick={onSelect}
    >
      <div className="card-header">
        <div className="title-group">
          <h2>{job.title}</h2>
          <span className="company-name"><Building2 size={14} /> {job.company}</span>
        </div>
        <button 
          className="save-btn" 
          onClick={(e) => { e.stopPropagation(); onSave(); }}
        >
          {saved ? <BookmarkCheck size={20} className="active" /> : <Bookmark size={20} />}
        </button>
      </div>

      {matchScore > 0 && (
        <div className="match-badge">
          <Sparkles size={12} />
          <span>{matchScore}% AI Match</span>
        </div>
      )}

      <div className="meta-grid">
        <span className="meta-item"><MapPin size={14} /> {job.location}</span>
        <span className="meta-item"><WalletCards size={14} /> {job.salaryMax ? `${job.salaryMax} LPA` : 'Competitive'}</span>
        <span className="meta-item"><Clock3 size={14} /> {job.postedDays === 0 ? "Today" : `${job.postedDays}d ago`}</span>
      </div>

      <p className="job-snippet">{(job.description ?? "").slice(0, 120)}...</p>

      <div className="tag-cloud">
        <span className="source-tag">{job.source}</span>
        <span className="category-tag">{job.category}</span>
        {job.skills.slice(0, 3).map(skill => (
          <span key={skill} className="skill-tag">{skill}</span>
        ))}
      </div>

      <div className="card-footer">
        <button className="primary-action" onClick={(e) => { e.stopPropagation(); onApply(); }}>
          <ExternalLink size={16} /> {applied ? "Applied" : "Apply Now"}
        </button>
        <button className="secondary-action" onClick={(e) => e.stopPropagation()}>
          <Share2 size={16} />
        </button>
      </div>
    </article>
  );
}
