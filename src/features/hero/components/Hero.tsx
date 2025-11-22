'use client'

import FloatingHero from './FloatingHero'
// import HeroCard from './HeroCard' // Später
// import HeroFullscreen from './HeroFullscreen' // Später
// import HeroMinimal from './HeroMinimal' // Später
// import HeroSplit from './HeroSplit' // Später

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
  variant: 'floating' | 'card' | 'fullscreen' | 'minimal' | 'split'
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
  // Wenn Hero deaktiviert oder kein userData, nichts rendern
  if (!config?.enabled || !userData) return null

  // Wähle Variante basierend auf Config
  switch (config.variant) {
    case 'floating':
      return <FloatingHero userData={userData} />
    // case 'card':
    //   return <HeroCard userData={userData} config={config} />
    // case 'fullscreen':
    //   return <HeroFullscreen userData={userData} config={config} />
    // case 'minimal':
    //   return <HeroMinimal userData={userData} config={config} />
    // case 'split':
    //   return <HeroSplit userData={userData} config={config} />
    default:
      // Fallback zu Floating (aktuell einzige implementierte Variante)
      return <FloatingHero userData={userData} />
  }
}

