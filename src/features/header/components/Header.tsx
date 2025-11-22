'use client'

import PortfolioHeader from './PortfolioHeader'
import HeaderMinimal from './HeaderMinimal'
import HeaderTransparent from './HeaderTransparent'

interface HeaderConfig {
  enabled: boolean
  variant: 'default' | 'minimal' | 'transparent'
  showBranding?: boolean
  showNavigation?: boolean
}

interface HeaderProps {
  config?: HeaderConfig
  onAboutClick?: () => void
}

export default function Header({ config, onAboutClick }: HeaderProps) {
  if (!config?.enabled) return null

  switch (config.variant) {
    case 'minimal':
      return <HeaderMinimal onAboutClick={onAboutClick} />
    case 'transparent':
      return <HeaderTransparent onAboutClick={onAboutClick} />
    case 'default':
    default:
      return <PortfolioHeader onAboutClick={onAboutClick} />
  }
}

