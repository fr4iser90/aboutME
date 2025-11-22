'use client'

import { TerminalSection } from '@/features/terminal'
import { AboutMeSection } from '@/features/portfolio'
import type { UserData } from '@/features/shared/types'

interface AboutMeBlockProps {
  userData: UserData | null
  config?: {
    enabled?: boolean
  }
  onAboutMeClick?: () => void
}

export default function AboutMeBlock({ userData, config, onAboutMeClick }: AboutMeBlockProps) {
  if (!config?.enabled || !userData?.aboutMe || !userData) return null
  
  return (
    <TerminalSection id="about" title="About Me">
      <AboutMeSection userData={userData} onAboutMeClick={onAboutMeClick} />
    </TerminalSection>
  )
}

