import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProjectMeta, fetchChanges, fetchPPT, uploadPPT, deletePPT, loginAdmin } from '../services/api';
import ChangeForm from '../components/ChangeForm';
import ChangeLog from '../components/ChangeLog';
import { toast } from 'react-toastify';

export default function Admin({ adminUser, onLoginSuccess, onLogout }) {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [projectInfo, setProjectInfo] = useState({
    courseLabel: 'UCS503 Software Engineering',
    subtitle: 'Productivity Tracker',
    version: 'V1',
    uploadedDate: '17 August 2026'
  });

  const [changes, setChanges] = useState([]);
  const [pptMeta, setPptMeta] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [presentationName, setPresentationName] = useState('');
  const [versionTag, setVersionTag] = useState('V1');
  const [uploadStatus, setUploadStatus] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      const [projRes, changeRes, pptRes] = await Promise.all([
        fetchProjectMeta(),
        fetchChanges(),
        fetchPPT()
      ]);

      if (projRes.success) setProjectInfo(projRes.project);
      if (changeRes.success) setChanges(changeRes.changes);
      if (pptRes && pptRes.available) {
        setPptMeta(pptRes);
      } else {
        setPptMeta(null);
      }
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!identity.trim() || !password.trim()) {
      toast.error('Please enter email/username and password.');
      return;
    }

    setLoginLoading(true);

    try {
      const data = await loginAdmin(identity.trim(), password.trim());

      if (data.success && data.user) {
        toast.success(`Welcome back, ${data.user.name}!`);
        onLoginSuccess(data.user, data.token);
      } else {
        toast.error(data.message || 'Login failed. Invalid credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Server connection error during login.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'ppt' && ext !== 'pptx' && ext !== 'pdf') {
      toast.error('Invalid file type. Only .ppt, .pptx, and .pdf files are allowed.');
      return;
    }
    setSelectedFile(file);
    if (!presentationName) {
      setPresentationName(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handlePPTUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a presentation file (.ppt, .pptx, or .pdf).');
      return;
    }

    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') {
      setUploadStatus('Uploading PDF presentation directly...');
    } else {
      setUploadStatus('Uploading PowerPoint file...');
    }

    const formData = new FormData();
    formData.append('pptFile', selectedFile);
    formData.append('presentationName', presentationName || selectedFile.name);
    formData.append('version', versionTag || 'V1');

    try {
      if (ext !== 'pdf') {
        setTimeout(() => {
          setUploadStatus('Converting PPT to PDF using LibreOffice...');
        }, 1000);
      }

      const res = await uploadPPT(formData);
      if (res.success) {
        setUploadStatus(ext === 'pdf' ? 'Success! PDF uploaded.' : 'Success! PPT converted to PDF.');
        toast.success(ext === 'pdf' ? 'PDF presentation uploaded successfully!' : 'PowerPoint uploaded & converted to PDF successfully!');
        setSelectedFile(null);
        setPresentationName('');
        await loadDashboardData();
      } else {
        setUploadStatus('');
        toast.error(res.message || 'Upload failed.');
      }
    } catch (err) {
      setUploadStatus('');
      toast.error('Error uploading file to backend server.');
    } finally {
      setTimeout(() => {
        setUploadStatus('');
      }, 3000);
    }
  };

  const handleDeletePPT = async (id) => {
    if (!window.confirm('Are you sure you want to delete this presentation?')) return;
    try {
      const res = await deletePPT(id);
      if (res.success) {
        toast.success('Presentation deleted successfully.');
        await loadDashboardData();
      } else {
        toast.error(res.message || 'Failed to delete presentation.');
      }
    } catch (err) {
      toast.error('Failed to delete presentation.');
    }
  };

  const handleAddChangeSuccess = (newChange) => {
    setChanges((prev) => [newChange, ...prev]);
  };

  const handleDeleteChangeSuccess = (id) => {
    setChanges((prev) => prev.filter((item) => item.id !== id));
  };

  const isAdmin = adminUser && adminUser.role === 'admin';

  // VIEW A: If NOT authenticated -> Clean Login Form
  if (!adminUser) {
    return (
      <div style={{ maxWidth: '380px', margin: '3rem auto 0' }}>
        <div className="flat-panel">
          <div style={{ marginBottom: '1.25rem' }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Account Login</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Sign in with your admin credentials
            </p>
          </div>

          <form onSubmit={handleLoginSubmit}>
            <div className="form-field">
              <label className="form-label-text">Email / Username</label>
              <input
                type="text"
                className="input-box"
                placeholder="yprakash_be24@thapar.edu"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                disabled={loginLoading}
                autoFocus
              />
            </div>

            <div className="form-field" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label-text">Password</label>
              <input
                type="password"
                className="input-box"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginLoading}
              />
            </div>

            <button type="submit" className="btn-solid" style={{ width: '100%' }} disabled={loginLoading}>
              {loginLoading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // VIEW B: Authenticated User (Admin / Viewer Portal)
  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="course-tag">
            {isAdmin ? 'ADMINISTRATOR SESSION' : 'VIEWER SESSION'}
          </div>
          <h1 className="page-title">
            {isAdmin ? 'Admin Dashboard' : 'User Portal'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Signed in as <strong>{adminUser.name}</strong> ({adminUser.email})
          </p>
        </div>

        <button onClick={() => navigate('/')} className="btn-outline">
          View Homepage
        </button>
      </div>

      {/* Status Overview */}
      <div className="flat-panel" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
          Project Status Overview
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
            <span className="version-item-label">Current Version</span>
            <div className="version-item-val">{projectInfo.version || 'V1'}</div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
            <span className="version-item-label">Last Uploaded</span>
            <div className="version-item-val" style={{ fontSize: '0.95rem' }}>{projectInfo.uploadedDate || '17 August 2026'}</div>
          </div>
        </div>
      </div>

      {/* Admin Change Form */}
      {isAdmin && (
        <ChangeForm defaultAuthor={adminUser.name} onChangeAdded={handleAddChangeSuccess} />
      )}

      {/* Admin PPT & PDF Management */}
      {isAdmin && (
        <div className="flat-panel" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.85rem' }}>
            Presentation & PDF Upload Manager
          </h3>

          {/* Uploaded Presentations List */}
          {pptMeta && pptMeta.presentations && pptMeta.presentations.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Active Converted PDF Presentations ({pptMeta.presentations.length}):
              </div>

              {pptMeta.presentations.map((p, idx) => (
                <div key={idx} style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {p.version} - {p.presentationName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      PDF: {p.pdfFilePath} | Uploaded by {p.uploadedBy} on {p.uploadedAt}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => navigate('/ppt-viewer')} className="btn-solid" style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}>
                      View PDF
                    </button>
                    <button onClick={() => handleDeletePPT(p.id)} className="btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Drag & Drop Upload Section */}
          <div
            className="drag-drop-area"
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('pptFileInput').click()}
            style={{ padding: '1.5rem 1rem', borderStyle: dragOver ? 'solid' : 'dashed', borderColor: dragOver ? '#3b82f6' : 'var(--border-color)', cursor: 'pointer', textAlign: 'center' }}
          >
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
              {selectedFile ? selectedFile.name : 'Drag & Drop Presentation File (.ppt, .pptx, or .pdf)'}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              PPT/PPTX files are automatically converted via LibreOffice. PDF files are saved directly without conversion.
            </div>

            <input
              type="file"
              id="pptFileInput"
              accept=".ppt,.pptx,.pdf,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />
          </div>

          {/* Status Indicator */}
          {uploadStatus && (
            <div style={{ marginTop: '0.75rem', padding: '0.6rem 1rem', backgroundColor: '#141414', border: '1px solid #3b82f6', color: '#38bdf8', borderRadius: 'var(--radius)', fontSize: '0.85rem', fontWeight: 600 }}>
              ⏳ {uploadStatus}
            </div>
          )}

          {selectedFile && (
            <form onSubmit={handlePPTUpload} style={{ marginTop: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '0.75rem' }}>
                <div className="form-field">
                  <label className="form-label-text">Presentation Title</label>
                  <input
                    type="text"
                    className="input-box"
                    placeholder="EvoMem Presentation"
                    value={presentationName}
                    onChange={(e) => setPresentationName(e.target.value)}
                    disabled={Boolean(uploadStatus)}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label-text">Version Tag</label>
                  <select
                    className="input-box"
                    value={versionTag}
                    onChange={(e) => setVersionTag(e.target.value)}
                    disabled={Boolean(uploadStatus)}
                  >
                    <option value="V1">V1</option>
                    <option value="V2">V2</option>
                    <option value="V3">V3</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-solid" disabled={Boolean(uploadStatus)}>
                  {uploadStatus ? 'Uploading...' : 'Upload Presentation'}
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => { setSelectedFile(null); setPresentationName(''); }}
                  disabled={Boolean(uploadStatus)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Change History Log */}
      <ChangeLog changes={changes} isAdmin={isAdmin} onDeleteChange={handleDeleteChangeSuccess} />
    </div>
  );
}
