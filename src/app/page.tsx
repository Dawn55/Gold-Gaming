'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Matrix rain effect
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Character set for the Matrix effect
    const chars = "01ゴールドゲーミングサイバーパンク0123456789";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    
    // Array to store the y position for each column
    const drops: number[] = [];
    
    // Initialize all columns with random y positions
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }
    
    function draw() {
      // Set semi-transparent black to create the fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = "#0f0"; // Green color
      ctx.font = `${fontSize}px monospace`;
      
      // Loop through each drop
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // Draw the character
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Move drops down
        drops[i]++;
        
        // Reset when off the screen with random offset
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
      }
    }
    
    const interval = setInterval(draw, 33);
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-full h-full z-0 opacity-30"
      />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-neon tracking-wider">
          GOLD GAMING
        </h1>
        
        <p className="text-xl md:text-2xl mb-10 max-w-2xl">
          Experience next-level gaming with our collection of classic arcade games.
          Compete for the highest scores and climb the leaderboards!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          {!user ? (
            <button 
              onClick={() => document.getElementById('login-button')?.click()}
              className="btn-neon text-lg"
            >
              Sign In to Play
            </button>
          ) : (
            <Link href="/games" className="btn-neon text-lg">
              Play Now
            </Link>
          )}
          
          <Link href="/leaderboard" className="btn-neon bg-black border border-green-500 text-green-500 text-lg">
            View Leaderboards
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <div className="game-card p-6">
            <h2 className="text-2xl font-bold mb-3 text-green-400">Snake Game</h2>
            <p className="mb-4">Navigate the snake to collect food while avoiding walls and your own tail.</p>
            <Link href="/games/snake" className="text-green-500 hover:text-green-400 inline-flex items-center">
              Play Snake
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="game-card p-6">
            <h2 className="text-2xl font-bold mb-3 text-green-400">Pacman</h2>
            <p className="mb-4">Navigate through the maze, eat all the dots, and avoid ghosts or eat them when powered up!</p>
            <Link href="/games/pacman" className="text-green-500 hover:text-green-400 inline-flex items-center">
              Play Pacman
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}