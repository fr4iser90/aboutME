'use client'

import { Hero } from '@/features/hero'
import type { UserData } from '@/features/shared/types'

interface HeroBlockProps {
  userData: UserData | null
  config?: {
    enabled?: boolean
    variant?: 'floating' | 'card' | 'fullscreen' | 'minimal' | 'split'
    animation?: {
      enabled: boolean
      type: 'fade' | 'slide' | 'zoom' | 'none'
      duration: number
    }
    showStats?: boolean
    showSocialLinks?: boolean
  }
}

export default function HeroBlock({ userData, config }: HeroBlockProps) {
  if (!config?.enabled || !userData) return null
  
  return <Hero userData={userData} config={config} />
}

