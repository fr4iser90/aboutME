'use client';

import { useRouter } from 'next/navigation';
import { ArrowRightOnRectangleIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

// Get API URL from environment variable or use default
const API_URL = process.env.BACKEND_URL || 'http://localhost:8090';

export const Header = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint
      // This endpoint should clear the HttpOnly authentication cookie
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Important to send cookies
      });
    } catch (error) {
      console.error('Logout failed:', error);
      // Still attempt to redirect even if logout API call fails
    } finally {
      // Remove any local token if it was used for supplementary purposes (optional)
      // localStorage.removeItem('token'); 
      
      // Redirect to the login page
      router.push('/login');
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">About Me Admin</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => {/* Toggle theme */}}
            >
              <SunIcon className="h-6 w-6" />
            </button>
            <button
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={handleLogout}
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
