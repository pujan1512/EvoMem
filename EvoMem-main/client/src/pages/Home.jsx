import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProjectMeta, fetchChanges, fetchPPT } from '../services/api';
import VersionCard from '../components/VersionCard';
import TechStackBadges from '../components/TechStackBadges';
import ChangeLog from '../components/ChangeLog';
import ChangeForm from '../components/ChangeForm';

export default function Home({ adminUser }) {
  const [project, setProject] = useState(null);
  const [changes, setChanges] = useState([]);
  const [pptMeta, setPptMeta] = useState(null);
  const [available, setAvailable] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [projRes, changeRes, pptRes] = await Promise.all([
        fetchProjectMeta(),
        fetchChanges(),
        fetchPPT()
      ]);

      if (projRes.success) setProject(projRes.project);
      if (changeRes.success) setChanges(changeRes.changes);

      if (pptRes && pptRes.available) {
        setAvailable(true);
        setPptMeta(pptRes);
      } else {
        setAvailable(false);
        setPptMeta(null);
      }
    } catch (err) {
      console.error('Error loading home data:', err);
      setAvailable(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddChangeSuccess = (newChange) => {
    setChanges((prev) => [newChange, ...prev]);
  };

  const handleDeleteChangeSuccess = (id) => {
    setChanges((prev) => prev.filter((item) => item.id !== id));
  };

  const handleViewPPT = () => {
    navigate('/ppt-viewer');
  };

  const isAdmin = adminUser && adminUser.role === 'admin';

  return (
    <div>
      {/* Hero Section */}
      <div className="hero-grid">
        <div>
          <div className="course-tag">
            {project?.courseLabel || 'UCS503 Software Engineering'}
          </div>
          
          {/* Brand Title */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 className="brand-title-main" style={{ margin: 0 }}>
              EvoMem
            </h1>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '0.2rem 0.55rem', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
              OpenHands Framework Integration
            </span>
          </div>

          <div className="page-subtitle" style={{ marginTop: '0.4rem' }}>
            Validated and Retrieval-Gated Experience Memory for Coding Agents
          </div>

          <p className="page-desc" style={{ fontSize: '0.96rem', lineHeight: '1.65', color: '#cbd5e1' }}>
            EvoMem is a validated, retrieval-gated experience memory system for autonomous coding agents built on top of OpenHands. Instead of blindly replaying raw trajectories, it distills completed tasks into sandbox-verified experience records, employing hybrid retrieval (semantic, error-signature, code-structure) with context-aware gating that abstains when repository transfer is unsafe. Evaluated against four baselines across chronological, leak-free issue sequences, EvoMem investigates when past experience helps, when it silently hurts, and how agents can tell the difference.
          </p>

          <TechStackBadges stack={['OpenHands Core', 'Sandbox Validation', 'Hybrid Retrieval', 'Retrieval Gating', 'Version Invalidation', 'Negative-Transfer Safeguards']} />
        </div>

        {/* Compact Version Box */}
        <VersionCard
          uploadedDate={project?.uploadedDate || '17 August 2026'}
          version={project?.version || 'V1'}
        />
      </div>

      {/* Presentation Action Bar: Shown ONLY when available: true */}
      {available && pptMeta && (
        <div className="flat-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', borderColor: '#333333', backgroundColor: '#0d0d0d', marginBottom: '2.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: '#ffffff', margin: '0 0 0.25rem 0' }}>
              {pptMeta.presentationName || 'Project Presentation PDF'}
            </h3>
            <div style={{ color: '#a3a3a3', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
              Version: {pptMeta.version || 'V1'} • Uploaded by {pptMeta.uploadedBy || 'Admin'} on {pptMeta.uploadedAt}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleViewPPT} className="btn-solid">
              View Presentation PDF
            </button>
          </div>
        </div>
      )}

      {/* Core Features Grid */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '1rem' }}>Core System Features</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="flat-panel" style={{ margin: 0, padding: '1.25rem' }}>
            <div style={{ color: '#38bdf8', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Memory distillation pipeline
            </div>
            <p style={{ fontSize: '0.85rem', color: '#a3a3a3', lineHeight: 1.4 }}>
              Converts raw agent trajectories into compact, structured, auditable experience records (issue signature, repo revision, dependency fingerprint, patch, tests, cost, confidence).
            </p>
          </div>

          <div className="flat-panel" style={{ margin: 0, padding: '1.25rem' }}>
            <div style={{ color: '#38bdf8', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Sandbox-validated admission
            </div>
            <p style={{ fontSize: '0.85rem', color: '#a3a3a3', lineHeight: 1.4 }}>
              Every experience is re-verified by re-running its tests in the sandbox before it's allowed into memory, filtering out unreliable or self-reported-only successes.
            </p>
          </div>

          <div className="flat-panel" style={{ margin: 0, padding: '1.25rem' }}>
            <div style={{ color: '#38bdf8', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Hybrid retrieval
            </div>
            <p style={{ fontSize: '0.85rem', color: '#a3a3a3', lineHeight: 1.4 }}>
              Combines semantic similarity, error-signature matching, and code-structure similarity (not just embedding search) to find genuinely relevant past experiences.
            </p>
          </div>

          <div className="flat-panel" style={{ margin: 0, padding: '1.25rem' }}>
            <div style={{ color: '#38bdf8', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Retrieval-gating with abstention
            </div>
            <p style={{ fontSize: '0.85rem', color: '#a3a3a3', lineHeight: 1.4 }}>
              The system can decide not to use a retrieved memory when transfer looks unsafe or low-confidence, instead of always injecting whatever comes back from search.
            </p>
          </div>

          <div className="flat-panel" style={{ margin: 0, padding: '1.25rem' }}>
            <div style={{ color: '#38bdf8', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Version-aware invalidation
            </div>
            <p style={{ fontSize: '0.85rem', color: '#a3a3a3', lineHeight: 1.4 }}>
              Memories are automatically retired or down-weighted when the dependencies, APIs, or code they reference have since changed.
            </p>
          </div>

          <div className="flat-panel" style={{ margin: 0, padding: '1.25rem' }}>
            <div style={{ color: '#38bdf8', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Negative-transfer detection & security hardening
            </div>
            <p style={{ fontSize: '0.85rem', color: '#a3a3a3', lineHeight: 1.4 }}>
              Instrumented measurement of when memory makes the agent worse (not just better), plus defenses against memory poisoning, prompt injection via retrieved content, and cross-repository leakage.
            </p>
          </div>
        </div>
      </section>

      {/* Target Users Section */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '1rem' }}>Target Users</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div className="flat-panel" style={{ margin: 0, padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '0.4rem' }}>Software engineering teams / open-source maintainers</h3>
            <p style={{ fontSize: '0.85rem', color: '#a3a3a3', lineHeight: 1.45 }}>
              Who want a coding agent that gets measurably better at resolving issues in their specific codebase over time, without needing to fine-tune a model.
            </p>
          </div>

          <div className="flat-panel" style={{ margin: 0, padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '0.4rem' }}>ML/agent researchers</h3>
            <p style={{ fontSize: '0.85rem', color: '#a3a3a3', lineHeight: 1.45 }}>
              Who need a reproducible benchmark and evaluation harness to study when experience-based memory helps vs. harms coding agents, rather than assuming retrieval always helps.
            </p>
          </div>

          <div className="flat-panel" style={{ margin: 0, padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '0.4rem' }}>Platform/DevOps teams running AI coding agents at scale</h3>
            <p style={{ fontSize: '0.85rem', color: '#a3a3a3', lineHeight: 1.45 }}>
              Who need visibility (via the dashboard) into memory quality, retrieval precision, and failure modes before trusting an agent's memory system with production repositories.
            </p>
          </div>
        </div>
      </section>

      {/* Admin Add Change Form */}
      {isAdmin && (
        <ChangeForm defaultAuthor={adminUser.name} onChangeAdded={handleAddChangeSuccess} />
      )}

      {/* Change Log Section */}
      <ChangeLog changes={changes} isAdmin={isAdmin} onDeleteChange={handleDeleteChangeSuccess} />
    </div>
  );
}
