"use client";

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
  speed: number;
  direction: number;
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

interface GoldenMunchEffect {
  active: boolean;
  alpha: number;
  scale: number;
  duration: number;
}

// Game state stored in refs to prevent React re-renders
interface GameState {
  cakes: Cake[];
  particles: Particle[];
  pacman: PacMan;
  score: number;
  lastMouthToggle: number;
  lastCakeSpawn: number;
  lastScoreUpdate: number;
  lastGoldenMunchCheck: number;
  goldenMunchEffect: GoldenMunchEffect;
  isRunning: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

export default function IdlePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  // Game state in ref to prevent re-renders
  const gameStateRef = useRef<GameState>({
    cakes: [],
    particles: [],
    pacman: {
      x: 200,
      y: 200,
      speed: 2.8,
      direction: 0,
      mouthOpen: true,
      size: 40
    },
    score: 0,
    lastMouthToggle: 0,
    lastCakeSpawn: 0,
    lastScoreUpdate: 0,
    lastGoldenMunchCheck: 0,
    goldenMunchEffect: {
      active: false,
      alpha: 0,
      scale: 1,
      duration: 0
    },
    isRunning: true,
    canvasWidth: 0,
    canvasHeight: 0
  });
  
  // Minimal React state - only for UI updates
  const [displayScore, setDisplayScore] = useState(0);
  const [showStartButton, setShowStartButton] = useState(true);
  const [cakeCount, setCakeCount] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const cakeEmojis = ['🍰', '🧁', '🎂', '🍪', '🥧', '🍩', '🧄', '🍮'];

