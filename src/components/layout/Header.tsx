'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function Header() {
  const { user, signIn, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-black border-b border-green-500 shadow-lg shadow-green-500/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold text-green-500 tracking-wider">
            GOLD<span className="text-white">GAMING</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 items-center">
          <Link href="/" className="text-white hover:text-green-400 transition-colors">
            Home
          </Link>
          <Link href="/games" className="text-white hover:text-green-400 transition-colors">
            Games
          </Link>
          <Link href="/leaderboard" className="text-white hover:text-green-400 transition-colors">
            Leaderboard
          </Link>
          {user ? (
            <div className="flex items-center space-x-4">
              <Link href="/profile" className="flex items-center">
                {user.photoURL && (
                  <Image 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    width={32} 
                    height={32} 
                    className="rounded-full mr-2 border border-green-500"
                  />
                )}
                <span className="text-green-400">{user.displayName}</span>
              </Link>
              <button 
                onClick={() => signOut()} 
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={() => signIn()} 
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white transition-colors"
            >
              Sign In with Google
            </button>
          )}
        </nav>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-white" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            ) : (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-green-500/30">
          <div className="container mx-auto px-4 py-2 flex flex-col space-y-3">
            <Link 
              href="/" 
              className="text-white hover:text-green-400 py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/games" 
              className="text-white hover:text-green-400 py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Games
            </Link>
            <Link 
              href="/leaderboard" 
              className="text-white hover:text-green-400 py-2 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Leaderboard
            </Link>
            {user ? (
              <div className="flex flex-col space-y-2">
                <Link 
                  href="/profile" 
                  className="flex items-center py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {user.photoURL && (
                    <Image 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      width={32} 
                      height={32} 
                      className="rounded-full mr-2 border border-green-500"
                    />
                  )}
                  <span className="text-green-400">{user.displayName}</span>
                </Link>
                <button 
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }} 
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  signIn();
                  setMobileMenuOpen(false);
                }} 
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white transition-colors"
              >
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}