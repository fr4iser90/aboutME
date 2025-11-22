'use client'

import { useState, useEffect } from 'react'
import { config } from '@/features/shared/services/config'

interface UserData {
  username: string
  name: string
}

interface HeaderTransparentProps {
  onAboutClick?: () => void
}

export default function HeaderTransparent({ onAboutClick }: HeaderTransparentProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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
    setIsMenuOpen(false)
  }

  return (
    <header className="header header--transparent">
      <div className="header__container">
        <div className="header__brand">
          <span className="header__brand-text neon-text">
            About @{userData?.username}
          </span>
        </div>
        
        <nav className="header__nav">
          <button 
            className="header__nav-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className="header__nav-toggle-line"></span>
            <span className="header__nav-toggle-line"></span>
            <span className="header__nav-toggle-line"></span>
          </button>
          
          <ul className={`header__nav-list ${isMenuOpen ? 'header__nav-list--open' : ''}`}>
            <li className="header__nav-item">
              <button 
                className="header__nav-link btn-neon"
                onClick={onAboutClick}
              >
                About Me
              </button>
            </li>
            <li className="header__nav-item">
              <button 
                className="header__nav-link btn-neon"
                onClick={() => scrollToSection('projects')}
              >
                Projects
              </button>
            </li>
            <li className="header__nav-item">
              <button 
                className="header__nav-link btn-neon"
                onClick={() => scrollToSection('skills')}
              >
                Skills
              </button>
            </li>
            <li className="header__nav-item">
              <button 
                className="header__nav-link btn-neon"
                onClick={() => scrollToSection('contact')}
              >
                Contact
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