  // Initialize canvas to full screen
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Set canvas size
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
    }
    
    // Update game state with canvas dimensions
    const gameState = gameStateRef.current;
    gameState.canvasWidth = width;
    gameState.canvasHeight = height;
    
    // Reset Pac-Man position to center if needed
    if (gameState.pacman.x === 200 && gameState.pacman.y === 200) {
      gameState.pacman.x = width / 2;
      gameState.pacman.y = height / 2;
    }
    
    console.log('Canvas initialized:', width, 'x', height);
  }, []);

  // Trigger Golden Munch effect
  const triggerGoldenMunchEffect = useCallback(() => {
    const gameState = gameStateRef.current;
    gameState.goldenMunchEffect = {
      active: true,
      alpha: 1,
      scale: 0.2,
      duration: 240 // ~4 seconds at 60fps
    };
    console.log('Golden Munch effect triggered!');
  }, []);

  // Create eating particles
  const createEatingParticles = useCallback((x: number, y: number) => {
    const gameState = gameStateRef.current;
    for (let i = 0; i < 10; i++) {
      gameState.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        life: 60,
        maxLife: 60,
        color: `hsl(${Math.random() * 60 + 30}, 90%, 65%)`
      });
    }
  }, []);

  // Generate random cake
  const generateCake = useCallback(() => {
    const gameState = gameStateRef.current;
    if (!gameState.canvasWidth || !gameState.canvasHeight) return;

    let attempts = 0;
    let x, y;
    
    do {
      x = Math.random() * (gameState.canvasWidth - 120) + 60;
      y = Math.random() * (gameState.canvasHeight - 120) + 60;
      attempts++;
    } while (
      attempts < 15 && 
      Math.sqrt(Math.pow(x - gameState.pacman.x, 2) + Math.pow(y - gameState.pacman.y, 2)) < 150
    );

    const newCake: Cake = {
      x,
      y,
      emoji: cakeEmojis[Math.floor(Math.random() * cakeEmojis.length)],
      id: Date.now() + Math.random(),
      size: 32 + Math.random() * 20
    };

    gameState.cakes.push(newCake);
    console.log('Cake spawned at:', x, y);
  }, []);

  // Find nearest cake
  const findNearestCake = useCallback((pacman: PacMan, cakes: Cake[]) => {
    if (cakes.length === 0) return null;

    let nearest = cakes[0];
    let minDistance = Math.sqrt(
      Math.pow(pacman.x - nearest.x, 2) + Math.pow(pacman.y - nearest.y, 2)
    );

    for (let i = 1; i < cakes.length; i++) {
      const distance = Math.sqrt(
        Math.pow(pacman.x - cakes[i].x, 2) + Math.pow(pacman.y - cakes[i].y, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = cakes[i];
      }
    }

    return nearest;
  }, []);

  // Check collision
  const checkCollision = useCallback((pacman: PacMan, cake: Cake) => {
    const distance = Math.sqrt(
      Math.pow(pacman.x - cake.x, 2) + Math.pow(pacman.y - cake.y, 2)
    );
    return distance < (pacman.size + cake.size) / 2.5;
  }, []);

  // Draw Pac-Man
  const drawPacMan = useCallback((ctx: CanvasRenderingContext2D, pacman: PacMan) => {
    // Trail effect
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#FFDD44';
    for (let i = 1; i <= 4; i++) {
      const trailX = pacman.x - Math.cos(pacman.direction) * i * 18;
      const trailY = pacman.y - Math.sin(pacman.direction) * i * 18;
      ctx.beginPath();
      ctx.arc(trailX, trailY, (pacman.size / 2) * (1 - i * 0.2), 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.restore();

    // Main Pac-Man
    ctx.save();
    ctx.translate(pacman.x, pacman.y);
    ctx.rotate(pacman.direction);
    
    // Shadow
    ctx.fillStyle = '#CC9900';
    ctx.beginPath();
    if (pacman.mouthOpen) {
      ctx.arc(3, 3, pacman.size / 2, 0.3 * Math.PI, 1.7 * Math.PI);
      ctx.lineTo(3, 3);
    } else {
      ctx.arc(3, 3, pacman.size / 2, 0, 2 * Math.PI);
    }
    ctx.fill();
    
    // Body
    ctx.fillStyle = '#FFDD44';
    ctx.beginPath();
    if (pacman.mouthOpen) {
      ctx.arc(0, 0, pacman.size / 2, 0.3 * Math.PI, 1.7 * Math.PI);
      ctx.lineTo(0, 0);
    } else {
      ctx.arc(0, 0, pacman.size / 2, 0, 2 * Math.PI);
    }
    ctx.fill();
    
    // Outline
    ctx.strokeStyle = '#E6C200';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-8, -14, 6, 0, 2 * Math.PI);
    ctx.fill();
    
    // Eye highlight
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(-6, -16, 2.5, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.restore();
  }, []);

  // Draw cake
  const drawCake = useCallback((ctx: CanvasRenderingContext2D, cake: Cake) => {
    ctx.save();
    ctx.shadowColor = '#F9A03F';
    ctx.shadowBlur = 15;
    ctx.font = `${cake.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cake.emoji, cake.x, cake.y);
    ctx.restore();
  }, []);

  // Draw particles
  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, particles: Particle[]) => {
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 6 * alpha, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    });
  }, []);

  // Draw Golden Munch effect
  const drawGoldenMunchEffect = useCallback((ctx: CanvasRenderingContext2D, effect: GoldenMunchEffect, gameState: GameState) => {
    if (!effect.active) return;

    ctx.save();
    ctx.globalAlpha = effect.alpha;
    
    // Background flash
    ctx.fillStyle = 'rgba(249, 160, 63, 0.5)';
    ctx.fillRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);
    
    // Golden Munch text
    const centerX = gameState.canvasWidth / 2;
    const centerY = gameState.canvasHeight / 2;
    
    ctx.translate(centerX, centerY);
    ctx.scale(effect.scale, effect.scale);
    
    // Text shadow
    ctx.fillStyle = '#B8860B';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GOLDEN MUNCH', 6, 6);
    
    // Main text
    ctx.fillStyle = '#FFD700';
    ctx.fillText('GOLDEN MUNCH', 0, 0);
    
    // Text outline
    ctx.strokeStyle = '#CC6600';
    ctx.lineWidth = 8;
    ctx.strokeText('GOLDEN MUNCH', 0, 0);
    
    ctx.restore();
  }, []);

  // Optimized game update
  const updateGame = useCallback((currentTime: number) => {
    const gameState = gameStateRef.current;
    if (!gameState.isRunning) return;

    // Mouth animation (every 120ms)
    if (currentTime - gameState.lastMouthToggle > 120) {
      gameState.pacman.mouthOpen = !gameState.pacman.mouthOpen;
      gameState.lastMouthToggle = currentTime;
    }

    // Spawn cakes (every 1.5-3 seconds)
    if (currentTime - gameState.lastCakeSpawn > (1500 + Math.random() * 1500)) {
      if (gameState.cakes.length < 15) {
        generateCake();
        gameState.lastCakeSpawn = currentTime;
      }
    }

    // Update Pac-Man movement
    const nearestCake = findNearestCake(gameState.pacman, gameState.cakes);
    
    if (nearestCake) {
      const dx = nearestCake.x - gameState.pacman.x;
      const dy = nearestCake.y - gameState.pacman.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        const targetDirection = Math.atan2(dy, dx);
        let currentDirection = gameState.pacman.direction;
        let directionDiff = targetDirection - currentDirection;
        
        // Handle angle wrapping
        if (directionDiff > Math.PI) directionDiff -= 2 * Math.PI;
        if (directionDiff < -Math.PI) directionDiff += 2 * Math.PI;
        
        currentDirection += directionDiff * 0.10; // Smooth turning

        const newX = gameState.pacman.x + Math.cos(currentDirection) * gameState.pacman.speed;
        const newY = gameState.pacman.y + Math.sin(currentDirection) * gameState.pacman.speed;

        // Keep within bounds
        gameState.pacman.x = Math.max(gameState.pacman.size, Math.min(gameState.canvasWidth - gameState.pacman.size, newX));
        gameState.pacman.y = Math.max(gameState.pacman.size, Math.min(gameState.canvasHeight - gameState.pacman.size, newY));
        gameState.pacman.direction = currentDirection;

        // Check collision
        if (checkCollision(gameState.pacman, nearestCake)) {
          gameState.cakes = gameState.cakes.filter(cake => cake.id !== nearestCake.id);
          gameState.score += Math.floor(nearestCake.size / 2) + 10;
          createEatingParticles(nearestCake.x, nearestCake.y);
          console.log('Cake eaten! Score:', gameState.score);
        }
      }
    } else {
      // Wander randomly
      if (Math.random() < 0.01) {
        gameState.pacman.direction = Math.random() * 2 * Math.PI;
      }
      
      const newX = gameState.pacman.x + Math.cos(gameState.pacman.direction) * gameState.pacman.speed * 0.8;
      const newY = gameState.pacman.y + Math.sin(gameState.pacman.direction) * gameState.pacman.speed * 0.8;
      
      // Bounce off walls
      if (newX <= gameState.pacman.size || newX >= gameState.canvasWidth - gameState.pacman.size) {
        gameState.pacman.direction = Math.PI - gameState.pacman.direction;
      }
      if (newY <= gameState.pacman.size || newY >= gameState.canvasHeight - gameState.pacman.size) {
        gameState.pacman.direction = -gameState.pacman.direction;
      }
      
      gameState.pacman.x = Math.max(gameState.pacman.size, Math.min(gameState.canvasWidth - gameState.pacman.size, newX));
      gameState.pacman.y = Math.max(gameState.pacman.size, Math.min(gameState.canvasHeight - gameState.pacman.size, newY));
    }

    // Update particles efficiently
    gameState.particles = gameState.particles.map(particle => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      vx: particle.vx * 0.95,
      vy: particle.vy * 0.95,
      life: particle.life - 1
    })).filter(particle => particle.life > 0);

    // Check for Golden Munch trigger (every 1000 points) - check every 2 seconds
    if (currentTime - gameState.lastGoldenMunchCheck > 2000) {
      const currentThousands = Math.floor(gameState.score / 1000);
      const lastThousands = Math.floor(displayScore / 1000);
      
      if (currentThousands > lastThousands && currentThousands > 0) {
        triggerGoldenMunchEffect();
      }
      
      gameState.lastGoldenMunchCheck = currentTime;
    }

    // Update Golden Munch effect
    if (gameState.goldenMunchEffect.active) {
      gameState.goldenMunchEffect.duration--;
      gameState.goldenMunchEffect.scale = Math.min(1.3, gameState.goldenMunchEffect.scale + 0.01);
      
      if (gameState.goldenMunchEffect.duration <= 80) {
        gameState.goldenMunchEffect.alpha = gameState.goldenMunchEffect.duration / 80;
      }
      
      if (gameState.goldenMunchEffect.duration <= 0) {
        gameState.goldenMunchEffect.active = false;
      }
    }

    // Update React state only every 1 second
    if (currentTime - gameState.lastScoreUpdate > 1000) {
      setDisplayScore(gameState.score);
      setCakeCount(gameState.cakes.length);
      gameState.lastScoreUpdate = currentTime;
    }
  }, [generateCake, findNearestCake, checkCollision, createEatingParticles, triggerGoldenMunchEffect, displayScore]);

  // Optimized draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const gameState = gameStateRef.current;
    if (!canvas || !ctx || !gameState.isRunning) return;

    // Clear and draw background
    ctx.clearRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);
    
    const gradient = ctx.createLinearGradient(0, 0, gameState.canvasWidth, gameState.canvasHeight);
    gradient.addColorStop(0, '#0B1426');
    gradient.addColorStop(1, '#1E3A5F');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);

    // Draw border
    ctx.strokeStyle = '#F9A03F';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, gameState.canvasWidth - 8, gameState.canvasHeight - 8);

    // Draw game elements
    gameState.cakes.forEach(cake => drawCake(ctx, cake));
    drawParticles(ctx, gameState.particles);
    drawPacMan(ctx, gameState.pacman);

    // Draw Golden Munch effect
    drawGoldenMunchEffect(ctx, gameState.goldenMunchEffect, gameState);

    // Draw minimal UI (only score)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(20, 20, 250, 80);
    ctx.strokeStyle = '#F9A03F';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 250, 80);
    
    ctx.fillStyle = '#F9A03F';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${displayScore.toLocaleString()}`, 35, 60);
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`Cakes: ${cakeCount}`, 35, 85);
  }, [drawCake, drawParticles, drawPacMan, drawGoldenMunchEffect, displayScore, cakeCount]);

  // Optimized game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!isActive) return;
    
    updateGame(currentTime);
    draw();
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, draw, isActive]);

  // Initialize game
  useEffect(() => {
    if (!isActive) return;

    console.log('Initializing idle page game...');
    initializeCanvas();
    
    // Hide start button after 4 seconds
    const buttonTimer = setTimeout(() => setShowStartButton(false), 4000);

    // Generate initial cakes with delay
    const cakeTimers: NodeJS.Timeout[] = [];
    for (let i = 0; i < 8; i++) {
      const timer = setTimeout(() => generateCake(), i * 1000);
      cakeTimers.push(timer);
    }

    // Start game loop
    animationRef.current = requestAnimationFrame(gameLoop);

    // Handle resize efficiently
    const handleResize = () => {
      console.log('Resizing canvas...');
      initializeCanvas();
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      console.log('Cleaning up idle page game...');
      clearTimeout(buttonTimer);
      cakeTimers.forEach(timer => clearTimeout(timer));
      window.removeEventListener('resize', handleResize);
      gameStateRef.current.isRunning = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, generateCake, gameLoop, initializeCanvas]);

  const handleStartOrder = useCallback(() => {
    console.log('Starting order...');
    gameStateRef.current.isRunning = false;
    setIsActive(false);
    window.location.href = '/';
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-900 overflow-hidden">
      {/* Full Screen Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-pointer"
        onClick={handleStartOrder}
        style={{ 
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          width: '100vw',
          height: '100vh',
          display: 'block'
        }}
      />
      
      {/* Start Button Overlay */}
      {showStartButton && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-black/95 backdrop-blur-sm rounded-3xl p-8 text-center border-4 border-golden-orange pointer-events-auto animate-pulse-slow">
            <h1 className="text-4xl md:text-6xl font-bold text-golden-orange mb-4">
              🍰 Golden Munch 🍰
            </h1>
            <p className="text-lg md:text-xl text-cream-white mb-6">
              Watch Pac-Man hunt for delicious treats!
            </p>
            <p className="text-md text-cream-white/80 mb-6">
              Touch anywhere to start ordering
            </p>
            <Button
              size="lg"
              className="bg-golden-orange hover:bg-deep-amber text-chocolate-brown font-bold text-xl px-8 py-4"
              onClick={handleStartOrder}
            >
              🛒 Start Order
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}