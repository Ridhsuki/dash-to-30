'use client';

import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  type: 'coin' | 'need' | 'want' | 'paylater' | 'danger' | 'receipt';
  text: string;
  color: string;
  x: number; // percentage left
  y: number; // percentage top
  scale: number;
  angle: number;
  speed: number;
}

const INITIAL_PARTICLES: Particle[] = [
  { id: 1, type: 'coin', text: '🪙', color: '#FFD166', x: 15, y: 20, scale: 1.1, angle: 12, speed: 1.2 },
  { id: 2, type: 'coin', text: '$', color: '#FFD166', x: 28, y: 75, scale: 0.9, angle: -15, speed: 0.8 },
  { id: 3, type: 'need', text: '✓ Needs', color: '#2EC27E', x: 12, y: 55, scale: 0.9, angle: -5, speed: 0.5 },
  { id: 4, type: 'want', text: 'Pink Tag', color: '#EF476F', x: 84, y: 18, scale: 1.0, angle: 25, speed: 0.7 },
  { id: 5, type: 'paylater', text: 'Paylater 💜', color: '#8B5CF6', x: 78, y: 65, scale: 1.0, angle: 10, speed: 1.0 },
  { id: 6, type: 'danger', text: '⚠️ Bills', color: '#E63946', x: 88, y: 42, scale: 1.1, angle: -8, speed: 1.1 },
  { id: 7, type: 'receipt', text: '📄', color: '#FFF1C7', x: 45, y: 15, scale: 1.2, angle: -20, speed: 0.6 },
  { id: 8, type: 'coin', text: 'Rp', color: '#FFD166', x: 62, y: 82, scale: 0.9, angle: 30, speed: 1.3 },
  { id: 9, type: 'want', text: '🛍️', color: '#EF476F', x: 74, y: 10, scale: 1.0, angle: -12, speed: 0.8 },
  { id: 10, type: 'danger', text: '💸', color: '#E63946', x: 5, y: 85, scale: 1.1, angle: 35, speed: 1.4 },
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

    // Track cursor movement
    if (!initialReduced) {
      const handleMouseMove = (e: MouseEvent) => {
        // Normalize screen center as 0,0
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
  // Layer 1 (Far silhouette) moves very little
  const farOffset = isReduced ? { x: 0, y: 0 } : { x: coords.x * -6, y: coords.y * -4 };
  // Layer 2 (Mid-ground details/mesh) moves moderately
  const midOffset = isReduced ? { x: 0, y: 0 } : { x: coords.x * -14, y: coords.y * -8 };
  // Layer 3 (Foreground particles) floating layers move slightly more
  const foreOffset = isReduced ? { x: 0, y: 0 } : { x: coords.x * 12, y: coords.y * 12 };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Background radial gradient glow (Layer 1 - Far shadow) */}
      <div 
        className="absolute inset-x-0 -bottom-1/4 h-[70vh] bg-gradient-to-t from-[#141B3D]/30 to-transparent blur-[120px]"
        style={{
          transform: `translate3d(${farOffset.x}px, ${farOffset.y}px, 0)`,
          transition: isReduced ? 'none' : 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      />

      {/* Layer 2 - Retro game road/path silhouette & Budget skyline */}
      <div 
        className="absolute bottom-0 inset-x-0 h-40 bg-[#141B3D]/25 border-t border-[#141B3D]/50 blur-[1px]"
        style={{
          transform: `translate3d(${midOffset.x}px, ${midOffset.y}px, 0)`,
          transition: isReduced ? 'none' : 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {/* Subtle decorative "Payday City Skyline" silhouettes built from clean CSS rectangles */}
        <div className="absolute bottom-0 left-[10%] w-24 h-32 bg-[#0B1020]/40 rounded-t-lg border-t border-x border-[#141B3D]/30"></div>
        <div className="absolute bottom-0 left-[18%] w-16 h-20 bg-[#0B1020]/50 rounded-t-lg border-t border-x border-[#141B3D]/40"></div>
        <div className="absolute bottom-0 left-[24%] w-28 h-40 bg-[#0B1020]/30 rounded-t-lg border-t border-x border-[#141B3D]/30"></div>
        <div className="absolute bottom-0 right-[8%] w-32 h-24 bg-[#0B1020]/40 rounded-t-lg border-t border-x border-[#141B3D]/30"></div>
        <div className="absolute bottom-0 right-[25%] w-20 h-36 bg-[#0B1020]/50 rounded-t-lg border-t border-x border-[#141B3D]/40"></div>
        
        {/* Horizontal game floor/road representation */}
        <div className="absolute bottom-0 inset-x-0 h-2 bg-[#141B3D]"></div>
      </div>

      {/* Layer 3 - Interactive Float particles */}
      <div 
        className="absolute inset-0 z-10"
        style={{
          transform: `translate3d(${foreOffset.x}px, ${foreOffset.y}px, 0)`,
          transition: isReduced ? 'none' : 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {INITIAL_PARTICLES.map((p) => {
          let customClass = '';
          
          // Semantic tag decorations
          if (p.type === 'need') {
            customClass = 'text-[9px] font-pixel tracking-widest px-2.5 py-1 border border-[#2EC27E]/30 bg-[#2EC27E]/10 rounded-full text-[#2EC27E] font-semibold';
          } else if (p.type === 'want') {
            customClass = 'text-[9px] font-pixel tracking-widest px-2.5 py-1 border border-[#EF476F]/30 bg-[#EF476F]/10 rounded-full text-[#EF476F] font-semibold';
          } else if (p.type === 'paylater') {
            customClass = 'text-[9px] font-pixel tracking-widest px-2.5 py-1 border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 rounded-full text-[#8B5CF6] font-semibold';
          } else if (p.type === 'danger') {
            customClass = 'text-[9px] font-mono tracking-wider px-2 py-0.5 border border-[#E63946]/30 bg-[#E63946]/10 rounded text-[#E63946] font-bold';
          } else {
            customClass = 'text-xl drop-shadow-md';
          }

          // Gentle animation duration per particle
          const duration = 5 / p.speed;

          return (
            <div
              key={p.id}
              className="absolute select-none opacity-40 hover:opacity-100 transition-opacity"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: `scale(${p.scale}) rotate(${p.angle}deg)`,
                animation: isReduced ? 'none' : `floatParticleCustom ${duration}s ease-in-out infinite alternate`,
                animationDelay: `${p.id * 0.3}s`,
              }}
            >
              <div className={customClass}>{p.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
