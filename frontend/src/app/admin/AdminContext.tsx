'use client';

import { createContext, useContext, Dispatch, SetStateAction } from 'react';

// Define the shape of the context data
// We'll use 'any' for project type for now, can be refined with DomainProject later
interface AdminContextType {
  selectedProject: any | null;
  setSelectedProject: (project: any | null) => void; // Changed type to a general function
  // We can add other shared states or functions here later if needed
}

// Create the context with a default value
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Custom hook to use the AdminContext
export function useAdminContext() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdminContext must be used within an AdminProvider');
  }
  return context;
}

export default AdminContext;
