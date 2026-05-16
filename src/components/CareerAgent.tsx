import React, { useState } from "react";
import { MessageSquare, Send, Bot, TrendingUp, Map } from "lucide-react";

export function CareerAgent() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI Career Agent. I can help you with roadmaps, salary trends, or finding your next big move in the Indian tech market. What's on your mind?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // In real implementation, this would call a /api/career/agent endpoint
      // For now, we simulate a very intelligent multi-agent response
      const response = await fetch("/api/jobs/analyze-job", { // Using existing analyze endpoint for demo or create new one
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Career Guidance", company: "System", description: input })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.advice || "Based on market trends, I recommend focusing on Next.js and GenAI prompt engineering to hit the ₹15LPA mark in remote roles." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm analyzing market trends... (Network simulation active)" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="career-agent-container">
      <div className="agent-header">
        <Bot size={24} />
        <div>
          <h3>Career Agent v1.0</h3>
          <span>Multi-Agent Workflow Active</span>
        </div>
      </div>

      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <div className="bubble">{m.content}</div>
          </div>
        ))}
        {loading && <div className="message assistant"><div className="bubble pulsing">Analyzing roadmap...</div></div>}
      </div>

      <div className="agent-quick-actions">
        <button onClick={() => setInput("What should I learn for ₹20LPA remote jobs?")}><TrendingUp size={14} /> ₹20LPA Roadmap</button>
        <button onClick={() => setInput("Skills needed for Senior Frontend in Bangalore?")}><Map size={14} /> City Insights</button>
      </div>

      <div className="chat-input">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about roadmaps, salaries, or skills..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={loading}><Send size={18} /></button>
      </div>
    </div>
  );
}
