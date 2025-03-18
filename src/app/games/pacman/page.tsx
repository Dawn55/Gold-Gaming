'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { saveScore } from '@/lib/firestore';

// Game constants
const CELL_SIZE = 20;
const GRID_WIDTH = 28;
const GRID_HEIGHT = 31;
const GAME_SPEED = 150; // ms per frame

// Types
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };
type Ghost = {
  position: Position;
  direction: Direction;
  color: string;
  scared: boolean;
};

export default function PacmanGame() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  // Refs for game elements
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mazeRef = useRef<string[]>([]);
  const pacmanRef = useRef<Position>({ x: 14, y: 23 });
  const pacmanDirectionRef = useRef<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction | null>(null);
  const ghostsRef = useRef<Ghost[]>([]);
  const dotsRemainingRef = useRef(0);
  const powerModeRef = useRef(false);
  const powerModeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const animationCounterRef = useRef(0);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  // Initialize game
  const initGame = () => {
    // Create maze
    mazeRef.current = [
      "1111111111111111111111111111",
      "1222222222222112222222222221",
      "1211112111112112111112111121",
      "1311112111112112111112111131",
      "1211112111112112111112111121",
      "1222222222222222222222222221",
      "1211112112111111112112111121",
      "1211112112111111112112111121",
      "1222222112222112222112222221",
      "1111112111110110111112111111",
      "1111112111110110111112111111",
      "1111112110000000000112111111",
      "1111112110111001110112111111",
      "1111112110100000010112111111",
      "0000002000100000010002000000",
      "1111112110100000010112111111",
      "1111112110111111110112111111",
      "1111112110000000000112111111",
      "1111112110111111110112111111",
      "1111112110111111110112111111",
      "1222222222222112222222222221",
      "1211112111112112111112111121",
      "1211112111112112111112111121",
      "1322112222222002222222112231",
      "1112112112111111112112112111",
      "1112112112111111112112112111",
      "1222222112222112222112222221",
      "1211111111112112111111111121",
      "1211111111112112111111111121",
      "1222222222222222222222222221",
      "1111111111111111111111111111"
    ];

    // Count total dots
    let dotCount = 0;
    mazeRef.current.forEach(row => {
      for (let i = 0; i < row.length; i++) {
        if (row[i] === '2' || row[i] === '3') {
          dotCount++;
        }
      }
    });
    dotsRemainingRef.current = dotCount;

    // Reset Pacman
    pacmanRef.current = { x: 14, y: 23 };
    pacmanDirectionRef.current = 'RIGHT';
    nextDirectionRef.current = null;

    // Reset ghosts
    ghostsRef.current = [
      { position: { x: 13, y: 14 }, direction: 'LEFT', color: '#FF0000', scared: false }, // Red
      { position: { x: 14, y: 14 }, direction: 'LEFT', color: '#00FFDE', scared: false }, // Cyan
      { position: { x: 13, y: 15 }, direction: 'UP', color: '#FFB8DE', scared: false },   // Pink
      { position: { x: 14, y: 15 }, direction: 'UP', color: '#FFB847', scared: false }    // Orange
    ];

    // Reset game state
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameWon(false);
    powerModeRef.current = false;
    
    if (powerModeTimerRef.current) {
      clearTimeout(powerModeTimerRef.current);
      powerModeTimerRef.current = null;
    }
  };

  // Start game
  const startGame = () => {
    if (gameActive) return;
    
    initGame();
    setGameActive(true);
    
    // Start game loop
    gameLoopRef.current = setInterval(() => {
      updateGame();
      drawGame();
    }, GAME_SPEED);
  };

  // Update game state
  const updateGame = () => {
    if (!gameActive || gameOver || gameWon) return;
    
    animationCounterRef.current += 1;
    movePacman();
    moveGhosts();
  };

  // Move pacman
  const movePacman = () => {
    const { x, y } = pacmanRef.current;
    
    // Try to change direction if there's a queued direction
    if (nextDirectionRef.current) {
      let canChangeDirection = false;
      
      switch (nextDirectionRef.current) {
        case 'UP':
          canChangeDirection = !isWall(x, y - 1);
          break;
        case 'DOWN':
          canChangeDirection = !isWall(x, y + 1);
          break;
        case 'LEFT':
          canChangeDirection = !isWall(x - 1, y);
          break;
        case 'RIGHT':
          canChangeDirection = !isWall(x + 1, y);
          break;
      }
      
      if (canChangeDirection) {
        pacmanDirectionRef.current = nextDirectionRef.current;
        nextDirectionRef.current = null;
      }
    }
    
    // Move pacman in the current direction
    let newX = x;
    let newY = y;
    
    switch (pacmanDirectionRef.current) {
      case 'UP':
        newY -= 1;
        break;
      case 'DOWN':
        newY += 1;
        break;
      case 'LEFT':
        newX -= 1;
        break;
      case 'RIGHT':
        newX += 1;
        break;
    }
    
    // Check if pacman can move in the current direction
    if (!isWall(newX, newY)) {
      // Handle tunnel wrapping
      if (newY === 14) {
        if (newX < 0) {
          newX = GRID_WIDTH - 1;
        } else if (newX >= GRID_WIDTH) {
          newX = 0;
        }
      }
      
      pacmanRef.current = { x: newX, y: newY };
      checkDotCollection();
      checkGhostCollision();
    }
  };

  // Move ghosts
  const moveGhosts = () => {
    ghostsRef.current = ghostsRef.current.map(ghost => {
      const { position: { x, y }, direction, scared } = ghost;
      
      // Determine possible directions to move (exclude walls and reverse direction)
      const possibleDirections: Direction[] = [];
      const oppositeDirection: Direction = 
        direction === 'UP' ? 'DOWN' :
        direction === 'DOWN' ? 'UP' :
        direction === 'LEFT' ? 'RIGHT' : 'LEFT';
      
      // Check each direction
      if (!isWall(x, y - 1) && 'UP' !== oppositeDirection) {
        possibleDirections.push('UP');
      }
      
      if (!isWall(x, y + 1) && 'DOWN' !== oppositeDirection) {
        possibleDirections.push('DOWN');
      }
      
      if (!isWall(x - 1, y) && 'LEFT' !== oppositeDirection) {
        possibleDirections.push('LEFT');
      }
      
      if (!isWall(x + 1, y) && 'RIGHT' !== oppositeDirection) {
        possibleDirections.push('RIGHT');
      }
      
      // If at dead end, allow reversal
      if (possibleDirections.length === 0) {
        possibleDirections.push(oppositeDirection);
      }
      
      // Choose direction based on ghost state
      let newDirection: Direction;
      
      if (scared) {
        // Scared ghosts move randomly
        const randomIndex = Math.floor(Math.random() * possibleDirections.length);
        newDirection = possibleDirections[randomIndex];
      } else {
        // Normal ghosts try to chase Pacman
        const pacman = pacmanRef.current;
        
        if (Math.random() < 0.75) {
          // 75% chance to chase Pacman
          // Calculate direction that gets closest to Pacman
          let bestDirection = direction;
          let minDistance = Infinity;
          
          possibleDirections.forEach(dir => {
            let newX = x;
            let newY = y;
            
            switch (dir) {
              case 'UP': newY--; break;
              case 'DOWN': newY++; break;
              case 'LEFT': newX--; break;
              case 'RIGHT': newX++; break;
            }
            
            // Calculate Manhattan distance to Pacman
            const distance = Math.abs(newX - pacman.x) + Math.abs(newY - pacman.y);
            
            if (distance < minDistance) {
              minDistance = distance;
              bestDirection = dir;
            }
          });
          
          newDirection = bestDirection;
        } else {
          // 25% chance to move randomly
          const randomIndex = Math.floor(Math.random() * possibleDirections.length);
          newDirection = possibleDirections[randomIndex];
        }
      }
      
      // Move ghost in the chosen direction
      let newX = x;
      let newY = y;
      
      switch (newDirection) {
        case 'UP': newY--; break;
        case 'DOWN': newY++; break;
        case 'LEFT': newX--; break;
        case 'RIGHT': newX++; break;
      }
      
      // Handle tunnel wrapping
      if (newY === 14) {
        if (newX < 0) {
          newX = GRID_WIDTH - 1;
        } else if (newX >= GRID_WIDTH) {
          newX = 0;
        }
      }
      
      return {
        ...ghost,
        position: { x: newX, y: newY },
        direction: newDirection
      };
    });
    
    // Check for ghost collision after all ghosts have moved
    checkGhostCollision();
  };

  // Check if Pacman is touching any ghosts
  const checkGhostCollision = () => {
    const { x, y } = pacmanRef.current;
    
    for (const ghost of ghostsRef.current) {
      const { position: { x: ghostX, y: ghostY }, scared } = ghost;
      
      if (x === ghostX && y === ghostY) {
        if (scared) {
          // Eat the ghost
          ghostRespawn(ghost);
          setScore(prevScore => prevScore + 200);
        } else {
          // Lose a life
          loseLife();
          break;
        }
      }
    }
  };

  // Respawn a ghost
  const ghostRespawn = (ghost: Ghost) => {
    // Reset ghost position to the center box
    const respawnPositions = [
      { x: 13, y: 14 },
      { x: 14, y: 14 },
      { x: 13, y: 15 },
      { x: 14, y: 15 }
    ];

    const randomIndex = Math.floor(Math.random() * respawnPositions.length);
    
    // Find the ghost in the array and update it
    ghostsRef.current = ghostsRef.current.map(g => {
      if (g === ghost) {
        return {
          ...g,
          position: respawnPositions[randomIndex],
          scared: false
        };
      }
      return g;
    });
  };

  // Lose a life
  const loseLife = () => {
    const newLives = lives - 1;
    setLives(newLives);

    if (newLives <= 0) {
      endGame(false);
    } else {
      // Reset positions but keep score and dots
      pacmanRef.current = { x: 14, y: 23 };
      pacmanDirectionRef.current = 'RIGHT';
      nextDirectionRef.current = null;

      // Reset ghost positions
      ghostsRef.current = [
        { position: { x: 13, y: 14 }, direction: 'LEFT', color: '#FF0000', scared: false },
        { position: { x: 14, y: 14 }, direction: 'LEFT', color: '#00FFDE', scared: false },
        { position: { x: 13, y: 15 }, direction: 'UP', color: '#FFB8DE', scared: false },
        { position: { x: 14, y: 15 }, direction: 'UP', color: '#FFB847', scared: false }
      ];

      // Clear power mode
      powerModeRef.current = false;
      if (powerModeTimerRef.current) {
        clearTimeout(powerModeTimerRef.current);
        powerModeTimerRef.current = null;
      }
    }
  };

  // Check if Pacman collected a dot
  const checkDotCollection = () => {
    const { x, y } = pacmanRef.current;
    
    if (y >= 0 && y < mazeRef.current.length && x >= 0 && x < mazeRef.current[y].length) {
      const cell = mazeRef.current[y][x];
      
      if (cell === '2') {
        // Regular dot
        const newMaze = [...mazeRef.current];
        newMaze[y] = newMaze[y].substring(0, x) + '0' + newMaze[y].substring(x + 1);
        mazeRef.current = newMaze;
        
        setScore(prevScore => prevScore + 10);
        dotsRemainingRef.current -= 1;
        
        if (dotsRemainingRef.current <= 0) {
          winGame();
        }
      } else if (cell === '3') {
        // Power pellet
        const newMaze = [...mazeRef.current];
        newMaze[y] = newMaze[y].substring(0, x) + '0' + newMaze[y].substring(x + 1);
        mazeRef.current = newMaze;
        
        setScore(prevScore => prevScore + 50);
        dotsRemainingRef.current -= 1;
        
        // Activate power mode
        activatePowerMode();
        
        if (dotsRemainingRef.current <= 0) {
          winGame();
        }
      }
    }
  };

  // Activate power mode
  const activatePowerMode = () => {
    powerModeRef.current = true;
    
    // Make ghosts scared
    ghostsRef.current = ghostsRef.current.map(ghost => ({
      ...ghost,
      scared: true
    }));
    
    // Clear existing power mode timer
    if (powerModeTimerRef.current) {
      clearTimeout(powerModeTimerRef.current);
    }
    
    // Set timer for power mode duration
    powerModeTimerRef.current = setTimeout(() => {
      powerModeRef.current = false;
      
      // Make ghosts normal again
      ghostsRef.current = ghostsRef.current.map(ghost => ({
        ...ghost,
        scared: false
      }));
    }, 8000); // 8 seconds of power mode
  };

  // Win game
  const winGame = () => {
    endGame(true);
  };

  // End game (either win or lose)
  const endGame = async (hasWon: boolean) => {
    // Stop game loop
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    // Clear power mode timer
    if (powerModeTimerRef.current) {
      clearTimeout(powerModeTimerRef.current);
      powerModeTimerRef.current = null;
    }
    
    // Update game state
    setGameActive(false);
    setGameOver(!hasWon);
    setGameWon(hasWon);
    
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
          gameType: 'pacman',
          score
        });
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
  };

  // Utility function to check if a position is a wall
  const isWall = (x: number, y: number) => {
    if (y < 0 || y >= mazeRef.current.length) return true;
    if (x < 0 || x >= mazeRef.current[y].length) return true;
    
    return mazeRef.current[y][x] === '1';
  };

  // Set up canvas and handle key events
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = GRID_WIDTH * CELL_SIZE;
    canvas.height = GRID_HEIGHT * CELL_SIZE;
    
    // Initialize the game
    initGame();
    
    // Draw initial state
    drawGame();
    
    // Handle key presses
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameActive) return;
      
      switch (e.key) {
        case 'ArrowUp':
          nextDirectionRef.current = 'UP';
          break;
        case 'ArrowDown':
          nextDirectionRef.current = 'DOWN';
          break;
        case 'ArrowLeft':
          nextDirectionRef.current = 'LEFT';
          break;
        case 'ArrowRight':
          nextDirectionRef.current = 'RIGHT';
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      
      if (powerModeTimerRef.current) {
        clearTimeout(powerModeTimerRef.current);
      }
    };
  }, []);

  // Draw game
  const drawGame = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw maze
    for (let y = 0; y < mazeRef.current.length; y++) {
      const row = mazeRef.current[y];
      for (let x = 0; x < row.length; x++) {
        const cell = row[x];
        
        if (cell === '1') {
          // Wall
          ctx.fillStyle = '#0431B4';
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          
          // Add neon effect
          ctx.strokeStyle = '#00ff41';
          ctx.lineWidth = 1;
          ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        } else if (cell === '2') {
          // Dot
          ctx.fillStyle = '#FFFF00';
          ctx.beginPath();
          ctx.arc(
            x * CELL_SIZE + CELL_SIZE / 2,
            y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 6,
            0,
            Math.PI * 2
          );
          ctx.fill();
        } else if (cell === '3') {
          // Power pellet
          ctx.fillStyle = '#FFFF00';
          ctx.beginPath();
          ctx.arc(
            x * CELL_SIZE + CELL_SIZE / 2,
            y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 3,
            0,
            Math.PI * 2
          );
          ctx.fill();
          
          // Add pulsing neon effect
          const pulseSize = Math.sin(animationCounterRef.current / 5) * 2 + 4;
          ctx.shadowColor = '#FFFF00';
          ctx.shadowBlur = pulseSize;
          ctx.strokeStyle = '#FFFF00';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }
    }
    
    // Draw Pacman
    const { x, y } = pacmanRef.current;
    const direction = pacmanDirectionRef.current;
    
    // Calculate mouth angle for animation
    const mouthAngle = (Math.sin(animationCounterRef.current / 4) * 0.2) + 0.05;
    
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    
    // Calculate start and end angles based on direction
    let startAngle = 0;
    let endAngle = 2 * Math.PI;
    
    switch (direction) {
      case 'RIGHT':
        startAngle = mouthAngle * Math.PI;
        endAngle = (2 - mouthAngle) * Math.PI;
        break;
      case 'LEFT':
        startAngle = (1 + mouthAngle) * Math.PI;
        endAngle = (1 - mouthAngle) * Math.PI;
        break;
      case 'UP':
        startAngle = (1.5 + mouthAngle) * Math.PI;
        endAngle = (1.5 - mouthAngle) * Math.PI;
        break;
      case 'DOWN':
        startAngle = (0.5 + mouthAngle) * Math.PI;
        endAngle = (0.5 - mouthAngle) * Math.PI;
        break;
    }
    
    ctx.arc(
      x * CELL_SIZE + CELL_SIZE / 2,
      y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2,
      startAngle,
      endAngle
    );
    
    ctx.lineTo(
      x * CELL_SIZE + CELL_SIZE / 2,
      y * CELL_SIZE + CELL_SIZE / 2
    );
    
    ctx.fill();
    
    // Draw ghosts
    ghostsRef.current.forEach(ghost => {
      const { position: { x, y }, color, scared } = ghost;
      
      ctx.fillStyle = scared ? '#0000FF' : color;
      
      // Draw ghost body
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE + CELL_SIZE / 6, y * CELL_SIZE + CELL_SIZE);
      
      // Wavy bottom
      ctx.lineTo(x * CELL_SIZE + CELL_SIZE / 6, y * CELL_SIZE + CELL_SIZE * 0.8);
      ctx.lineTo(x * CELL_SIZE + CELL_SIZE / 3, y * CELL_SIZE + CELL_SIZE * 0.9);
      ctx.lineTo(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE * 0.8);
      ctx.lineTo(x * CELL_SIZE + CELL_SIZE * 2 / 3, y * CELL_SIZE + CELL_SIZE * 0.9);
      ctx.lineTo(x * CELL_SIZE + CELL_SIZE * 5 / 6, y * CELL_SIZE + CELL_SIZE * 0.8);
      ctx.lineTo(x * CELL_SIZE + CELL_SIZE * 5 / 6, y * CELL_SIZE + CELL_SIZE);
      
      // Top part (semi-circle)
      ctx.arc(
        x * CELL_SIZE + CELL_SIZE / 2,
        y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2,
        Math.PI,
        0
      );
      
      ctx.fill();
      
      // Draw eyes
      if (scared) {
        // Scared eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(
          x * CELL_SIZE + CELL_SIZE / 3,
          y * CELL_SIZE + CELL_SIZE * 0.45,
          CELL_SIZE / 6,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(
          x * CELL_SIZE + CELL_SIZE * 2 / 3,
          y * CELL_SIZE + CELL_SIZE * 0.45,
          CELL_SIZE / 6,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // X eyes when scared
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        // Left eye X
        ctx.moveTo(x * CELL_SIZE + CELL_SIZE / 3 - CELL_SIZE / 10, y * CELL_SIZE + CELL_SIZE * 0.45 - CELL_SIZE / 10);
        ctx.lineTo(x * CELL_SIZE + CELL_SIZE / 3 + CELL_SIZE / 10, y * CELL_SIZE + CELL_SIZE * 0.45 + CELL_SIZE / 10);
        ctx.moveTo(x * CELL_SIZE + CELL_SIZE / 3 + CELL_SIZE / 10, y * CELL_SIZE + CELL_SIZE * 0.45 - CELL_SIZE / 10);
        ctx.lineTo(x * CELL_SIZE + CELL_SIZE / 3 - CELL_SIZE / 10, y * CELL_SIZE + CELL_SIZE * 0.45 + CELL_SIZE / 10);
        
        // Right eye X
        ctx.moveTo(x * CELL_SIZE + CELL_SIZE * 2 / 3 - CELL_SIZE / 10, y * CELL_SIZE + CELL_SIZE * 0.45 - CELL_SIZE / 10);
        ctx.lineTo(x * CELL_SIZE + CELL_SIZE * 2 / 3 + CELL_SIZE / 10, y * CELL_SIZE + CELL_SIZE * 0.45 + CELL_SIZE / 10);
        ctx.moveTo(x * CELL_SIZE + CELL_SIZE * 2 / 3 + CELL_SIZE / 10, y * CELL_SIZE + CELL_SIZE * 0.45 - CELL_SIZE / 10);
        ctx.lineTo(x * CELL_SIZE + CELL_SIZE * 2 / 3 - CELL_SIZE / 10, y * CELL_SIZE + CELL_SIZE * 0.45 + CELL_SIZE / 10);
        
        ctx.stroke();
      } else {
        // Normal eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(
          x * CELL_SIZE + CELL_SIZE / 3,
          y * CELL_SIZE + CELL_SIZE * 0.45,
          CELL_SIZE / 6,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(
          x * CELL_SIZE + CELL_SIZE * 2 / 3,
          y * CELL_SIZE + CELL_SIZE * 0.45,
          CELL_SIZE / 6,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // Pupils
        ctx.fillStyle = '#000000';
        let pupilOffsetX = 0;
        let pupilOffsetY = 0;
        
        switch (ghost.direction) {
          case 'LEFT':
            pupilOffsetX = -CELL_SIZE / 10;
            break;
          case 'RIGHT':
            pupilOffsetX = CELL_SIZE / 10;
            break;
          case 'UP':
            pupilOffsetY = -CELL_SIZE / 10;
            break;
          case 'DOWN':
            pupilOffsetY = CELL_SIZE / 10;
            break;
        }
        
        ctx.beginPath();
        ctx.arc(
          x * CELL_SIZE + CELL_SIZE / 3 + pupilOffsetX,
          y * CELL_SIZE + CELL_SIZE * 0.45 + pupilOffsetY,
          CELL_SIZE / 12,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(
          x * CELL_SIZE + CELL_SIZE * 2 / 3 + pupilOffsetX,
          y * CELL_SIZE + CELL_SIZE * 0.45 + pupilOffsetY,
          CELL_SIZE / 12,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });