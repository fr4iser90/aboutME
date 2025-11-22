'use client'

import { useState, useEffect } from 'react'

interface PasswordHintBubbleProps {
  isVisible: boolean
  onClose: () => void
  passwordHint: string
  position?: 'top' | 'bottom'
}

export default function PasswordHintBubble({ 
  isVisible, 
  onClose, 
  passwordHint, 
  position = 'bottom'
}: PasswordHintBubbleProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setTimeout(onClose, 300) // Wait for animation to complete
      }, 4000)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div 
      className={`password-hint-bubble password-hint-bubble--${position} ${
        isAnimating ? 'password-hint-bubble--visible' : 'password-hint-bubble--hidden'
      }`}
      onClick={onClose}
    >
      <div className="password-hint-bubble__content">
        <div className="password-hint-bubble__text">
          <div className="password-hint-bubble__hint">{passwordHint}</div>
        </div>
      </div>
      <div className={`password-hint-bubble__arrow password-hint-bubble__arrow--${position}`}></div>
    </div>
  )
}
