'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import FloatingHeroDragHandler from '../services/floatingHero'
import { isMobileDevice, shouldReduceMotion } from '@/features/shared/services/mobileDetection'

interface UserData {
  name: string
  bio: string
  avatar_url: string
  followers: number
  public_repos: number
  location?: string
}

interface FloatingHeroProps {
  userData: UserData
}

export default function FloatingHero({ userData }: FloatingHeroProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [position, setPosition] = useState({ x: 32, y: 120 }) // Start below header
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice())
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Throttle position updates for better performance
  const throttledSetPosition = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (newPosition: { x: number; y: number }) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => setPosition(newPosition), isMobile ? 16 : 8) // 60fps on mobile, 120fps on desktop
      }
    })(),
    [isMobile]
  )

  // Constrain position within boundaries using cached measurements for better performance
  const constrainPosition = useCallback((x: number, y: number, expanded: boolean) => {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Cache DOM queries for better performance
    const header = document.querySelector('.header')
    const footer = document.querySelector('.footer')
    
    const headerHeight = header ? header.getBoundingClientRect().height : 100
    const footerHeight = footer ? footer.getBoundingClientRect().height : 80
    
    // Use cached dimensions instead of querying DOM every time
    const elementWidth = isMobile ? 200 : 263 // Approximate mobile vs desktop width
    const elementHeight = isMobile ? 250 : 324 // Approximate mobile vs desktop height
    
    const minX = 0
    const maxX = viewportWidth - elementWidth
    const minY = headerHeight
    const maxY = viewportHeight - elementHeight - footerHeight
    
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y))
    }
  }, [isMobile])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const constrained = constrainPosition(position.x, position.y, isExpanded)
      setPosition(constrained)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [position.x, position.y, isExpanded])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault()
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      
      const constrained = constrainPosition(newX, newY, isExpanded)
      throttledSetPosition(constrained)
    }
  }, [isDragging, dragStart, isExpanded, constrainPosition, throttledSetPosition])

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    const handleDocumentMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault()
        const newX = e.clientX - dragStart.x
        const newY = e.clientY - dragStart.y
        
        const constrained = constrainPosition(newX, newY, isExpanded)
        throttledSetPosition(constrained)
      }
    }

    const handleDocumentMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleDocumentMouseMove, { passive: false })
      document.addEventListener('mouseup', handleDocumentMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove)
      document.removeEventListener('mouseup', handleDocumentMouseUp)
    }
  }, [isDragging, dragStart, isExpanded, constrainPosition, throttledSetPosition])


  if (!isVisible || isMobile) return null

  return (
    <div 
      data-floating-hero
      className={`glass-card transition-all duration-300 floating-hero ${
        isMobile ? 'scale-75' : 'scale-50'
      } ${
        isExpanded ? 'floating-hero--expanded' : 'floating-hero--minimized'
      }`}
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        zIndex: 501,
        cursor: isDragging ? 'grabbing' : 'grab',
        // Disable drag on mobile for better performance
        touchAction: isMobile ? 'none' : 'auto'
      }}
      onMouseDown={!isMobile ? handleMouseDown : undefined}
      onTouchStart={isMobile ? (e) => {
        // Simple tap to expand/collapse on mobile instead of drag
        e.preventDefault()
        setIsExpanded(!isExpanded)
      } : undefined}
    >
        {/* Control Icons */}
        <div className="terminal-section-controls">
          <div 
            className="terminal-section-control terminal-section-control--close"
            onClick={() => setIsVisible(false)}
            title="Close"
          >
            ✕
          </div>
        </div>

        {/* Avatar */}
        <div className={`mb-3 mx-auto floating-hero__avatar ${
          isExpanded ? 'floating-hero__avatar--expanded' : 'floating-hero__avatar--minimized'
        } avatar-neon`}>
          <img
            src={userData.avatar_url}
            alt={userData.name}
            className="w-full h-full rounded-full object-contain"
          />
        </div>

        {/* Name */}
        <h1 className={`neon-text font-bold text-center mb-1 floating-hero__name ${
          isExpanded ? 'floating-hero__name--expanded' : 'floating-hero__name--minimized'
        }`}>
          {userData.name}
        </h1>

        {/* Bio */}
        {isExpanded && (
          <p className="text-white/80 text-center mb-2 floating-hero__bio">
            {userData.bio}
          </p>
        )}

        {/* Stats */}
        <div className="flex justify-center gap-3 floating-hero__stats">
          <div className="flex items-center gap-1 text-white/70 hover:text-white/90 transition-all duration-300 hover:scale-105 cursor-pointer px-2 py-1 rounded-lg hover:bg-white/5">
            <span className="text-sm">👥</span>
            <span className="font-semibold text-white/90">{userData.followers}</span>
            <span className="text-xs opacity-70">Followers</span>
          </div>
          <div className="flex items-center gap-1 text-white/70 hover:text-white/90 transition-all duration-300 hover:scale-105 cursor-pointer px-2 py-1 rounded-lg hover:bg-white/5">
            <span className="text-sm">📁</span>
            <span className="font-semibold text-white/90">{userData.public_repos}</span>
            <span className="text-xs opacity-70">Repos</span>
          </div>
        </div>

        {/* Location */}
        {isExpanded && userData.location && (
          <div className="flex items-center justify-center gap-1 mt-3 text-white/60 text-xs">
            <span>📍</span>
            <span>{userData.location}</span>
          </div>
        )}
    </div>
  )
}

