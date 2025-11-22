'use client'

import dynamic from 'next/dynamic'
import AdminPageLayout from '@/features/admin/components/AdminPageLayout'

// Lazy load EditorComponent for better performance
const EditorComponent = dynamic(
  () => import('@/features/editor/components/EditorComponent'),
  { 
    ssr: false,
    loading: () => (
      <div className="content-page__loading">
        Loading editor...
      </div>
    )
  }
)

export default function ContentPage() {
  return (
    <AdminPageLayout
      title="Content Editor"
      subtitle="Edit your portfolio content (projects, blog posts, about page)"
      centered={false}
      maxWidth="full"
    >
      {/* Editor Component */}
      <div className="content-page__editor">
        <EditorComponent />
      </div>
    </AdminPageLayout>
  )
}
