import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authApi } from '@/domain/shared/utils/api';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await authApi.validateAuth();
      setIsLoggedIn(isValid);
    };
    checkAuth();
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        background: 'var(--navbar-bg, rgba(15,23,42,0.8))',
        backdropFilter: 'blur(var(--navbar-blur, 8px))',
        zIndex: 50,
        borderBottom: '1px solid var(--navbar-border, #a78bfa33)',
        height: 'var(--navbar-height, 4rem)'
      }}
    >
      <div
        style={{
          maxWidth: 'var(--navbar-container-max-width, 80rem)',
          margin: '0 auto',
          paddingLeft: 'var(--navbar-container-padding-x, 1rem)',
          paddingRight: 'var(--navbar-container-padding-x, 1rem)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          <Link href="/" className="navbar-brand">
            About
          </Link>
          <div style={{ display: 'flex' }}>
            <div style={{ marginLeft: '2.5rem', display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
              <Link href="/#about" className="navbar-link">About</Link>
              <Link href="/#skills" className="navbar-link">Skills</Link>
              <Link href="/#nixos" className="navbar-link">NixOS</Link>
              <Link href="/#homelab" className="navbar-link">Homelab</Link>
              <Link href="/#angeln" className="navbar-link">Angeln</Link>
              <Link href="/#projects" className="navbar-link">Projects</Link>
              <Link href="/blog" className="navbar-link">Blog</Link>
              <Link href="/#contact" className="navbar-link">Contact</Link>
              {isLoggedIn && (
                <Link href="/admin" className="navbar-link navbar-link-admin">Admin</Link>
              )}
              <Link href="/login" className="navbar-link navbar-link-login">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
