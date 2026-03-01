import type { Language } from '../lib/dates'
import { useBottomSheetDismiss } from '../hooks/useBottomSheetDismiss'
import './AboutModal.css'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
  language?: Language
}

export function AboutModal({ isOpen, onClose, onBack, language = 'da' }: AboutModalProps) {
  const { sheetRef, handleTouchStart, handleTouchMove, handleTouchEnd, isDragging, overlayOpacity, sheetStyle } = useBottomSheetDismiss(isOpen, onClose)

  if (!isOpen) return null

  const isEn = language === 'en'

  return (
    <div className="modal-overlay" onClick={onClose} style={isDragging ? { background: `rgba(0, 0, 0, ${overlayOpacity})` } : undefined}>
      <div ref={sheetRef} className="modal-content about-modal" onClick={e => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={sheetStyle}>
        <div className="modal-header">
          <button type="button" className="modal-back-btn" onClick={() => { onClose(); onBack() }} aria-label="Back">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="12 15 7 10 12 5" />
            </svg>
          </button>
          <h3>{isEn ? 'About' : 'Om'}</h3>
        </div>

        <div className="about-app-name">ITU Calendar</div>
        <p className="about-description">
          {isEn
            ? 'A semester calendar for IT University of Copenhagen students. Track lectures, deadlines, exams, and more across your courses.'
            : 'En semesterkalender for studerende p\u00e5 IT-Universitetet i K\u00f8benhavn. Hold styr p\u00e5 forel\u00e6sninger, afleveringer, eksamener og mere p\u00e5 tv\u00e6rs af dine kurser.'}
        </p>

        <div className="about-section">
          <div className="about-section-title">{isEn ? 'Tech Stack' : 'Teknologi'}</div>
          <div className="about-stack-list">
            <span className="about-stack-item">React 19</span>
            <span className="about-stack-item">TypeScript</span>
            <span className="about-stack-item">Vite</span>
            <span className="about-stack-item">Supabase</span>
            <span className="about-stack-item">Cloudflare Pages</span>
            <span className="about-stack-item">PWA</span>
          </div>
        </div>

        <div className="about-section">
          <a
            className="about-github-link"
            href="https://github.com/leosakharoff/itu-calendar"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
        </div>

        <div className="modal-actions">
          <div className="right-actions">
            <button type="button" onClick={onClose}>{isEn ? 'Done' : 'Luk'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
