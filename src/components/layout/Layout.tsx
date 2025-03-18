'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import { AuthProvider } from '@/contexts/AuthContext';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-black text-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}