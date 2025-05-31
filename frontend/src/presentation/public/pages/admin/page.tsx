'use client';

import { AdminLayout } from '@/presentation/public/components/admin/AdminLayout';

export function AdminDashboardView() {
  // The authentication check and redirection are now handled by frontend/src/middleware.ts
  // No need for the useEffect hook here anymore.

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dashboard content will go here */}
        </div>
      </div>
    </AdminLayout>
  );
}
