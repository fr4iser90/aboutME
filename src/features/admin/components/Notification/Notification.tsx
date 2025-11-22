'use client'

import { useEffect } from 'react'

export interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  onClose: () => void
  autoClose?: boolean
  duration?: number
}

export default function Notification({
  type,
  message,
  onClose,
  autoClose = true,
  duration = 3000
}: NotificationProps) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, onClose])

  return (
    <div className={`notification notification--${type}`}>
      {/* Icon */}
      <div className="notification__icon">
        {type === 'success' && '✓'}
        {type === 'error' && '✕'}
        {type === 'warning' && '⚠'}
        {type === 'info' && 'ℹ'}
      </div>

      {/* Message */}
      <p className="notification__message">{message}</p>

      {/* Close Button */}
      <button className="notification__close" onClick={onClose}>
        ✕
      </button>
    </div>
  )
}
