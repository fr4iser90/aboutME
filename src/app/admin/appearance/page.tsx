'use client'

import dynamic from 'next/dynamic'
import AdminPageLayout from '@/features/admin/components/AdminPageLayout'

// Lazy load AppearanceEditor for better performance
const AppearanceEditor = dynamic(
  () => import('@/features/admin/components/AppearanceEditor/AppearanceEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="appearance-editor__loading">
        Loading appearance editor...
      </div>
    )
  }
)

export default function AppearancePage() {
  return (
    <AdminPageLayout
      title="Appearance"
      subtitle="Configure design styles, theme colors, typography, effects, and layouts for your portfolio"
      centered={false}
      maxWidth="full"
    >
      <div className="appearance-editor__container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <AppearanceEditor />
      </div>
    </AdminPageLayout>
  )
}

