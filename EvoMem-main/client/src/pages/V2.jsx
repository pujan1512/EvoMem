import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function V2() {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="course-tag">Future Version Architecture</div>
        <h1 className="page-title">EvoMem – Version 2.0 (V2 Roadmap)</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Prepared version route for future software engineering modules.
        </p>
      </div>

      <div className="flat-panel" style={{ borderLeft: '3px solid var(--red-accent)', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>V2 Architecture Readiness</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>
          EvoMem features modular version-based routing. Version configuration is stored dynamically in backend services to support seamless transitions across V1, V2, V3, and future engineering milestones.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.3rem', fontSize: '0.95rem' }}>Automated ML Classification</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Context classifier to categorize window switching and focus index events.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.3rem', fontSize: '0.95rem' }}>Real-Time Stream Engine</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              WebSocket pipeline for real-time focus analytics.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={() => navigate('/')} className="btn-solid">
          ← Back to Homepage
        </button>
      </div>
    </div>
  );
}
