'use client';

import { useState, useEffect } from 'react';
import { getLeaderboard, GameScore } from '@/lib/firestore';
import Image from 'next/image';

export default function LeaderboardPage() {
  const [selectedGame, setSelectedGame] = useState<'snake' | 'pacman'>('snake');
  const [leaderboard, setLeaderboard] = useState<(GameScore & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const scores = await getLeaderboard(selectedGame);
        setLeaderboard(scores);
        setError(null);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedGame]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-green-400">
        Leaderboard
      </h1>

      <div className="mb-8">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setSelectedGame('snake')}
            className={`px-6 py-3 rounded-md transition-all ${
              selectedGame === 'snake'
                ? 'bg-green-600 text-white border-2 border-green-500 shadow-lg shadow-green-500/30'
                : 'bg-black text-green-500 border-2 border-green-500'
            }`}
          >
            Snake Game
          </button>
          <button
            onClick={() => setSelectedGame('pacman')}
            className={`px-6 py-3 rounded-md transition-all ${
              selectedGame === 'pacman'
                ? 'bg-green-600 text-white border-2 border-green-500 shadow-lg shadow-green-500/30'
                : 'bg-black text-green-500 border-2 border-green-500'
            }`}
          >
            Pacman Game
          </button>
        </div>
      </div>

      <div className="bg-black border-2 border-green-500 rounded-lg shadow-lg shadow-green-500/20 overflow-hidden">
        <div className="p-6 border-b border-green-500">
          <h2 className="text-2xl font-bold text-green-400">
            {selectedGame === 'snake' ? 'Snake' : 'Pacman'} Top Players
          </h2>
          <p className="text-gray-400">
            The best players ranked by their highest scores.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : leaderboard.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No scores recorded yet. Be the first to play!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-green-900/30">
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-500/30">
                {leaderboard.map((entry, index) => (
                  <tr 
                    key={entry.id} 
                    className={index === 0 ? "bg-green-900/20" : index < 3 ? "bg-green-900/10" : ""}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`
                        flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                        ${index === 0 ? 'bg-yellow-500 text-black' : 
                          index === 1 ? 'bg-gray-300 text-black' : 
                          index === 2 ? 'bg-amber-700 text-white' : 
                          'bg-green-800 text-white'}
                      `}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {entry.photoURL ? (
                          <Image
                            src={entry.photoURL}
                            alt={entry.displayName}
                            width={32}
                            height={32}
                            className="rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-green-600 mr-3 flex items-center justify-center">
                            {entry.displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-white">{entry.displayName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-green-400 font-bold">{entry.score}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {entry.timestamp instanceof Date
                        ? entry.timestamp.toLocaleDateString()
                        : new Date(entry.timestamp.seconds * 1000).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}