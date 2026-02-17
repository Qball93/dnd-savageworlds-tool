// src/pages/JoinPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const JoinPage: React.FC = () => {
  const [sessionId, setSessionId] = useState('');
  const navigate = useNavigate();

  const handleGo = () => {
    const trimmed = sessionId.trim();
    if (!trimmed) return;

    // session id becomes part of the URL
    navigate(`/s/${encodeURIComponent(trimmed)}`);
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1>Join Session</h1>

      <div style={{ display: 'flex', gap: '0.5rem', maxWidth: 520 }}>
        <input
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder="session id (e.g. test123)"
          style={{
            flex: 1,
            padding: '0.65rem',
            borderRadius: '0.5rem',
            border: '1px solid #333',
          }}
        />
        <button onClick={handleGo}>Go</button>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <Link to="/" style={{ color: '#c9d4ff' }}>
          ← Back
        </Link>
      </div>
    </div>
  );
};

export default JoinPage;