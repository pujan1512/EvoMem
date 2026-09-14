import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MilestonePlan() {
  const navigate = useNavigate();

  const milestones = [
    {
      id: 1,
      title: 'Milestone 1 — OpenHands Integration & Baseline Pipeline',
      duration: 'Week 1–3',
      status: 'Completed',
      items: [
        'Integrate EvoMem with OpenHands.',
        'Enable the agent to solve software issues.',
        'Generate and collect patch files.',
        'Establish the initial baseline pipeline.'
      ]
    },
    {
      id: 2,
      title: 'Milestone 2 — Benchmark Construction',
      duration: 'Week 2–4',
      status: 'In Progress',
      items: [
        'Construct chronological issue sequences.',
        'Ensure experiments are leak-free.',
        'Include multiple repositories.',
        'Prepare the benchmark for later evaluation.'
      ]
    },
    {
      id: 3,
      title: 'Milestone 3 — Baseline Systems',
      duration: 'Week 2–6',
      status: 'In Progress',
      items: [
        'Implement the No-Memory baseline.',
        'Implement OpenHands Native Memory baseline.',
        'Implement Raw Trajectory RAG.',
        'Include the SWE-Bench-CL Memory baseline.',
        'Prepare baseline results for comparison with EvoMem.'
      ]
    },
    {
      id: 4,
      title: 'Milestone 4 — Memory Distillation Pipeline',
      duration: 'Week 3–5',
      status: 'Planned',
      items: [
        'Extract useful information from agent trajectories.',
        'Create structured and auditable experience records.',
        'Store issue, error, solution, patch, test, and repository information.',
        'Prepare experiences for validation and retrieval.'
      ]
    },
    {
      id: 5,
      title: 'Milestone 5 — Sandbox-Validated Admission',
      duration: 'Week 4–6',
      status: 'Planned',
      items: [
        'Reconstruct the relevant repository state.',
        'Apply candidate patches in a sandbox.',
        'Re-run relevant tests.',
        'Validate experiences before admitting them into memory.'
      ]
    },
    {
      id: 6,
      title: 'Milestone 6 — Hybrid Retrieval',
      duration: 'Week 5–8',
      status: 'Planned',
      items: [
        'Implement semantic retrieval.',
        'Add error-signature retrieval.',
        'Add code-structure retrieval.',
        'Combine multiple retrieval signals to identify relevant experiences.'
      ]
    },
    {
      id: 7,
      title: 'Milestone 7 — Retrieval Gating with Abstention',
      duration: 'Week 7–9',
      status: 'Planned',
      items: [
        'Evaluate retrieved memories for relevance and compatibility.',
        'Assign confidence to retrieved experiences.',
        'Implement USE and ABSTAIN decisions.',
        'Prevent potentially harmful or irrelevant memories from being transferred.'
      ]
    },
    {
      id: 8,
      title: 'Milestone 8 — Version-Aware Invalidation Layer',
      duration: 'Week 8–10',
      status: 'Planned',
      items: [
        'Track repository and dependency changes.',
        'Detect changes that can make memories outdated.',
        'Down-weight or invalidate stale memories.',
        'Handle repository evolution and compatibility.'
      ]
    },
    {
      id: 9,
      title: 'Milestone 9 — Negative-Transfer Detection & Security Hardening',
      duration: 'Week 9–11',
      status: 'Planned',
      items: [
        'Measure positive, neutral, and negative transfer.',
        'Test memory poisoning scenarios.',
        'Test prompt-injection risks.',
        'Check for cross-repository information leakage.',
        'Strengthen memory security.'
      ]
    },
    {
      id: 10,
      title: 'Milestone 10 — Full System Integration & Internal Testing',
      duration: 'Week 10–12',
      status: 'Planned',
      items: [
        'Integrate all EvoMem components.',
        'Connect distillation, validation, retrieval, gating, and invalidation.',
        'Perform end-to-end testing.',
        'Identify and fix integration issues.'
      ]
    },
    {
      id: 11,
      title: 'Milestone 11 — Evaluation Experiments',
      duration: 'Week 11–14',
      status: 'Planned',
      items: [
        'Run experiments across the selected repositories.',
        'Compare EvoMem with 4 baseline systems.',
        'Measure task success and patch correctness.',
        'Evaluate retrieval, validation, cost, and transfer performance.'
      ]
    },
    {
      id: 12,
      title: 'Milestone 12 — Results Analysis & Monitoring Dashboard',
      duration: 'Week 12–14',
      status: 'Planned',
      items: [
        'Analyze experimental results.',
        'Compare EvoMem against the baselines.',
        'Analyze retrieval and memory behavior.',
        'Develop a monitoring/dashboard interface.',
        'Present important evaluation metrics visually.'
      ]
    },
    {
      id: 13,
      title: 'Milestone 13 — Report, Paper & Presentation Preparation',
      duration: 'Week 13–15',
      status: 'Planned',
      items: [
        'Consolidate experimental findings.',
        'Prepare the project report/paper.',
        'Document methodology and results.',
        'Prepare presentation material.',
        'Finalize research conclusions.'
      ]
    },
    {
      id: 14,
      title: 'Milestone 14 — Final Submission',
      duration: 'Week 15–16',
      status: 'Planned',
      items: [
        'Complete final revisions.',
        'Verify all documentation and results.',
        'Prepare the final project package.',
        'Submit the completed EvoMem project.'
      ]
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' };
      case 'In Progress':
        return { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: 'rgba(56, 189, 248, 0.3)' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.25)' };
    }
  };

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-color, #333)'
        }}
      >
        <div>
          <div style={{ fontSize: '0.85rem', color: '#a855f7', fontFamily: 'var(--font-mono)', marginBottom: '0.35rem' }}>
            DEVELOPMENT ROADMAP & TIMELINE
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>
            EvoMem Milestone Plan
          </h1>
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn-solid"
          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          ← Back to Homepage
        </button>
      </div>

      {/* Milestones List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
        {milestones.map((m) => {
          const badge = getStatusBadge(m.status);
          return (
            <div
              key={m.id}
              className="flat-panel"
              style={{
                padding: '1.35rem 1.5rem',
                backgroundColor: '#0d0d0d',
                borderColor: '#262626',
                borderRadius: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0, fontWeight: '600' }}>
                    {m.title}
                  </h2>
                  <div style={{ fontSize: '0.83rem', color: '#a3a3a3', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
                    🗓️ Duration: {m.duration}
                  </div>
                </div>
                <span
                  style={{
                    backgroundColor: badge.bg,
                    color: badge.color,
                    border: `1px solid ${badge.border}`,
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {m.status}
                </span>
              </div>

              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#cbd5e1', lineHeight: '1.65', fontSize: '0.94rem' }}>
                {m.items.map((item, iIdx) => (
                  <li key={iIdx} style={{ marginBottom: iIdx === m.items.length - 1 ? 0 : '0.35rem' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
        <button
          onClick={() => navigate('/')}
          className="btn-solid"
          style={{
            cursor: 'pointer',
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          ← Return to Homepage
        </button>
      </div>
    </div>
  );
}
