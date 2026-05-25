import React from 'react';
import { 
  Play, 
  HelpCircle, 
  Award, 
  LogIn, 
  Coins, 
  Settings, 
  Calendar, 
  Receipt,
  User,
  Coffee,
  PiggyBank,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import ParallaxGameBackground from '@/components/landing/ParallaxGameBackground';

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
          <button 
            type="button"
            className="w-8 h-8 rounded-full bg-[#FFF6E8] hover:bg-white border-2 border-[#8B5E3C] flex items-center justify-center text-[#4A3A2A] transition-all shadow-[0_3px_0_#8B5E3C] active:translate-y-[2px] active:shadow-[0_1px_0_#8B5E3C] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF9F1C]"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
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
          <div className="space-y-3 sm:space-y-3.5">
            
            {/* Primary Action Button: PLAY (Sunny Yellow #FFC857 & shadow alignment) */}
            <button 
              type="button"
              className="group relative w-full bg-[#FFC857] hover:bg-[#FF9F1C] text-[#4A3A2A] font-black py-4.5 px-6 uppercase rounded-2xl transition-all duration-75 border-2 border-[#FFF6E8] border-b-6 border-b-[#8B5E3C] active:border-b-2 active:translate-y-[4px] cursor-pointer flex items-center justify-center gap-3 font-pixel select-none shadow-[0_8px_16px_rgba(139,94,60,0.12)] btn-shimmer overflow-hidden focus-visible:outline-4 focus-visible:outline-[#FF9F1C]"
            >
              <Play className="w-4 h-4 fill-[#4A3A2A] stroke-[#4A3A2A]" />
              <span className="text-xs sm:text-sm tracking-widest">PLAY GAME</span>
            </button>

            {/* Minor grid-aligned options */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                className="group relative bg-[#FFF6E8] hover:bg-white text-[#4A3A2A] border-2 border-[#8B5E3C] border-b-4 border-b-[#8B5E3C] active:border-b-2 active:translate-y-[2px] cursor-pointer text-[9px] sm:text-[10px] font-pixel py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF9F1C]"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#6FD08C]" />
                <span>HOW TO PLAY</span>
              </button>

              <button 
                type="button"
                className="group relative bg-[#FFF6E8] hover:bg-white text-[#4A3A2A] border-2 border-[#8B5E3C] border-b-4 border-b-[#8B5E3C] active:border-b-2 active:translate-y-[2px] cursor-pointer text-[9px] sm:text-[10px] font-pixel py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF9F1C]"
              >
                <User className="w-3.5 h-3.5 text-[#9B8CFF]" />
                <span>CHOOSE ROLE</span>
              </button>
            </div>

            {/* Leaderboard stats trigger */}
            <button 
              type="button"
              className="group relative w-full bg-[#FFF6E8] hover:bg-white text-[#4A3A2A] border-2 border-[#8B5E3C] border-b-4 border-b-[#8B5E3C] active:border-b-2 active:translate-y-[2px] cursor-pointer text-[9px] sm:text-[10px] font-pixel py-3.5 rounded-xl transition-all flex items-center justify-center gap-2.5 uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF9F1C]"
            >
              <Award className="w-4 h-4 text-[#FF9F1C]" />
              <span>LEADERBOARD STATS</span>
            </button>

            {/* Clean line separation */}
            <div className="h-[2px] bg-[#8B5E3C]/20 my-2"></div>

            {/* Google sign-in action button */}
            <button 
              type="button"
              className="group w-full bg-[#FFF1C7] hover:bg-white text-[10px] sm:text-xs text-[#4A3A2A] font-bold py-3.5 rounded-xl border-2 border-[#8B5E3C] shadow-[0_3px_0_#8B5E3C] active:translate-y-[2px] active:shadow-[0_1px_0_#8B5E3C] transition-all uppercase font-mono tracking-wider flex items-center justify-center gap-2.5 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF9F1C]"
            >
              <LogIn className="w-3.5 h-3.5 text-[#FF7AA2]" />
              <span>LOGIN TO SAVE SCORE</span>
            </button>
          </div>

          {/* Small compact game tracking mini timeline calendar inside the console */}
          <div className="mt-5 bg-[#CDEFFF]/40 border-2 border-[#8B5E3C]/45 rounded-xl p-3 text-left">
            <div className="flex items-center justify-between text-[8px] font-mono uppercase text-[#4A3A2A] mb-1.5 font-bold tracking-wider">
              <span className="flex items-center gap-1 text-[#FF9F1C]">📅 SURVIVAL TARGET</span>
              <span>Day 1 → Day 30</span>
            </div>
            {/* Shimmering indicator line */}
            <div className="relative w-full h-2 bg-white/95 border border-[#8B5E3C]/30 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-3/4 bg-gradient-to-r from-[#FFC857] to-[#FF9F1C] rounded-full"></div>
              {/* Mark dangerous days in Coral Red */}
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#FF6B6B]" title="Late month chaos threshold"></div>
            </div>
            <div className="flex justify-between items-center text-[7px] font-mono text-slate-500 mt-1 uppercase font-semibold">
              <span className="text-[#6FD08C]">Day 01 Payday</span>
              <span className="text-[#FF6B6B]">Day 30 Crisis</span>
            </div>
          </div>

        </div>

        {/* Humorous financial ledger mini receipt paper block (#FFF1C7 as asked) */}
        <div className="w-[88%] mt-4 bg-[#FFF1C7] text-[#4A3A2A] border-2 border-[#8B5E3C] shadow-[0_6px_0_rgba(139,94,60,0.15)] p-3.5 font-mono rounded-xl text-[9px] flex flex-col gap-1 select-none">
          <div className="flex justify-between font-bold border-b-2 border-dashed border-[#8B5E3C]/30 pb-1.5 mb-1.5 uppercase tracking-wider">
            <span className="flex items-center gap-1">🧾 DAILY ACCOUNTING</span>
            <span>DAY 20</span>
          </div>
          <div className="space-y-0.5 text-[#4A3A2A]/85">
            <div className="flex justify-between">
              <span>- Coffee Temptation</span>
              <span className="text-[#FF7AA2] font-bold">-$6.50</span>
            </div>
            <div className="flex justify-between">
              <span>- Paylater Traps</span>
              <span className="text-[#9B8CFF] font-bold">-$24.00</span>
            </div>
            <div className="flex justify-between">
              <span>- Healthy Organic Needs</span>
              <span className="text-[#6FD08C] font-bold">✓ -$10.00</span>
            </div>
          </div>
          <div className="border-t-2 border-dashed border-[#8B5E3C]/30 mt-1.5 pt-1.5 flex justify-between font-bold text-[#4A3A2A] uppercase text-[8px]">
            <span>AI ROAST RISK LEVEL:</span>
            <span className="text-[#FF6B6B] animate-pulse">💸 COFFEE ADDICT INSOLVENCY</span>
          </div>
        </div>

      </main>


      {/* ========================================== */}
      {/* ================ LOBBY FOOTER ============ */}
      {/* ========================================== */}
      <footer className="relative w-full max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center text-[9px] text-[#4A3A2A]/55 font-mono pt-4 border-t-2 border-[#8B5E3C]/15 z-30 uppercase tracking-wider gap-3 sm:gap-0 font-bold">
        <div>v1.2.0-STABLE</div>
        <div className="text-[#6FD08C] bg-white border-2 border-[#8B5E3C] rounded-full px-3 py-0.5 shadow-sm font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-[#6FD08C] rounded-full pulse-indicator"></span>
          CONSOLE INTERACTION SAFE
        </div>
        <div>ARCADE CABINET // PORT 3000</div>
      </footer>

    </div>
  );
}
