'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserBestScores } from '@/lib/firestore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [userScores, setUserScores] = useState<{ snake: any; pacman: any }>({
    snake: null,
    pacman: null,
  });
  const [isLoadingScores, setIsLoadingScores] = useState(true);

  // Redirect to home if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  // Fetch user scores when logged in
  useEffect(() => {
    const fetchUserScores = async () => {
      if (user) {
        try {
          setIsLoadingScores(true);
          const scores = await getUserBestScores(user.uid);
          setUserScores(scores);
        } catch (error) {
          console.error('Error fetching user scores:', error);
        } finally {
          setIsLoadingScores(false);
        }
      }
    };

    if (user) {
      fetchUserScores();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-black border-2 border-green-500 rounded-lg shadow-lg shadow-green-500/20 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt="Profile"
                width={120}
                height={120}
                className="rounded-full border-4 border-green-500 shadow-lg shadow-green-500/30"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-green-600 flex items-center justify-center text-4xl font-bold text-white">
                {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-grow text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-green-400">
              {user.displayName || 'Gamer'}
            </h1>
            <p className="text-gray-400 mb-4">{user.email}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button 
                onClick={() => router.push('/games')} 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
              >
                Play Games
              </button>
              <button 
                onClick={() => signOut()} 
                className="bg-black border border-red-600 text-red-500 hover:bg-red-900/20 px-4 py-2 rounded transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-green-400">Your Best Scores</h2>

      {isLoadingScores ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black border-2 border-green-500 rounded-lg shadow-lg shadow-green-500/20 overflow-hidden">
            <div className="p-4 border-b border-green-500 flex justify-between items-center">
              <h3 className="text-xl font-bold text-green-400">Snake Game</h3>
              <Link href="/games/snake" className="text-green-400 hover:text-green-300 text-sm">
                Play Now →
              </Link>
            </div>
            <div className="p-6">
              {userScores.snake ? (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 mb-1">Best Score</p>
                    <p className="text-3xl font-bold text-green-400">{userScores.snake.score}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Date</p>
                    <p className="text-white">
                      {userScores.snake.timestamp instanceof Date
                        ? userScores.snake.timestamp.toLocaleDateString()
                        : new Date(userScores.snake.timestamp.seconds * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">You haven't played Snake yet.</p>
              )}
            </div>
          </div>

          <div className="bg-black border-2 border-green-500 rounded-lg shadow-lg shadow-green-500/20 overflow-hidden">
            <div className="p-4 border-b border-green-500 flex justify-between items-center">
              <h3 className="text-xl font-bold text-green-400">Pacman</h3>
              <Link href="/games/pacman" className="text-green-400 hover:text-green-300 text-sm">
                Play Now →
              </Link>
            </div>
            <div className="p-6">
              {userScores.pacman ? (
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 mb-1">Best Score</p>
                    <p className="text-3xl font-bold text-green-400">{userScores.pacman.score}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Date</p>
                    <p className="text-white">
                      {userScores.pacman.timestamp instanceof Date
                        ? userScores.pacman.timestamp.toLocaleDateString()
                        : new Date(userScores.pacman.timestamp.seconds * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">You haven't played Pacman yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 bg-black border-2 border-green-500 rounded-lg shadow-lg shadow-green-500/20 p-6">
        <h3 className="text-xl font-bold mb-4 text-green-400">Game History</h3>
        <p className="text-gray-400">
          Detailed game history with statistics and achievements coming soon!
        </p>
      </div>
    </div>
  );
}