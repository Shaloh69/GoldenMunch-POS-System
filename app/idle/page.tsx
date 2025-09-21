"use client"

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@heroui/button';

interface Cake {
  x: number;
  y: number;
  emoji: string;
  id: number;
  size: number;
}

interface PacMan {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  direction: number; // angle in radians
  mouthOpen: boolean;
  size: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export default function IdlePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastMouthToggle = useRef<number>(0);
  const lastCakeSpawn = useRef<number>(0);
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [pacman, setPacman] = useState<PacMan>({
    x: 100,
    y: 100,
    targetX: 100,
    targetY: 100,
    speed: 3,
    direction: 0,
    mouthOpen: true,
    size: 35
  });
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [gameTime, setGameTime] = useState(0);

  const cakeEmojis = ['🍰', '🧁', '🎂', '🍪', '🥧', '🍩', '🧄', '🍮'];

  // Create eating particles
  const createEatingParticles = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 30,
        maxLife: 30,
        color: `hsl(${Math.random() * 60 + 30}, 70%, 60%)` // Golden colors
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Generate random cake at safe distance from Pac-Man
  const generateCake = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let attempts = 0;
    let x, y;
    
    do {
      x = Math.random() * (canvas.width - 80) + 40;
      y = Math.random() * (canvas.height - 80) + 40;
      attempts++;
    } while (
      attempts < 20 && 
      Math.sqrt(Math.pow(x - pacman.x, 2) + Math.pow(y - pacman.y, 2)) < 100
    );

    const newCake: Cake = {
      x,
      y,
      emoji: cakeEmojis[Math.floor(Math.random() * cakeEmojis.length)],
      id: Date.now() + Math.random(),
      size: 30 + Math.random() * 15 // Variable cake sizes
    };

