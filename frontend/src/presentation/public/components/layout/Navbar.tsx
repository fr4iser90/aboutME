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
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand">
            About
          </Link>
          <div className="navbar-links-outer">
            <div className="navbar-links">
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
