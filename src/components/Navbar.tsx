'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Code, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  if (pathname === '/auth') return null;

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <Code className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">CodeProgress</span>
            </Link>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/calendar"
                  className="text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <Calendar className="h-5 w-5 mr-1" />
                  Calendar
                </Link>
                <div className="relative group">
                  <button className="flex items-center text-gray-600 hover:text-gray-900">
                    <User className="h-5 w-5 mr-1" />
                    {user.email}
                  </button>
                  <div className="absolute right-0 mt-0 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                    <button
                      onClick={() => signOut()}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/auth"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 