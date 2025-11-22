'use client'

import Link from 'next/link'
import { useSetupStatus } from '@/features/setup/hooks/useSetupStatus'

/**
 * Setup Banner Component
 * 
 * Displays a banner on the admin dashboard when setup is needed
 * Provides a call-to-action link to the setup page
 */
export default function SetupBanner() {
  const setupStatus = useSetupStatus()

  // Don't show banner if setup is complete or still loading
  if (setupStatus.isLoading || setupStatus.isConfigured) {
    return null
  }

  return (
    <div className="setup-banner">
      <div className="setup-banner__content">
        <div className="setup-banner__icon">🚀</div>
        <div className="setup-banner__text">
          <h3 className="setup-banner__title">Setup Required</h3>
          <p className="setup-banner__description">
            Complete the initial setup to configure your portfolio and start managing your content.
          </p>
        </div>
        <div className="setup-banner__action">
          <Link href="/admin/setup" className="setup-banner__link">
            Start Setup →
          </Link>
        </div>
      </div>
    </div>
  )
}

