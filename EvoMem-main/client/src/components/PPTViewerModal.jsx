import React, { useState, useEffect, useRef } from 'react';
import { updatePPTSlides, SERVER_BASE } from '../services/api';
import { toast } from 'react-toastify';
import RichPPTViewer from './RichPPTViewer';

export default function PPTViewerModal({ pptData, pptList = [], onSelectPPT, onClose, onPPTSaved, adminUser }) {
  const [content, setContent] = useState(null);
  const [presentationName, setPresentationName] = useState(
    pptData?.presentationName || "EvoMem Presentation"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saving, setSaving] = useState(false);
  const modalRef = useRef(null);

  // Check admin privileges dynamically from authenticated user role
  const canEditPPT = Boolean(adminUser && adminUser.role === 'admin');

  const toggleFullscreen = () => {
    if (!modalRef.current) return;
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
      if (modalRef.current.requestFullscreen) {
        modalRef.current.requestFullscreen();
      } else if (modalRef.current.webkitRequestFullscreen) {
        modalRef.current.webkitRequestFullscreen();
      } else if (modalRef.current.msRequestFullscreen) {
        modalRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFs);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (pptData?.presentationName) {
      setPresentationName(pptData.presentationName);
    }
    const rawTarget = pptData?.pptFile || pptData?.fileUrl || '/api/ppt/file';
    const targetUrl = rawTarget.startsWith('http') ? rawTarget : `${SERVER_BASE}${rawTarget}`;
    if (targetUrl) {
      fetch(targetUrl)
        .then((r) => {
          if (!r.ok) return null;
          return r.arrayBuffer();
        })
        .then((buf) => {
          if (buf) setContent(new Uint8Array(buf));
          else setContent(null);
        })
        .catch((err) => {
          console.warn("Failed fetching PPT file binary buffer:", err);
          setContent(null);
        });
    }
  }, [pptData]);

  useEffect(() => {
    if (!canEditPPT && isEditing) {
      setIsEditing(false);
    }
  }, [canEditPPT, isEditing]);

  async function handleSave() {
    if (!canEditPPT) {
      toast.error("You are not authorized to save this presentation");
      return;
    }
    try {
      setSaving(true);
      const response = await updatePPTSlides(content, presentationName);
      if (response?.success) {
        toast.success("Presentation saved successfully");
        if (onPPTSaved) onPPTSaved(response.ppt);
        setIsEditing(false);
      } else {
        toast.error(response?.message || "Failed to save presentation");
      }
    } catch (err) {
      console.error("Error saving presentation:", err);
      toast.error("Error saving presentation");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 2000 }}>
      <div
        ref={modalRef}
        className="modal-content-box"
        onClick={(e) => e.stopPropagation()}
        style={
          isFullscreen
            ? { width: "100vw", height: "100vh", borderRadius: 0, padding: 0 }
            : { width: "90vw", maxWidth: "1000px", height: "82vh", maxHeight: "780px", borderRadius: "10px", display: "flex", flexDirection: "column", overflow: "hidden", padding: 0, boxSizing: "border-box" }
        }
      >
        {/* HEADER BAR */}
        <div className="modal-bar" style={{ padding: '0.75rem 1.25rem', backgroundColor: '#0d0d0d', color: '#ffffff', borderBottom: '1px solid #222222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              value={presentationName}
              onChange={(e) => setPresentationName(e.target.value)}
              className="input-box"
              style={{ fontWeight: 700, minWidth: '220px', backgroundColor: '#141414', color: '#ffffff', border: '1px solid #262626' }}
              disabled={!canEditPPT || !isEditing}
            />

            {/* Multiple PPT Dropdown Selector */}
            {pptList.length > 1 && (
              <select
                value={pptData?.id || pptData?.filePath}
                onChange={(e) => {
                  const sel = pptList.find((p) => String(p.id) === String(e.target.value) || p.filePath === e.target.value);
                  if (sel && onSelectPPT) onSelectPPT(sel);
                }}
                style={{ backgroundColor: '#141414', color: '#38bdf8', border: '1px solid #38bdf8', padding: '0.35rem 0.65rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                {pptList.map((p, idx) => (
                  <option key={idx} value={p.id || p.filePath}>
                    Presentation #{idx + 1}: {p.presentationName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {canEditPPT && (
              <button
                className="btn-outline"
                onClick={() => setIsEditing(!isEditing)}
                style={{ color: '#ffffff', borderColor: '#333333' }}
              >
                {isEditing ? "Done Editing" : "Edit"}
              </button>
            )}

            {canEditPPT && isEditing && (
              <button
                className="btn-solid"
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            )}

            <button
              className="btn-solid"
              onClick={toggleFullscreen}
              style={{ backgroundColor: isFullscreen ? '#334155' : '#2563eb', color: '#ffffff', border: 'none', padding: '0.35rem 0.85rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              {isFullscreen ? "✕ Exit Full Screen" : "⛶ Full Screen"}
            </button>

            <button
              className="btn-outline"
              onClick={onClose}
              style={{ color: '#ffffff', borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
            >
              Close
            </button>
          </div>
        </div>

        {/* RICH PPT VIEWER CANVAS */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <RichPPTViewer
            pptData={pptData}
            rawContent={content}
            canEdit={canEditPPT}
            isEditing={isEditing}
            onContentChange={(bytes) => setContent(bytes)}
            onClose={onClose}
            presentationTitle={presentationName}
          />
        </div>
      </div>
    </div>
  );
}
