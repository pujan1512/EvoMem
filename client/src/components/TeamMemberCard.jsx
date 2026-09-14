import React from 'react';

export default function TeamMemberCard({ member }) {
  return (
    <div className="team-member-box">
      <div className="team-member-name">{member.name}</div>

      <div className="team-member-info">
        <div style={{ fontWeight: 600, color: '#e5e5e5', fontSize: '0.88rem', marginBottom: '0.2rem' }}>
          Roll No: {member.rollNo}
        </div>
        <div style={{ color: '#38bdf8', fontWeight: 500, fontSize: '0.85rem', marginBottom: '0.45rem' }}>
          {member.email}
        </div>
        <div style={{ display: 'inline-block', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600, padding: '0.2rem 0.65rem', borderRadius: '4px' }}>
          [{member.role}]
        </div>
      </div>
    </div>
  );
}
