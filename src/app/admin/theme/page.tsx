'use client'

import dynamic from 'next/dynamic'
import AdminPageLayout from '@/features/admin/components/AdminPageLayout'

// Lazy load ThemeEditor for better performance
const ThemeEditor = dynamic(
  () => import('@/features/admin/components/ThemeEditor/ThemeEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="theme-editor__loading">
        Loading theme editor...
      </div>
    )
  }
)

export default function ThemePage() {
  return (
    <AdminPageLayout
      title="Design & Themes"
      subtitle="Configure design styles, theme colors, typography, and effects for your portfolio"
      centered={false}
      maxWidth="full"
    >
      <div className="theme-editor__container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <ThemeEditor />
      </div>
    </AdminPageLayout>
  )
}

