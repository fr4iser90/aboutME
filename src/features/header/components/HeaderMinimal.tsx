'use client'

import { useState, useEffect } from 'react'
import { config } from '@/features/shared/services/config'

interface UserData {
  username: string
  name: string
}

interface HeaderMinimalProps {
  onAboutClick?: () => void
}

export default function HeaderMinimal({ onAboutClick }: HeaderMinimalProps) {
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch(config.api.user)
        const data = await response.json()
        setUserData(data)
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }
    loadUserData()
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className="header header--minimal">
      <div className="header__container">
        <div className="header__brand">
          <span className="header__brand-text">
            @{userData?.username}
          </span>
        </div>
        
        <nav className="header__nav header__nav--minimal">
          <button 
            className="header__nav-link"
            onClick={onAboutClick}
          >
            About
          </button>
          <button 
            className="header__nav-link"
            onClick={() => scrollToSection('projects')}
          >
            Projects
          </button>
          <button 
            className="header__nav-link"
            onClick={() => scrollToSection('skills')}
          >
            Skills
          </button>
          <button 
            className="header__nav-link"
            onClick={() => scrollToSection('contact')}
          >
            Contact
          </button>
        </nav>
      </div>
    </header>
  )
}

