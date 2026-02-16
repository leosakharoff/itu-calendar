import { useState, useEffect } from 'react'
import type { Course, SharedCalendar } from '../types/database'
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
  onSubscribeToShareCopy
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
  }, [editingCourse, isOpen])

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
      ? 'Unsubscribe from this course?'
      : 'Delete this course and all its events?'
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
      setSubscribeError(err instanceof Error ? err.message : 'Failed to subscribe')
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
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h3>Subscribed Course</h3>

          <div className="form-group">
            <label>Name</label>
            <input type="text" value={editingCourse.name} readOnly disabled />
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              <span
                className="color-option selected"
                style={{ backgroundColor: editingCourse.color }}
              />
            </div>
          </div>

          <p className="subscribed-notice">This course is live-synced and read-only.</p>

          <div className="modal-actions">
            <button type="button" className="delete-btn" onClick={handleDelete}>
              Unsubscribe
            </button>
            <div className="right-actions">
              <button type="button" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // When editing an owned course, show the standard form
  if (editingCourse) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h3>Edit Course</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Algorithms"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Color</label>
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
                <label className="share-label">Share</label>
                {!share ? (
                  <button
                    type="button"
                    className="share-enable-btn"
                    onClick={handleEnableShare}
                    disabled={shareLoading}
                  >
                    {shareLoading ? 'Creating...' : 'Enable sharing'}
                  </button>
                ) : (
                  <div className="share-details">
                    <div className="share-toggle-row">
                      <span className="share-status">
                        {share.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        type="button"
                        className="share-toggle-btn"
                        onClick={handleToggleShare}
                        disabled={shareLoading}
                      >
                        {share.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                    {share.is_active && (
                      <div className="share-urls">
                        <div className="share-url-group">
                          <span className="share-url-label">Subscribe page</span>
                          <div className="share-url-row">
                            <input type="text" readOnly value={subscribeUrl} className="share-url-input" />
                            <button type="button" className="share-copy-btn" onClick={() => handleCopy(subscribeUrl, 'subscribe')}>
                              {copied === 'subscribe' ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>
                        <div className="share-url-group">
                          <span className="share-url-label">iCal URL</span>
                          <div className="share-url-row">
                            <input type="text" readOnly value={icalUrl} className="share-url-input" />
                            <button type="button" className="share-copy-btn" onClick={() => handleCopy(icalUrl, 'ical')}>
                              {copied === 'ical' ? 'Copied' : 'Copy'}
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
                  Delete
                </button>
              )}
              <div className="right-actions">
                <button type="button" onClick={onClose}>Cancel</button>
                <button type="submit" className="save-btn">Save</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // When adding new: show tabs for "New course" vs "Subscribe"
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Add Course</h3>

        <div className="course-modal-tabs">
          <button
            type="button"
            className={`course-modal-tab ${tab === 'create' ? 'active' : ''}`}
            onClick={() => setTab('create')}
          >
            New course
          </button>
          <button
            type="button"
            className={`course-modal-tab ${tab === 'subscribe' ? 'active' : ''}`}
            onClick={() => setTab('subscribe')}
          >
            From share link
          </button>
        </div>

        {tab === 'create' ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Algorithms"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Color</label>
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
                <button type="button" onClick={onClose}>Cancel</button>
                <button type="submit" className="save-btn">Create</button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubscribe}>
            <div className="form-group">
              <label>Share link or token</label>
              <input
                type="text"
                value={shareUrl}
                onChange={e => { setShareUrl(e.target.value); setSubscribeError(null) }}
                placeholder="Paste a share link..."
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
                  <span className="subscribe-mode-title">Live sync</span>
                  <span className="subscribe-mode-desc">See updates automatically. Read-only.</span>
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
                  <span className="subscribe-mode-title">Copy</span>
                  <span className="subscribe-mode-desc">Create your own editable copy. No sync.</span>
                </div>
              </label>
            </div>

            {subscribeError && (
              <div className="subscribe-error-msg">{subscribeError}</div>
            )}

            <div className="modal-actions">
              <div className="right-actions">
                <button type="button" onClick={onClose}>Cancel</button>
                <button type="submit" className="save-btn" disabled={subscribeLoading || !shareUrl.trim()}>
                  {subscribeLoading ? 'Importing...' : subscribeMode === 'live' ? 'Subscribe' : 'Import'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
