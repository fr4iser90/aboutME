'use client'

import AdminPageLayout from '@/features/admin/components/AdminPageLayout'
import MediaLibrary from '@/features/upload/components/MediaLibrary'

export default function MediaPage() {
  return (
    <AdminPageLayout
      title="Media Library"
      subtitle="Upload and manage your portfolio files (images, videos, documents)"
      centered={false}
      maxWidth="full"
    >
      <MediaLibrary />
    </AdminPageLayout>
  )
}
