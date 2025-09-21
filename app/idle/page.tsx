"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@heroui/button";
import { title } from "@/components/primitives";

const randomMessages = [
  "🎯 Click Anywhere to Start!",
  "🍰 Cakes in Just a Click Away!",
  "✨ Tap to Begin Your Journey!",
  "🚀 Your Adventure Awaits!",
  "🎮 Ready to Order? Click Here!",
  "💫 Touch to Explore Our Menu!",
  "🎉 Press Anywhere to Continue!",
  "🌟 One Click to Deliciousness!",
  "🎪 Click for Sweet Surprises!",
  "🍭 Tap to Taste the Magic!",
  "🎨 Your Sweet Journey Starts Here!",
  "🎵 Click to the Beat of Flavor!"
];

interface Cake {
  id: number;
  x: number;
  y: number;
  emoji: string;
  spawning: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface Trail {
  id: number;
  x: number;
  y: number;
  opacity: number;
}

export default function IdlePage() {
  const [score, setScore] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [lastMessageScore, setLastMessageScore] = useState(0);
  const [pacmanPosition, setPacmanPosition] = useState<Position>({ x: 15, y: 50 });
  const [pacmanDirection, setPacmanDirection] = useState<Position>({ x: 1.2, y: 0.3 });
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [isEating, setIsEating] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(true);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [screenShake, setScreenShake] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const cakeIdRef = useRef(0);
  const trailIdRef = useRef(0);

  const cakeEmojis = ['🎂', '🧁', '🍰', '🍪', '🍩', '🥧', '🍭', '🍬', '🍯', '🧈', '🍮', '🍡'];

  // Enhanced Pacman mouth animation
  useEffect(() => {
    const interval = setInterval(() => {
      setMouthOpen(prev => !prev);
    }, isEating ? 100 : 180);
    return () => clearInterval(interval);
  }, [isEating]);

  // Create trailing effect
  useEffect(() => {
    const createTrail = () => {
      const newTrail: Trail = {
        id: trailIdRef.current++,
        x: pacmanPosition.x,
        y: pacmanPosition.y,
        opacity: 0.6
      };
      setTrails(prev => [...prev.slice(-8), newTrail]);
    };

    const interval = setInterval(createTrail, 100);
    return () => clearInterval(interval);
  }, [pacmanPosition]);

  // Fade out trails
  useEffect(() => {
    const interval = setInterval(() => {
      setTrails(prev => 
        prev.map(trail => ({ ...trail, opacity: trail.opacity - 0.1 }))
            .filter(trail => trail.opacity > 0)
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Enhanced cake spawning with animation
  useEffect(() => {
    const spawnCake = () => {
      if (cakes.length < 12) {
        const newCake: Cake = {
          id: cakeIdRef.current++,
          x: Math.random() * 85 + 7.5,
          y: Math.random() * 85 + 7.5,
          emoji: cakeEmojis[Math.floor(Math.random() * cakeEmojis.length)],
          spawning: true
        };
        setCakes(prev => [...prev, newCake]);
        
        // Remove spawning animation after delay
        setTimeout(() => {
          setCakes(prev => prev.map(cake => 
            cake.id === newCake.id ? { ...cake, spawning: false } : cake
          ));
        }, 500);
      }
    };

    const interval = setInterval(spawnCake, 1500);
    return () => clearInterval(interval);
  }, [cakes.length]);

  // Enhanced Pacman movement with better AI
  useEffect(() => {
    const movePacman = () => {
      setPacmanPosition(prev => {
        let newX = prev.x + pacmanDirection.x;
        let newY = prev.y + pacmanDirection.y;
        
        // Find nearest cake for AI behavior
        const nearestCake = cakes.reduce((nearest, cake) => {
          const distance = Math.sqrt(Math.pow(cake.x - prev.x, 2) + Math.pow(cake.y - prev.y, 2));
          return distance < nearest.distance ? { cake, distance } : nearest;
        }, { cake: null, distance: Infinity });

        // Slightly adjust direction towards nearest cake
        if (nearestCake.cake && Math.random() < 0.3) {
          const dx = nearestCake.cake.x - prev.x;
          const dy = nearestCake.cake.y - prev.y;
          const magnitude = Math.sqrt(dx * dx + dy * dy);
          if (magnitude > 0) {
            setPacmanDirection(dir => ({
              x: dir.x + (dx / magnitude) * 0.2,
              y: dir.y + (dy / magnitude) * 0.2
            }));
          }
        }
        
        // Bounce off walls with more dynamic direction changes
        if (newX <= 3 || newX >= 95) {
          setPacmanDirection(dir => ({ 
            x: -dir.x + (Math.random() - 0.5) * 0.3, 
            y: dir.y + (Math.random() - 0.5) * 0.8 
          }));
          newX = Math.max(3, Math.min(95, newX));
        }
        if (newY <= 3 || newY >= 95) {
          setPacmanDirection(dir => ({ 
            x: dir.x + (Math.random() - 0.5) * 0.8, 
            y: -dir.y + (Math.random() - 0.5) * 0.3 
          }));
          newY = Math.max(3, Math.min(95, newY));
        }

        // Normalize direction to maintain speed
        const magnitude = Math.sqrt(pacmanDirection.x ** 2 + pacmanDirection.y ** 2);
        if (magnitude > 2) {
          setPacmanDirection(dir => ({
            x: (dir.x / magnitude) * 1.5,
            y: (dir.y / magnitude) * 1.5
          }));
        }

        return { x: newX, y: newY };
      });
    };

    const interval = setInterval(movePacman, 40);
    return () => clearInterval(interval);
  }, [pacmanDirection, cakes]);

  // Enhanced collision detection with combo system
  useEffect(() => {
    let comboCount = 0;
    
    setCakes(prevCakes => {
      const remainingCakes = prevCakes.filter(cake => {
        const distance = Math.sqrt(
          Math.pow(cake.x - pacmanPosition.x, 2) + 
          Math.pow(cake.y - pacmanPosition.y, 2)
        );
        
        if (distance < 6) {
          comboCount++;
          const points = 10 + (combo * 5);
          setScore(prev => prev + points);
          setIsEating(true);
          setScreenShake(true);
          
          setTimeout(() => {
            setIsEating(false);
            setScreenShake(false);
          }, 200);
          
          return false;
        }
        return true;
      });
      
      if (comboCount > 0) {
        setCombo(prev => prev + comboCount);
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 1500);
        
        // Reset combo after no eating for a while
        setTimeout(() => setCombo(0), 3000);
      }
      
      return remainingCakes;
    });
  }, [pacmanPosition, combo]);

  // Auto-increment score
  useEffect(() => {
    const interval = setInterval(() => {
      setScore(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced random messages
  useEffect(() => {
    if (score > 0 && score % 100 === 0 && score !== lastMessageScore) {
      const randomIndex = Math.floor(Math.random() * randomMessages.length);
      setCurrentMessage(randomMessages[randomIndex]);
      setShowMessage(true);
      setLastMessageScore(score);
      
      const timeout = setTimeout(() => {
        setShowMessage(false);
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [score, lastMessageScore]);

  const handleClick = useCallback(() => {
    window.location.href = '/';
  }, []);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    handleClick();
  }, [handleClick]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => clearDocument.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const getRotation = () => {
    const angle = Math.atan2(pacmanDirection.y, pacmanDirection.x) * (180 / Math.PI);
    return angle;
  };

  return (
    <div 
      ref={gameAreaRef}
      className={`min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 via-pink-900 to-orange-900 relative overflow-hidden cursor-pointer ${
        screenShake ? 'animate-pulse' : ''
      }`}
      onClick={handleClick}
    >
      {/* Enhanced animated background */}
      <div className="absolute inset-0">
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Twinkling stars */}
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1 + Math.random() * 2}s`,
              boxShadow: '0 0 6px #fff, 0 0 12px #fff'
            }}
          />
        ))}
      </div>

      {/* Enhanced UI Header */}
      <div className="absolute top-6 left-6 z-20 bg-black bg-opacity-40 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20">
        <div className="flex items-center gap-4">
          <div className="text-6xl animate-bounce">🍰</div>
          <div>
            <div className={title({ size: "md", class: "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 drop-shadow-lg mb-1" })}>
              Cake Hunter
            </div>
            <div className="text-yellow-300 text-2xl font-bold neon-text">
              Score: {score.toLocaleString()}
            </div>
            <div className="text-blue-200 text-sm">
              Time: {Math.floor(score / 60)}:{(score % 60).toString().padStart(2, '0')}
            </div>
            {combo > 0 && (
              <div className="text-orange-400 text-lg font-bold animate-pulse">
                🔥 Combo x{combo}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Instructions */}
      <div className="absolute top-6 right-6 z-20 bg-black bg-opacity-40 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20 text-right">
        <div className="text-white text-xl mb-2 neon-text">🎮 Auto-Hunt Mode</div>
        <div className="text-emerald-300 text-sm animate-pulse">Click anywhere to start ordering!</div>
        <div className="text-purple-300 text-xs mt-2">Pacman is collecting treats for you! 🎂</div>
      </div>

      {/* Game area with trails and effects */}
      <div className="absolute inset-0 z-10">
        {/* Pacman trails */}
        {trails.map((trail) => (
          <div
            key={trail.id}
            className="absolute w-8 h-8 bg-yellow-400 rounded-full transition-opacity duration-300"
            style={{
              left: `${trail.x}%`,
              top: `${trail.y}%`,
              transform: 'translate(-50%, -50%)',
              opacity: trail.opacity * 0.3,
              filter: 'blur(2px)'
            }}
          />
        ))}

        {/* Enhanced Pacman */}
        <div
          className={`absolute transition-all duration-75 ease-linear transform ${
            isEating ? 'scale-150' : 'scale-100'
          }`}
          style={{
            left: `${pacmanPosition.x}%`,
            top: `${pacmanPosition.y}%`,
            transform: `translate(-50%, -50%) rotate(${getRotation()}deg) ${
              isEating ? 'scale(1.5)' : 'scale(1)'
            }`,
            zIndex: 15,
            filter: isEating ? 'drop-shadow(0 0 20px #ffd700)' : 'drop-shadow(0 0 10px #ffd700)'
          }}
        >
          <div className="relative">
            {/* Pacman body with enhanced styling */}
            <div 
              className={`w-16 h-16 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 rounded-full relative transition-all duration-150 shadow-2xl border-2 border-yellow-200 ${
                mouthOpen ? 'border-8 border-transparent' : ''
              }`}
              style={{
                clipPath: mouthOpen 
                  ? 'polygon(100% 74%, 44% 48%, 100% 21%, 100% 0%, 0% 0%, 0% 100%, 100% 100%)'
                  : 'circle(50%)',
                boxShadow: '0 0 30px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.3)'
              }}
            >
              {/* Enhanced eye */}
              <div className="absolute w-3 h-3 bg-black rounded-full top-4 left-4 shadow-inner"></div>
              <div className="absolute w-1 h-1 bg-white rounded-full top-4.5 left-4.5"></div>
            </div>
            
            {/* Enhanced eating effect */}
            {isEating && (
              <>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-3xl animate-bounce">😋</div>
                </div>
                <div className="absolute inset-0 animate-ping bg-yellow-400 rounded-full opacity-30"></div>
              </>
            )}
          </div>
        </div>

        {/* Enhanced Cakes with spawn animation */}
        {cakes.map((cake) => (
          <div
            key={cake.id}
            className={`absolute text-5xl transition-all duration-500 drop-shadow-lg ${
              cake.spawning ? 'scale-0 animate-bounce' : 'scale-100 hover:scale-125'
            }`}
            style={{
              left: `${cake.x}%`,
              top: `${cake.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              animation: cake.spawning 
                ? 'spawn 0.5s ease-out forwards, float 3s ease-in-out infinite alternate' 
                : `float ${2 + Math.random()}s ease-in-out infinite alternate, glow 2s ease-in-out infinite`,
              filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.5))'
            }}
          >
            {cake.emoji}
          </div>
        ))}
      </div>

      {/* Combo display */}
      {showCombo && combo > 1 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <div className="text-6xl font-bold text-orange-400 animate-bounce neon-text">
            +{combo * 10} COMBO! 🔥
          </div>
        </div>
      )}

      {/* Enhanced random message overlay */}
      {showMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-opacity-95 backdrop-blur-lg rounded-3xl px-20 py-12 transform animate-bounce shadow-2xl border-4 border-white border-opacity-40">
            <div className={title({ 
              size: "md", 
              color: "foreground",
              class: "text-white text-center drop-shadow-lg neon-text mb-4"
            })}>
              {currentMessage}
            </div>
            <div className="text-center text-yellow-200 text-xl animate-pulse">
              ✨ Sweet treats await! ✨
            </div>
          </div>
        </div>
      )}

      {/* Enhanced floating food particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute text-3xl opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animation: `float ${4 + Math.random() * 2}s ease-in-out infinite alternate, rotate 8s linear infinite`
            }}
          >
            {cakeEmojis[Math.floor(Math.random() * cakeEmojis.length)]}
          </div>
        ))}
      </div>

      {/* Enhanced central call-to-action */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20">
        <Button
          size="lg"
          color="primary"
          variant="shadow"
          className="text-2xl px-20 py-10 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 hover:from-emerald-400 hover:via-blue-400 hover:to-purple-400 transform hover:scale-110 transition-all duration-300 animate-pulse border-2 border-white border-opacity-30 neon-button"
        >
          🛒 Click to Start Your Sweet Journey! 🍰
        </Button>
      </div>

      <style jsx>{`
        @keyframes float {
          from { transform: translateY(0px) rotate(0deg); }
          to { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes spawn {
          from { transform: translate(-50%, -50%) scale(0) rotate(180deg); }
          to { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
        }
        
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5)); }
          50% { filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8)); }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .neon-text {
          text-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor;
        }
        
        .neon-button {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3);
        }
        
        .neon-button:hover {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
}