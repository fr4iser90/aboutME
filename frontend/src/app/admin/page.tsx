import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminDashboard() {
  // In the App Router, we use server components by default
  // Authentication check will be handled by middleware

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