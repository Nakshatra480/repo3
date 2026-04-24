import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Sparkles, Loader } from 'lucide-react';

const NewIdea = () => {
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
      const res = await axios.post('http://127.0.0.1:5100/api/evaluations', { idea }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/evaluation/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to evaluate idea');
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Validate Your <span className="text-gradient">Vision</span></h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>
          Describe your startup idea in detail. Our AI will analyze it across 15 critical venture parameters.
        </p>
      </div>

      <div className="card glass">
        {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              What are you building?
            </label>
            <textarea 
              className="form-input form-textarea" 
              placeholder="e.g., An AI-powered mental health companion that uses CBT techniques and speech analysis to detect early signs of depression and provides personalized daily exercises..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              style={{ minHeight: '200px', fontSize: '1.1rem', padding: '1.5rem' }}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
              {loading ? (
                <><Loader className="animate-spin" size={20} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing Idea...</>
              ) : (
                <><Sparkles size={20} /> Generate Evaluation</>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* CSS for spin animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </motion.div>
  );
};

export default NewIdea;