    setCakes(prev => [...prev, newCake]);
  }, [pacman.x, pacman.y]);

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
    return distance < (pacmanPos.size + cake.size) / 2;
  }, []);

  // Draw Pac-Man with authentic sprite-like appearance
  const drawPacMan = useCallback((ctx: CanvasRenderingContext2D, pacman: PacMan) => {
    ctx.save();
    ctx.translate(pacman.x, pacman.y);
    ctx.rotate(pacman.direction);
    
    // Pac-Man body (golden yellow)
    ctx.fillStyle = '#FFDD44';
    ctx.beginPath();
    
    if (pacman.mouthOpen) {
      // Mouth open - classic Pac-Man shape
      ctx.arc(0, 0, pacman.size / 2, 0.2 * Math.PI, 1.8 * Math.PI);
      ctx.lineTo(0, 0);
    } else {
      // Mouth closed - full circle
      ctx.arc(0, 0, pacman.size / 2, 0, 2 * Math.PI);
    }
    
    ctx.fill();
    
    // Add shadow/depth
    ctx.fillStyle = '#E6C200';
    ctx.beginPath();
    ctx.arc(2, 2, pacman.size / 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Pac-Man body outline
    ctx.strokeStyle = '#CC9900';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (pacman.mouthOpen) {
      ctx.arc(0, 0, pacman.size / 2, 0.2 * Math.PI, 1.8 * Math.PI);
      ctx.lineTo(0, 0);
    } else {
      ctx.arc(0, 0, pacman.size / 2, 0, 2 * Math.PI);
    }
    ctx.stroke();
    
    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-5, -8, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Eye highlight
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(-4, -9, 1, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();
  }, []);

  // Draw cake with glow effect
  const drawCake = useCallback((ctx: CanvasRenderingContext2D, cake: Cake) => {
    // Glow effect
    ctx.save();
    ctx.shadowColor = '#F9A03F';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Cake emoji with enhanced size
    ctx.font = `${cake.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cake.emoji, cake.x, cake.y);
    
    ctx.restore();
  }, []);

  // Draw particle effects
  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 3 * alpha, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    });
  }, []);

  // Main draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background with grid pattern (classic Pac-Man style)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0B1426');
    gradient.addColorStop(1, '#1E3A5F');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid dots for authentic feel
    ctx.fillStyle = 'rgba(249, 160, 63, 0.1)';
    for (let x = 20; x < canvas.width; x += 40) {
      for (let y = 20; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Draw border
    ctx.strokeStyle = '#F9A03F';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    // Draw cakes
    cakes.forEach(cake => drawCake(ctx, cake));

    // Draw particles
    drawParticles(ctx, particles);

    // Draw Pac-Man
    drawPacMan(ctx, pacman);

    // Draw trail effect behind Pac-Man
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#FFDD44';
    for (let i = 1; i <= 3; i++) {
      const trailX = pacman.x - Math.cos(pacman.direction) * i * 8;
      const trailY = pacman.y - Math.sin(pacman.direction) * i * 8;
      ctx.beginPath();
      ctx.arc(trailX, trailY, (pacman.size / 2) * (1 - i * 0.2), 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.restore();
  }, [cakes, particles, pacman, drawCake, drawParticles, drawPacMan]);

  // Update particles
  const updateParticles = useCallback(() => {
    setParticles(prev => 
      prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vx: particle.vx * 0.98,
        vy: particle.vy * 0.98,
        life: particle.life - 1
      })).filter(particle => particle.life > 0)
    );
  }, []);

  // Update game state
  const updateGame = useCallback((currentTime: number) => {
    // Toggle Pac-Man mouth every 150ms for authentic animation
    if (currentTime - lastMouthToggle.current > 150) {
      setPacman(prev => ({
        ...prev,
        mouthOpen: !prev.mouthOpen
      }));
      lastMouthToggle.current = currentTime;
    }

    // Spawn cakes every 2-4 seconds randomly
    if (currentTime - lastCakeSpawn.current > (2000 + Math.random() * 2000)) {
      if (cakes.length < 8) { // Max 8 cakes on screen
        generateCake();
        lastCakeSpawn.current = currentTime;
      }
    }

    // Update Pac-Man movement
    setPacman(prevPacman => {
      const canvas = canvasRef.current;
      if (!canvas) return prevPacman;

      const currentCakes = cakes;
      const nearestCake = findNearestCake(prevPacman, currentCakes);
      
      if (nearestCake) {
        // Calculate direction to nearest cake
        const dx = nearestCake.x - prevPacman.x;
        const dy = nearestCake.y - prevPacman.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          // Calculate new direction angle
          const targetDirection = Math.atan2(dy, dx);
          
          // Smooth direction change
          let currentDirection = prevPacman.direction;
          let directionDiff = targetDirection - currentDirection;
          
          // Handle angle wrapping
          if (directionDiff > Math.PI) directionDiff -= 2 * Math.PI;
          if (directionDiff < -Math.PI) directionDiff += 2 * Math.PI;
          
          // Smooth rotation
          const rotationSpeed = 0.15;
          currentDirection += directionDiff * rotationSpeed;

          // Move Pac-Man
          const newX = prevPacman.x + Math.cos(currentDirection) * prevPacman.speed;
          const newY = prevPacman.y + Math.sin(currentDirection) * prevPacman.speed;

          // Keep within bounds
          const boundedX = Math.max(prevPacman.size, Math.min(canvas.width - prevPacman.size, newX));
          const boundedY = Math.max(prevPacman.size, Math.min(canvas.height - prevPacman.size, newY));

          const newPacman = {
            ...prevPacman,
            x: boundedX,
            y: boundedY,
            direction: currentDirection,
            targetX: nearestCake.x,
            targetY: nearestCake.y
          };

          // Check for collision
          if (checkCollision(newPacman, nearestCake)) {
            setCakes(prev => prev.filter(cake => cake.id !== nearestCake.id));
            setScore(prev => prev + Math.floor(nearestCake.size / 3)); // Score based on cake size
            createEatingParticles(nearestCake.x, nearestCake.y);
          }

          return newPacman;
        }
      } else {
        // No cakes, wander randomly
        if (Math.random() < 0.02) { // 2% chance to change direction
          return {
            ...prevPacman,
            direction: Math.random() * 2 * Math.PI
          };
        }
        
        // Continue in current direction
        const newX = prevPacman.x + Math.cos(prevPacman.direction) * (prevPacman.speed * 0.5);
        const newY = prevPacman.y + Math.sin(prevPacman.direction) * (prevPacman.speed * 0.5);
        
        // Bounce off walls
        let newDirection = prevPacman.direction;
        let boundedX = newX;
        let boundedY = newY;
        
        if (newX <= prevPacman.size || newX >= canvas.width - prevPacman.size) {
          newDirection = Math.PI - newDirection;
          boundedX = Math.max(prevPacman.size, Math.min(canvas.width - prevPacman.size, newX));
        }
        if (newY <= prevPacman.size || newY >= canvas.height - prevPacman.size) {
          newDirection = -newDirection;
          boundedY = Math.max(prevPacman.size, Math.min(canvas.height - prevPacman.size, newY));
        }
        
        return {
          ...prevPacman,
          x: boundedX,
          y: boundedY,
          direction: newDirection
        };
      }
      
      return prevPacman;
    });

    // Update particles
    updateParticles();
    
    // Update game time
    setGameTime(prev => prev + 16); // ~60fps
  }, [cakes, findNearestCake, checkCollision, generateCake, createEatingParticles, updateParticles]);

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!isActive) return;
    
    updateGame(currentTime);
    draw();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, draw, isActive]);

  // Initialize game
  useEffect(() => {
    if (!isActive) return;

    // Generate initial cakes
    for (let i = 0; i < 4; i++) {
      setTimeout(() => generateCake(), i * 800);
    }

    // Start game loop
    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, generateCake, gameLoop]);

  const handleStartOrder = () => {
    setIsActive(false);
    // Navigate to main menu
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-golden-orange mb-4 animate-pulse-slow">
          🍰 Golden Munch 🍰
        </h1>
        <p className="text-2xl text-cream-white/90 mb-2">
          Watch Pac-Man hunt for delicious treats!
        </p>
        <p className="text-lg text-cream-white/70">
          Touch anywhere to start your order
        </p>
      </div>

      {/* Game Canvas */}
      <div className="relative mb-8">
        <canvas
          ref={canvasRef}
          width={900}
          height={500}
          className="border-4 border-golden-orange rounded-2xl shadow-2xl cursor-pointer bg-gradient-to-br from-gray-900 to-blue-900"
          onClick={handleStartOrder}
        />
        
        {/* Game UI Overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          {/* Score Display */}
          <div className="bg-black/80 text-golden-orange px-6 py-3 rounded-lg font-bold text-2xl shadow-lg border-2 border-golden-orange/50">
            Score: {score.toLocaleString()}
          </div>
          
          {/* Cake Count */}
          <div className="bg-black/80 text-cream-white px-4 py-2 rounded-lg font-semibold text-lg shadow-lg border-2 border-golden-orange/50">
            🍰 Cakes: {cakes.length}
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 bg-black/90 text-cream-white px-6 py-3 rounded-lg text-lg font-semibold shadow-lg border-2 border-golden-orange/50">
          🟡 Pac-Man is hunting for Golden Munch treats!
        </div>
        
        {/* Game Time */}
        <div className="absolute bottom-4 right-4 bg-black/80 text-golden-orange px-4 py-2 rounded-lg font-mono text-sm shadow-lg border-2 border-golden-orange/50">
          {Math.floor(gameTime / 1000)}s
        </div>
      </div>

      {/* Call to Action */}
      <Button
        size="lg"
        className="bg-golden-orange hover:bg-deep-amber text-chocolate-brown font-bold text-2xl px-12 py-6 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 animate-pulse-slow mb-6"
        onClick={handleStartOrder}
      >
        🛒 Start Your Order 🛒
      </Button>

      {/* Game Instructions */}
      <div className="text-center max-w-2xl">
        <div className="bg-black/50 backdrop-blur-sm border-2 border-golden-orange/30 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-golden-orange mb-3">How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-cream-white/80">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🟡</span>
              <span>Pac-Man automatically hunts cakes</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🍰</span>
              <span>Cakes spawn randomly on screen</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">💫</span>
              <span>Watch particles when cakes are eaten</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">👆</span>
              <span>Touch anywhere to start ordering</span>
            </div>
          </div>
        </div>
        
        <p className="text-cream-white/70 text-lg">
          Freshly baked daily • Made with love • Fast service
        </p>
        <div className="flex gap-4 justify-center mt-4 text-3xl">
          <span className="animate-float" style={{ animationDelay: '0s' }}>🥐</span>
          <span className="animate-float" style={{ animationDelay: '0.5s' }}>☕</span>
          <span className="animate-float" style={{ animationDelay: '1s' }}>🍪</span>
          <span className="animate-float" style={{ animationDelay: '1.5s' }}>🧁</span>
          <span className="animate-float" style={{ animationDelay: '2s' }}>🥧</span>
        </div>
      </div>
    </div>
  );
}