import AdminLayout from '@/features/admin/components/AdminLayout/AdminLayout'
import '@/features/admin/styles/admin.css'
import '@/features/upload/styles/upload.css'
// Import globals.css to get all design and theme CSS files for previews
import '../globals.css'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>
}

