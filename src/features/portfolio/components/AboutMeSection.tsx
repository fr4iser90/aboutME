'use client'

import { useState, useEffect } from 'react'
import { config } from '@/features/shared/services/config'
import PasswordHintBubble from '../../terminal/components/PasswordHintBubble'

interface AboutMeSectionProps {
  userData: {
    name: string
    bio: string
    avatar: string
    aboutMe?: {
      content: string
      frontmatter: any
      lastModified: string
    }
    socialLinks?: {
      github: string
      twitter?: string
      website?: string
      linkedin?: string
      email?: string
    }
  } | null
  onAboutMeClick: () => void
}

export default function AboutMeSection({ userData, onAboutMeClick }: AboutMeSectionProps) {
  const [showPasswordHint, setShowPasswordHint] = useState(false)
  const [passwordHint, setPasswordHint] = useState('')

  // Load password hint data
  useEffect(() => {
    const loadPasswordHint = async () => {
      try {
        const response = await fetch(config.api.terminalUserInfo)
        const data = await response.json()
        setPasswordHint(data.password_hint || '')
      } catch (error) {
        console.error('Failed to load password hint:', error)
      }
    }
    
    loadPasswordHint()
  }, [])

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowPasswordHint(true)
  }

  if (!userData?.aboutMe) return null

  const content = userData.aboutMe.content
  const excerpt = content.split('\n').slice(0, 3).join('\n')
  const hasMoreContent = content.length > excerpt.length

  return (
    <div className="about-section-preview">
      <div className="about-section-preview__card glass-card">
        <div className="about-section-preview__profile">
          <div className="about-section-preview__avatar-container">
            <div className="relative">
              <img
                src={userData.avatar}
                alt={userData.name}
                className="about-section-preview__avatar cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={handleAvatarClick}
              />
              <PasswordHintBubble
                isVisible={showPasswordHint}
                onClose={() => setShowPasswordHint(false)}
                passwordHint={passwordHint}
                position="bottom"
              />
            </div>
            <div className="about-section-preview__avatar-ring"></div>
          </div>
          
          <div className="about-section-preview__info">
            <h3 className="about-section-preview__name">
              {userData.name}
            </h3>
            <p className="about-section-preview__bio">
              {userData.bio}
            </p>
          </div>
        </div>

        <div className="about-section-preview__description">
          <div className="about-section-preview__text-content">
            {excerpt}
          </div>
          
          {hasMoreContent && (
            <button
              onClick={onAboutMeClick}
              className="btn-neon about-section-preview__read-more-btn"
            >
              Read More
            </button>
          )}
        </div>

        {/* Social Links */}
        {userData.socialLinks && (
          <div className="about-section-preview__social">
            <h4 className="about-section-preview__social-title">Connect with me</h4>
            <div className="about-section-preview__social-links">
              <a
                href={userData.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link social-link--github"
                title="GitHub"
              >
                <span className="sr-only">GitHub</span>
                <svg className="social-link__icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              
              {userData.socialLinks.twitter && (
                <a
                  href={userData.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link social-link--twitter"
                  title="Twitter"
                >
                  <span className="sr-only">Twitter</span>
                  <svg className="social-link__icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              )}

              {userData.socialLinks.website && (
                <a
                  href={userData.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link social-link--website"
                  title="Website"
                >
                  <span className="sr-only">Website</span>
                  <svg className="social-link__icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
