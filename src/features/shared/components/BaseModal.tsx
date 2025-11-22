'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  badges?: Array<{
    label: string
    type: 'status' | 'difficulty' | 'technology' | 'category' | 'tags' | 'default'
    value: string
  }>
  flags?: Array<{
    type: 'status' | 'difficulty' | 'category' | 'featured'
    value: string
  }>
}

export default function BaseModal({ isOpen, onClose, children, title, badges, flags }: ModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent background scrolling
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      // Store current scroll position
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      // Restore scrolling
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      // Restore scroll position
      const scrollY = document.body.style.top
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
  }, [isOpen, onClose])

  if (!isOpen || !mounted) return null

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'status':
        return 'bg-neon-green bg-opacity-20 text-neon-green border-neon-green border-opacity-30'
      case 'difficulty':
        return 'bg-neon-pink bg-opacity-20 text-neon-pink border-neon-pink border-opacity-30'
      case 'technology':
        return 'bg-neon-blue bg-opacity-20 text-neon-blue border-neon-blue border-opacity-30'
      case 'category':
        return 'bg-neon-purple bg-opacity-20 text-neon-purple border-neon-purple border-opacity-30'
      case 'tags':
        return 'bg-neon-yellow bg-opacity-20 text-neon-yellow border-neon-yellow border-opacity-30'
      default:
        return 'bg-glass-bg-hover text-gray-300 border-glass-border'
    }
  }

  const getFlagClass = (type: string, value: string) => {
    const baseClass = 'flag'
    const valueClass = value.toLowerCase().replace(/[^a-z0-9]/g, '-')
    
    switch (type) {
      case 'status':
        return `${baseClass} flag--${valueClass}`
      case 'difficulty':
        return `${baseClass} flag--${valueClass}`
      case 'category':
        return `${baseClass} flag--category`
      case 'featured':
        return `${baseClass} flag--featured`
      default:
        return `${baseClass} flag--default`
    }
  }

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div className="flex-1">
            {title && <h2 className="modal__title">{title}</h2>}
            
            {/* Flags - kompakte Status-Anzeige */}
            {flags && flags.length > 0 && (
              <div className="flex gap-2 mt-2">
                {flags.map((flag, index) => (
                  <span
                    key={index}
                    className={getFlagClass(flag.type, flag.value)}
                  >
                    {flag.value}
                  </span>
                ))}
              </div>
            )}
            
            {/* Badges - detaillierte Informationen */}
            {badges && badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {badges.map((badge, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 text-xs font-medium rounded-md border ${getBadgeColor(badge.type)}`}
                  >
                    {badge.label}: {badge.value}
                  </span>
                ))}
              </div>
            )}
          </div>
          <button className="modal__close" onClick={onClose}>
            <span className="modal__close-icon">✕</span>
          </button>
        </div>
        <div className="modal__content">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
