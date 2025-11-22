'use client'

import { useState, useEffect } from 'react'

interface BaseSectionProps {
  id: string
  title: string
  children: React.ReactNode
  className?: string
  variant?: 'terminal' | 'simple' | 'hero'
  showControls?: boolean
  showTypewriter?: boolean
}

export default function BaseSection({ 
  id, 
  title, 
  children, 
  className = '', 
  variant = 'simple',
  showControls = false,
  showTypewriter = false
}: BaseSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [displayedTitle, setDisplayedTitle] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          
          if (showTypewriter) {
            // Typewriter effect for title
            setIsTyping(true)
            let currentIndex = 0
            const typeInterval = setInterval(() => {
              if (currentIndex <= title.length) {
                setDisplayedTitle(title.slice(0, currentIndex))
                currentIndex++
              } else {
                clearInterval(typeInterval)
                setIsTyping(false)
              }
            }, 100)
          }
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById(id)
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [id, title, showTypewriter])

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const handleClose = () => {
    const element = document.getElementById(id)
    if (element) {
      element.style.display = 'none'
    }
  }

  // Simple variant - just a basic section
  if (variant === 'simple') {
    return (
      <section id={id} className={`terminal-section ${className}`}>
        <div className="terminal-section-container">
          <h2 className="terminal-section-title">{title}</h2>
          <div className="terminal-section-content">
            {children}
          </div>
        </div>
      </section>
    )
  }

  // Hero variant - special styling for hero sections
  if (variant === 'hero') {
    return (
      <section id={id} className={`terminal-section ${className}`}>
        <div className="terminal-section-container">
          <h1 className="terminal-section-title">{title}</h1>
          <div className="terminal-section-content">
            {children}
          </div>
        </div>
      </section>
    )
  }

  // Terminal variant - full terminal styling with controls
  return (
    <section id={id} className={`terminal-section ${className}`}>
      <div className="terminal-section-container">
        {/* Terminal Window Header */}
        <div className="terminal-section-header">
          {showControls && (
            <div className="terminal-section-controls">
              <div 
                className="terminal-section-control terminal-section-control--minimize"
                onClick={handleMinimize}
                title="Minimize"
              >➖</div>
              <div 
                className="terminal-section-control terminal-section-control--close"
                onClick={handleClose}
                title="Close"
              >✕</div>
            </div>
          )}
          <div className="terminal-section-title">
            {showTypewriter ? displayedTitle : title}
            {isTyping && <span className="terminal-section-cursor">█</span>}
          </div>
          {showControls && (
            <div className="terminal-section-status">
              <span className="terminal-section-status-indicator terminal-section-status--active"></span>
              <span className="terminal-section-status-text">ACTIVE</span>
            </div>
          )}
        </div>

        {/* Terminal Content */}
        <div className={`terminal-section-content ${isVisible ? 'terminal-section-content--visible' : ''} ${isMinimized ? 'terminal-section-content--minimized' : ''}`}>
          <div className="terminal-section-output">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
