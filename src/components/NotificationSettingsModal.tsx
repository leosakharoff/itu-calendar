import { useState } from 'react'
import type { NotificationSettings, EventType } from '../types/database'
import type { Language } from '../lib/dates'
import { useBottomSheetDismiss } from '../hooks/useBottomSheetDismiss'
import './NotificationSettingsModal.css'

const ALL_EVENT_TYPES: EventType[] = ['lecture', 'deliverable', 'exam', 'presentation', 'holiday']

const EVENT_TYPE_LABELS: Record<EventType, { da: string; en: string }> = {
  lecture: { da: 'Forel\u00e6sninger', en: 'Lectures' },
  deliverable: { da: 'Afleveringer', en: 'Deliverables' },
  exam: { da: 'Eksamener', en: 'Exams' },
  presentation: { da: 'Pr\u00e6sentationer', en: 'Presentations' },
  holiday: { da: 'Helligdage', en: 'Holidays' },
}

interface NotificationSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
  settings: NotificationSettings | null
  onUpdate: (partial: Partial<Omit<NotificationSettings, 'id' | 'user_id' | 'created_at'>>) => void
  onTestWebhook: () => Promise<{ ok: boolean; error?: string }>
  onTestEmail: () => Promise<{ ok: boolean; error?: string }>
  userEmail?: string
  language?: Language
}

export function NotificationSettingsModal({ isOpen, onClose, onBack, settings, onUpdate, onTestWebhook, onTestEmail, userEmail, language = 'da' }: NotificationSettingsModalProps) {
  const { sheetRef, handleTouchStart, handleTouchMove, handleTouchEnd, isDragging, overlayOpacity, sheetStyle } = useBottomSheetDismiss(isOpen, onClose)
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null)
  const [testing, setTesting] = useState(false)
  const [emailTestResult, setEmailTestResult] = useState<{ ok: boolean; error?: string } | null>(null)
  const [emailTesting, setEmailTesting] = useState(false)

  if (!isOpen || !settings) return null

  const isEn = language === 'en'
  const eventTypes = settings.notify_event_types ?? ['deliverable', 'exam']

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    const result = await onTestWebhook()
    setTestResult(result)
    setTesting(false)
  }

  const handleEmailTest = async () => {
    setEmailTesting(true)
    setEmailTestResult(null)
    const result = await onTestEmail()
    setEmailTestResult(result)
    setEmailTesting(false)
  }

  const toggleEventType = (type: EventType) => {
    const current = new Set(eventTypes)
    if (current.has(type)) {
      current.delete(type)
    } else {
      current.add(type)
    }
    onUpdate({ notify_event_types: [...current] })
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={isDragging ? { background: `rgba(0, 0, 0, ${overlayOpacity})` } : undefined}>
      <div ref={sheetRef} className="modal-content notification-settings-modal" onClick={e => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={sheetStyle}>
        <div className="modal-header">
          <button type="button" className="modal-back-btn" onClick={() => { onClose(); onBack() }} aria-label="Back">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="12 15 7 10 12 5" />
            </svg>
          </button>
          <h3>{isEn ? 'Notifications' : 'Notifikationer'}</h3>
        </div>

        {/* Discord section */}
        <div className="notification-section">
          <div className="notification-section-title">Discord</div>

          <div className="notification-row">
            <span className="notification-row-label">{isEn ? 'Send to Discord' : 'Send til Discord'}</span>
            <button
              type="button"
              className={`notification-toggle ${settings.discord_enabled ? 'active' : ''}`}
              onClick={() => onUpdate({ discord_enabled: !settings.discord_enabled })}
              aria-label="Toggle Discord notifications"
            />
          </div>

          {settings.discord_enabled && (
            <>
              <input
                type="url"
                className="notification-webhook-input"
                placeholder="https://discord.com/api/webhooks/..."
                value={settings.discord_webhook_url || ''}
                onChange={e => onUpdate({ discord_webhook_url: e.target.value || null })}
              />
              <button
                type="button"
                className="notification-test-btn"
                onClick={handleTest}
                disabled={testing || !settings.discord_webhook_url}
              >
                {testing ? (isEn ? 'Sending...' : 'Sender...') : 'Test'}
              </button>
              {testResult && (
                <div className={`notification-test-result ${testResult.ok ? 'success' : 'error'}`}>
                  {testResult.ok
                    ? (isEn ? 'Message sent!' : 'Besked sendt!')
                    : (isEn ? `Failed: ${testResult.error}` : `Fejl: ${testResult.error}`)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Email section */}
        <div className="notification-section">
          <div className="notification-section-title">Email</div>

          <div className="notification-row">
            <span className="notification-row-label">{isEn ? 'Send via email' : 'Send via email'}</span>
            <button
              type="button"
              className={`notification-toggle ${settings.email_enabled ? 'active' : ''}`}
              onClick={() => onUpdate({ email_enabled: !settings.email_enabled })}
              aria-label="Toggle email notifications"
            />
          </div>

          {settings.email_enabled && (
            <>
              {userEmail && (
                <div className="notification-email-label">{userEmail}</div>
              )}
              <button
                type="button"
                className="notification-test-btn"
                onClick={handleEmailTest}
                disabled={emailTesting}
              >
                {emailTesting ? (isEn ? 'Sending...' : 'Sender...') : 'Test'}
              </button>
              {emailTestResult && (
                <div className={`notification-test-result ${emailTestResult.ok ? 'success' : 'error'}`}>
                  {emailTestResult.ok
                    ? (isEn ? 'Email sent!' : 'Email sendt!')
                    : (isEn ? `Failed: ${emailTestResult.error}` : `Fejl: ${emailTestResult.error}`)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Event Types section */}
        <div className="notification-section">
          <div className="notification-section-title">{isEn ? 'Event Types' : 'Begivenhedstyper'}</div>
          <div className="notification-event-types">
            {ALL_EVENT_TYPES.map(type => (
              <button
                key={type}
                type="button"
                className={`notification-event-type-pill ${eventTypes.includes(type) ? 'selected' : ''}`}
                onClick={() => toggleEventType(type)}
              >
                {isEn ? EVENT_TYPE_LABELS[type].en : EVENT_TYPE_LABELS[type].da}
              </button>
            ))}
          </div>
        </div>

        {/* Timing section */}
        <div className="notification-section">
          <div className="notification-section-title">{isEn ? 'Timing' : 'Tidspunkt'}</div>

          <div className="notification-row">
            <span className="notification-row-label">{isEn ? 'Day before' : 'Dagen f\u00f8r'}</span>
            <button
              type="button"
              className={`notification-toggle ${settings.notify_day_before ? 'active' : ''}`}
              onClick={() => onUpdate({ notify_day_before: !settings.notify_day_before })}
              aria-label="Toggle day-before notifications"
            />
          </div>

          <div className="notification-row">
            <span className="notification-row-label">{isEn ? 'Same day' : 'Samme dag'}</span>
            <button
              type="button"
              className={`notification-toggle ${settings.notify_same_day ? 'active' : ''}`}
              onClick={() => onUpdate({ notify_same_day: !settings.notify_same_day })}
              aria-label="Toggle same-day notifications"
            />
          </div>

          <div className="notification-row">
            <span className="notification-row-label">{isEn ? 'Notify at' : 'Besked kl.'}</span>
            <input
              type="time"
              className="notification-time-input"
              value={settings.notify_time}
              onChange={e => onUpdate({ notify_time: e.target.value })}
            />
          </div>
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
