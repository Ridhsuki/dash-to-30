import { Play, LogIn, Globe, Award, Coins } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between overflow-x-hidden bg-slate-900 text-slate-100 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px]">
      {/* Dynamic light scanline overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:100%_6px] opacity-30 z-50"></div>
      
      {/* 1. Header Section */}
      <header className="w-full max-w-5xl px-4 pt-6 z-40">
        <div className="flex flex-col md:flex-row items-center justify-between bg-slate-950/80 rounded-2xl border border-slate-800 p-4 md:px-6 shadow-xl backdrop-blur-md">
          {/* Top Info Indicator */}
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="text-[10px] font-pixel tracking-widest text-emerald-400 uppercase">
              1P READY // RETIRE RESILIENT
            </div>
          </div>

          {/* Pill-shaped modern toggles for Language & Currency */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            {/* Language toggle selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" /> LANG
              </span>
              <div className="inline-flex rounded-full p-1 bg-slate-900 border border-slate-800/80">
                <button className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase rounded-full px-3 py-1 transition-all">
                  EN
                </button>
                <button className="text-slate-500 hover:text-slate-300 text-[10px] font-bold uppercase rounded-full px-3 py-1 transition-all">
                  ID
                </button>
              </div>
            </div>

            {/* Currency toggle selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-slate-400" /> CURR
              </span>
              <div className="inline-flex rounded-full p-1 bg-slate-900 border border-slate-800/80">
                <button className="bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[10px] font-bold uppercase rounded-full px-3 py-1 transition-all">
                  $
                </button>
                <button className="text-slate-500 hover:text-slate-300 text-[10px] font-bold uppercase rounded-full px-3 py-1 transition-all">
                  RP
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl px-4 flex-1 flex flex-col items-center justify-center py-10 z-40">
        
        {/* 2. Hero Section */}
        <section className="text-center mb-10 select-none">
          <div className="relative inline-block mb-4">
            {/* Soft backdrop glow to center title */}
            <div className="absolute inset-x-0 -bottom-2 h-16 bg-gradient-to-t from-emerald-500/10 to-transparent blur-xl"></div>
            
            <h1 className="relative font-pixel text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-amber-400 uppercase select-none drop-shadow-[0_4px_0_rgba(180,83,9,1)]">
              DASH TO 30
            </h1>
          </div>

          <p className="mt-6 text-xs text-slate-400 max-w-xl mx-auto leading-relaxed border-y border-slate-800/80 py-4 uppercase tracking-widest font-semibold">
            THE FINANCIAL SURVIVAL CHALLENGE — AN 8-BIT RUNNER DEMONSTRATING REAL-WORLD{" "}
            <span className="text-emerald-400 font-bold">FINANCIAL DECISION MAKING</span>. Can you retire resiliently?
          </p>
        </section>

        {/* 3. Action Section */}
        <section className="w-full max-w-2xl mx-auto mb-12 flex flex-col sm:flex-row gap-6 justify-center">
          {/* Play as Guest button */}
          <button className="group relative flex-grow bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs md:text-sm py-4 pb-[18px] px-8 border-2 border-slate-950 border-b-6 border-b-emerald-700 uppercase cursor-pointer rounded-xl transition-all duration-75 active:border-b-2 active:translate-y-[4px] flex items-center justify-center gap-3 font-pixel">
            <Play className="w-4 h-4 fill-slate-950 stroke-slate-950 animate-bounce" />
            <span>PLAY AS GUEST</span>
          </button>

          {/* Login with Google button */}
          <button className="group relative flex-grow bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs md:text-sm py-4 pb-[18px] px-8 border-2 border-slate-950 border-b-6 border-b-amber-600 uppercase cursor-pointer rounded-xl transition-all duration-75 active:border-b-2 active:translate-y-[4px] flex items-center justify-center gap-3 font-pixel">
            <LogIn className="w-4 h-4" />
            <span>GOOGLE LOGIN</span>
          </button>
        </section>

        {/* 4. Leaderboard Section */}
        <section className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-center gap-3 mb-6 border-b border-slate-800 pb-5">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="font-pixel text-2xs sm:text-xs font-bold text-center text-amber-400 uppercase tracking-widest">
              FINANCIAL RESILIENCE LEDGER
            </h2>
            <Award className="w-5 h-5 text-amber-400" />
          </div>

          <div className="bg-transparent">
            {/* Headers Row */}
            <div className="grid grid-cols-12 gap-3 text-slate-400 mb-4 px-4 text-xs font-bold uppercase tracking-wider font-mono">
              <div className="col-span-2">RANK</div>
              <div className="col-span-6">RESILIENT HERO</div>
              <div className="col-span-4 text-right">NET WORTH score</div>
            </div>

            {/* List items structured beautifully container */}
            <div className="space-y-3">
              {/* Row 1 Highlights */}
              <div className="grid grid-cols-12 gap-3 text-sm p-4 bg-slate-900 hover:bg-slate-800/80 transition-colors border border-slate-800/50 rounded-xl font-mono items-center">
                <div className="col-span-2 text-emerald-400 font-bold text-base font-pixel">01</div>
                <div className="col-span-6 text-slate-100 font-medium uppercase tracking-wider">WAITING_FOR_DASHERS...</div>
                <div className="col-span-4 text-right text-amber-400 font-bold text-base">$0.00</div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-12 gap-3 text-sm p-4 bg-slate-900/50 hover:bg-slate-800/50 transition-colors border border-slate-900 rounded-xl font-mono items-center">
                <div className="col-span-2 text-slate-400 font-bold text-base font-pixel">02</div>
                <div className="col-span-6 text-slate-400 font-medium uppercase tracking-wider">TRIAL_PENDING</div>
                <div className="col-span-4 text-right text-amber-400/80 font-bold text-base">$0.00</div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-12 gap-3 text-sm p-4 bg-slate-900/50 hover:bg-slate-800/50 transition-colors border border-slate-900 rounded-xl font-mono items-center">
                <div className="col-span-2 text-slate-400 font-bold text-base font-pixel">03</div>
                <div className="col-span-6 text-slate-400 font-medium uppercase tracking-wider">TRIAL_PENDING</div>
                <div className="col-span-4 text-right text-amber-400/80 font-bold text-base">$0.00</div>
              </div>
            </div>

            {/* Custom Empty Notification Card with clean white-hot-neon accents */}
            <div className="mt-8 border border-dashed border-slate-800 bg-slate-900/40 rounded-xl p-4 text-center">
              <p className="text-[11px] text-slate-400 uppercase leading-relaxed tracking-wider font-semibold">
                NO TRANSACTIONS COMMITTED BY ACTIVE HEROES YET.
                <br />
                <span className="text-amber-400 font-pixel text-[10px] inline-block mt-2 tracking-wide animate-pulse">★ SURVIVE TO AGE 30, MANAGE INTEREST & CLAIM HIGHEST WORTH ★</span>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Game Cabinet Footer Decor with high density design styles */}
      <footer className="w-full max-w-5xl px-4 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 pt-6 pb-8 border-t border-slate-800/60 bg-transparent z-40 mt-12 uppercase tracking-wider gap-4 sm:gap-0 font-medium font-mono">
        <div>VER 1.1.0-STABLE</div>
        <div className="text-emerald-500 font-semibold flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          SERVER SECURE // PORT 3000
        </div>
        <div>COPYRIGHT © 2026 DASH_TO_30_STUDIOS</div>
      </footer>
    </div>
  );
}
