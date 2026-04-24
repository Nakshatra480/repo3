import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Sparkles, Loader, ArrowUp, Lightbulb as IdeaIcon } from 'lucide-react';

const Dashboard = () => {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idea.trim()) return setError('Please enter a startup idea');
    
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5100'}/api/evaluations`, { idea }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/evaluation/${res.data._id}`, { state: { evaluation: res.data } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to evaluate idea');
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.div 
      className="chat-content"
      style={{ paddingBottom: '100px' }}
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
    >
      {!loading ? (
        <div className="chat-empty-state">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: '600' }}>
            What's your next <span className="text-gradient">big idea</span>?
          </h1>
          {error && (
            <div style={{ color: 'var(--error-color)', marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
              {error}
            </div>
          )}
        </div>
      ) : (
        <div style={{ width: '100%' }}>
          {/* Optimistic User Message Bubble */}
          <div className="chat-message">
            <div className="chat-bubble-user">
              {idea}
            </div>
          </div>

          {/* Loading AI Message Bubble */}
          <div className="chat-message">
            <motion.div className="chat-bubble-ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="chat-user-avatar" style={{ flexShrink: 0 }}>
                  <IdeaIcon size={18} color="white" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Loader className="animate-spin" size={16} />
                  <span>Analyzing your venture...</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      <div className="chat-input-wrapper" style={{ position: 'absolute', bottom: 0, left: 0 }}>
        <form onSubmit={handleSubmit} className="chat-input-container">
          <div className="chat-input-box">
            <textarea 
              placeholder="Message VentureAI..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="chat-submit-btn" 
              disabled={loading || !idea.trim()}
            >
              {loading ? (
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

      {/* CSS for spin animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </motion.div>
  );
};

export default Dashboard;
