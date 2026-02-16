import { useState, useRef, useCallback, useEffect } from 'react'

interface BottomSheetDismissResult {
  sheetRef: React.RefObject<HTMLDivElement | null>
  handleTouchStart: (e: React.TouchEvent) => void
  handleTouchMove: (e: React.TouchEvent) => void
  handleTouchEnd: () => void
  dragY: number
  isDragging: boolean
  overlayOpacity: number
  sheetStyle: React.CSSProperties | undefined
}

export function useBottomSheetDismiss(isOpen: boolean, onClose: () => void): BottomSheetDismissResult {
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dismissing, setDismissing] = useState(false)
  const dragStartRef = useRef<{ y: number; time: number } | null>(null)
  const sheetRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      setDragY(0)
      setIsDragging(false)
      setDismissing(false)

      // Lock body scroll — iOS needs position:fixed to truly prevent scroll
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (dismissing) return
    const sheet = sheetRef.current
    if (!sheet) return

    // Don't initiate drag if sheet is scrolled down
    if (sheet.scrollTop > 0) return

    // Don't start drag from input/textarea/select elements
    const target = e.target as HTMLElement
    const tag = target.tagName.toLowerCase()
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return

    const touch = e.touches[0]
    dragStartRef.current = { y: touch.clientY, time: Date.now() }
  }, [dismissing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragStartRef.current || dismissing) return
    const touch = e.touches[0]
    const dy = touch.clientY - dragStartRef.current.y

    // Only allow downward drag
    if (dy <= 0) {
      if (isDragging) {
        setDragY(0)
        setIsDragging(false)
      }
      return
    }

    if (dy > 8) {
      // Prevent page scroll while dragging the sheet
      e.preventDefault()
      setIsDragging(true)
      setDragY(dy)
    }
  }, [isDragging, dismissing])

  const handleTouchEnd = useCallback(() => {
    if (!dragStartRef.current || !isDragging || dismissing) {
      dragStartRef.current = null
      return
    }

    const elapsed = Date.now() - dragStartRef.current.time
    const velocity = dragY / Math.max(elapsed, 1)

    if (dragY > 120 || velocity > 0.4) {
      // Dismiss: animate off screen, then close
      setDismissing(true)
      setDragY(window.innerHeight)
      setTimeout(() => {
        onClose()
      }, 250)
    } else {
      // Spring back
      setDragY(0)
    }

    setIsDragging(false)
    dragStartRef.current = null
  }, [isDragging, dragY, onClose, dismissing])

  const overlayOpacity = isDragging ? Math.max(0, 0.4 * (1 - dragY / 400)) : 0.4

  const sheetStyle: React.CSSProperties | undefined = dragY > 0
    ? {
        transform: `translateY(${dragY}px)`,
        transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }
    : undefined

  return {
    sheetRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    dragY,
    isDragging,
    overlayOpacity,
    sheetStyle,
  }
}
