import { useState, useEffect } from 'react'
import type { Course, SharedCalendar } from '../types/database'
import type { Language } from '../lib/dates'
import { supabase } from '../lib/supabase'
import { useBottomSheetDismiss } from '../hooks/useBottomSheetDismiss'
import './ShareModal.css'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  courses: Course[]
  userId?: string
  onGetShare: (courseId: string) => Promise<SharedCalendar | null>
  onCreateShare: (courseId: string) => Promise<SharedCalendar>
  onToggleShare: (shareId: string, isActive: boolean) => Promise<SharedCalendar>
  language?: Language
}

function generateToken(): string {
  const array = new Uint8Array(24)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(36).padStart(2, '0')).join('').slice(0, 32)
}

export function ShareModal({ isOpen, onClose, courses, userId, onGetShare, onCreateShare, onToggleShare, language = 'da' }: ShareModalProps) {
  const { sheetRef, handleTouchStart, handleTouchMove, handleTouchEnd, isDragging, overlayOpacity, sheetStyle } = useBottomSheetDismiss(isOpen, onClose)

  const [combinedToken, setCombinedToken] = useState<string | null>(null)
  const [combinedLoading, setCombinedLoading] = useState(false)
  const [courseShares, setCourseShares] = useState<Map<string, SharedCalendar | null>>(new Map())
  const [copied, setCopied] = useState<string | null>(null)

  const isEn = language === 'en'
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

  // Load combined share token and per-course shares when modal opens
  useEffect(() => {
    if (!isOpen || !userId) return

    // Fetch combined share token
    async function loadCombinedToken() {
      const { data } = await supabase
        .from('user_settings')
        .select('combined_share_token')
        .eq('user_id', userId)
        .single()
      if (data?.combined_share_token) {
        setCombinedToken(data.combined_share_token)
      }
    }

    // Fetch per-course shares
    async function loadCourseShares() {
      const ownedCourses = courses.filter(c => !c.isSubscribed)
      const shares = new Map<string, SharedCalendar | null>()
      for (const course of ownedCourses) {
        const share = await onGetShare(course.id)
        shares.set(course.id, share)
      }
      setCourseShares(shares)
    }

    loadCombinedToken()
    loadCourseShares()
  }, [isOpen, userId, courses, onGetShare])

  if (!isOpen) return null

  const handleGenerateCombinedToken = async () => {
    if (!userId) return
    setCombinedLoading(true)
    try {
      const token = generateToken()
      await supabase
        .from('user_settings')
        .update({ combined_share_token: token })
        .eq('user_id', userId)
      setCombinedToken(token)
    } catch (err) {
      console.error('Failed to generate combined token:', err)
    }
    setCombinedLoading(false)
  }

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const handleEnableShare = async (courseId: string) => {
    try {
      const share = await onCreateShare(courseId)
      setCourseShares(prev => new Map(prev).set(courseId, share))
    } catch (err) {
      console.error('Failed to enable share:', err)
    }
  }

  const handleToggleShare = async (share: SharedCalendar) => {
    try {
      const updated = await onToggleShare(share.id, !share.is_active)
      setCourseShares(prev => new Map(prev).set(share.course_id, updated))
    } catch (err) {
      console.error('Failed to toggle share:', err)
    }
  }

  const combinedIcalUrl = combinedToken
    ? `${supabaseUrl}/functions/v1/ical-combined?token=${combinedToken}`
    : null

  const ownedCourses = courses.filter(c => !c.isSubscribed)

  return (
    <div className="modal-overlay" onClick={onClose} style={isDragging ? { background: `rgba(0, 0, 0, ${overlayOpacity})` } : undefined}>
      <div ref={sheetRef} className="modal-content share-modal" onClick={e => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={sheetStyle}>
        <h3>{isEn ? 'Share' : 'Del'}</h3>

        {/* Combined Calendar Section */}
        <div className="share-modal-section">
          <div className="share-modal-section-title">{isEn ? 'Combined Calendar' : 'Samlet kalender'}</div>
          <p className="share-modal-desc">
            {isEn
              ? 'Subscribe to all your courses in one iCal feed. Use this URL in Apple Calendar, Google Calendar, or any other calendar app.'
              : 'Abonner p\u00e5 alle dine kurser i \u00e9t iCal-feed. Brug denne URL i Apple Kalender, Google Kalender eller en anden kalender-app.'}
          </p>
          {combinedIcalUrl ? (
            <div className="share-url-row">
              <input type="text" readOnly value={combinedIcalUrl} className="share-url-input" />
              <button type="button" className="share-copy-btn" onClick={() => handleCopy(combinedIcalUrl, 'combined')}>
                {copied === 'combined' ? (isEn ? 'Copied' : 'Kopieret') : (isEn ? 'Copy' : 'Kopier')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="share-enable-btn"
              onClick={handleGenerateCombinedToken}
              disabled={combinedLoading}
            >
              {combinedLoading ? (isEn ? 'Creating...' : 'Opretter...') : (isEn ? 'Generate iCal URL' : 'Generer iCal-URL')}
            </button>
          )}
        </div>

        {/* Individual Courses Section */}
        {ownedCourses.length > 0 && (
          <div className="share-modal-section">
            <div className="share-modal-section-title">{isEn ? 'Individual Courses' : 'Individuelle kurser'}</div>
            <div className="share-modal-courses">
              {ownedCourses.map(course => {
                const share = courseShares.get(course.id)
                const subscribeUrl = share ? `${window.location.origin}/subscribe?token=${share.share_token}` : ''

                return (
                  <div key={course.id} className="share-modal-course">
                    <div className="share-modal-course-header">
                      <span className="share-modal-course-dot" style={{ backgroundColor: course.color }} />
                      <span className="share-modal-course-name">{course.name}</span>
                      {share ? (
                        <button
                          type="button"
                          className={`share-modal-toggle ${share.is_active ? 'active' : ''}`}
                          onClick={() => handleToggleShare(share)}
                        >
                          {share.is_active ? (isEn ? 'Active' : 'Aktiv') : (isEn ? 'Inactive' : 'Inaktiv')}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="share-modal-enable"
                          onClick={() => handleEnableShare(course.id)}
                        >
                          {isEn ? 'Share' : 'Del'}
                        </button>
                      )}
                    </div>
                    {share?.is_active && (
                      <div className="share-modal-course-urls">
                        <div className="share-url-row">
                          <input type="text" readOnly value={subscribeUrl} className="share-url-input" />
                          <button type="button" className="share-copy-btn" onClick={() => handleCopy(subscribeUrl, `sub-${course.id}`)}>
                            {copied === `sub-${course.id}` ? (isEn ? 'Copied' : 'Kopieret') : (isEn ? 'Copy' : 'Kopier')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="modal-actions">
          <div className="right-actions">
            <button type="button" onClick={onClose}>{isEn ? 'Done' : 'Luk'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
