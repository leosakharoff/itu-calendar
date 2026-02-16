import type { UserSettings } from '../types/database'
import { useBottomSheetDismiss } from '../hooks/useBottomSheetDismiss'
import './SettingsModal.css'

const MONTH_OPTIONS = [
  { value: '01', label: 'Jan' }, { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' }, { value: '04', label: 'Apr' },
  { value: '05', label: 'May' }, { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' }, { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' }, { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' },
]

const YEAR_OPTIONS = ['2025', '2026', '2027', '2028']

interface CalendarSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: UserSettings
  onUpdateSettings: (partial: Partial<Pick<UserSettings, 'calendar_start' | 'calendar_end' | 'week_start' | 'language'>>) => void
}

export function CalendarSettingsModal({ isOpen, onClose, settings, onUpdateSettings }: CalendarSettingsModalProps) {
  const { sheetRef, handleTouchStart, handleTouchMove, handleTouchEnd, isDragging, overlayOpacity, sheetStyle } = useBottomSheetDismiss(isOpen, onClose)

  if (!isOpen) return null

  const startMonth = settings.calendar_start?.split('-')[1] || '01'
  const startYear = settings.calendar_start?.split('-')[0] || '2026'
  const endMonth = settings.calendar_end?.split('-')[1] || '06'
  const endYear = settings.calendar_end?.split('-')[0] || '2026'
  const isEn = settings.language === 'en'

  return (
    <div className="modal-overlay" onClick={onClose} style={isDragging ? { background: `rgba(0, 0, 0, ${overlayOpacity})` } : undefined}>
      <div ref={sheetRef} className="modal-content settings-modal" onClick={e => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={sheetStyle}>
        <h3>{isEn ? 'Calendar' : 'Kalender'}</h3>

        <div className="settings-modal-row">
          <span className="settings-modal-label">{isEn ? 'From' : 'Fra'}</span>
          <div className="settings-modal-range-group">
            <select value={startMonth} onChange={e => onUpdateSettings({ calendar_start: `${startYear}-${e.target.value}` })}>
              {MONTH_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select value={startYear} onChange={e => onUpdateSettings({ calendar_start: `${e.target.value}-${startMonth}` })}>
              {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="settings-modal-row">
          <span className="settings-modal-label">{isEn ? 'To' : 'Til'}</span>
          <div className="settings-modal-range-group">
            <select value={endMonth} onChange={e => onUpdateSettings({ calendar_end: `${endYear}-${e.target.value}` })}>
              {MONTH_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select value={endYear} onChange={e => onUpdateSettings({ calendar_end: `${e.target.value}-${endMonth}` })}>
              {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="settings-modal-row">
          <span className="settings-modal-label">{isEn ? 'Week starts' : 'Uge starter'}</span>
          <select value={settings.week_start} onChange={e => onUpdateSettings({ week_start: e.target.value as 'monday' | 'sunday' })}>
            <option value="monday">{isEn ? 'Monday' : 'Mandag'}</option>
            <option value="sunday">{isEn ? 'Sunday' : 'Sondag'}</option>
          </select>
        </div>

        <div className="settings-modal-row">
          <span className="settings-modal-label">{isEn ? 'Language' : 'Sprog'}</span>
          <select value={settings.language} onChange={e => onUpdateSettings({ language: e.target.value as 'da' | 'en' })}>
            <option value="da">Dansk</option>
            <option value="en">English</option>
          </select>
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
