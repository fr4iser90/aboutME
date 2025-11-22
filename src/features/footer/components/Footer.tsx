'use client'

import FooterDefault from './FooterDefault'
import FooterMinimal from './FooterMinimal'
import FooterCentered from './FooterCentered'

interface UserData {
  username: string
  name: string
  bio: string
  avatar: string
  location: string
  followers: number
  publicRepos: number
}

interface FooterConfig {
  enabled: boolean
  variant: 'default' | 'minimal' | 'centered'
  showCopyright?: boolean
  showTerminalButton?: boolean
}

interface FooterProps {
  userData: UserData | null
  config?: FooterConfig
  terminalEnabled?: boolean
  onTerminalOpen?: () => void
}

export default function Footer({ userData, config, terminalEnabled, onTerminalOpen }: FooterProps) {
  if (!config?.enabled || !userData) return null

  const showTerminalButton = config.showTerminalButton !== false && terminalEnabled && onTerminalOpen

  switch (config.variant) {
    case 'minimal':
      return <FooterMinimal userData={userData} onTerminalOpen={onTerminalOpen} showTerminalButton={showTerminalButton} />
    case 'centered':
      return <FooterCentered userData={userData} onTerminalOpen={onTerminalOpen} showTerminalButton={showTerminalButton} />
    case 'default':
    default:
      return <FooterDefault userData={userData} onTerminalOpen={onTerminalOpen} showTerminalButton={showTerminalButton} />
  }
}

