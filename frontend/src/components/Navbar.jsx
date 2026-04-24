import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lightbulb, LogOut, LayoutDashboard, PlusCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass">
      <div className="container navbar-inner">
        <Link to="/" className="flex-center" style={{ gap: '0.5rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
          <Lightbulb size={24} color="var(--primary-color)" />
          <span>Venture<span className="text-gradient">AI</span></span>
        </Link>
        
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link flex-center" style={{ gap: '0.25rem' }}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link to="/new" className="nav-link flex-center" style={{ gap: '0.25rem' }}>
                <PlusCircle size={18} /> Evaluate Idea
              </Link>
              <button onClick={handleLogout} className="nav-link flex-center" style={{ gap: '0.25rem' }}>
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
