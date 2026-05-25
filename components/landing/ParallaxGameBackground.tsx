'use client';

import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  type: 'coin' | 'need' | 'want' | 'paylater' | 'danger' | 'receipt';
  text: string;
  color: string;
  x: number; // percentage left
  scale: number;
  angle: number;
  speed: number;
}

// Sparkly, sparse and cozy financial snowfall items themed around needs/wants/payday
const INITIAL_PARTICLES: Particle[] = [
  { id: 1, type: 'coin', text: '🪙', color: '#FFC857', x: 8, scale: 1.1, angle: 12, speed: 1.1 },
  { id: 2, type: 'coin', text: '$', color: '#FFC857', x: 18, scale: 0.9, angle: -15, speed: 0.7 },
  { id: 3, type: 'need', text: '✓ Need', color: '#6FD08C', x: 26, scale: 0.95, angle: -5, speed: 0.5 },
  { id: 4, type: 'want', text: '🛍️ Want', color: '#FF7AA2', x: 74, y: 0, scale: 0.95, angle: 25, speed: 0.6 } as any,
  { id: 5, type: 'paylater', text: '💳 Paylater', color: '#9B8CFF', x: 82, scale: 0.9, angle: 10, speed: 0.8 },
  { id: 6, type: 'danger', text: '⚠️ Bill', color: '#FF6B6B', x: 91, scale: 1.0, angle: -8, speed: 1.0 },
  { id: 7, type: 'receipt', text: '📄', color: '#FFF1C7', x: 38, scale: 1.1, angle: -20, speed: 0.6 },
  { id: 8, type: 'coin', text: 'Rp', color: '#FFC857', x: 64, scale: 0.85, angle: 30, speed: 1.2 },
  { id: 9, type: 'want', text: '💗', color: '#FF7AA2', x: 55, scale: 1.0, angle: -12, speed: 0.7 },
  { id: 10, type: 'danger', text: '💸', color: '#FF6B6B', x: 12, scale: 1.0, angle: 35, speed: 1.3 },
  { id: 11, type: 'coin', text: '✨', color: '#FFC857', x: 47, scale: 0.8, angle: 15, speed: 0.8 },
  { id: 12, type: 'receipt', text: '📜', color: '#FFF6E8', x: 85, scale: 1.0, angle: -45, speed: 0.9 },
  { id: 13, type: 'need', text: '🍏 Eco', color: '#6FD08C', x: 3, scale: 0.9, angle: 10, speed: 0.5 },
  { id: 14, type: 'paylater', text: '💜 Risky', color: '#9B8CFF', x: 69, scale: 0.9, angle: -6, speed: 0.95 },
  { id: 15, type: 'coin', text: '🪙', color: '#FFC857', x: 49, scale: 1.0, angle: 0, speed: 1.4 },
];

