// frontend/src/app/admin/page.tsx
"use client";

// Removed: import { AdminDashboardView } from "@/presentation/public/pages/admin/page";

export default function AdminPageContent() { // Renamed
  // Replaced: return <AdminDashboardView />;
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Content for the admin dashboard page.</p>
      {/* The main admin functionality is likely driven by the AdminLayout and its specific child routes/components */}
    </div>
  );
}
