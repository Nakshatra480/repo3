import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Lightbulb as IdeaIcon, Loader, ArrowUp } from 'lucide-react';

const EvaluationDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [evaluation, setEvaluation] = useState(location.state?.evaluation || null);
  const [loading, setLoading] = useState(!location.state?.evaluation);
  
  const [chatInput, setChatInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatHistory, setChatHistory] = useState([]); // { role: 'user'|'ai', content: string }

  const hasStateData = !!location.state?.evaluation;

  useEffect(() => {
    if (hasStateData) return;
    const fetchEvaluation = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5100'}/api/evaluations/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvaluation(res.data);
      } catch (error) {
        console.error('Failed to fetch evaluation', error);
      }
      setLoading(false);
    };
    fetchEvaluation();
  }, [id, hasStateData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isSubmitting) return;

    const userMessage = chatInput.trim();
    setChatInput('');

    // Optimistically add user message
    const updatedHistory = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(updatedHistory);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5100'}/api/evaluations/${id}/chat`,
        { message: userMessage, history: chatHistory.map(m => ({ role: m.role, content: m.type === 'analysis' ? '[Updated Analysis Report]' : m.content })) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data;
      if (data.type === 'analysis') {
        setChatHistory([...updatedHistory, { role: 'ai', type: 'analysis', analysisData: data.data }]);
      } else {
        setChatHistory([...updatedHistory, { role: 'ai', type: 'text', content: data.reply || data.text || String(data) }]);
      }
    } catch (err) {
      setChatHistory([...updatedHistory, { role: 'ai', type: 'text', content: "Sorry, I couldn't process your question. Please try again." }]);
    }
    setIsSubmitting(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (loading) return <div className="chat-content"><div className="chat-empty-state">Loading analysis...</div></div>;
  if (!evaluation) return <div className="chat-content"><div className="chat-empty-state">Evaluation not found.</div></div>;

  // Group parameters for better UI structure
  const paramGroups = [
    { title: "Market & Need", keys: ['problemClarity', 'targetMarket', 'customerDemand'] },
    { title: "Product & Innovation", keys: ['uniqueness', 'innovationLevel', 'feasibility'] },
    { title: "Business & Growth", keys: ['revenueModel', 'monetizationStrategy', 'scalability', 'growthPotential'] },
    { title: "Execution & Risk", keys: ['competition', 'timing', 'executionComplexity', 'riskFactors', 'longTermSustainability'] }
  ];

  const formatParamName = (name) => {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  return (
    <div className="chat-content" style={{ paddingBottom: '120px' }}>
      
      {/* Current Conversation Items */}
      <div style={{ width: '100%' }}>
        {/* User Message Bubble */}
        <div className="chat-message">
          <div className="chat-bubble-user">
            {evaluation.idea}
          </div>
        </div>

        {/* AI Message Bubble */}
        <div className="chat-message">
          <motion.div className="chat-bubble-ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div className="chat-user-avatar" style={{ flexShrink: 0 }}>
                <IdeaIcon size={18} color="white" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Analysis Complete</h2>
            </div>

            <div className="chat-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Executive Summary</h3>
                  <p style={{ lineHeight: '1.8', color: '#ececec', fontSize: '0.95rem' }}>
                    {evaluation.summary || evaluation.executiveSummary || evaluation.overview || "Executive summary unavailable. Please check the detailed parameters below."}
                  </p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>Venture Score</p>
                  <div className={`text-gradient`} style={{ fontSize: '3rem', fontWeight: 'bold', lineHeight: 1 }}>
                    {evaluation.overallScore}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>/ 100</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
              {paramGroups.map((group, idx) => (
                <div key={idx} className="chat-card" style={{ padding: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                    {group.title}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {group.keys.map(key => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{formatParamName(key)}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '50%' }}>
                          <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                height: '100%', 
                                width: `${(evaluation.scores[key] / 10) * 100}%`,
                                background: evaluation.scores[key] >= 8 ? 'var(--success-color)' : evaluation.scores[key] >= 5 ? 'var(--warning-color)' : 'var(--error-color)'
                              }} 
                            />
                          </div>
                          <span style={{ fontWeight: '600', width: '20px', textAlign: 'right', fontSize: '0.875rem' }}>{evaluation.scores[key]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3">
              <div className="chat-card" style={{ borderTop: '3px solid var(--success-color)', padding: '1.5rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--success-color)', fontSize: '1rem' }}>
                  <CheckCircle size={16} /> Strengths
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {evaluation.strengths.map((str, i) => (
                    <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--success-color)' }}>•</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="chat-card" style={{ borderTop: '3px solid var(--error-color)', padding: '1.5rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--error-color)', fontSize: '1rem' }}>
                  <XCircle size={16} /> Weaknesses
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {evaluation.weaknesses.map((weak, i) => (
                    <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--error-color)' }}>•</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{weak}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="chat-card" style={{ borderTop: '3px solid var(--primary-color)', padding: '1.5rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary-color)', fontSize: '1rem' }}>
                  <IdeaIcon size={16} /> Suggestions
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {evaluation.suggestions.map((sug, i) => (
                    <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--primary-color)' }}>•</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </motion.div>
        </div>

        {/* Render follow-up chat history */}
        {chatHistory.map((msg, i) => (
          <div key={i} className="chat-message" style={{ marginTop: i === 0 ? '2rem' : 0 }}>
            {msg.role === 'user' ? (
              <div className="chat-bubble-user">{msg.content}</div>
            ) : msg.type === 'analysis' ? (
              <motion.div className="chat-bubble-ai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="chat-user-avatar" style={{ flexShrink: 0 }}><IdeaIcon size={18} color="white" /></div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Updated Analysis</h2>
                </div>
                {/* Summary + Score */}
                <div className="chat-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Executive Summary</h3>
                      <p style={{ lineHeight: '1.8', color: '#ececec', fontSize: '0.9rem' }}>{msg.analysisData.summary}</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', flexShrink: 0 }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Score</p>
                      <div className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: 1 }}>{msg.analysisData.overallScore}</div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>/100</p>
                    </div>
                  </div>
                </div>
                {/* Scores Grid */}
                <div className="grid grid-cols-2" style={{ marginBottom: '1.5rem' }}>
                  {paramGroups.map((group, idx) => (
                    <div key={idx} className="chat-card" style={{ padding: '1.25rem' }}>
                      <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem' }}>{group.title}</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {group.keys.map(key => (
                          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{formatParamName(key)}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '50%' }}>
                              <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${(msg.analysisData.scores[key] / 10) * 100}%`, background: msg.analysisData.scores[key] >= 8 ? 'var(--success-color)' : msg.analysisData.scores[key] >= 5 ? 'var(--warning-color)' : 'var(--error-color)' }} />
                              </div>
                              <span style={{ fontWeight: '600', width: '18px', textAlign: 'right', fontSize: '0.8rem' }}>{msg.analysisData.scores[key]}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Strengths / Weaknesses / Suggestions */}
                <div className="grid grid-cols-3">
                  <div className="chat-card" style={{ borderTop: '3px solid var(--success-color)', padding: '1.25rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', color: 'var(--success-color)', fontSize: '0.9rem' }}><CheckCircle size={14}/> Strengths</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {msg.analysisData.strengths.map((s, j) => <li key={j} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.8rem' }}><span style={{ color: 'var(--success-color)' }}>•</span><span style={{ color: 'var(--text-secondary)' }}>{s}</span></li>)}
                    </ul>
                  </div>
                  <div className="chat-card" style={{ borderTop: '3px solid var(--error-color)', padding: '1.25rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', color: 'var(--error-color)', fontSize: '0.9rem' }}><XCircle size={14}/> Weaknesses</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {msg.analysisData.weaknesses.map((w, j) => <li key={j} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.8rem' }}><span style={{ color: 'var(--error-color)' }}>•</span><span style={{ color: 'var(--text-secondary)' }}>{w}</span></li>)}
                    </ul>
                  </div>
                  <div className="chat-card" style={{ borderTop: '3px solid var(--primary-color)', padding: '1.25rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', color: 'var(--primary-color)', fontSize: '0.9rem' }}><IdeaIcon size={14}/> Suggestions</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {msg.analysisData.suggestions.map((s, j) => <li key={j} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.8rem' }}><span style={{ color: 'var(--primary-color)' }}>•</span><span style={{ color: 'var(--text-secondary)' }}>{s}</span></li>)}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div className="chat-bubble-ai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div className="chat-user-avatar" style={{ flexShrink: 0, marginTop: '2px' }}><IdeaIcon size={18} color="white" /></div>
                  <p style={{ lineHeight: '1.8', color: '#ececec', fontSize: '0.95rem', flex: 1 }}>{msg.content}</p>
                </div>
              </motion.div>
            )}
          </div>
        ))}

        {/* Show typing indicator while waiting for AI reply */}
        {isSubmitting && (
          <div className="chat-message" style={{ marginTop: '0.5rem' }}>
            <div className="chat-bubble-ai">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="chat-user-avatar" style={{ flexShrink: 0 }}>
                  <IdeaIcon size={18} color="white" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Loader className="animate-spin" size={16} />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Follow-up Input Box */}
      <div className="chat-input-wrapper" style={{ position: 'absolute', bottom: 0, left: 0 }}>
        <form onSubmit={handleSubmit} className="chat-input-container">
          <div className="chat-input-box">
            <textarea 
              placeholder="Ask a follow-up question about this idea..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
            />
            <button 
              type="submit" 
              className="chat-submit-btn" 
              disabled={isSubmitting || !chatInput.trim()}
            >
              {isSubmitting ? (
                <Loader className="animate-spin" size={16} />
              ) : (
                <ArrowUp size={18} strokeWidth={3} />
              )}
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: '#676767' }}>
            VentureAI can make mistakes. Consider verifying important information.
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
      
    </div>
  );
};

export default EvaluationDetail;
