import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import EvaluationDetail from './pages/EvaluationDetail';
import ChatLayout from './components/ChatLayout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="flex-center" style={{ height: '100vh', background: 'var(--bg-color)' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <ChatLayout>
              <Dashboard />
            </ChatLayout>
          </PrivateRoute>
        } 
      />
      <Route 
        path="/evaluation/:id" 
        element={
          <PrivateRoute>
            <ChatLayout>
              <EvaluationDetail />
            </ChatLayout>
          </PrivateRoute>
        } 
      />
    </Routes>
  );
}

export default App;
