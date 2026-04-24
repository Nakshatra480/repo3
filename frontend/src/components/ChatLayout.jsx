import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, MessageSquare, LogOut, Lightbulb } from 'lucide-react';

const ChatLayout = ({ children }) => {
  const [evaluations, setEvaluations] = useState([]);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://127.0.0.1:5100/api/evaluations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvaluations(res.data);
      } catch (error) {
        console.error('Failed to fetch evaluations', error);
      }
    };
    if (user) {
      fetchEvaluations();
    }
  }, [user, location.pathname]); // refetch when route changes to keep history updated

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <Link to="/dashboard" className="new-chat-btn" style={{ textDecoration: 'none' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lightbulb size={18} />
              New Evaluation
            </span>
            <Plus size={18} />
          </Link>
        </div>

        <div className="chat-history">
          <div className="chat-history-title">Recent Ideas</div>
          {evaluations.map(ev => (
            <Link 
              key={ev._id} 
              to={`/evaluation/${ev._id}`}
              className={`chat-item ${location.pathname.includes(ev._id) ? 'active' : ''}`}
              style={{ textDecoration: 'none', display: 'flex' }}
            >
              <MessageSquare size={16} style={{ flexShrink: 0 }} />
              <span className="chat-item-text">{ev.idea}</span>
            </Link>
          ))}
        </div>

        <div className="chat-user-profile" onClick={handleLogout}>
          <div className="chat-user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span style={{ flex: 1, fontWeight: '500' }}>{user?.name}</span>
          <LogOut size={16} style={{ color: '#94a3b8' }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="chat-main">
        {/* We can add a top header here if we want, like ChatGPT's model selector */}
        <div className="chat-header">
          <span>VentureAI <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Evaluator</span></span>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ChatLayout;