export default function ParallaxGameBackground() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    // Detect reduced motion settings or mobile screen
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const isMobile = window.innerWidth < 768;
    const initialReduced = mediaQuery.matches || isMobile;

    // Defer state update to prevent synchronous cascade render warning
    const timer = setTimeout(() => {
      setIsReduced(initialReduced);
    }, 0);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsReduced(e.matches || window.innerWidth < 768);
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    // Track cursor movement for lightweight background parallax
    if (!initialReduced) {
      const handleMouseMove = (e: MouseEvent) => {
        const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
        const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
        setCoords({ x, y });
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('mousemove', handleMouseMove);
        mediaQuery.removeEventListener('change', handleMediaChange);
      };
    }

    return () => {
      clearTimeout(timer);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  // Soft Parallax displacement calculations (divided into layers)
  // Layer 1 (Far skyline / sky gradient) moves extremely subtly
  const farOffset = isReduced ? { x: 0, y: 0 } : { x: coords.x * -4, y: coords.y * -2 };
  // Layer 2 (Mid-ground decorative city) moves moderately
  const midOffset = isReduced ? { x: 0, y: 0 } : { x: coords.x * -10, y: coords.y * -5 };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none bg-[#DFF4FF]">
      
      {/* Playful keyfamed styles inside the component block */}
      <style>{`
        @keyframes verticalDrift {
          0% {
            transform: translateY(-80px) translateX(0px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(108vh) translateX(30px) rotate(360deg);
            opacity: 0;
          }
        }
        .anim-falling-snow {
          animation: verticalDrift var(--fall-duration) linear infinite;
        }
        .retro-cloud {
          border-radius: 9999px;
          background-color: rgba(255, 255, 255, 0.45);
        }
      `}</style>

      {/* 2D Soft sky gradient overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#DFF4FF] via-[#E6F7FF] to-[#CDEFFF] opacity-100"
        style={{
          transform: `translate3d(${farOffset.x}px, ${farOffset.y}px, 0)`,
          transition: isReduced ? 'none' : 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      />

      {/* Decorative fluffy pixel cloud shapes */}
      <div className="absolute top-[12%] left-[15%] w-24 h-6 retro-cloud opacity-40"></div>
      <div className="absolute top-[20%] right-[20%] w-36 h-8 retro-cloud opacity-35"></div>
      <div className="absolute top-[8%] right-[45%] w-16 h-5 retro-cloud opacity-30"></div>

      {/* Ambient sun-glow behind the main panel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-[#FFF6E8]/30 rounded-full blur-[80px] pointer-events-none z-0"></div>

      {/* Layer 2: Charming Mid-ground Game City Silhouettes in beautiful Pale Aqua */}
      <div 
        className="absolute bottom-0 inset-x-0 h-48 pointer-events-none"
        style={{
          transform: `translate3d(${midOffset.x}px, ${midOffset.y}px, 0)`,
          transition: isReduced ? 'none' : 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {/* Playful blocky city shapes using `#CDEFFF` (Pale Aqua) and `#BFEDFF` */}
        
        {/* Cute block 1: ATM-Kiosk style outline */}
        <div className="absolute bottom-8 left-[12%] w-20 h-28 bg-[#CDEFFF]/70 rounded-t-xl border-t-4 border-x-4 border-[#BFEDFF]">
          {/* Green ATM symbol */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[#6FD08C] bg-white px-1.5 py-0.5 rounded border border-[#6FD08C]/40">ATM</div>
        </div>

        {/* Cute block 2: 24h Convenience Mini-Market silhouette */}
        <div className="absolute bottom-8 right-[15%] w-36 h-32 bg-[#CDEFFF]/80 rounded-t-2xl border-t-4 border-x-4 border-[#BFEDFF]">
          {/* Triangular market overhang styling */}
          <div className="absolute -top-3 left-0 right-0 h-4 bg-[#FF7AA2]/40 rounded-full flex justify-between px-2 text-[8px] font-bold text-[#4A3A2A]/40 font-mono">
            <span>🏪</span>
            <span>MART</span>
          </div>
          {/* Tiny glowing safe-choices check indicator */}
          <div className="absolute top-8 left-4 text-xs">🍏</div>
          <div className="absolute top-8 right-4 text-xs">🛍️</div>
        </div>

        {/* Random playful high-rises in background wrapper */}
        <div className="absolute bottom-8 left-[24%] w-16 h-40 bg-[#CDEFFF]/45 rounded-t-lg"></div>
        <div className="absolute bottom-8 left-[40%] w-24 h-16 bg-[#CDEFFF]/35 rounded-t-lg"></div>
        <div className="absolute bottom-8 right-[32%] w-14 h-36 bg-[#CDEFFF]/50 rounded-t-lg"></div>

        {/* 2D Ground Road Strip near bottom */}
        <div className="absolute bottom-0 inset-x-0 h-8 bg-[#CDEFFF] border-t-4 border-[#BFEDFF] flex items-center justify-around px-8">
          <div className="w-12 h-1 bg-white/40 rounded"></div>
          <div className="w-12 h-1 bg-white/40 rounded"></div>
          <div className="w-12 h-1 bg-white/40 rounded"></div>
          <div className="w-12 h-1 bg-white/40 rounded"></div>
          <div className="w-12 h-1 bg-white/40 rounded"></div>
        </div>
      </div>

      {/* Layer 3: Gentle Financial Snowfall particle drift (Snow-Rain model) */}
      <div className="absolute inset-0 z-10 w-full h-full">
        {INITIAL_PARTICLES.map((p) => {
          let customClass = 'anim-falling-snow ';
          
          if (p.type === 'need') {
            customClass += 'text-[9px] font-pixel tracking-wider px-2.5 py-1 border border-[#6FD08C]/30 bg-white/90 rounded-full text-[#6FD08C] font-semibold whitespace-nowrap shadow-sm';
          } else if (p.type === 'want') {
            customClass += 'text-[9px] font-pixel tracking-wider px-2.5 py-1 border border-[#FF7AA2]/30 bg-white/95 rounded-full text-[#FF7AA2] font-semibold whitespace-nowrap shadow-sm';
          } else if (p.type === 'paylater') {
            customClass += 'text-[9px] font-pixel tracking-wider px-2.5 py-1 border border-[#9B8CFF]/30 bg-white/95 rounded-full text-[#9B8CFF] font-semibold whitespace-nowrap shadow-sm';
          } else if (p.type === 'danger') {
            customClass += 'text-[9px] font-mono tracking-wider px-2 py-0.5 border border-[#FF6B6B]/30 bg-white/95 rounded text-[#FF6B6B] font-bold whitespace-nowrap shadow-sm';
          } else {
            customClass += 'text-lg drop-shadow-sm filter';
          }

          // Generate stable randomized speed & delay factors
          const fallSeed = p.speed;
          const fallTime = 14 / fallSeed; // 10 to 20 seconds falling travel time

          return (
            <div
              key={p.id}
              className="absolute select-none pointer-events-none"
              style={{
                left: `${p.x}%`,
                // Embed custom property variables securely
                '--fall-duration': `${fallTime}s`,
                animationDelay: `${p.id * 0.65}s`,
                transform: `scale(${p.scale}) rotate(${p.angle}deg)`,
              } as React.CSSProperties}
            >
              <div className={customClass}>{p.text}</div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
