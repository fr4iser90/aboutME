'use client';

import AdminPageContent from '@/presentation/admin/pages/page';
// import type { Metadata } from 'next';

// export const metadata: Metadata = {
//   title: 'Admin Home',
// };

export default function AdminPage() { // Removed children from props
  return <AdminPageContent />; // Removed children from being passed
}
