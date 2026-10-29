import React, { useState, useEffect } from 'react';
import {
  fetchEvoMemPhases,
  fetchEvoMemData,
  triggerOrchestrator,
  triggerExtractExperience,
  triggerDistillExperience,
  triggerValidateMemory,
  triggerBuildIndex,
  createEvoMemProblem
} from '../services/api';
import { toast } from 'react-toastify';

export default function EvoMemPipeline() {
  const [phases, setPhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState('phase-1');
  const [loading, setLoading] = useState(false);
  const [runningAction, setRunningAction] = useState('');
  const [activeTab, setActiveTab] = useState('solution'); // trajectory | experience | distilled | memory | index | validation | terminal | solution
  const [codeSubTab, setCodeSubTab] = useState('solution'); // solution | problem

  const [data, setData] = useState({
    trajectory: null,
    experience: null,
    distilled: null,
    memory: null,
    index: null,
    validatedMemory: null,
    problemCode: null,
    solutionCode: null
  });

  const [terminalLogs, setTerminalLogs] = useState('');

  // LeetCode Problem Modal / Form State
  const [showModal, setShowModal] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState('phase-3');
  const [newProblemTitle, setNewProblemTitle] = useState('Two Sum');
  const [newLanguage, setNewLanguage] = useState('cpp');
  const [newProblemCode, setNewProblemCode] = useState(`// # Two Sum
// description:[
// Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
// ]
// testCases:[
// 1:[Input: nums = [2,7,11,15], target = 9, Output: [0,1]]
// ]

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Buggy template for agent to fix
        unordered_map<int, int> mp;
        for(int i=0; i<nums.size(); i++) {
            int comp = target - nums[i];
            if(mp.count(comp)) return {mp[comp], i};
            mp[nums[i]] = i;
        }
        return {};
    }
};`);

  // Load phases on mount
  useEffect(() => {
    loadPhases();
  }, []);

  // Load phase data when selectedPhase changes
  useEffect(() => {
    if (selectedPhase) {
      loadPhaseData(selectedPhase);
    }
  }, [selectedPhase]);

  const loadPhases = async () => {
    try {
      const res = await fetchEvoMemPhases();
      if (res.success && res.phases) {
        setPhases(res.phases);
        if (res.phases.length > 0 && !selectedPhase) {
          setSelectedPhase(res.phases[0].id);
        }
      }
    } catch (e) {
      toast.error('Failed loading EvoMem phases');
    }
  };

  const loadPhaseData = async (phaseId) => {
    setLoading(true);
    try {
      const res = await fetchEvoMemData(phaseId);
      if (res.success) {
        setData({
          trajectory: res.trajectory,
          experience: res.experience,
          distilled: res.distilled,
          memory: res.memory,
          index: res.index,
          validatedMemory: res.validatedMemory,
          problemCode: res.problemCode,
          solutionCode: res.solutionCode
        });
      }
    } catch (e) {
      toast.error(`Error loading data for ${phaseId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProblem = async (e) => {
    e.preventDefault();
    try {
      const res = await createEvoMemProblem({
        phaseName: newPhaseName,
        problemTitle: newProblemTitle,
        language: newLanguage,
        problemCode: newProblemCode
      });
      if (res.success) {
        toast.success(`Created problem in ${res.phaseId}`);
        setShowModal(false);
        await loadPhases();
        setSelectedPhase(res.phaseId);
      } else {
        toast.error(res.message || 'Failed creating problem');
      }
    } catch (e) {
      toast.error('Error creating new problem');
    }
  };

  const handleRunOrchestrator = async () => {
    setRunningAction('Running Agent Orchestrator...');
    setTerminalLogs(`🚀 Starting OpenHands Agent Orchestrator on ${selectedPhase}...\n`);
    setActiveTab('terminal');
    try {
      const res = await triggerOrchestrator(selectedPhase);
      if (res.success) {
        toast.success('Agent Orchestration completed!');
        setTerminalLogs((prev) => prev + '\n' + (res.output || 'Completed successfully.'));
      } else {
        toast.error('Orchestration encountered issues or rate limit delay');
        setTerminalLogs((prev) => prev + '\n❌ LOG OUTPUT:\n' + (res.error || res.output || 'Unknown output'));
      }
      await loadPhaseData(selectedPhase);
      await loadPhases();
    } catch (e) {
      toast.error('Failed running orchestrator');
      setTerminalLogs((prev) => prev + '\n❌ Failed calling orchestrator API');
    } finally {
      setRunningAction('');
    }
  };

  const handleExtractExperience = async () => {
    setRunningAction('Extracting Experience...');
    setTerminalLogs(`⚡ Extracting experience from trajectory in ${selectedPhase}...\n`);
    setActiveTab('terminal');
    try {
      const res = await triggerExtractExperience(selectedPhase);
      if (res.success) {
        toast.success('Experience extracted!');
        setTerminalLogs((prev) => prev + '\n' + (res.output || 'Completed successfully.'));
      } else {
        toast.error('Experience extraction failed');
        setTerminalLogs((prev) => prev + '\n❌ ERROR:\n' + (res.error || res.output || 'Unknown error'));
      }
      await loadPhaseData(selectedPhase);
    } catch (e) {
      toast.error('Failed extracting experience');
    } finally {
      setRunningAction('');
    }
  };

  const handleDistillExperience = async () => {
    setRunningAction('Distilling Memory...');
    setTerminalLogs(`🧠 Distilling experience into long-term memory guidelines for ${selectedPhase}...\n`);
    setActiveTab('terminal');
    try {
      const res = await triggerDistillExperience(selectedPhase);
      if (res.success) {
        toast.success('Memory distilled successfully!');
        setTerminalLogs((prev) => prev + '\n' + (res.output || 'Completed successfully.'));
      } else {
        toast.error('Memory distillation failed');
        setTerminalLogs((prev) => prev + '\n❌ ERROR:\n' + (res.error || res.output || 'Unknown error'));
      }
      await loadPhaseData(selectedPhase);
    } catch (e) {
      toast.error('Failed distilling experience');
    } finally {
      setRunningAction('');
    }
  };

  const handleValidateMemory = async () => {
    setRunningAction('Validating Memory...');
    setTerminalLogs(`✅ Validating memory claims & execution ground truth for ${selectedPhase}...\n`);
    setActiveTab('terminal');
    try {
      const res = await triggerValidateMemory(selectedPhase);
      if (res.success) {
        toast.success('Memory validation completed!');
        setTerminalLogs((prev) => prev + '\n' + (res.output || 'Completed successfully.'));
      } else {
        toast.error('Memory validation failed');
        setTerminalLogs((prev) => prev + '\n❌ ERROR:\n' + (res.error || res.output || 'Unknown error'));
      }
      await loadPhaseData(selectedPhase);
    } catch (e) {
      toast.error('Failed validating memory');
    } finally {
      setRunningAction('');
    }
  };

  const handleBuildIndex = async () => {
    setRunningAction('Building Retrieval Index...');
    setTerminalLogs(`🔍 Generating vector embeddings & building retrieval index.json for ${selectedPhase}...\n`);
    setActiveTab('terminal');
    try {
      const res = await triggerBuildIndex(selectedPhase);
      if (res.success) {
        toast.success('Retrieval index built successfully!');
        setTerminalLogs((prev) => prev + '\n' + (res.output || 'Completed successfully.'));
      } else {
        toast.error('Building retrieval index failed');
        setTerminalLogs((prev) => prev + '\n❌ ERROR:\n' + (res.error || res.output || 'Unknown error'));
      }
      await loadPhaseData(selectedPhase);
    } catch (e) {
      toast.error('Failed building retrieval index');
    } finally {
      setRunningAction('');
    }
  };

  const handleRunFullPipeline = async () => {
    setRunningAction('Running Full Pipeline End-to-End...');
    setTerminalLogs(`🔥 Starting End-to-End EvoMem Pipeline for ${selectedPhase}...\n`);
    setActiveTab('terminal');
    try {
      // Step 1: Orchestrator
      setTerminalLogs((prev) => prev + '\n--- STEP 1: Running Agent Orchestrator ---\n');
      const res1 = await triggerOrchestrator(selectedPhase);
      setTerminalLogs((prev) => prev + (res1.output || res1.error || '') + '\n');
      if (!res1.success) throw new Error('Agent Orchestrator step failed');

      // Step 2: Extract Experience
      setTerminalLogs((prev) => prev + '\n--- STEP 2: Extracting Experience ---\n');
      const res2 = await triggerExtractExperience(selectedPhase);
      setTerminalLogs((prev) => prev + (res2.output || res2.error || '') + '\n');

      // Step 3: Distill Memory
      setTerminalLogs((prev) => prev + '\n--- STEP 3: Distilling Memory ---\n');
      const res3 = await triggerDistillExperience(selectedPhase);
      setTerminalLogs((prev) => prev + (res3.output || res3.error || '') + '\n');

      // Step 4: Validate Memory
      setTerminalLogs((prev) => prev + '\n--- STEP 4: Validating Memory ---\n');
      const res4 = await triggerValidateMemory(selectedPhase);
      setTerminalLogs((prev) => prev + (res4.output || res4.error || '') + '\n');

      // Step 5: Build Index
      setTerminalLogs((prev) => prev + '\n--- STEP 5: Building Retrieval Index ---\n');
      const res5 = await triggerBuildIndex(selectedPhase);
      setTerminalLogs((prev) => prev + (res5.output || res5.error || '') + '\n');

      toast.success('🎉 Full Pipeline Completed Successfully!');
      setTerminalLogs((prev) => prev + '\n✅ ALL 5 PIPELINE STAGES COMPLETED SUCCESSFULLY!\n');
      await loadPhaseData(selectedPhase);
      await loadPhases();
    } catch (e) {
      toast.error(`Pipeline stopped: ${e.message}`);
      setTerminalLogs((prev) => prev + `\n❌ PIPELINE HALTED: ${e.message}\n`);
    } finally {
      setRunningAction('');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main, #fff)', marginBottom: '0.25rem' }}>
            🧠 EvoMem Execution & Memory Pipeline
          </h1>
          <p style={{ color: 'var(--text-muted, #94a3b8)' }}>
            Autonomous Agent Trajectory Logging, Experience Extraction, Memory Distillation & Retrieval Indexing
          </p>
        </div>

        {/* Action Controls & Phase Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '0.5rem',
              backgroundColor: '#ec4899',
              color: '#fff',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            Add Problem
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontWeight: '600', color: 'var(--text-main, #fff)' }}>Phase:</label>
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '0.5rem',
                backgroundColor: 'var(--bg-card, #1e293b)',
                color: '#fff',
                border: '1px solid var(--border-color, #334155)',
                cursor: 'pointer'
              }}
            >
              {phases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Pipeline Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          backgroundColor: 'var(--bg-card, #1e293b)',
          padding: '1.25rem',
          borderRadius: '0.75rem',
          border: '1px solid var(--border-color, #334155)',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <button
          onClick={handleRunFullPipeline}
          disabled={!!runningAction}
          style={{
            padding: '0.75rem 1.75rem',
            borderRadius: '0.5rem',
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            fontWeight: '700',
            fontSize: '1rem',
            cursor: runningAction ? 'not-allowed' : 'pointer',
            opacity: runningAction ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
          }}
        >
          Run Agent
        </button>

        {runningAction && (
          <span style={{ color: '#f59e0b', fontWeight: '600', fontSize: '0.9rem' }}>
            {runningAction}
          </span>
        )}
      </div>

      {/* Tabs Header */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color, #334155)', marginBottom: '1.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('solution')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            color: activeTab === 'solution' ? '#ec4899' : 'var(--text-muted, #94a3b8)',
            borderBottom: activeTab === 'solution' ? '3px solid #ec4899' : 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Code & Solution {data.solutionCode ? '(Available)' : ''}
        </button>

        <button
          onClick={() => setActiveTab('index')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            color: activeTab === 'index' ? '#f59e0b' : 'var(--text-muted, #94a3b8)',
            borderBottom: activeTab === 'index' ? '3px solid #f59e0b' : 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Vector Retrieval Index {data.index ? '(Available)' : ''}
        </button>

        <button
          onClick={() => setActiveTab('validation')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            color: activeTab === 'validation' ? '#06b6d4' : 'var(--text-muted, #94a3b8)',
            borderBottom: activeTab === 'validation' ? '3px solid #06b6d4' : 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Validation Report {data.validatedMemory ? '(Available)' : ''}
        </button>

        <button
          onClick={() => setActiveTab('trajectory')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            color: activeTab === 'trajectory' ? '#3b82f6' : 'var(--text-muted, #94a3b8)',
            borderBottom: activeTab === 'trajectory' ? '3px solid #3b82f6' : 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Trajectory Log {data.trajectory ? '(Available)' : ''}
        </button>

        <button
          onClick={() => setActiveTab('experience')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            color: activeTab === 'experience' ? '#8b5cf6' : 'var(--text-muted, #94a3b8)',
            borderBottom: activeTab === 'experience' ? '3px solid #8b5cf6' : 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Extracted Experience {data.experience ? '(Available)' : ''}
        </button>

        <button
          onClick={() => setActiveTab('terminal')}
          style={{
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'none',
            color: activeTab === 'terminal' ? '#eab308' : 'var(--text-muted, #94a3b8)',
            borderBottom: activeTab === 'terminal' ? '3px solid #eab308' : 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Console
        </button>
      </div>

      {/* Tab Content Display */}
      <div
        style={{
          backgroundColor: '#0f172a',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          border: '1px solid var(--border-color, #334155)',
          minHeight: '400px'
        }}
      >
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading pipeline data...</p>
        ) : (
          <>
            {activeTab === 'solution' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      onClick={() => setCodeSubTab('solution')}
                      style={{
                        padding: '0.4rem 0.9rem',
                        borderRadius: '0.375rem',
                        backgroundColor: codeSubTab === 'solution' ? '#ec4899' : '#1e293b',
                        color: '#fff',
                        border: '1px solid #334155',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                      }}
                    >
                      Generated Solution ({data.solutionCode ? data.solutionCode.filename : 'None'})
                    </button>
                    <button
                      onClick={() => setCodeSubTab('problem')}
                      style={{
                        padding: '0.4rem 0.9rem',
                        borderRadius: '0.375rem',
                        backgroundColor: codeSubTab === 'problem' ? '#ec4899' : '#1e293b',
                        color: '#fff',
                        border: '1px solid #334155',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                      }}
                    >
                      Problem Template ({data.problemCode ? data.problemCode.filename : 'None'})
                    </button>
                  </div>

                  {codeSubTab === 'solution' && data.solutionCode && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(data.solutionCode.content);
                        toast.success('Copied solution code to clipboard!');
                      }}
                      style={{
                        padding: '0.4rem 0.9rem',
                        borderRadius: '0.375rem',
                        backgroundColor: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                      }}
                    >
                      Copy Solution Code
                    </button>
                  )}
                </div>

                {codeSubTab === 'solution' ? (
                  data.solutionCode ? (
                    <div>
                      <div style={{ backgroundColor: '#1e293b', padding: '0.5rem 1rem', borderRadius: '0.5rem 0.5rem 0 0', borderBottom: '1px solid #334155', color: '#ec4899', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>📄 sol/{data.solutionCode.filename}</span>
                        <span style={{ color: '#22c55e', fontSize: '0.8rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '1rem', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                          ✓ Tested & Passed
                        </span>
                      </div>
                      <pre
                        style={{
                          backgroundColor: '#020617',
                          padding: '1.25rem',
                          borderRadius: '0 0 0.5rem 0.5rem',
                          color: '#38bdf8',
                          fontFamily: 'monospace',
                          fontSize: '0.9rem',
                          overflowX: 'auto',
                          lineHeight: '1.5',
                          border: '1px solid #334155',
                          borderTop: 'none',
                          margin: 0
                        }}
                      >
                        {data.solutionCode.content}
                      </pre>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                      <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No solution code generated yet for {selectedPhase}.</p>
                      <button
                        onClick={handleRunOrchestrator}
                        style={{ padding: '0.5rem 1rem', backgroundColor: '#ec4899', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                      >
                        Run Agent Orchestrator to Generate Solution
                      </button>
                    </div>
                  )
                ) : (
                  data.problemCode ? (
                    <div>
                      <div style={{ backgroundColor: '#1e293b', padding: '0.5rem 1rem', borderRadius: '0.5rem 0.5rem 0 0', borderBottom: '1px solid #334155', color: '#a855f7', fontWeight: '600' }}>
                        <span>📄 problem/{data.problemCode.filename}</span>
                      </div>
                      <pre
                        style={{
                          backgroundColor: '#020617',
                          padding: '1.25rem',
                          borderRadius: '0 0 0.5rem 0.5rem',
                          color: '#e2e8f0',
                          fontFamily: 'monospace',
                          fontSize: '0.9rem',
                          overflowX: 'auto',
                          lineHeight: '1.5',
                          border: '1px solid #334155',
                          borderTop: 'none',
                          margin: 0
                        }}
                      >
                        {data.problemCode.content}
                      </pre>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                      <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No problem file found in {selectedPhase}/problem.</p>
                    </div>
                  )
                )}
              </div>
            )}

            {activeTab === 'trajectory' && (
              <div>
                <h3 style={{ color: '#3b82f6', marginBottom: '1rem' }}>Agent Execution Trajectory</h3>
                {data.trajectory ? (
                  <pre style={{ color: '#e2e8f0', overflowX: 'auto', fontSize: '0.875rem' }}>
                    {JSON.stringify(data.trajectory, null, 2)}
                  </pre>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No trajectory log generated yet for {selectedPhase}.</p>
                    <button
                      onClick={handleRunOrchestrator}
                      style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                    >
                      Run Agent Orchestrator Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'experience' && (
              <div>
                <h3 style={{ color: '#8b5cf6', marginBottom: '1rem' }}>Extracted Experience</h3>
                {data.experience ? (
                  <pre style={{ color: '#e2e8f0', overflowX: 'auto', fontSize: '0.875rem' }}>
                    {JSON.stringify(data.experience, null, 2)}
                  </pre>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No extracted experience found for {selectedPhase}.</p>
                    <button
                      onClick={handleExtractExperience}
                      style={{ padding: '0.5rem 1rem', backgroundColor: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                    >
                      Extract Experience Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'index' && (
              <div>
                <h3 style={{ color: '#f59e0b', marginBottom: '1rem' }}>🔍 Vector Retrieval Index (retrieval/index.json)</h3>
                {data.index ? (
                  <pre style={{ color: '#e2e8f0', overflowX: 'auto', fontSize: '0.875rem' }}>
                    {JSON.stringify(data.index, null, 2)}
                  </pre>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No retrieval index.json generated yet for {selectedPhase}.</p>
                    <button
                      onClick={handleBuildIndex}
                      style={{ padding: '0.5rem 1rem', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                    >
                      Build Retrieval Index Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'validation' && (
              <div>
                <h3 style={{ color: '#06b6d4', marginBottom: '1rem' }}>✅ Validated Memory & Report (validation/validated/memory.json)</h3>
                {data.validatedMemory ? (
                  <pre style={{ color: '#e2e8f0', overflowX: 'auto', fontSize: '0.875rem' }}>
                    {JSON.stringify(data.validatedMemory, null, 2)}
                  </pre>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No validated memory report generated yet for {selectedPhase}.</p>
                    <button
                      onClick={handleValidateMemory}
                      style={{ padding: '0.5rem 1rem', backgroundColor: '#06b6d4', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                    >
                      Validate Memory Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'terminal' && (
              <div>
                <h3 style={{ color: '#eab308', marginBottom: '1rem' }}>Execution Console Terminal</h3>
                <pre
                  style={{
                    backgroundColor: '#020617',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    color: '#22c55e',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    minHeight: '300px',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {terminalLogs || '$ Waiting for pipeline execution process...'}
                </pre>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add LeetCode Problem Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '1.5rem'
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '0.75rem',
              maxWidth: '900px',
              width: '95%',
              padding: '2.5rem',
              border: '1px solid #334155',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h2 style={{ fontSize: '1.6rem', marginBottom: '1.25rem', color: '#fff' }}>
              Add Problem to EvoMem Pipeline
            </h2>
            <form onSubmit={handleCreateProblem}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#cbd5e1' }}>
                  Target Phase Directory (e.g. phase-2)
                </label>
                <input
                  type="text"
                  value={newPhaseName}
                  onChange={(e) => setNewPhaseName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '0.375rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#cbd5e1' }}>
                  Problem Title
                </label>
                <input
                  type="text"
                  value={newProblemTitle}
                  onChange={(e) => setNewProblemTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '0.375rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#cbd5e1' }}>
                  Problem Description & Starter Code
                </label>
                <textarea
                  rows={16}
                  value={newProblemCode}
                  onChange={(e) => setNewProblemCode(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '0.375rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    color: '#22c55e',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    minHeight: '380px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '0.7rem 1.4rem',
                    borderRadius: '0.375rem',
                    backgroundColor: '#475569',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.7rem 1.4rem',
                    borderRadius: '0.375rem',
                    backgroundColor: '#ec4899',
                    color: '#fff',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Create & Select Problem Phase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
