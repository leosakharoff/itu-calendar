import { useState } from 'react'
import type { NotificationSettings } from '../types/database'
import type { Language } from '../lib/dates'
import { useBottomSheetDismiss } from '../hooks/useBottomSheetDismiss'
import './NotificationSettingsModal.css'

interface NotificationSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: NotificationSettings | null
  onUpdate: (partial: Partial<Omit<NotificationSettings, 'id' | 'user_id' | 'created_at'>>) => void
  onTestWebhook: () => Promise<{ ok: boolean; error?: string }>
  language?: Language
}

export function NotificationSettingsModal({ isOpen, onClose, settings, onUpdate, onTestWebhook, language = 'da' }: NotificationSettingsModalProps) {
  const { sheetRef, handleTouchStart, handleTouchMove, handleTouchEnd, isDragging, overlayOpacity, sheetStyle } = useBottomSheetDismiss(isOpen, onClose)
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null)
  const [testing, setTesting] = useState(false)

  if (!isOpen || !settings) return null

  const isEn = language === 'en'

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    const result = await onTestWebhook()
    setTestResult(result)
    setTesting(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={isDragging ? { background: `rgba(0, 0, 0, ${overlayOpacity})` } : undefined}>
      <div ref={sheetRef} className="modal-content notification-settings-modal" onClick={e => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={sheetStyle}>
        <h3>{isEn ? 'Notifications' : 'Notifikationer'}</h3>

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
