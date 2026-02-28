'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

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

          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-white/30"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
                    {(user.email?.[0] || 'U').toUpperCase()}
                  </div>
                )}
                <span className="text-white/80 text-sm hidden sm:block max-w-[150px] truncate">
                  {user.displayName || user.email}
                </span>
              </div>
              <button
                onClick={signOut}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/15 hover:text-white transition-all"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
