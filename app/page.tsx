import React from "react";
import HomeSettingsButton from "@/components/landing/HomeSettingsButton";
import GlobalToaster from "@/components/landing/GlobalToaster";
import ParallaxGameBackground from "@/components/landing/ParallaxGameBackground";
import MenuActions from "@/components/landing/MenuActions";

export default function HomePage() {
  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden bg-[#DFF4FF] text-[#4A3A2A] flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none font-sans">
      {/* 1. Custom CSS animations for a cozy, tactile, toy-like indie game UI feel */}
      <style>{`
        @keyframes menuDrift {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(0.5deg); }
        }
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .anim-menu-box {
          animation: menuDrift 6s ease-in-out infinite;
        }
        .btn-shimmer::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          transition: all 0.6s;
        }
        .btn-shimmer:hover::after {
          animation: shine 1.3s infinite;
        }
        @keyframes indicatorWave {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .pulse-indicator {
          animation: indicatorWave 2s infinite ease-in-out;
        }
      `}</style>

      <GlobalToaster />

      {/* 2. Soft, Branded Parallax Background with Falling Financial Snow Dust & silhouettes */}
      <ParallaxGameBackground />

      {/* Screen scanlines & vignette edges for playful retro arcade focus */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100%_4px] opacity-30 z-20"></div>
      <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-transparent via-[#4A3A2A]/5 to-[#4A3A2A]/20 z-25"></div>

      {/* ========================================== */}
      {/* ================ HEADER NAV ============= */}
      {/* ========================================== */}
      <header className="relative w-full max-w-5xl mx-auto flex items-center justify-between z-30 transition-all">
        {/* Top-Left: Playful Dash-to-30 Piggy Coin Badge */}
        <div className="flex items-center gap-2 bg-[#FFF6E8] border-2 border-[#8B5E3C] rounded-full px-3 py-1.5 shadow-[0_4px_0_#8B5E3C]">
          <div className="w-5 h-5 rounded-full bg-[#FFC857] border border-[#FF9F1C] flex items-center justify-center font-bold text-[#4A3A2A] text-xs shadow-sm">
            $
          </div>
          <span className="text-[10px] font-pixel tracking-widest text-[#4A3A2A] font-bold uppercase">
            PAYDAY LOBBY
          </span>
        </div>

        {/* Top-Right: Setting pill buttons with minimal text */}
        <div className="flex items-center gap-2">
          {/* Calendar status pill in Mint Green for Needs/Positive aspect */}
          <div className="hidden sm:inline-flex items-center gap-1.5 bg-[#6FD08C]/15 border-2 border-[#6FD08C]/55 rounded-full px-3.5 py-1">
            <span className="w-2 h-2 rounded-full bg-[#6FD08C] pulse-indicator"></span>
            <span className="text-[9px] font-mono font-bold text-[#4A3A2A] tracking-wider uppercase">
              Day 1: Fresh Paycheck
            </span>
          </div>

          {/* Quiet Settings trigger */}
          <HomeSettingsButton />
        </div>
      </header>

      {/* ========================================== */}
      {/* ============ CENTER MAIN CONSOLE MENU ==== */}
      {/* ========================================== */}
      <main className="relative flex-1 flex flex-col items-center justify-center z-30 w-full max-w-sm sm:max-w-md mx-auto py-2 select-none">
        {/* The Game Start Menu Card - styled in Warm Cream #FFF6E8 */}
        <div className="relative w-full bg-[#FFF6E8] border-4 border-[#8B5E3C] rounded-3xl p-5 sm:p-7 shadow-[0_16px_32px_rgba(139,94,60,0.18)] anim-menu-box">
          {/* Receipt strip head decoration popping out from original design parameters */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-[75%] h-5 bg-[#FFF1C7] border-2 border-[#8B5E3C] border-b-0 rounded-t-lg flex items-center justify-between px-3 text-[8px] text-[#4A3A2A] font-mono tracking-widest uppercase font-bold">
            <span>START UNIT</span>
            <span className="text-[#6FD08C]">✓ READY</span>
          </div>

          {/* Interactive Title & Main Tagline */}
          <div className="text-center mb-6 pt-1">
            <h1 className="font-pixel text-4xl sm:text-5xl font-bold tracking-tight text-[#FF9F1C] uppercase drop-shadow-[0_4px_0_#8B5E3C] select-none text-shadow">
              DASH TO 30
            </h1>
            <p className="text-[10px] sm:text-xs text-[#4A3A2A]/70 uppercase tracking-widest font-mono font-bold mt-2 flex items-center justify-center gap-1">
              <span>★</span> Survive your spending until payday. <span>★</span>
            </p>
          </div>

          {/* ================= INTEGRATED GAME ACTION CONTROLS ================= */}
          <MenuActions />

          {/* Small compact game tracking mini timeline calendar inside the console */}
          <div className="mt-5 bg-[#CDEFFF]/40 border-2 border-[#8B5E3C]/45 rounded-xl p-3 text-left">
            <div className="flex items-center justify-between text-[8px] font-mono uppercase text-[#4A3A2A] mb-1.5 font-bold tracking-wider">
              <span className="flex items-center gap-1 text-[#FF9F1C]">
                📅 SURVIVAL TARGET
              </span>
              <span>Day 1 → Day 30</span>
            </div>
            {/* Shimmering indicator line */}
            <div className="relative w-full h-2 bg-white/95 border border-[#8B5E3C]/30 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-3/4 bg-gradient-to-r from-[#FFC857] to-[#FF9F1C] rounded-full"></div>
              {/* Mark dangerous days in Coral Red */}
              <div
                className="absolute right-0 top-0 bottom-0 w-1 bg-[#FF6B6B]"
                title="Late month chaos threshold"
              ></div>
            </div>
            <div className="flex justify-between items-center text-[7px] font-mono text-slate-500 mt-1 uppercase font-semibold">
              <span className="text-[#6FD08C]">Day 01 Payday</span>
              <span className="text-[#FF6B6B]">Day 30 Crisis</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
