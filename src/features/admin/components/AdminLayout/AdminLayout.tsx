'use client'

import { ReactNode, useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import { useSetupStatus } from '@/features/setup/hooks/useSetupStatus'
import { useBuildWithValidation } from '@/features/editor/hooks/useBuildWithValidation'
import ValidationModal from '@/features/editor/components/ValidationModal'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const setupStatus = useSetupStatus()
  const buildHook = useBuildWithValidation()

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <AdminSidebar collapsed={sidebarCollapsed} setupStatus={setupStatus} />

      {/* Main Content Area */}
      <div className={`admin-layout__main ${sidebarCollapsed ? 'admin-layout__main--sidebar-collapsed' : ''}`}>
        {/* Header */}
        <AdminHeader buildHook={buildHook} />

        {/* Content */}
        <main className="admin-layout__content">
          {children}
        </main>
      </div>

      {/* Galaxy Background */}
      <div className="admin-layout__background" />

      {/* Validation Modal (wird per Portal in document.body gerendert) */}
      <ValidationModal
        isOpen={buildHook.isValidationModalOpen}
        onClose={() => buildHook.setIsValidationModalOpen(false)}
        validationResults={buildHook.validationResults}
        buildReview={buildHook.buildReview}
        onRemoveEmptySections={buildHook.handleRemoveEmptySections}
        onBuildAnyway={buildHook.performBuild}
        onCancel={() => buildHook.setIsValidationModalOpen(false)}
      />
    </div>
  )
}
