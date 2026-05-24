import { Play, LogIn, Globe, Award, Coins } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between overflow-x-hidden bg-[#0a0a0a] text-white bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:20px_20px]">
      {/* Retro Arcade Grid & scanline overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100%_4px] opacity-40 z-50"></div>
      <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-transparent via-black/50 to-[#0a0a0a] z-30"></div>
      
      {/* 1. Header Section */}
      <header className="w-full max-w-5xl px-4 pt-6 z-40">
        <div className="flex flex-col md:flex-row items-center justify-between bg-[#111] border-4 border-white p-4 shadow-[6px_6px_0_0_#333]">
          {/* Top Info Indicator */}
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39ff14] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#39ff14]"></span>
            </span>
            <div className="text-[10px] tracking-widest text-[#39ff14] uppercase">
              1P READY // INSERT COIN: 0.00
            </div>
          </div>

          {/* Dummy Toggles for Language & Currency */}
          <div className="flex flex-wrap gap-4 items-center justify-center">
            {/* Language toggle selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/50 uppercase flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-white/75" /> LANG
              </span>
              <div className="flex border-2 border-white bg-black">
                <button className="bg-white text-black px-3 py-0.5 text-[10px] font-bold uppercase transition-colors">
                  EN
                </button>
                <button className="bg-black text-white hover:bg-white/10 px-3 py-0.5 text-[10px] font-bold uppercase transition-colors">
                  ID
                </button>
              </div>
            </div>

            {/* Currency toggle selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/50 uppercase flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-white/75" /> CURR
              </span>
              <div className="flex border-2 border-white bg-black">
                <button className="bg-white text-black px-3 py-0.5 text-[10px] font-bold uppercase transition-colors">
                  $
                </button>
                <button className="bg-black text-white hover:bg-white/10 px-3 py-0.5 text-[10px] font-bold uppercase transition-colors">
                  RP
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl px-4 flex-1 flex flex-col items-center justify-center py-6 z-40">
        
        {/* 2. Hero Section */}
        <section className="text-center mb-12 select-none">
          <div className="relative inline-block">
            {/* Massive Glowing Title with High Density Shadow */}
            <h1 className="relative text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter text-[#ffd700] drop-shadow-[8px_8px_0_#ff00ff] uppercase select-none animate-pulse">
              DASH TO 30
            </h1>
          </div>

          <p className="mt-6 text-[10px] sm:text-xs text-[#00ffff] max-w-xl mx-auto leading-relaxed border-y-2 border-dashed border-white/20 py-4 uppercase tracking-widest">
            THE FINANCIAL SURVIVAL CHALLENGE — AN 8-BIT RUNNER DEMONSTRATING REAL-WORLD{" "}
            <span className="text-[#39ff14] font-bold">FINANCIAL DECISION MAKING</span>. Can you retire resiliently at age 30?
          </p>
        </section>

        {/* 3. Action Section */}
        <section className="w-full max-w-2xl mx-auto mb-16 flex flex-col sm:flex-row gap-6 justify-center">
          {/* Play as Guest button */}
          <button className="group relative flex-grow bg-[#39ff14] hover:bg-emerald-300 text-black font-black text-base py-5 px-8 border-4 border-black uppercase cursor-pointer transition-all duration-100 shadow-[6px_6px_0_0_#fff] active:translate-x-[4px] active:translate-y-[4px] active:shadow-[2px_2px_0_0_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#fff] flex items-center justify-center gap-3">
            <Play className="w-5 h-5 fill-black stroke-black animate-bounce" />
            <span>PLAY AS GUEST</span>
          </button>

          {/* Login with Google button */}
          <button className="group relative flex-grow bg-[#00ffff] hover:bg-cyan-300 text-black font-black text-base py-5 px-8 border-4 border-black uppercase cursor-pointer transition-all duration-100 shadow-[6px_6px_0_0_#fff] active:translate-x-[4px] active:translate-y-[4px] active:shadow-[2px_2px_0_0_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_0_#fff] flex items-center justify-center gap-3">
            <LogIn className="w-5 h-5 stroke-black" />
            <span>GOOGLE LOGIN</span>
          </button>
        </section>

        {/* 4. Leaderboard Section */}
        <section className="w-full bg-black border-4 border-white p-6 md:p-8 shadow-[10px_10px_0_0_#ff00ff]">
          <div className="flex items-center justify-center gap-3 mb-6 border-b-2 border-dashed border-white pb-4">
            <Award className="w-5 h-5 text-[#ffd700] animate-bounce" />
            <h2 className="text-xs sm:text-sm font-bold text-center text-[#ffd700] uppercase tracking-widest">
              Global Financial Resilience Leaderboard
            </h2>
            <Award className="w-5 h-5 text-[#ffd700] animate-bounce" />
          </div>

          <div className="bg-black">
            {/* Headers Row */}
            <div className="grid grid-cols-12 gap-2 text-white/50 mb-4 px-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <div className="col-span-2">RANK</div>
              <div className="col-span-6">RESILIENT HERO</div>
              <div className="col-span-4 text-right">NET WORTH score</div>
            </div>

            {/* List items structured beautifully container */}
            <div className="space-y-3">
              {/* Row 1 Highlights */}
              <div className="grid grid-cols-12 gap-2 text-xs sm:text-sm p-3 bg-[#1a1a1a] border-l-8 border-[#39ff14] font-mono items-center">
                <div className="col-span-2 text-[#39ff14] font-bold">01</div>
                <div className="col-span-6 text-white uppercase tracking-wider">WAITING_FOR_DASHERS...</div>
                <div className="col-span-4 text-right text-[#ffd700] font-bold">$0.00</div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-12 gap-2 text-xs sm:text-sm p-3 bg-[#111] border-l-8 border-transparent font-mono items-center">
                <div className="col-span-2 text-white/50 font-bold">02</div>
                <div className="col-span-6 text-white/70 uppercase tracking-wider">TRIAL_PENDING</div>
                <div className="col-span-4 text-right text-[#ffd700] font-bold">$0.00</div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-12 gap-2 text-xs sm:text-sm p-3 bg-[#111] border-l-8 border-transparent font-mono items-center">
                <div className="col-span-2 text-white/50 font-bold">03</div>
                <div className="col-span-6 text-white/70 uppercase tracking-wider">TRIAL_PENDING</div>
                <div className="col-span-4 text-right text-[#ffd700] font-bold">$0.00</div>
              </div>
            </div>

            {/* Custom Empty Notification Card with clean white-hot-neon accents */}
            <div className="mt-6 border-2 border-dotted border-white/20 bg-white/5 p-4 text-center">
              <p className="text-[10px] text-[#00ffff] uppercase leading-relaxed tracking-wider">
                NO SCORES SUBMITTED YET FOR THIS ARCADE UNIT.
                <br />
                <span className="text-[#ffd700] animate-pulse inline-block mt-2">★ RUN THE COIN, SURVIVE TO 30, MAKE LIFE DECISIONS & BE THE FIRST! ★</span>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Game Cabinet Footer Decor with high density design styles */}
      <footer className="w-full max-w-5xl px-4 flex flex-col sm:flex-row justify-between items-center text-[8px] text-white/40 pt-6 pb-8 border-t border-white/10 bg-transparent z-40 mt-12 uppercase tracking-widest gap-2 sm:gap-0">
        <div>VER 1.0.4-BETA</div>
        <div className="text-[#ff00ff] font-bold">★ PORT 3000 CONSOLE DEPLOYMENT ★</div>
        <div>COPYRIGHT © 2026 DASH_TO_30_STUDIOS</div>
      </footer>
    </div>
  );
}
