"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/presentation/public/components/layout/Navbar';
import { authApi } from '@/domain/shared/utils/api';
import './page.css';

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
      await authApi.login(email, password);

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
      <main className="login-page__main">
        <div className="login-form__container">
          <div>
            <h2 className="login-form__title text">
              Admin Login
            </h2>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            {/* Form inputs remain the same as your original */}
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" required disabled={isLoading} className="login-form__input" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required disabled={isLoading} className="login-form__input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && (<div className="login-form__error">{error}</div>)}
            <div>
              <button type="submit" disabled={isLoading} className="login-form__button">
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
