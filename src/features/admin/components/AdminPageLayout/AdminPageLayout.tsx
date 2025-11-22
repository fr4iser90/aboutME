'use client'

import { ReactNode } from 'react'

interface AdminPageLayoutProps {
  title: string
  subtitle?: string
  centered?: boolean
  maxWidth?: '800px' | '1200px' | 'full'
  children: ReactNode
}

/**
 * AdminPageLayout - Zentrale Layout-Definition für alle Admin Pages
 * 
 * Löst das Problem der inkonsistenten Header-Positionierung:
 * - Header ist IMMER außerhalb des Content-Containers
 * - Header bleibt immer linksbündig, auch wenn Content zentriert ist
 * - Einheitliche Struktur für alle Pages
 */
export default function AdminPageLayout({
  title,
  subtitle,
  centered = false,
  maxWidth = 'full',
  children
}: AdminPageLayoutProps) {
  return (
    <>
      {/* Header IMMER außerhalb des Content-Containers */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">{title}</h1>
        {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
      </div>
      
      {/* Content-Container (kann zentriert sein) */}
      <div className={`admin-page-content ${
        centered ? `admin-page-content--centered admin-page-content--${maxWidth}` : ''
      }`}>
        {children}
      </div>
    </>
  )
}

