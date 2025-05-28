'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export function GitHubSyncButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/projects/github/sync', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync projects');
      }

      // Refresh the page to show updated projects
      router.refresh();
    } catch (error) {
      console.error('Error syncing projects:', error);
      alert('Failed to sync projects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={isLoading}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Syncing...' : 'Sync GitHub Projects'}
    </button>
  );
} 