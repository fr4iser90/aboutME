'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Auth Feature Check entfernt - Login ist IMMER für Setup verfügbar

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful, redirecting to:', data.redirect || '/admin/content');
        console.log('Full response data:', data);
        // Force redirect
        setTimeout(() => {
          window.location.href = data.redirect || '/admin/content';
        }, 100);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" data-login="true">
      <div className="login-card max-w-md w-full mx-auto">
        <div className="login-card__content">
          <div className="login-card__header">
            <div className="login-card__icon">🔐</div>
            <h1 className="login-card__title neon-text">
              Admin Login
            </h1>
            <p className="login-card__subtitle">
              Enter admin password to access editor
            </p>
          </div>
          
          <form className="login-card__form" onSubmit={handleLogin}>
            <div className="login-card__field">
              <label htmlFor="password" className="login-card__label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="login-card__input"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="login-card__error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="login-card__submit"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="login-card__footer">
            <a
              href="/"
              className="login-card__back-link"
            >
              ← Back to Portfolio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}