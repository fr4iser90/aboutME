'use client';

import AdminLayoutContent from '@/presentation/admin/pages/layout';
// import type { Metadata } from 'next'; // Only if specific metadata is needed here

// export const metadata: Metadata = {
//   title: 'Admin Section',
// };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
