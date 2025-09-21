"use client";

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Redirect to idle page for kiosk mode
    window.location.href = '/idle';
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: '#FFF8F0' }}
    >
      <div className="text-center">
        <div className="text-6xl mb-4">🍰</div>
        <h1 
          className="text-4xl font-bold mb-4"
          style={{ color: '#F9A03F' }}
        >
          Golden Munch
        </h1>
        <p 
          className="text-lg"
          style={{ color: '#4B2E2E' }}
        >
          Redirecting to kiosk mode...
        </p>
      </div>
    </div>
  );
}