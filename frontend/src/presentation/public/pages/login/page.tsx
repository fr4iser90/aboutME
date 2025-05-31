"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/presentation/public/components/layout/Navbar';
import { apiRequest } from '@/domain/shared/utils/api'; // Corrected path

export function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setError('');
    setIsLoading(true);

    try {
      await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // After successful login API call (cookie should be set by backend),
      // redirect to the main page.
      router.replace('/'); 
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-900/30">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold galaxy-text">
              Admin Login
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Form inputs remain the same as your original */}
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" required disabled={isLoading} className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-700 bg-slate-900 text-white placeholder-slate-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm disabled:opacity-50" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required disabled={isLoading} className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-slate-700 bg-slate-900 text-white placeholder-slate-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm disabled:opacity-50" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && (<div className="text-red-500 text-sm text-center">{error}</div>)}
            <div>
              <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
