import { useState, useEffect } from 'react'
import type { Course, SharedCalendar } from '../types/database'
import type { Language } from '../lib/dates'
import { useBottomSheetDismiss } from '../hooks/useBottomSheetDismiss'
import './EventModal.css'
import './ShareSection.css'

interface CourseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (course: Omit<Course, 'id' | 'created_at'>) => void
  onDelete?: () => void
  editingCourse?: Course | null
  onGetShare?: (courseId: string) => Promise<SharedCalendar | null>
  onCreateShare?: (courseId: string) => Promise<SharedCalendar>
  onToggleShare?: (shareId: string, isActive: boolean) => Promise<SharedCalendar>
  onSubscribeToShareLive?: (token: string) => Promise<Course>
  onSubscribeToShareCopy?: (token: string) => Promise<Course>
  language?: Language
}

const COLORS = [
  '#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#F44336',
  '#00BCD4', '#795548', '#607D8B', '#E91E63', '#3F51B5'
]

type Tab = 'create' | 'subscribe'
type SubscribeMode = 'live' | 'copy'

export function CourseModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingCourse,
  onGetShare,
  onCreateShare,
  onToggleShare,
  onSubscribeToShareLive,
  onSubscribeToShareCopy,
  language = 'da'
}: CourseModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [share, setShare] = useState<SharedCalendar | null>(null)
  const [shareLoading, setShareLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('create')
  const [shareUrl, setShareUrl] = useState('')
  const [subscribeLoading, setSubscribeLoading] = useState(false)
  const [subscribeError, setSubscribeError] = useState<string | null>(null)
  const [subscribeMode, setSubscribeMode] = useState<SubscribeMode>('live')

  const isEn = language === 'en'
  const { sheetRef, handleTouchStart, handleTouchMove, handleTouchEnd, isDragging, overlayOpacity, sheetStyle } = useBottomSheetDismiss(isOpen, onClose)

  useEffect(() => {
    if (editingCourse) {
      setName(editingCourse.name)
      setColor(editingCourse.color)
      if (onGetShare && !editingCourse.isSubscribed) {
        onGetShare(editingCourse.id).then(s => setShare(s))
      }
    } else {
      setName('')
      setColor(COLORS[Math.floor(Math.random() * COLORS.length)])
      setShare(null)
      setTab('create')
      setShareUrl('')
      setSubscribeError(null)
      setSubscribeMode('live')
    }
    setCopied(null)
  }, [editingCourse, isOpen, onGetShare])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      color,
      active: true,
      sort_order: editingCourse?.sort_order ?? 999
    })
    onClose()
  }

  const handleDelete = () => {
    if (!onDelete) return
    const msg = editingCourse?.isSubscribed
      ? (isEn ? 'Unsubscribe from this course?' : 'Afmeld dette kursus?')
      : (isEn ? 'Delete this course and all its events?' : 'Slet dette kursus og alle dets begivenheder?')
    if (confirm(msg)) {
      onDelete()
      onClose()
    }
  }

  const extractToken = (input: string): string => {
    let token = input.trim()
    const match = token.match(/[?&]token=([^&]+)/)
    if (match) {
      token = match[1]
    }
    return token
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shareUrl.trim()) return

    setSubscribeLoading(true)
    setSubscribeError(null)

    try {
      const token = extractToken(shareUrl)

      if (subscribeMode === 'live' && onSubscribeToShareLive) {
        await onSubscribeToShareLive(token)
      } else if (subscribeMode === 'copy' && onSubscribeToShareCopy) {
        await onSubscribeToShareCopy(token)
      }
      onClose()
    } catch (err) {
      setSubscribeError(err instanceof Error ? err.message : (isEn ? 'Failed to subscribe' : 'Kunne ikke abonnere'))
    } finally {
      setSubscribeLoading(false)
    }
  }

  const handleEnableShare = async () => {
    if (!editingCourse || !onCreateShare) return
    setShareLoading(true)
    try {
      const newShare = await onCreateShare(editingCourse.id)
      setShare(newShare)
    } catch (err) {
      console.error('Failed to create share:', err)
    } finally {
      setShareLoading(false)
    }
  }

  const handleToggleShare = async () => {
    if (!share || !onToggleShare) return
    setShareLoading(true)
    try {
      const updated = await onToggleShare(share.id, !share.is_active)
      setShare(updated)
    } catch (err) {
      console.error('Failed to toggle share:', err)
    } finally {
      setShareLoading(false)
    }
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

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const subscribeUrl = share ? `${window.location.origin}/subscribe?token=${share.share_token}` : ''
  const icalUrl = share ? `${supabaseUrl}/functions/v1/ical?token=${share.share_token}` : ''

  // When editing a subscribed course, show read-only view
  if (editingCourse?.isSubscribed) {
    return (
      <div className="modal-overlay" onClick={onClose} style={isDragging ? { background: `rgba(0, 0, 0, ${overlayOpacity})` } : undefined}>
        <div ref={sheetRef} className="modal-content" onClick={e => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={sheetStyle}>
          <h3>{isEn ? 'Subscribed Course' : 'Abonneret kursus'}</h3>

          <div className="form-group">
            <label>{isEn ? 'Name' : 'Navn'}</label>
            <input type="text" value={editingCourse.name} readOnly disabled />
          </div>

          <div className="form-group">
            <label>{isEn ? 'Color' : 'Farve'}</label>
            <div className="color-picker">
              <span
                className="color-option selected"
                style={{ backgroundColor: editingCourse.color }}
              />
            </div>
          </div>

          <p className="subscribed-notice">{isEn ? 'This course is live-synced and read-only.' : 'Dette kursus er live-synkroniseret og skrivebeskyttet.'}</p>

          <div className="modal-actions">
            <button type="button" className="delete-btn" onClick={handleDelete}>
              {isEn ? 'Unsubscribe' : 'Afmeld'}
            </button>
            <div className="right-actions">
              <button type="button" onClick={onClose}>{isEn ? 'Close' : 'Luk'}</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // When editing an owned course, show the standard form
  if (editingCourse) {
    return (
      <div className="modal-overlay" onClick={onClose} style={isDragging ? { background: `rgba(0, 0, 0, ${overlayOpacity})` } : undefined}>
        <div ref={sheetRef} className="modal-content" onClick={e => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={sheetStyle}>
          <h3>{isEn ? 'Edit Course' : 'Rediger kursus'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{isEn ? 'Name' : 'Navn'}</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={isEn ? 'e.g., Algorithms' : 'f.eks., Algoritmer'}
              />
            </div>

            <div className="form-group">
              <label>{isEn ? 'Color' : 'Farve'}</label>
              <div className="color-picker">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`color-option ${color === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>

            {onCreateShare && (
              <div className="share-section">
                <label className="share-label">{isEn ? 'Share' : 'Deling'}</label>
                {!share ? (
                  <button
                    type="button"
                    className="share-enable-btn"
                    onClick={handleEnableShare}
                    disabled={shareLoading}
                  >
                    {shareLoading ? (isEn ? 'Creating...' : 'Opretter...') : (isEn ? 'Enable sharing' : 'Aktiv\u00e9r deling')}
                  </button>
                ) : (
                  <div className="share-details">
                    <div className="share-toggle-row">
                      <span className="share-status">
                        {share.is_active ? (isEn ? 'Active' : 'Aktiv') : (isEn ? 'Inactive' : 'Inaktiv')}
                      </span>
                      <button
                        type="button"
                        className="share-toggle-btn"
                        onClick={handleToggleShare}
                        disabled={shareLoading}
                      >
                        {share.is_active ? (isEn ? 'Deactivate' : 'Deaktiv\u00e9r') : (isEn ? 'Activate' : 'Aktiv\u00e9r')}
                      </button>
                    </div>
                    {share.is_active && (
                      <div className="share-urls">
                        <div className="share-url-group">
                          <span className="share-url-label">{isEn ? 'Subscribe page' : 'Abonnementsside'}</span>
                          <div className="share-url-row">
                            <input type="text" readOnly value={subscribeUrl} className="share-url-input" />
                            <button type="button" className="share-copy-btn" onClick={() => handleCopy(subscribeUrl, 'subscribe')}>
                              {copied === 'subscribe' ? (isEn ? 'Copied' : 'Kopieret') : (isEn ? 'Copy' : 'Kopi\u00e9r')}
                            </button>
                          </div>
                        </div>
                        <div className="share-url-group">
                          <span className="share-url-label">iCal URL</span>
                          <div className="share-url-row">
                            <input type="text" readOnly value={icalUrl} className="share-url-input" />
                            <button type="button" className="share-copy-btn" onClick={() => handleCopy(icalUrl, 'ical')}>
                              {copied === 'ical' ? (isEn ? 'Copied' : 'Kopieret') : (isEn ? 'Copy' : 'Kopi\u00e9r')}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              {onDelete && (
                <button type="button" className="delete-btn" onClick={handleDelete}>
                  {isEn ? 'Delete' : 'Slet'}
                </button>
              )}
              <div className="right-actions">
                <button type="button" onClick={onClose}>{isEn ? 'Cancel' : 'Annuller'}</button>
                <button type="submit" className="save-btn">{isEn ? 'Save' : 'Gem'}</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // When adding new: show tabs for "New course" vs "Subscribe"
  return (
    <div className="modal-overlay" onClick={onClose} style={isDragging ? { background: `rgba(0, 0, 0, ${overlayOpacity})` } : undefined}>
      <div ref={sheetRef} className="modal-content" onClick={e => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={sheetStyle}>
        <h3>{isEn ? 'Add Course' : 'Tilf\u00f8j kursus'}</h3>

        <div className="course-modal-tabs">
          <button
            type="button"
            className={`course-modal-tab ${tab === 'create' ? 'active' : ''}`}
            onClick={() => setTab('create')}
          >
            {isEn ? 'New course' : 'Nyt kursus'}
          </button>
          <button
            type="button"
            className={`course-modal-tab ${tab === 'subscribe' ? 'active' : ''}`}
            onClick={() => setTab('subscribe')}
          >
            {isEn ? 'From share link' : 'Fra delingslink'}
          </button>
        </div>

        {tab === 'create' ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{isEn ? 'Name' : 'Navn'}</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={isEn ? 'e.g., Algorithms' : 'f.eks., Algoritmer'}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>{isEn ? 'Color' : 'Farve'}</label>
              <div className="color-picker">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`color-option ${color === c ? 'selected' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <div className="right-actions">
                <button type="button" onClick={onClose}>{isEn ? 'Cancel' : 'Annuller'}</button>
                <button type="submit" className="save-btn">{isEn ? 'Create' : 'Opret'}</button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubscribe}>
            <div className="form-group">
              <label>{isEn ? 'Share link or token' : 'Delingslink eller token'}</label>
              <input
                type="text"
                value={shareUrl}
                onChange={e => { setShareUrl(e.target.value); setSubscribeError(null) }}
                placeholder={isEn ? 'Paste a share link...' : 'Inds\u00e6t et delingslink...'}
                autoFocus
              />
            </div>

            <div className="subscribe-mode-selector">
              <label className="subscribe-mode-option">
                <input
                  type="radio"
                  name="subscribeMode"
                  value="live"
                  checked={subscribeMode === 'live'}
                  onChange={() => setSubscribeMode('live')}
                />
                <div className="subscribe-mode-label">
                  <span className="subscribe-mode-title">{isEn ? 'Live sync' : 'Live-synkronisering'}</span>
                  <span className="subscribe-mode-desc">{isEn ? 'See updates automatically. Read-only.' : 'Se opdateringer automatisk. Skrivebeskyttet.'}</span>
                </div>
              </label>
              <label className="subscribe-mode-option">
                <input
                  type="radio"
                  name="subscribeMode"
                  value="copy"
                  checked={subscribeMode === 'copy'}
                  onChange={() => setSubscribeMode('copy')}
                />
                <div className="subscribe-mode-label">
                  <span className="subscribe-mode-title">{isEn ? 'Copy' : 'Kopi'}</span>
                  <span className="subscribe-mode-desc">{isEn ? 'Create your own editable copy. No sync.' : 'Opret din egen redigerbare kopi. Ingen synkronisering.'}</span>
                </div>
              </label>
            </div>

            {subscribeError && (
              <div className="subscribe-error-msg">{subscribeError}</div>
            )}

            <div className="modal-actions">
              <div className="right-actions">
                <button type="button" onClick={onClose}>{isEn ? 'Cancel' : 'Annuller'}</button>
                <button type="submit" className="save-btn" disabled={subscribeLoading || !shareUrl.trim()}>
                  {subscribeLoading ? (isEn ? 'Importing...' : 'Importerer...') : subscribeMode === 'live' ? (isEn ? 'Subscribe' : 'Abonner') : (isEn ? 'Import' : 'Import\u00e9r')}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
