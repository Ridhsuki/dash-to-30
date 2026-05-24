import React from 'react';
import { 
  Play, 
  LogIn, 
  Globe, 
  Award, 
  Coins, 
  ShieldCheck, 
  Calendar, 
  AlertTriangle, 
  Receipt, 
  Coffee, 
  CreditCard, 
  ExternalLink,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  // Configurable, robust array of subtle particles behind the hero
  const particles = [
    { id: 1, type: 'coin', color: '#FFD166', char: '$', delay: '0s', left: '12%', top: '25%', size: 'text-lg', label: '' },
    { id: 2, type: 'need', color: '#2EC27E', char: 'Need', delay: '1.5s', left: '18%', top: '65%', size: 'text-[9px] font-pixel tracking-widest px-2 py-0.5 border border-[#2EC27E]/30 bg-[#2EC27E]/10 rounded-md', label: 'Needs' },
    { id: 3, type: 'want', color: '#EF476F', char: 'Want', delay: '3.2s', left: '82%', top: '20%', size: 'text-[9px] font-pixel tracking-widest px-2 py-0.5 border border-[#EF476F]/30 bg-[#EF476F]/10 rounded-md', label: 'Wants' },
    { id: 4, type: 'trap', color: '#8B5CF6', char: 'Paylater', delay: '4.8s', left: '76%', top: '70%', size: 'text-[9px] font-pixel tracking-widest px-2 py-0.5 border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 rounded-md', label: 'Paylater' },
    { id: 5, type: 'danger', color: '#E63946', char: '⚠️ Danger', delay: '2.1s', left: '85%', top: '45%', size: 'text-[9px] font-mono tracking-wider text-[#E63946] font-bold px-1.5 py-0.5 bg-[#E63946]/10 border border-[#E63946]/20 rounded', label: 'Late Month' },
    { id: 6, type: 'bill', color: '#FFF7E6', char: '📄', delay: '5.5s', left: '22%', top: '15%', size: 'text-xl', label: '' },
    { id: 7, type: 'coin', color: '#FFD166', char: 'Rp', delay: '3s', left: '30%', top: '80%', size: 'text-sm font-bold', label: '' },
    { id: 8, type: 'coin', color: '#FFD166', char: '💰', delay: '4.2s', left: '68%', top: '12%', size: 'text-lg', label: '' },
    { id: 9, type: 'warn', color: '#E63946', char: '✕', delay: '0.8s', left: '8%', top: '50%', size: 'text-2xl opacity-40', label: '' },
    { id: 10, type: 'need', color: '#2EC27E', char: '✓', delay: '5s', left: '40%', top: '10%', size: 'text-xl opacity-30', label: '' },
  ];

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden bg-[#0B1020] text-[#FFF7E6] flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none font-sans">
      
      {/* 1. Custom CSS Keyframes for High-Fidelity Retro Game Lobby Feel */}
      <style>{`
        @keyframes floatIdle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes subtleGrid {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes meshGlow {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(1.1); }
        }
        @keyframes playPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 209, 102, 0.4); }
          50% { transform: scale(1.02); box-shadow: 0 0 25px 8px rgba(255, 209, 102, 0.2); }
        }
        @keyframes progressShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes floatParticleCustom {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          50% { transform: translateY(-16px) translateX(6px) rotate(8deg); }
        }

        .ambient-grid {
          background-image: 
            linear-gradient(to right, rgba(20, 27, 61, 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(20, 27, 61, 0.5) 1px, transparent 1px);
          background-size: 24px 24px;
          animation: subtleGrid 28s linear infinite;
        }

        .ambient-mesh {
          animation: meshGlow 10s ease-in-out infinite;
        }

        .play-pulsing {
          animation: playPulse 2.5s infinite ease-in-out;
        }

        .float-idle {
          animation: floatIdle 6s ease-in-out infinite;
        }

        .float-particle {
          animation: floatParticleCustom 5s ease-in-out infinite;
        }

        .progress-shimmer-bar {
          background: linear-gradient(90deg, #141B3D 25%, #25306B 50%, #141B3D 75%);
          background-size: 200% 100%;
          animation: progressShimmer 3s infinite linear;
        }
      `}</style>

      {/* 2. Visual Layer Stack (Zero-Friction Modern Ambience) */}
      <div className="absolute inset-0 z-0 bg-[#0B1020]"></div>
      <div className="absolute inset-0 z-0 ambient-grid opacity-70"></div>
      
      {/* Soft city mesh neon overlay to convey the urban running setting */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#141B3D]/60 to-transparent pointer-events-none z-0"></div>

      {/* Multi-source glowing coordinates (safe lights & late month warnings) */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-[#2EC27E]/5 rounded-full blur-[90px] pointer-events-none z-0 ambient-mesh"></div>
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[340px] h-[340px] bg-[#EF476F]/5 rounded-full blur-[100px] pointer-events-none z-0 ambient-mesh" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-10 right-0 w-[240px] h-[240px] bg-[#8B5CF6]/10 rounded-full blur-[80px] pointer-events-none z-0"></div>

      {/* Screen CRT scanlines & vignette edges to focus vision center-ward */}
      <div className="pointer-events-none absolute inset-0 bg-[#0B1020]/20 z-20"></div>
      <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-transparent via-[#0B1020]/30 to-[#0B1020]/80 z-20"></div>

      {/* 3. Subtle Interactive Financial Particles (Low opacity, behind the hero) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10 hidden sm:block">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute float-particle select-none opacity-40 hover:opacity-85 transition-opacity"
            style={{
              left: p.left,
              top: p.top,
              color: p.color,
              animationDelay: p.delay,
              animationDuration: '6s',
            }}
          >
            <span className={p.size}>{p.char}</span>
          </div>
        ))}
      </div>

      {/* Late-month Boss Warning Corner Indicator Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#E63946]/10 to-transparent pointer-events-none z-30">
        <div className="absolute top-3 right-3 text-[8px] font-mono tracking-widest text-[#E63946]/60 text-right rotate-45 transform translate-x-4 translate-y-2 select-none uppercase font-bold">
          Late Month Chaos Alert
        </div>
      </div>

      {/* ========================================================= */}
      {/* ==================== SCREEN HEADER OVERLAY =================== */}
      {/* ========================================================= */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-45 relative">
        <div className="flex items-center gap-2 bg-[#141B3D]/50 border border-slate-800 backdrop-blur-md rounded-full px-3 py-1.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2EC27E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2EC27E]"></span>
          </span>
          <span className="text-[10px] font-mono tracking-widest text-slate-300 font-semibold uppercase">
            PAYDAY LOBBY READY
          </span>
        </div>

        {/* Minimalist EN/USD switch inside a tiny clean pill */}
        <div className="flex items-center gap-2.5 bg-[#141B3D]/50 border border-slate-800 backdrop-blur-md rounded-full px-3 py-1 text-xs">
          <Globe className="w-3.5 h-3.5 text-[#FFD166]" />
          <span className="text-[10px] font-mono font-medium tracking-wider text-slate-300">EN // USD</span>
        </div>
      </header>

      {/* ========================================================= */}
      {/* ==================== CENTER STAGE HERO ================== */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col items-center justify-center z-40 max-w-2xl mx-auto text-center px-4 self-center w-full relative">
        
        {/* Floating Category Tag Badge */}
        <div className="inline-flex items-center gap-2 bg-[#FFD166]/10 border border-[#FFD166]/20 rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest text-[#FFD166] mb-5 uppercase hover:bg-[#FFD166]/20 transition-colors">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Financial Survival Runner</span>
        </div>

        {/* Main Title Group with Soft Shadows */}
        <div className="relative mb-3 float-idle">
          <h1 className="font-pixel text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-[#FFD166] uppercase drop-shadow-[0_4px_0_#FF9F1C] select-none">
            DASH TO 30
          </h1>
        </div>

        {/* Minimal game-specific tagline */}
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-md mx-auto mb-10 tracking-wide">
          Can you survive your spending patterns, dodge paylater traps, and make it until payday?
        </p>

        {/* MASSIVE HERO "PLAY" GAME TRIGGER BUTTON */}
        <div className="w-full max-w-sm px-4">
          <button 
            type="button"
            className="group relative w-full bg-[#FFD166] hover:bg-[#FF9F1C] text-[#0B1020] font-black text-base sm:text-lg py-5 pb-[22px] px-8 uppercase cursor-pointer rounded-2xl transition-all duration-100 font-pixel select-none tracking-wider border-2 border-[#FFF7E6] border-b-8 border-b-[#FF9F1C] active:border-b-2 active:translate-y-[6px] play-pulsing focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#FFD166]"
          >
            <span className="flex items-center justify-center gap-3.5">
              <Play className="w-5 h-5 fill-[#0B1020] stroke-[#0B1020]" />
              <span>PLAY NOW</span>
            </span>
            {/* Soft internal gradient shine layer */}
            <span className="absolute inset-x-0 top-0 h-1/2 bg-white/15 rounded-t-xl pointer-events-none"></span>
          </button>
        </div>

        {/* Miniature interactive/visual Day 1 -> Day 30 calendar tracker display */}
        <div className="w-full max-w-xs mt-8 bg-[#141B3D]/40 border border-slate-800/80 rounded-xl p-3 select-none text-left">
          <div className="flex items-center justify-between text-[9px] font-mono uppercase text-slate-400 mb-2 font-semibold">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#FFD166]" /> Milestone</span>
            <span>Day 1 → Day 30</span>
          </div>
          {/* Progress track representation */}
          <div className="relative w-full h-1.5 bg-[#0B1020] rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-3/4 progress-shimmer-bar rounded-full"></div>
            {/* Mark critical days */}
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#E63946]" title="Late month stress"></div>
          </div>
          <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 mt-1 uppercase">
            <span>Hire/Starting Pay</span>
            <span className="text-[#E63946] font-bold">Late Month Chaos</span>
          </div>
        </div>

      </main>

      {/* ========================================================= */}
      {/* ==================== FOOTER & SIDE DATA ================= */}
      {/* ========================================================= */}
      <footer className="w-full max-w-7xl mx-auto z-40 relative flex flex-col md:flex-row justify-between items-end gap-6 pt-4 border-t border-slate-900">
        
        {/* Playful realistic Receipt-Paper mini-block accent strictly in #FFF1C7 */}
        <div className="hidden md:flex flex-col w-52 bg-[#FFF1C7] border-2 border-dashed border-slate-700/80 rounded-lg p-3 text-slate-900 font-mono text-[9px] shadow-lg float-idle">
          <div className="border-b border-dashed border-slate-700/60 pb-1.5 mb-1.5 flex justify-between items-center">
            <span className="font-bold tracking-wider">MONTHLY LEDGER</span>
            <Receipt className="w-3.5 h-3.5 text-slate-700" />
          </div>
          <div className="space-y-1 text-slate-800">
            <div className="flex justify-between">
              <span>Impulse Coffee</span>
              <span className="text-[#EF476F] font-semibold">-$6.50</span>
            </div>
            <div className="flex justify-between">
              <span>Paylater Trap</span>
              <span className="text-[#8B5CF6] font-semibold">-$24.00</span>
            </div>
            <div className="flex justify-between">
              <span>Secure Savings</span>
              <span className="text-[#2EC27E] font-semibold">+$15.00</span>
            </div>
            <div className="flex justify-between font-bold border-t border-dashed border-slate-700/40 pt-1 text-slate-900 uppercase">
              <span>RESILIENCE STATUS</span>
              <span className="text-[#2EC27E]">STABLE</span>
            </div>
          </div>
          <div className="mt-2 text-center text-[7px] text-slate-500 tracking-wider">
            ★ DASH TO 30 MEMO ★
          </div>
        </div>

        {/* Compact buttons representing secondary tasks, perfectly responsive */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-center sm:justify-start">
          <button className="group relative flex items-center gap-2.5 bg-[#141B3D]/50 hover:bg-[#141B3D]/80 border border-slate-800 hover:border-slate-700 rounded-full px-4 py-2 transition-all cursor-pointer text-[10px] font-bold tracking-wider font-mono uppercase text-slate-300 hover:text-white">
            <LogIn className="w-3.5 h-3.5 text-[#FFD166] group-hover:scale-110 transition-transform" />
            <span>Login to Save Score</span>
          </button>

          <button className="group relative flex items-center gap-2.5 bg-[#141B3D]/50 hover:bg-[#141B3D]/80 border border-slate-800 hover:border-slate-700 rounded-full px-4 py-2 transition-all cursor-pointer text-[10px] font-bold tracking-wider font-mono uppercase text-[#2EC27E] hover:text-emerald-300">
            <Award className="w-3.5 h-3.5 text-[#2EC27E] group-hover:scale-110 transition-transform" />
            <span>Leaderboard</span>
          </button>
        </div>

        {/* Standard arcade unit attribution details */}
        <div className="text-right text-[9px] font-mono text-slate-500 font-semibold uppercase tracking-wider self-center md:self-end text-center md:text-right w-full md:w-auto">
          <span>PORT 3000 CONSOLE CONTEXT // COPYRIGHT 2026 DASH_TO_30</span>
        </div>
      </footer>

    </div>
  );
}
