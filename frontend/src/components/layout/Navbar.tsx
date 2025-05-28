import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-sm z-50 border-b border-purple-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold galaxy-text">
            My Galaxy
          </Link>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/#about" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                About
              </Link>
              <Link href="/#skills" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Skills
              </Link>
              <Link href="/#nixos" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                NixOS
              </Link>
              <Link href="/#homelab" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Homelab
              </Link>
              <Link href="/#angeln" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Angeln
              </Link>
              <Link href="/#projects" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Projects
              </Link>
              <Link href="/blog" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Blog
              </Link>
              <Link href="/#contact" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Contact
              </Link>
              <Link href="/login" className="text-white bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 