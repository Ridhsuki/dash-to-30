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
  ExternalLink
} from 'lucide-react';
import ParallaxGameBackground from '@/components/landing/ParallaxGameBackground';

export default function HomePage() {
  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden bg-[#0B1020] text-[#FFF7E6] flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none font-sans">
      
      {/* 1. Custom CSS Keyframes for tactile indie-game menu rendering */}
      <style>{`
        @keyframes menuBounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .anim-menu-idle {
          animation: menuBounce 6s ease-in-out infinite;
        }
        .text-neon-glow {
          text-shadow: 0 0 10px rgba(255, 209, 102, 0.4);
        }
        .btn-shimmer::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: all 0.6s;
        }
        .btn-shimmer:hover::after {
          animation: shine 1.2s infinite;
        }
      `}</style>

      {/* 2. Parallax Game Layer Background Component (Renders client hooks & particles) */}
      <ParallaxGameBackground />

      {/* CRT Grid screen scanner filter */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:100%_4px] opacity-40 z-20"></div>
      <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-transparent via-[#0B1020]/20 to-[#0B1020]/80 z-25"></div>

      {/* ========================================== */}
      {/* ================ HEADER NAV ============= */}
      {/* ========================================== */}
      <header className="relative w-full max-w-5xl mx-auto flex items-center justify-between z-30 transition-all">
        {/* Top-Left: Mini Dashboard Coin Badge (Instead of generic profile) */}
        <div className="flex items-center gap-2.5 bg-[#141B3D]/80 border-2 border-slate-800 backdrop-blur-md rounded-full px-3.5 py-1.5 shadow-xl">
          <div className="w-5 h-5 rounded-full bg-[#FFD166] border border-[#FF9F1C] flex items-center justify-center font-bold text-[#0B1020] text-[10px] sm:text-xs">
            $
          </div>
          <span className="text-[9px] font-pixel tracking-widest text-[#FFD166] font-bold uppercase">
            UNIT PRE-GAME
          </span>
        </div>

        {/* Top-Right: Settings, Language Pill and Status */}
        <div className="flex items-center gap-2">
          {/* Subtle info pill */}
          <div className="hidden sm:inline-flex items-center gap-1.5 bg-[#2EC27E]/10 border border-[#2EC27E]/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2EC27E] animate-pulse"></span>
            <span className="text-[9px] font-mono font-semibold text-[#2EC27E] tracking-wider uppercase">
              Day 1: Fresh Payday
            </span>
          </div>

          <button 
            type="button"
            className="w-8 h-8 rounded-full bg-[#141B3D]/80 hover:bg-[#141B3D] border-2 border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md active:scale-95 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FFD166]"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================== */}
      {/* ============ MAIN GAME CENTER MENU ======= */}
      {/* ========================================== */}
      <main className="relative flex-1 flex flex-col items-center justify-center z-30 w-full max-w-sm sm:max-w-md mx-auto py-4 select-none">
        
        {/* Center menu panel styled as a compact gaming terminal console */}
        <div className="relative w-full bg-[#141B3D]/95 border-4 border-slate-800 rounded-3xl p-5 sm:p-7 shadow-[0_24px_50px_-12px_rgba(11,16,32,0.8)] md:shadow-[0_24px_40px_rgba(255,209,102,0.04)] anim-menu-idle">
          
          {/* Decorative receipt paper tag sticking out the top */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[70%] h-4 bg-[#FFF1C7] border-t-2 border-x-2 border-slate-800 rounded-t-md flex items-center justify-between px-2 text-[7px] text-slate-800 font-mono tracking-widest uppercase">
            <span>RECEIPT #030</span>
            <span>BUDGET: SAFE</span>
          </div>

          {/* Interactive Title & Brand Area */}
          <div className="text-center mb-6 pt-1">
            <h1 className="font-pixel text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#FFD166] uppercase drop-shadow-[0_4px_0_#FF9F1C] select-none text-neon-glow">
              DASH TO 30
            </h1>
            <p className="text-[10px] sm:text-xs text-[#FFF7E6]/70 uppercase tracking-widest font-mono font-bold mt-2">
              Survive until payday.
            </p>
          </div>

          {/* ================= BUTTON STACK ================= */}
          <div className="space-y-3 sm:space-y-3.5">
            {/* Primary Action: PLAY */}
            <button 
              type="button"
              className="group relative w-full bg-[#FFD166] hover:bg-[#FF9F1C] text-[#0B1020] font-black py-4 px-6 uppercase rounded-2xl transition-all duration-75 border-2 border-[#FFF7E6] border-b-6 border-b-[#FF9F1C] active:border-b-2 active:translate-y-[4px] cursor-pointer flex items-center justify-center gap-3 font-pixel select-none shadow-[0_8px_20px_rgba(255,209,102,0.2)] hover:shadow-[0_12px_24px_rgba(255,159,28,0.35)] btn-shimmer overflow-hidden focus-visible:outline-4 focus-visible:outline-[#FFD166]"
            >
              <Play className="w-4 h-4 fill-[#0B1020] stroke-[#0B1020]" />
              <span className="text-xs sm:text-sm tracking-widest">PLAY GAME</span>
            </button>

            {/* Minor stacked actions */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                className="group relative bg-[#141B3D] hover:bg-[#141B3D]/70 text-[#FFF7E6]/90 hover:text-white border-2 border-slate-800 border-b-4 border-b-slate-900/90 active:border-b-2 active:translate-y-[2px] cursor-pointer text-[9px] sm:text-[10px] font-pixel py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FFD166]"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#2EC27E]" />
                <span>HOW TO PLAY</span>
              </button>

              <button 
                type="button"
                className="group relative bg-[#141B3D] hover:bg-[#141B3D]/70 text-[#FFF7E6]/90 hover:text-white border-2 border-slate-800 border-b-4 border-b-slate-900/90 active:border-b-2 active:translate-y-[2px] cursor-pointer text-[9px] sm:text-[10px] font-pixel py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FFD166]"
              >
                <User className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>CHOOSE ROLE</span>
              </button>
            </div>

            <button 
              type="button"
              className="group relative w-full bg-[#141B3D] hover:bg-[#141B3D]/70 text-[#FFF7E6]/90 hover:text-white border-2 border-slate-800 border-b-4 border-b-slate-900/90 active:border-b-2 active:translate-y-[2px] cursor-pointer text-[9px] sm:text-[10px] font-pixel py-3 rounded-xl transition-all flex items-center justify-center gap-2.5 uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FFD166]"
            >
              <Award className="w-4 h-4 text-[#FFD166]" />
              <span>LEADERBOARD STATS</span>
            </button>

            <div className="h-[1px] bg-slate-800/80 my-2"></div>

            <button 
              type="button"
              className="group w-full bg-slate-950/40 hover:bg-slate-950/80 text-xs text-slate-400 hover:text-[#FFF7E6] py-3 rounded-xl border border-slate-800 transition-colors uppercase font-mono tracking-wider flex items-center justify-center gap-2 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FFD166]"
            >
              <LogIn className="w-3.5 h-3.5 text-[#EF476F]" />
              <span>LOGIN TO SAVE SCORE</span>
            </button>
          </div>

          {/* Decorative mini status ribbon inside center panel */}
          <div className="mt-5 border border-dashed border-slate-850 bg-slate-950/40 rounded-xl p-2.5 text-center flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF476F] inline-block"></span>
            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest select-none">
              Impulse Temptation Status // HIGH ACCELERATION
            </span>
          </div>

        </div>

        {/* Small floating "Receipt Strip" decor element below console */}
        <div className="w-[85%] mt-4 bg-[#FFF1C7] text-slate-900 border-2 border-slate-800 shadow-md p-3.5 font-mono rounded-xl text-[9px] flex flex-col gap-1 select-none">
          <div className="flex justify-between font-bold border-b border-dashed border-slate-500/50 pb-1 uppercase tracking-wider">
            <span>TEMPTATION ACCOUNTING</span>
            <span>DAY 20</span>
          </div>
          <div className="space-y-0.5 text-slate-850">
            <div className="flex justify-between">
              <span>- Impulse Coffee</span>
              <span className="text-[#EF476F] font-bold">-$6.50</span>
            </div>
            <div className="flex justify-between">
              <span>- Paylater Trap</span>
              <span className="text-[#8B5CF6] font-bold">-$24.00</span>
            </div>
            <div className="flex justify-between">
              <span>- Secure Net Interest</span>
              <span className="text-[#2EC27E] font-bold">+$15.00</span>
            </div>
          </div>
          <div className="border-t border-dashed border-slate-500/50 mt-1 pt-1 flex justify-between font-bold text-slate-950 uppercase text-[8px]">
            <span>AI Roast Severity</span>
            <span className="text-[#E63946]">🚨 ACTIVE COFFEE ADDICT</span>
          </div>
        </div>

      </main>

      {/* ========================================== */}
      {/* ================ LOBBY FOOTER ============ */}
      {/* ========================================== */}
      <footer className="relative w-full max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 font-mono pt-4 border-t border-slate-900/60 z-30 uppercase tracking-wider gap-3 sm:gap-0 font-medium">
        <div>v1.2.0-STABLE</div>
        <div className="text-emerald-500 bg-slate-950/80 border border-slate-800 rounded-full px-3 py-1 font-semibold">
          UNIT STATUS: STABLE INTERACTION
        </div>
        <div>ARCADE CONSOLE // PORT 3000</div>
      </footer>

    </div>
  );
}
