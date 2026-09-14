import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function FeasibilityReport() {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Project Overview',
      icon: '💡',
      content:
        'EvoMem is a validated and retrieval-gated experience memory system for coding agents, built on OpenHands. The system aims to allow coding agents to learn from previous coding tasks by converting completed trajectories into structured experience records. These experiences can include the issue, repository, revision, dependencies, errors, code structure, solution, patch, tests, cost, and validation status.'
    },
    {
      title: 'Technical Feasibility',
      icon: '⚙️',
      content:
        'The project is technically feasible because it can be implemented incrementally on top of OpenHands without training a new foundation model or fine-tuning the underlying model. The initial technology stack can use Python, OpenHands, Git, Docker or another sandbox environment, a vector database or index, embedding models, code/AST parsing, and testing infrastructure. EvoMem can operate as an external memory layer around the existing coding agent.'
    },
    {
      title: 'Data Feasibility',
      icon: '📊',
      content:
        'The required data is feasible to obtain from existing software-engineering issue datasets and repository histories. A chronological dataset can be constructed using repository commit histories together with issue and pull-request timelines. This allows the system to simulate realistic experience accumulation while preventing future information from leaking into earlier tasks.'
    },
    {
      title: 'Compute Feasibility',
      icon: '⚡',
      content:
        'EvoMem does not require foundation-model pretraining, making its computational requirements manageable. The major computational costs will come from generating coding-agent trajectories and repeatedly running tests during sandbox validation. The project can therefore begin with a small number of repositories and tasks and scale the experiments after identifying the strongest configurations.'
    },
    {
      title: 'Implementation Feasibility',
      icon: '🚀',
      content:
        'The implementation can be developed in phases. An initial MVP can integrate OpenHands with trajectory extraction, experience distillation, sandbox validation, semantic retrieval, and a basic retrieval gate. More advanced capabilities such as error-signature retrieval, code-structure retrieval, version-aware invalidation, negative-transfer analysis, and security evaluation can then be added incrementally.\n\nThe main technical challenges are the retrieval gate and version-aware invalidation. The retrieval gate must determine whether a retrieved experience is sufficiently relevant and safe to use, while version-aware invalidation must identify when a previously useful memory has become stale because of dependency upgrades, API changes, refactoring, repository changes, or test/configuration changes.'
    },
    {
      title: 'Research Feasibility',
      icon: '🔬',
      content:
        'The research is feasible because EvoMem has a clear experimental question: when should a coding agent trust previous experience, and when should it ignore it? The system provides measurable hypotheses and evaluation criteria, including task resolution rate, patch correctness, test pass rate, retrieval precision, abstention rate, negative-transfer rate, stale-memory usage, and agent cost.'
    },
    {
      title: 'Risk & Scope Feasibility',
      icon: '🛡️',
      content:
        'The major risks include poor retrieval, incorrect or stale memories, negative transfer, data leakage, memory poisoning, prompt injection, cross-repository leakage, large memory size, and benchmark instability. These risks can be evaluated and mitigated through validation, retrieval gating, chronological evaluation, security checks, repository restrictions, and version-aware invalidation.\n\nThe project scope is controlled by avoiding foundation-model training, fine-tuning, development of an entirely new coding agent, support for every programming language, distributed production deployment, fully autonomous memory editing, and complex reinforcement learning. This keeps the project focused on experience memory, retrieval, validation, gating, and invalidation.'
    },
    {
      title: 'Overall Feasibility',
      icon: '🎯',
      content:
        'Overall, EvoMem is considered technically and experimentally feasible. The system can be built incrementally around OpenHands, evaluated using existing software-engineering benchmarks and repository histories, and tested through controlled ablations and chronological experiments. Its central contribution is a memory lifecycle in which experience is distilled, validated, retrieved, gated, transferred, monitored, and eventually invalidated when it becomes unreliable.'
    }
  ];

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header Bar */}
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
          <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontFamily: 'var(--font-mono)', marginBottom: '0.35rem' }}>
            PROJECT ASSESSMENT & ANALYSIS
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>
            EvoMem Feasibility Report
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

      {/* Sections Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {sections.map((sec, idx) => (
          <div
            key={idx}
            className="flat-panel"
            style={{
              padding: '1.5rem',
              backgroundColor: '#0d0d0d',
              borderColor: '#262626',
              borderRadius: '8px',
              transition: 'border-color 0.2s ease-in-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '1.4rem' }}>{sec.icon}</span>
              <h2 style={{ fontSize: '1.25rem', color: '#38bdf8', margin: 0, fontWeight: '600' }}>
                {sec.title}
              </h2>
            </div>
            {sec.content.split('\n\n').map((paragraph, pIdx) => (
              <p
                key={pIdx}
                style={{
                  color: '#cbd5e1',
                  lineHeight: '1.7',
                  fontSize: '0.96rem',
                  marginTop: pIdx > 0 ? '0.85rem' : 0,
                  marginBottom: 0
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        ))}
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
