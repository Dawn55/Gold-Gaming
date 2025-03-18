'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { saveScore } from '@/lib/firestore';

// Define types
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

export default function SnakeGame() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  // Game state refs
  const snakeRef = useRef<Position[]>([]);
  const foodRef = useRef<Position>({ x: 0, y: 0 });
  const directionRef = useRef<Direction>('RIGHT');
  const speedRef = useRef(100); // milliseconds between moves
  const gridSizeRef = useRef(20); // pixel size of grid cells
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);
  
  // Initialize game
  const initGame = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get canvas dimensions
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate grid dimensions
    const gridWidth = Math.floor(canvasWidth / gridSizeRef.current);
    const gridHeight = Math.floor(canvasHeight / gridSizeRef.current);
    
    // Initialize snake in the middle of the canvas
    const startX = Math.floor(gridWidth / 2);
    const startY = Math.floor(gridHeight / 2);
    
    snakeRef.current = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ];
    
    // Place food at random position
    placeFood();
    
    // Reset direction and score
    directionRef.current = 'RIGHT';
    setScore(0);
    setGameOver(false);
  };
  
  // Place food at random position
  const placeFood = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const gridWidth = Math.floor(canvas.width / gridSizeRef.current);
    const gridHeight = Math.floor(canvas.height / gridSizeRef.current);
    
    // Random position for food
    const x = Math.floor(Math.random() * gridWidth);
    const y = Math.floor(Math.random() * gridHeight);
    
    // Check if food is on snake
    const onSnake = snakeRef.current.some(segment => segment.x === x && segment.y === y);
    
    if (onSnake) {
      // Try again
      placeFood();
    } else {
      foodRef.current = { x, y };
    }
  };
  
  // Draw game
  const drawGame = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw snake
    snakeRef.current.forEach((segment, index) => {
      const brightness = index === 0 ? '500' : (index < 5 ? '400' : '300');
      ctx.fillStyle = index === 0 ? '#00ff41' : `#00d438`; // Head is brightest green
      
      ctx.fillRect(
        segment.x * gridSizeRef.current,
        segment.y * gridSizeRef.current,
        gridSizeRef.current,
        gridSizeRef.current
      );
      
      // Add neon glow effect to head
      if (index === 0) {
        ctx.shadowColor = '#00ff41';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = '#00ff41';
        ctx.lineWidth = 1;
        ctx.strokeRect(
          segment.x * gridSizeRef.current,
          segment.y * gridSizeRef.current,
          gridSizeRef.current,
          gridSizeRef.current
        );
        ctx.shadowBlur = 0;
      }
    });
    
    // Draw food with neon effect
    ctx.fillStyle = '#ff3000';
    ctx.shadowColor = '#ff3000';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    const centerX = foodRef.current.x * gridSizeRef.current + gridSizeRef.current / 2;
    const centerY = foodRef.current.y * gridSizeRef.current + gridSizeRef.current / 2;
    const radius = gridSizeRef.current / 2;
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };
  
  // Update game state
  const updateGame = () => {
    // Create a copy of the snake head
    const head = { ...snakeRef.current[0] };
    
    // Move head in the current direction
    switch (directionRef.current) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }
    
    // Check for collisions
    if (checkCollision(head)) {
      endGame();
      return;
    }
    
    // Add new head to the snake
    snakeRef.current.unshift(head);
    
    // Check if snake ate food
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      // Increase score
      const newScore = score + 1;
      setScore(newScore);
      
      // Place new food
      placeFood();
      
      // Speed up the game slightly
      if (newScore % 5 === 0) {
        speedRef.current = Math.max(50, speedRef.current - 5);
      }
    } else {
      // Remove tail if snake didn't eat food
      snakeRef.current.pop();
    }
  };
  
  // Check for collisions
  const checkCollision = (head: Position) => {
    if (!canvasRef.current) return true;
    
    const canvas = canvasRef.current;
    const gridWidth = Math.floor(canvas.width / gridSizeRef.current);
    const gridHeight = Math.floor(canvas.height / gridSizeRef.current);
    
    // Check wall collision
    if (
      head.x < 0 ||
      head.x >= gridWidth ||
      head.y < 0 ||
      head.y >= gridHeight
    ) {
      return true;
    }
    
    // Check self collision (skip the last segment as it will move)
    for (let i = 0; i < snakeRef.current.length - 1; i++) {
      if (head.x === snakeRef.current[i].x && head.y === snakeRef.current[i].y) {
        return true;
      }
    }
    
    return false;
  };
  
  // Game loop
  const gameLoop = () => {
    if (gameActive && !gameOver) {
      updateGame();
      drawGame();
      
      // Schedule next update
      gameLoopRef.current = setTimeout(gameLoop, speedRef.current);
    }
  };
  
  // Start game
  const startGame = () => {
    if (gameActive) return;
    
    initGame();
    setGameActive(true);
    setGameOver(false);
    
    // Start game loop
    gameLoopRef.current = setTimeout(gameLoop, speedRef.current);
  };
  
  // End game
  const endGame = async () => {
    setGameActive(false);
    setGameOver(true);
    
    // Clear game loop
    if (gameLoopRef.current) {
      clearTimeout(gameLoopRef.current);
    }
    
    // Update high score
    if (score > highScore) {
      setHighScore(score);
    }
    
    // Save score to Firebase if user is logged in
    if (user && score > 0) {
      try {
        await saveScore({
          userId: user.uid,
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL,
          gameType: 'snake',
          score
        });
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
  };
  
  // Handle key presses
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameActive) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== 'DOWN') {
            directionRef.current = 'UP';
          }
          break;
        case 'ArrowDown':
          if (directionRef.current !== 'UP') {
            directionRef.current = 'DOWN';
          }
          break;
        case 'ArrowLeft':
          if (directionRef.current !== 'RIGHT') {
            directionRef.current = 'LEFT';
          }
          break;
        case 'ArrowRight':
          if (directionRef.current !== 'LEFT') {
            directionRef.current = 'RIGHT';
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameActive]);
  
  // Clean up game loop on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
    };
  }, []);
  
  // Set up canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = 600;
    canvas.height = 400;
    
    // Draw initial state
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw border
    ctx.strokeStyle = '#00ff41';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }, []);
  
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
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-4 text-green-400">Snake Game</h1>
      
      <div className="mb-6 flex justify-between items-center">
        <div className="text-xl">
          <span className="text-gray-300">Score:</span> 
          <span className="text-green-400 font-bold ml-2">{score}</span>
        </div>
        
        <div className="text-xl">
          <span className="text-gray-300">High Score:</span>
          <span className="text-green-400 font-bold ml-2">{highScore}</span>
        </div>
      </div>
      
      <div className="relative mb-6">
        <canvas
          ref={canvasRef}
          className="border-2 border-green-500 shadow-lg shadow-green-500/20 mx-auto"
        />
        
        {!gameActive && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <button
              onClick={startGame}
              className="btn-neon text-xl px-8 py-3"
            >
              Start Game
            </button>
          </div>
        )}
        
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Game Over!</h2>
            <p className="text-xl text-green-400 mb-6">Final Score: {score}</p>
            <button
              onClick={startGame}
              className="btn-neon text-xl px-8 py-3"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-black border border-green-500 p-4 rounded-lg shadow-lg shadow-green-500/20">
        <h3 className="text-xl font-bold mb-2 text-green-400">How to Play</h3>
        <ul className="text-left list-disc list-inside text-gray-300">
          <li>Use arrow keys to control the snake</li>
          <li>Eat the red food to grow longer</li>
          <li>Avoid hitting walls and your own tail</li>
          <li>Each food eaten is worth 1 point</li>
        </ul>
      </div>
    </div>
  );
}