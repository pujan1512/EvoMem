import React, { useState, useEffect, useRef } from 'react';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import { PowerPointViewer } from 'pptx-react-viewer';
import 'pptx-react-viewer/styles';
import PPTErrorBoundary from './PPTErrorBoundary';

export default function RichPPTViewer({
  pptData,
  rawContent,
  canEdit = false,
  isEditing = false,
  onContentChange,
  onClose,
  presentationTitle = "Presentation Deck"
}) {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [viewMode, setViewMode] = useState('rich'); // Default to 'rich' slide deck mode so uploaded presentation slides & images display instantly!
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
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

  const fileUrl = pptData?.fileUrl || pptData?.ppt?.fileUrl || null;
  const fullFileUrl = fileUrl ? (fileUrl.startsWith('http') ? fileUrl : `${window.location.origin}${fileUrl}`) : null;
  const originalFileName = pptData?.originalFileName || pptData?.ppt?.originalFileName || "presentation.pptx";
  const hasActualFile = Boolean(fullFileUrl && !fullFileUrl.includes('default_presentation'));

  useEffect(() => {
    if (pptData?.slides && Array.isArray(pptData.slides)) {
      setSlides(pptData.slides);
    } else if (pptData?.ppt?.slides) {
      setSlides(pptData.ppt.slides);
    }
  }, [pptData]);

  // Slideshow Auto-Play timer
  useEffect(() => {
    let timer;
    if (isPlaying && slides.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentIndex((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Home') {
        setCurrentIndex(0);
      } else if (e.key === 'End') {
        setCurrentIndex(slides.length - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length]);

  const currentSlide = slides[currentIndex] || {
    slideNumber: 1,
    title: presentationTitle,
    subtitle: 'EvoMem Research Presentation',
    bullets: ['Select or upload a PowerPoint presentation to view full slides.'],
    paragraphs: ['No custom slide data loaded.'],
    images: [],
    bgColor: '#0f172a'
  };

  const hasRawBinary = Boolean(rawContent);
  const hasImages = currentSlide.images && currentSlide.images.length > 0;

  const docs = fullFileUrl
    ? [{ uri: fullFileUrl, fileName: originalFileName }]
    : [];

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', maxWidth: '100%', boxSizing: 'border-box', backgroundColor: '#090d16', color: '#f8fafc', overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* TOP TOOLBAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', flexWrap: 'wrap', gap: '0.5rem', zIndex: 10, width: '100%', boxSizing: 'border-box' }}>
        
        {/* Left Info & Sidebar Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {viewMode === 'rich' && (
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              style={{ backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '4px', padding: '0.3rem 0.6rem', fontSize: '0.78rem', cursor: 'pointer' }}
              title="Toggle Slide Thumbnails Drawer"
            >
              {showSidebar ? '◀ Hide List' : '▶ Slide List'}
            </button>
          )}
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
              {pptData?.presentationName || presentationTitle}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'monospace' }}>
              {viewMode === 'rich' ? `Slide ${currentIndex + 1} of ${slides.length || 1}` : originalFileName}
            </div>
          </div>
        </div>

        {/* Center Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {viewMode === 'rich' && (
            <>
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                style={{ opacity: currentIndex === 0 ? 0.4 : 1, backgroundColor: '#1e293b', color: '#ffffff', border: '1px solid #334155', padding: '0.3rem 0.65rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
              >
                ← Prev
              </button>
              
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', padding: '0 0.3rem', fontFamily: 'monospace' }}>
                {currentIndex + 1} / {slides.length || 1}
              </span>

              <button
                disabled={currentIndex >= slides.length - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                style={{ opacity: currentIndex >= slides.length - 1 ? 0.4 : 1, backgroundColor: '#1e293b', color: '#ffffff', border: '1px solid #334155', padding: '0.3rem 0.65rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
              >
                Next →
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{ backgroundColor: isPlaying ? '#dc2626' : '#2563eb', color: '#ffffff', border: 'none', padding: '0.3rem 0.65rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', marginLeft: '0.4rem' }}
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
            </>
          )}

          <button
            onClick={toggleFullscreen}
            style={{ backgroundColor: isFullscreen ? '#334155' : '#2563eb', color: '#ffffff', border: 'none', padding: '0.3rem 0.75rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            title={isFullscreen ? 'Exit Full Screen (Esc)' : 'Watch on Full Screen'}
          >
            {isFullscreen ? '✕ Exit Full Screen' : '⛶ Full Screen'}
          </button>

          {fullFileUrl && (
            <a
              href={fullFileUrl}
              download={originalFileName}
              style={{ backgroundColor: '#0284c7', color: '#ffffff', textDecoration: 'none', padding: '0.3rem 0.75rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              📥 Download Original PPT
            </a>
          )}
        </div>

        {/* Right Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ display: 'flex', backgroundColor: '#1e293b', borderRadius: '4px', padding: '2px', border: '1px solid #334155' }}>
            <button
              onClick={() => setViewMode('rich')}
              style={{ backgroundColor: viewMode === 'rich' ? '#0284c7' : 'transparent', color: '#ffffff', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
            >
              🎨 Slide Deck View
            </button>
            {hasActualFile && (
              <button
                onClick={() => setViewMode('doc')}
                style={{ backgroundColor: viewMode === 'doc' ? '#0284c7' : 'transparent', color: '#ffffff', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
              >
                📄 Document Viewer
              </button>
            )}
            {hasRawBinary && (
              <button
                onClick={() => setViewMode('native')}
                style={{ backgroundColor: viewMode === 'native' ? '#0284c7' : 'transparent', color: '#ffffff', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}
              >
                ⚙️ Raw XML Parser
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div style={{ display: 'flex', flex: 1, width: '100%', maxWidth: '100%', overflow: 'hidden', position: 'relative', boxSizing: 'border-box' }}>

        {/* THUMBNAILS SIDEBAR (Only in 'rich' mode) */}
        {viewMode === 'rich' && showSidebar && (
          <div style={{ width: '200px', minWidth: '180px', backgroundColor: '#0f172a', borderRight: '1px solid #1e293b', overflowY: 'auto', padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0, boxSizing: 'border-box' }}>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: '0.2rem' }}>
              Slides ({slides.length})
            </div>
            
            {slides.map((s, idx) => {
              const isActive = idx === currentIndex;
              const sHasImgs = s.images && s.images.length > 0;
              return (
                <div
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    padding: '0.5rem 0.6rem',
                    borderRadius: '6px',
                    border: isActive ? '2px solid #38bdf8' : '1px solid #1e293b',
                    backgroundColor: isActive ? '#1e293b' : '#090d16',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, color: isActive ? '#38bdf8' : '#94a3b8', fontFamily: 'monospace' }}>
                      #{idx + 1}
                    </span>
                    {sHasImgs && (
                      <span style={{ fontSize: '0.58rem', backgroundColor: '#0369a1', color: '#e0f2fe', padding: '1px 4px', borderRadius: '3px' }}>
                        📷 {s.images.length}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.78rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#ffffff' : '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.title}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ACTIVE CANVAS DISPLAY */}
        <div style={{ flex: 1, width: '100%', maxWidth: '100%', overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: '#020617', boxSizing: 'border-box' }}>

          {/* MODE 1: RICH CUSTOM PRESENTATION CANVAS WITH IMAGES & THEMES */}
          {viewMode === 'rich' ? (
            <div
              style={{
                width: '100%',
                maxWidth: '920px',
                backgroundColor: currentSlide.bgColor || '#0f172a',
                borderRadius: '10px',
                border: '1px solid #334155',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                boxSizing: 'border-box',
                margin: 'auto 0'
              }}
            >
              {/* SLIDE TOP ACCENT BAR */}
              <div style={{ height: '4px', background: 'linear-gradient(90deg, #38bdf8 0%, #3b82f6 50%, #e11d48 100%)' }} />

              {/* SLIDE CONTENT AREA */}
              <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxSizing: 'border-box' }}>
                
                {/* Header Block */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ backgroundColor: '#0284c7', color: '#ffffff', fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                      SLIDE {currentIndex + 1}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                      {currentSlide.subtitle || 'Software Engineering Presentation'}
                    </span>
                  </div>

                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.3, letterSpacing: '-0.01em', wordBreak: 'break-word' }}>
                    {currentSlide.title}
                  </h1>
                </div>

                {/* Main Content Layout: Responsive Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: hasImages ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr', gap: '1.5rem', alignItems: 'start', width: '100%', boxSizing: 'border-box' }}>
                  
                  {/* Text & Bullets Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
                    
                    {/* Bullets List */}
                    {currentSlide.bullets && currentSlide.bullets.length > 0 && (
                      <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1rem 1.2rem', boxSizing: 'border-box' }}>
                        <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          {currentSlide.bullets.map((b, bIdx) => (
                            <li key={bIdx} style={{ color: '#f1f5f9', fontSize: '0.98rem', lineHeight: 1.45, fontWeight: 500, wordBreak: 'break-word' }}>
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Paragraph Callouts */}
                    {currentSlide.paragraphs && currentSlide.paragraphs.map((p, pIdx) => (
                      <div key={pIdx} style={{ backgroundColor: '#090d16', borderLeft: '4px solid #38bdf8', padding: '0.85rem 1rem', borderRadius: '0 8px 8px 0', boxSizing: 'border-box' }}>
                        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5, margin: 0, wordBreak: 'break-word' }}>
                          {p}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Images Panel Column */}
                  {hasImages && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', boxSizing: 'border-box' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Slide Media ({currentSlide.images.length})
                      </div>
                      
                      {currentSlide.images.map((imgUrl, imgIdx) => (
                        <div
                          key={imgIdx}
                          onClick={() => setSelectedImage(imgUrl)}
                          style={{
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid #334155',
                            backgroundColor: '#090d16',
                            cursor: 'pointer',
                            position: 'relative',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                          title="Click to expand full image"
                        >
                          <img
                            src={imgUrl}
                            alt={`Slide ${currentIndex + 1} Image ${imgIdx + 1}`}
                            style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' }}
                          />
                          <div style={{ position: 'absolute', bottom: '6px', right: '6px', backgroundColor: 'rgba(0,0,0,0.75)', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                            🔍 Expand
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                {/* Footer Slide Bar */}
                <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.75rem', fontFamily: 'monospace', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span>EvoMem Experience Memory • UCS503 Software Engineering</span>
                  <span>Slide {currentIndex + 1} / {slides.length || 1}</span>
                </div>
              </div>
            </div>
          ) : viewMode === 'doc' && hasActualFile ? (
            /* MODE 2: DOCUMENT VIEWER */
            <div style={{ width: '100%', height: '100%', minHeight: '500px', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <PPTErrorBoundary>
                <DocViewer
                  documents={docs}
                  pluginRenderers={DocViewerRenderers}
                  style={{ width: '100%', height: '100%' }}
                  theme={{
                    primary: '#0284c7',
                    secondary: '#0f172a',
                    tertiary: '#f8fafc',
                    textPrimary: '#0f172a',
                    textSecondary: '#64748b',
                    textTertiary: '#94a3b8',
                    disableThemeScrollbar: false,
                  }}
                />
              </PPTErrorBoundary>
            </div>
          ) : (
            /* MODE 3: RAW XML PPTX PARSER */
            <div style={{ width: '100%', height: '100%', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
              <PPTErrorBoundary>
                <PowerPointViewer
                  content={rawContent}
                  canEdit={canEdit && isEditing}
                  onContentChange={onContentChange}
                />
              </PPTErrorBoundary>
            </div>
          )}

        </div>
      </div>

      {/* LIGHTBOX MODAL FOR EXPANDED IMAGES */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={selectedImage}
              alt="Expanded presentation media"
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '8px', objectFit: 'contain', border: '2px solid #38bdf8' }}
            />
            <button
              onClick={() => setSelectedImage(null)}
              style={{ position: 'absolute', top: '-15px', right: '-15px', backgroundColor: '#e11d48', color: '#ffffff', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
