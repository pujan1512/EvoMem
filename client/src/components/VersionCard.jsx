import React from 'react';

export default function VersionCard({ uploadedDate = '17 August 2026', version = 'V1' }) {
  return (
    <div className="version-box">
      <div>
        <span className="version-item-label">Current Version</span>
        <div className="version-item-val" style={{ fontSize: '1.4rem', color: '#ef4444' }}>
          {version}
        </div>
      </div>

      <div>
        <span className="version-item-label">Last Uploaded</span>
        <div className="version-item-val" style={{ fontSize: '0.95rem' }}>
          {uploadedDate}
        </div>
      </div>
    </div>
  );
}
