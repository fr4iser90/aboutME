'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavItem {
  id: string
  label: string
  /** Short text mark shown in the nav (no emoji) */
  mark: string
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
  { id: 'dashboard', label: 'Dashboard', mark: 'Da', href: '/admin' },
  { id: 'content', label: 'Content', mark: 'Co', href: '/admin/content' },
  { id: 'review', label: 'Review', mark: 'Re', href: '/admin/review' },
  { id: 'appearance', label: 'Appearance', mark: 'Ap', href: '/admin/appearance' },
  { id: 'media', label: 'Media', mark: 'Me', href: '/admin/media' },
  { id: 'features', label: 'Features', mark: 'Fe', href: '/admin/features' },
  { id: 'settings', label: 'Settings', mark: 'Se', href: '/admin/settings' },
]

interface AdminSidebarProps {
  collapsed?: boolean
  setupStatus?: SetupStatus
}

export default function AdminSidebar({ collapsed = false }: AdminSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const navItems: NavItem[] = [
    {
      id: 'setup',
      label: 'Setup',
      mark: 'Su',
      href: '/admin/setup',
    },
    ...baseNavItems,
  ]

  return (
    <aside className={`admin-sidebar ${collapsed ? 'admin-sidebar--collapsed' : ''}`}>
      <div className="admin-sidebar__logo">
        <span className="admin-sidebar__logo-icon" aria-hidden>
          aM
        </span>
        {!collapsed && (
          <div className="admin-sidebar__logo-text">
            <h2 className="admin-sidebar__logo-title">Portfolio CMS</h2>
            <p className="admin-sidebar__logo-subtitle">Single-admin control</p>
          </div>
        )}
      </div>

      <nav className="admin-nav">
        {navItems.map((item) => {
          if (item.condition === false) {
            return null
          }

          const active = isActive(item.href)
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`admin-nav__item ${active ? 'admin-nav__item--active' : ''}`}
              title={item.label}
            >
              <span className="admin-nav__item-icon">{item.mark}</span>
              {!collapsed && <span className="admin-nav__item-label">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
