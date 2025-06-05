'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { projectApi } from '@/domain/shared/utils/api';

export function GitHubSyncButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('fr4iser90');
  const router = useRouter();

  const handleSync = async () => {
    setIsLoading(true);
    try {
      let username = input.trim();
      if (username.startsWith('https://github.com/')) {
        username = username.replace('https://github.com/', '').replace(/\/$/, '');
      }
      
      await projectApi.request(`/api/admin/projects/github/sync?username=${encodeURIComponent(username)}`, {
        method: 'POST',
      });
      
      router.refresh();
    } catch (error) {
      console.error('Error syncing projects:', error);
      alert(error instanceof Error ? error.message : 'Failed to sync projects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="GitHub Username oder URL"
        className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 card"
        style={{ minWidth: 180 }}
      />
      <button
        onClick={handleSync}
        disabled={isLoading || !input.trim()}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md card text hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
      >
        <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Syncing...' : 'Sync GitHub Projects'}
      </button>
    </div>
  );
}
