import { useState, useEffect } from 'react'
import type { Language } from '../lib/dates'
import './OfflineIndicator.css'

interface OfflineIndicatorProps {
  language?: Language
}

export function OfflineIndicator({ language = 'da' }: OfflineIndicatorProps) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOffline) return null

  const isEn = language === 'en'

  return (
    <div className="offline-indicator">
      <span className="offline-icon">{'\u26a1'}</span>
      <span>{isEn ? "You're offline \u2014 showing cached data" : 'Du er offline \u2014 viser cachelagret data'}</span>
    </div>
  )
}
