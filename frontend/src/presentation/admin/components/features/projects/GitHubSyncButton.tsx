'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { projectApi } from '@/domain/shared/utils/api';
import './GitHubSyncButton.css';

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
    <div className="github-sync">
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="GitHub Username oder URL"
        className="github-sync__input card"
        style={{ minWidth: 180 }}
      />
      <button
        onClick={handleSync}
        disabled={isLoading || !input.trim()}
        className="github-sync__button card text"
      >
        <ArrowPathIcon className={`github-sync__icon ${isLoading ? 'github-sync__icon--loading' : ''}`} />
        {isLoading ? 'Syncing...' : 'Sync GitHub Projects'}
      </button>
    </div>
  );
}
