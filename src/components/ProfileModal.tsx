import { useState, useEffect, useRef, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import './ProfileModal.css'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
  onSignOut: () => void
  onUpdateProfile: (data: { displayName?: string; avatarUrl?: string }) => Promise<void>
  onUpdateEmail: (email: string) => Promise<void>
  onUpdatePassword: (password: string) => Promise<void>
}

function getInitials(user: User): string {
  const name = user.user_metadata?.display_name
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return parts[0][0].toUpperCase()
  }
  return (user.email?.[0] || '?').toUpperCase()
}

export function ProfileModal({
  isOpen,
  onClose,
  user,
  onSignOut,
  onUpdateProfile,
  onUpdateEmail,
  onUpdatePassword
}: ProfileModalProps) {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Swipe-to-dismiss state
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ y: number; time: number } | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setDisplayName(user.user_metadata?.display_name || '')
      setEmail(user.email || '')
      setNewPassword('')
      setConfirmPassword('')
      setMessage(null)
      setDragY(0)
      setIsDragging(false)
    }
  }, [isOpen, user])

  const handleModalTouchStart = useCallback((e: React.TouchEvent) => {
    // Only allow drag from the grab handle area or when scrolled to top
    const modal = modalRef.current
    if (!modal) return
    // If the modal content is scrolled down, don't start drag
    if (modal.scrollTop > 0) return
    const touch = e.touches[0]
    dragStartRef.current = { y: touch.clientY, time: Date.now() }
  }, [])

  const handleModalTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragStartRef.current) return
    const touch = e.touches[0]
    const dy = touch.clientY - dragStartRef.current.y

    // Only drag downward
    if (dy < 0) {
      setDragY(0)
      return
    }

    // If we're dragging down, prevent scroll and start tracking
    if (dy > 10) {
      setIsDragging(true)
      setDragY(dy)
    }
  }, [])

  const handleModalTouchEnd = useCallback(() => {
    if (!dragStartRef.current || !isDragging) {
      dragStartRef.current = null
      return
    }

    const elapsed = Date.now() - dragStartRef.current.time
    const velocity = dragY / elapsed // px/ms

    // Dismiss if dragged far enough or fast enough
    if (dragY > 150 || velocity > 0.5) {
      // Animate off screen then close
      setDragY(window.innerHeight)
      setTimeout(onClose, 200)
    } else {
      setDragY(0)
    }

    setIsDragging(false)
    dragStartRef.current = null
  }, [isDragging, dragY, onClose])

  if (!isOpen) return null

  const handleSaveProfile = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const nameChanged = displayName !== (user.user_metadata?.display_name || '')
      const emailChanged = email !== user.email

      if (nameChanged) {
        await onUpdateProfile({ displayName })
      }
      if (emailChanged) {
        await onUpdateEmail(email)
        setMessage({ type: 'success', text: 'Check your new email for a confirmation link.' })
        setSaving(false)
        return
      }
      if (nameChanged) {
        setMessage({ type: 'success', text: 'Profile updated.' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update profile.' })
    }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    if (!newPassword) return
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      await onUpdatePassword(newPassword)
      setNewPassword('')
      setConfirmPassword('')
      setMessage({ type: 'success', text: 'Password updated.' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update password.' })
    }
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={isDragging ? { background: `rgba(0, 0, 0, ${Math.max(0, 0.4 - dragY / 800)})` } : undefined}>
      <div
        ref={modalRef}
        className="modal-content profile-modal"
        onClick={e => e.stopPropagation()}
        onTouchStart={handleModalTouchStart}
        onTouchMove={handleModalTouchMove}
        onTouchEnd={handleModalTouchEnd}
        style={dragY > 0 ? {
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        } : undefined}
      >
        <h3>Profile</h3>

        <div className="profile-avatar-section">
          <div className="profile-avatar-large">
            {getInitials(user)}
          </div>
        </div>

        {message && (
          <div className={`profile-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="form-group">
          <label>Display name</label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="profile-save-row">
          <button
            className="save-btn"
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <div className="profile-divider" />

        <div className="form-group">
          <label>New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="New password"
          />
        </div>

        <div className="form-group">
          <label>Confirm password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
          />
        </div>

        <div className="profile-save-row">
          <button
            className="save-btn"
            onClick={handleChangePassword}
            disabled={saving || !newPassword}
          >
            Change password
          </button>
        </div>

        <div className="profile-divider" />

        <button className="profile-sign-out-btn" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </div>
  )
}

export { getInitials }
