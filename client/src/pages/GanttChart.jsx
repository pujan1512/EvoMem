import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function GanttChart() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>
            Project Gantt Chart
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            Visual timeline and milestones for EvoMem development
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn-solid"
          style={{ cursor: 'pointer' }}
        >
          ← Back to Homepage
        </button>
      </div>

      <div
        className="flat-panel"
        style={{
          padding: '1rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0d0d0d',
          borderColor: '#333333',
          overflowX: 'auto'
        }}
      >
        <img
          src="https://cdn.phototourl.com/free/2026-09-13-901b7fa9-719e-4b7a-80c9-8c989f747455.png"
          alt="EvoMem Gantt Chart"
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
        />
      </div>
    </div>
  );
}
