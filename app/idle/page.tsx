"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Cake {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

interface PacMan {
  x: number;
  y: number;
  size: number;
  speed: number;
  direction: number; // angle in radians
}

export default function IdlePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [pacman, setPacman] = useState<PacMan>({
    x: 400,
    y: 300,
    size: 25,
    speed: 2,
    direction: 0
  });
  const [score, setScore] = useState(0);

  const cakeEmojis = ['🍰', '🎂', '🧁', '🍩', '🥧', '🍪'];

  // Generate random cake
  const generateCake = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newCake: Cake = {
      id: Date.now() + Math.random(),
      x: Math.random() * (canvas.width - 40) + 20,
      y: Math.random() * (canvas.height - 40) + 20,
      emoji: cakeEmojis[Math.floor(Math.random() * cakeEmojis.length)]
    };

    setCakes(prev => [...prev, newCake]);
  }, []);

  // Find nearest cake to Pac-Man
  const findNearestCake = useCallback((pacmanPos: PacMan, cakeList: Cake[]) => {
    if (cakeList.length === 0) return null;

    let nearest = cakeList[0];
    let minDistance = Math.sqrt(
      Math.pow(pacmanPos.x - nearest.x, 2) + Math.pow(pacmanPos.y - nearest.y, 2)
    );

    for (let i = 1; i < cakeList.length; i++) {
      const distance = Math.sqrt(
        Math.pow(pacmanPos.x - cakeList[i].x, 2) + Math.pow(pacmanPos.y - cakeList[i].y, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = cakeList[i];
      }
    }

    return nearest;
  }, []);

  // Check collision between Pac-Man and cake
  const checkCollision = useCallback((pacmanPos: PacMan, cake: Cake) => {
    const distance = Math.sqrt(
      Math.pow(pacmanPos.x - cake.x, 2) + Math.pow(pacmanPos.y - cake.y, 2)
    );
    return distance < pacmanPos.size + 15; // 15 is roughly cake size
  }, []);

  // Draw Pac-Man
  const drawPacMan = useCallback((ctx: CanvasRenderingContext2D, pacmanPos: PacMan) => {
    ctx.save();
    ctx.translate(pacmanPos.x, pacmanPos.y);
    ctx.rotate(pacmanPos.direction);
    
    // Pac-Man body
    ctx.fillStyle = '#F9A03F'; // Golden Orange
    ctx.beginPath();
    ctx.arc(0, 0, pacmanPos.size, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.lineTo(0, 0);
    ctx.fill();
    
    // Eye
    ctx.fillStyle = '#4B2E2E'; // Chocolate Brown
    ctx.beginPath();
    ctx.arc(8, -8, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();
  }, []);

  // Draw cake
  const drawCake = useCallback((ctx: CanvasRenderingContext2D, cake: Cake) => {
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(cake.emoji, cake.x, cake.y);
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = '#FFF8F0'; // Cream White background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setCakes(currentCakes => {
      setPacman(currentPacman => {
        // Find nearest cake and move towards it
        const nearest = findNearestCake(currentPacman, currentCakes);
        let newPacman = { ...currentPacman };

        if (nearest) {
          const dx = nearest.x - currentPacman.x;
          const dy = nearest.y - currentPacman.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 0) {
            newPacman.direction = Math.atan2(dy, dx);
            newPacman.x += (dx / distance) * currentPacman.speed;
            newPacman.y += (dy / distance) * currentPacman.speed;
          }
        }

        // Keep Pac-Man within bounds
        newPacman.x = Math.max(currentPacman.size, Math.min(canvas.width - currentPacman.size, newPacman.x));
        newPacman.y = Math.max(currentPacman.size, Math.min(canvas.height - currentPacman.size, newPacman.y));

        // Check collisions and remove eaten cakes
        const remainingCakes = currentCakes.filter(cake => {
          const collision = checkCollision(newPacman, cake);
          if (collision) {
            setScore(prev => prev + 10);
          }
          return !collision;
        });

        // Draw remaining cakes
        remainingCakes.forEach(cake => drawCake(ctx, cake));

        // Draw Pac-Man
        drawPacMan(ctx, newPacman);

        return newPacman;
      });

      return currentCakes.filter(cake => {
        const collision = checkCollision(pacman, cake);
        return !collision;
      });
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [findNearestCake, checkCollision, drawPacMan, drawCake, pacman]);

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 600;

    // Generate initial cakes
    for (let i = 0; i < 5; i++) {
      setTimeout(() => generateCake(), i * 1000);
    }

    // Start animation
    animate();

    // Generate new cakes periodically
    const cakeInterval = setInterval(generateCake, 3000);

    return () => {
      clearInterval(cakeInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [generateCake, animate]);

  const handleScreenTouch = () => {
    // Navigate to main menu when touched
    window.location.href = '/menu';
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden cursor-pointer"
      style={{ backgroundColor: '#FFF8F0' }}
      onClick={handleScreenTouch}
    >
      {/* Header */}
      <div className="absolute top-8 text-center z-10">
        <h1 
          className="text-6xl font-bold mb-4"
          style={{ color: '#F9A03F' }}
        >
          🍰 Golden Munch 🍰
        </h1>
        <p 
          className="text-2xl font-medium"
          style={{ color: '#4B2E2E' }}
        >
          Touch anywhere to start ordering!
        </p>
      </div>

      {/* Score */}
      <div 
        className="absolute top-8 right-8 text-2xl font-bold px-6 py-3 rounded-full z-10"
        style={{ 
          backgroundColor: '#D97706', 
          color: '#FFF8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        Score: {score}
      </div>

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="border-4 rounded-2xl shadow-2xl"
        style={{ 
          borderColor: '#D97706',
          backgroundColor: '#FFF8F0'
        }}
      />

      {/* Instructions */}
      <div className="absolute bottom-8 text-center z-10">
        <p 
          className="text-xl font-medium mb-2"
          style={{ color: '#4B2E2E' }}
        >
          Watch Pac-Man collect delicious treats!
        </p>
        <div className="flex justify-center space-x-4 text-3xl">
          {cakeEmojis.map((emoji, index) => (
            <span key={index} className="animate-bounce" style={{ animationDelay: `${index * 0.2}s` }}>
              {emoji}
            </span>
          ))}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 text-4xl animate-pulse">🎂</div>
      <div className="absolute top-40 right-20 text-4xl animate-pulse" style={{ animationDelay: '1s' }}>🧁</div>
      <div className="absolute bottom-20 left-20 text-4xl animate-pulse" style={{ animationDelay: '2s' }}>🍩</div>
      <div className="absolute bottom-40 right-10 text-4xl animate-pulse" style={{ animationDelay: '0.5s' }}>🥧</div>
    </div>
  );
}