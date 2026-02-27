'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-white font-bold text-xl tracking-tight">
              Mock Server
            </Link>
            <nav className="flex gap-1">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/')
                    ? 'bg-white/25 text-white shadow-inner'
                    : 'text-white/80 hover:bg-white/15 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/mocks/new"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive('/mocks/new')
                    ? 'bg-white/25 text-white shadow-inner'
                    : 'text-white/80 hover:bg-white/15 hover:text-white'
                }`}
              >
                + New Mock
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
