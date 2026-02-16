import { useState, useEffect, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useBottomSheetDismiss } from '../hooks/useBottomSheetDismiss'
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
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { sheetRef, handleTouchStart, handleTouchMove, handleTouchEnd, isDragging, overlayOpacity, sheetStyle } = useBottomSheetDismiss(isOpen, onClose)

  useEffect(() => {
    if (isOpen) {
      setDisplayName(user.user_metadata?.display_name || '')
      setEmail(user.email || '')
      setAvatarUrl(user.user_metadata?.avatar_url || null)
      setNewPassword('')
      setConfirmPassword('')
      setMessage(null)
    }
  }, [isOpen, user])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file.' })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be under 2MB.' })
      return
    }

    setUploading(true)
    setMessage(null)
    try {
      const filePath = user.id
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Append timestamp to bust cache
      const url = `${publicUrl}?t=${Date.now()}`
      await onUpdateProfile({ avatarUrl: url })
      setAvatarUrl(url)
      setMessage({ type: 'success', text: 'Avatar updated.' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to upload avatar.' })
    }
    setUploading(false)
    // Reset input so re-selecting the same file triggers onChange
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

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
    <div
      className="modal-overlay"
      onClick={onClose}
      style={isDragging ? { background: `rgba(0, 0, 0, ${overlayOpacity})` } : undefined}
    >
      <div
        ref={sheetRef}
        className="modal-content profile-modal"
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={sheetStyle}
      >
        <h3>Profile</h3>

        <div className="profile-avatar-section">
          <button
            className={`profile-avatar-large ${uploading ? 'uploading' : ''}`}
            onClick={handleAvatarClick}
            type="button"
            aria-label="Change avatar"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="profile-avatar-img" />
            ) : (
              getInitials(user)
            )}
            <span className="profile-avatar-overlay">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 7C8.34 7 7 8.34 7 10s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4.5c-.83 0-1.5-.67-1.5-1.5S9.17 8.5 10 8.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="currentColor"/>
                <path d="M16.5 4h-2.12l-1.24-1.65A1.49 1.49 0 0011.95 1.5H8.05c-.49 0-.94.24-1.19.85L5.62 4H3.5C2.67 4 2 4.67 2 5.5v9c0 .83.67 1.5 1.5 1.5h13c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5zm0 10.5h-13v-9h3.05l1.24-1.65h4.42l1.24 1.65h3.05v9z" fill="currentColor"/>
              </svg>
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="profile-avatar-input"
          />
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
