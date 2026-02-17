// src/App.tsx
import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import JoinPage from './pages/JoinPage';
import SessionPage from './pages/SessionPage';

import './App.css'

const Home: React.FC = () => {
  return (
    <div style={{ padding: '1.5rem' }}>
      <h1>Session Test</h1>
      <p>Click below to join a session.</p>
      <Link to="/join">
        <button>Go to Join</button>
      </Link>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        background: '#0b1020',
        color: '#f5f7ff',
      }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/s/:sessionId" element={<SessionPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;