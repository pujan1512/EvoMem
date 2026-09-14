import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="error-page-container">
      <div className="flat-panel" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <div className="error-code">404</div>
        <h1 className="error-title">Invalid URL</h1>
        <p className="error-desc">The page you are looking for does not exist.</p>

        <button onClick={() => navigate('/')} className="btn-solid" style={{ margin: '0 auto' }}>
          ← Go Back to Homepage
        </button>
      </div>
    </div>
  );
}
