'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Games() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-green-400">
        Choose Your Game
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Snake Game Card */}
        <div className="game-card flex flex-col">
          <div className="relative h-60 w-full">
            <Image
              src="/images/snake-game.jpg"
              alt="Snake Game"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <h2 className="text-2xl font-bold mb-2 text-green-400">Snake Game</h2>
            <p className="text-gray-300 mb-4 flex-grow">
              Control the snake to eat food and grow longer. Be careful not to hit the walls or your own tail!
            </p>
            <div className="mt-auto flex justify-between items-center">
              <span className="text-sm text-green-300">Your Best: {user.displayName ? '0' : 'N/A'}</span>
              <Link href="/games/snake" className="btn-neon">
                Play Now
              </Link>
            </div>
          </div>
        </div>
        
        {/* Pacman Game Card */}
        <div className="game-card flex flex-col">
          <div className="relative h-60 w-full">
            <Image
              src="/images/pacman-game.jpg"
              alt="Pacman Game"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <h2 className="text-2xl font-bold mb-2 text-green-400">Pacman</h2>
            <p className="text-gray-300 mb-4 flex-grow">
              Navigate through the maze, eat all the dots, and avoid ghosts. Power up to eat the ghosts!
            </p>
            <div className="mt-auto flex justify-between items-center">
              <span className="text-sm text-green-300">Your Best: {user.displayName ? '0' : 'N/A'}</span>
              <Link href="/games/pacman" className="btn-neon">
                Play Now
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <h3 className="text-2xl font-bold mb-4 text-green-400">Coming Soon</h3>
        <p className="text-gray-300 max-w-2xl mx-auto">
          We're working on adding more exciting games to our collection. Stay tuned for updates!
        </p>
      </div>
    </div>
  );
}