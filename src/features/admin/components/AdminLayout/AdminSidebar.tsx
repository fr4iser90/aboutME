'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavItem {
  id: string
  label: string
  icon: string
  href: string
  condition?: boolean
}

interface SetupStatus {
  isConfigured: boolean
  isLoading: boolean
  error: Error | null
  portfolioStatus: 'unconfigured' | 'building' | 'active' | null
}

const baseNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/admin' },
  { id: 'content', label: 'Content', icon: '📝', href: '/admin/content' },
  { id: 'appearance', label: 'Appearance', icon: '🎨', href: '/admin/appearance' },
  { id: 'media', label: 'Media', icon: '📁', href: '/admin/media' },
  { id: 'features', label: 'Features', icon: '⚙️', href: '/admin/features' },
  { id: 'settings', label: 'Settings', icon: '🔧', href: '/admin/settings' }
]

interface AdminSidebarProps {
  collapsed?: boolean
  setupStatus?: SetupStatus
}

export default function AdminSidebar({ collapsed = false, setupStatus }: AdminSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  // Build nav items - Setup is always visible
  const navItems: NavItem[] = [
    {
      id: 'setup',
      label: 'Setup',
      icon: '🚀',
      href: '/admin/setup'
    },
    ...baseNavItems
  ]

  return (
    <aside className={`admin-sidebar ${collapsed ? 'admin-sidebar--collapsed' : ''}`}>
      {/* Logo Section */}
      <div className="admin-sidebar__logo">
        <span className="admin-sidebar__logo-icon">⚡</span>
        {!collapsed && (
          <div className="admin-sidebar__logo-text">
            <h2 className="admin-sidebar__logo-title">Portfolio CMS</h2>
            <p className="admin-sidebar__logo-subtitle">Control Center</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="admin-nav">
        {navItems.map((item) => {
          // Skip items that don't meet their condition
          if (item.condition === false) {
            return null
          }
          
          const active = isActive(item.href)
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`admin-nav__item ${active ? 'admin-nav__item--active' : ''}`}
            >
              <span className="admin-nav__item-icon">{item.icon}</span>
              {!collapsed && <span className="admin-nav__item-label">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
