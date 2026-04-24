import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#212121',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%',
          maxWidth: '380px',
          padding: '2.5rem',
          background: '#2f2f2f',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Lightbulb size={18} color="white" />
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ececec' }}>VentureAI</span>
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ececec', marginBottom: '0.5rem' }}>
          Welcome back
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#8e8e8e', marginBottom: '2rem' }}>
          Sign in to continue evaluating your ideas
        </p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem',
            fontSize: '0.875rem', color: '#f87171'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#8e8e8e', marginBottom: '0.5rem', fontWeight: '500' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '0.75rem 1rem',
                background: '#3f3f3f', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', color: '#ececec', fontSize: '0.9rem',
                outline: 'none', fontFamily: 'inherit',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#8e8e8e', marginBottom: '0.5rem', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%', padding: '0.75rem 1rem',
                background: '#3f3f3f', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', color: '#ececec', fontSize: '0.9rem',
                outline: 'none', fontFamily: 'inherit',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', padding: '0.8rem',
              background: submitting ? '#4f4f4f' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', borderRadius: '10px',
              color: 'white', fontSize: '0.9rem', fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'opacity 0.2s',
              fontFamily: 'inherit'
            }}
          >
            {submitting ? 'Signing in...' : (
              <><span>Sign in</span><ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#8e8e8e' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#818cf8', fontWeight: '500', textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
