'use client';

import AdminSkillsPageContent from '@/presentation/admin/pages/skills/page'; // This will be the AdminSkillsPage function
// import type { Metadata } from 'next';

// export const metadata: Metadata = {
//   title: 'Admin - Skills',
// };

export default function AdminSkillsPageWrapper() { // Renaming wrapper to avoid conflict if needed
  return <AdminSkillsPageContent />;
}
