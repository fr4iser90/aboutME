'use client'

import InlineHero from './InlineHero'
import FloatingHero from './FloatingHero'

interface UserData {
  name: string
  bio: string
  avatar_url: string
  avatar?: string
  username?: string
  location?: string
  followers: number
  public_repos?: number
  publicRepos?: number
}

interface HeroConfig {
  enabled: boolean
  variant: 'floating' | 'card' | 'fullscreen' | 'minimal' | 'split' | 'inline'
  animation?: {
    enabled: boolean
    type: 'fade' | 'slide' | 'zoom' | 'none'
    duration: number
  }
  showStats?: boolean
  showSocialLinks?: boolean
}

interface HeroProps {
  userData: UserData | null
  config?: HeroConfig
}

export default function Hero({ userData, config }: HeroProps) {
  if (!config?.enabled || !userData) return null

  const normalized = {
    ...userData,
    avatar_url: userData.avatar_url || userData.avatar || '',
    public_repos: userData.public_repos ?? userData.publicRepos ?? 0,
  }

  // Default: in-flow hero. Floating is explicit opt-in only.
  if (config.variant === 'floating') {
    return <FloatingHero userData={normalized} />
  }

  return <InlineHero userData={normalized} />
}
