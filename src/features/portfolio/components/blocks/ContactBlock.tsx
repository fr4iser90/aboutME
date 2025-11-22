'use client'

import { TerminalSection } from '@/features/terminal'
import { ContactSection } from '@/features/shared'
import type { UserData } from '@/features/shared/types'

interface ContactBlockProps {
  userData: UserData | null
  config?: {
    enabled?: boolean
  }
}

export default function ContactBlock({ userData, config }: ContactBlockProps) {
  if (!config?.enabled) return null
  
  return (
    <TerminalSection id="contact" title="Contact">
      <ContactSection userData={userData} />
    </TerminalSection>
  )
}

