'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSetupStatus } from '@/features/setup/hooks/useSetupStatus'
import { useBuildWithValidation } from '@/features/editor/hooks/useBuildWithValidation'
import { useSiteStatus } from '@/features/admin/hooks/useSiteStatus'

interface AdminHeaderProps {
  buildHook: ReturnType<typeof useBuildWithValidation>
}

export default function AdminHeader({ buildHook }: AdminHeaderProps) {
  const pathname = usePathname()
  const setupStatus = useSetupStatus() // Nur noch für setupModeEnabled
  const siteStatus = useSiteStatus() // Für Status-Badge
  const [backgroundHidden, setBackgroundHidden] = useState(false)

  // Apply background toggle
  const applyBackgroundToggle = (hidden: boolean) => {
    if (hidden) {
      // Simply add the class - CSS will handle the rest
      document.body.classList.add('background-hidden')
    } else {
      // Remove the class to restore background
      document.body.classList.remove('background-hidden')
    }
  }

  // Load background preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('backgroundHidden')
    if (saved === 'true') {
      setBackgroundHidden(true)
      // Apply toggle after a small delay to ensure DOM is ready
      setTimeout(() => applyBackgroundToggle(true), 0)
    }
  }, [])

  // Handle toggle click
  const handleToggleBackground = () => {
    const newState = !backgroundHidden
    setBackgroundHidden(newState)
    localStorage.setItem('backgroundHidden', String(newState))
    applyBackgroundToggle(newState)
  }

  // Generate breadcrumbs from pathname
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs = []
    
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i]
      const label = path.charAt(0).toUpperCase() + path.slice(1)
      breadcrumbs.push(label)
    }
    
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  // Get status badge info - basiert auf site-status.json
  const getStatusBadge = () => {
    if (siteStatus.isLoading) {
      return { label: 'Status: Loading...', color: 'gray', publicAccessible: false }
    }

    // Wenn setupModeEnabled === true → Setup Mode → / NICHT public erreichbar
    if (setupStatus.setupModeEnabled === true) {
      return { label: 'Status: Offline', color: 'yellow', publicAccessible: false }
    }

    // Status basiert auf site-status.json
    switch (siteStatus.currentStatus) {
      case 'setup_required':
        return { label: 'Setup Required', color: 'red', publicAccessible: false }
      case 'ready_to_build':
        return { label: 'Ready to Build', color: 'yellow', publicAccessible: false }
      case 'validated':
        return { label: 'Validated', color: 'blue', publicAccessible: true }
      case 'published':
        return { label: 'Published', color: 'green', publicAccessible: true }
      default:
        return { label: 'Status: Unknown', color: 'gray', publicAccessible: false }
    }
  }

  const statusBadge = getStatusBadge()

  // Show build button when ready to build
  const showBuildButton = siteStatus.currentStatus === 'ready_to_build' && !siteStatus.isLoading

  return (
    <header className="admin-header">
      {/* Left: Breadcrumbs */}
      <div className="admin-header__left">
        <div className="admin-header__breadcrumbs">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="admin-header__breadcrumb-item">
              {index > 0 && <span className="admin-header__breadcrumb-separator">/</span>}
              <span className={`admin-header__breadcrumb-label ${index === breadcrumbs.length - 1 ? 'admin-header__breadcrumb-label--active' : ''}`}>
                {crumb}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Build Button + Status Badge + User Info */}
      <div className="admin-header__right">
        {/* Better Readability Toggle Button */}
        <button
          onClick={handleToggleBackground}
          className={`admin-header__readability-button ${backgroundHidden ? 'admin-header__readability-button--active' : ''}`}
          title={backgroundHidden ? 'Show background image' : 'Hide background for better readability'}
        >
          {backgroundHidden ? '👁️ Show Background' : '📖 Better Readability'}
        </button>

        {/* Build Button (wenn Build nötig) */}
        {showBuildButton && (
          <button
            onClick={buildHook.handleBuild}
            disabled={buildHook.isBuilding || buildHook.isValidating}
            className="admin-header__build-button"
          >
            {buildHook.isValidating ? '⏳ Validating...' : buildHook.isBuilding ? '⏳ Building...' : '🚀 Build Portfolio'}
          </button>
        )}

        {/* Status Badge */}
        {statusBadge.label === 'Ready to Build' ? (
          <Link 
            href="/admin/content"
            className={`admin-header__status-badge admin-header__status-badge--${statusBadge.color}`}
          >
            <span className="admin-header__status-label">{statusBadge.label}</span>
          </Link>
        ) : statusBadge.publicAccessible ? (
          <Link 
            href="/" 
            target="_blank"
            className={`admin-header__status-badge admin-header__status-badge--${statusBadge.color}`}
          >
            <span className="admin-header__status-label">{statusBadge.label}</span>
          </Link>
        ) : (
          <div className={`admin-header__status-badge admin-header__status-badge--${statusBadge.color}`}>
            <span className="admin-header__status-label">{statusBadge.label}</span>
          </div>
        )}

        {/* User Info */}
        <div className="admin-header__user">
          <div className="admin-header__user-text">
            <p className="admin-header__user-name">Admin</p>
            <p className="admin-header__user-role">Administrator</p>
          </div>
          <div className="admin-header__user-avatar">👤</div>
        </div>
      </div>
    </header>
  )
}
