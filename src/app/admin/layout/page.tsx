'use client'

import dynamic from 'next/dynamic'
import AdminPageLayout from '@/features/admin/components/AdminPageLayout'

// Lazy load LayoutEditor for better performance
const LayoutEditor = dynamic(
  () => import('@/features/admin/components/LayoutEditor/LayoutEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="layout-editor__loading">
        Loading layout editor...
      </div>
    )
  }
)

export default function LayoutPage() {
  return (
    <AdminPageLayout
      title="Layout Editor"
      subtitle="Configure page layouts and blocks for your projects"
      centered={false}
      maxWidth="full"
    >
      <div className="layout-editor__container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <LayoutEditor />
      </div>
    </AdminPageLayout>
  )
}

