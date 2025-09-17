/**
 * Main App component with routing
 * Following Commandment #4: Keep logic out of views
 * Following Commandment #1: Keep it short - minimal routing logic
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login page - start of OAuth flow */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard - OAuth callback destination */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
