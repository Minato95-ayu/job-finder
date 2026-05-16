import React, { useState } from "react";
import { Upload, CheckCircle, AlertTriangle, FileText, Sparkles } from "lucide-react";

export function ResumeMatcher({ jobId, jobTitle }) {
  const [file, setFile] = useState(null);
  const [matching, setMatching] = useState(false);
  const [results, setResults] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    setMatching(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch(`/api/resume/match/${jobId}`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="resume-matcher-panel">
      <div className="matcher-header">
        <FileText size={20} />
        <h3>AI Resume Match Engine</h3>
      </div>

      {!results ? (
        <div className="upload-zone">
          <input 
            type="file" 
            accept=".pdf" 
            onChange={(e) => setFile(e.target.files[0])} 
            id="resume-upload"
          />
          <label htmlFor="resume-upload">
            <Upload size={32} />
            <p>{file ? file.name : "Upload Resume (PDF)"}</p>
          </label>
          {file && (
            <button 
              className="btn-match" 
              onClick={handleUpload}
              disabled={matching}
            >
              {matching ? "Analyzing Fit..." : `Match with ${jobTitle}`}
            </button>
          )}
        </div>
      ) : (
        <div className="match-results">
          <div className="score-ring">
            <div className="score-value">{results.match_percentage}%</div>
            <label>Match Score</label>
          </div>

          <div className="ats-score">
            <span>ATS Score: {results.ats_score}/100</span>
          </div>

          <div className="result-sections">
            <div className="result-section">
              <strong><CheckCircle size={14} color="#22c55e" /> Matched Skills</strong>
              <div className="mini-tags">
                {results.matched_skills.map(s => <span key={s} className="tag-green">{s}</span>)}
              </div>
            </div>

            <div className="result-section">
              <strong><AlertTriangle size={14} color="#f59e0b" /> Missing Skills</strong>
              <div className="mini-tags">
                {results.missing_skills.map(s => <span key={s} className="tag-amber">{s}</span>)}
              </div>
            </div>
          </div>

          <div className="ai-verdict">
             <Sparkles size={16} />
             <p>{results.verdict}</p>
          </div>

          <button className="btn-reset" onClick={() => setResults(null)}>Try Another Job</button>
        </div>
      )}
    </div>
  );
}
