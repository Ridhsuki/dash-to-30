import { Play, LogIn, Globe, Award, Coins, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden bg-[#070913] text-slate-100 flex flex-col justify-between p-6 md:p-12 select-none font-sans">
      
      {/* Custom Global/Utility Keyframe Animations for Smooth Game Feel */}
      <style>{`
        @keyframes subtleGridScroll {
          0% { background-position: 0 0; }
          100% { background-position: 32px 32px; }
        }
        @keyframes radialPulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.15); }
        }
        @keyframes goldenGlow {
          0%, 100% { filter: drop-shadow(0 0 15px rgba(251,191,36,0.35)); }
          50% { filter: drop-shadow(0 0 30px rgba(251,191,36,0.65)); }
        }
        .anim-grid {
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 32px 32px;
          animation: subtleGridScroll 20s linear infinite;
        }
        .anim-radial-breathing {
          animation: radialPulse 8s ease-in-out infinite;
        }
        .title-gold-glow {
          animation: goldenGlow 4s ease-in-out infinite;
        }
      `}</style>

      {/* 1. Dynamic Breathing Background Stack */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#020308] via-[#090b16] to-[#0d122b]"></div>
      
      {/* Repeating retro grid with continuous translation */}
      <div className="absolute inset-0 z-0 anim-grid opacity-60"></div>

      {/* Radial ambient breathing mesh to give depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0 anim-radial-breathing"></div>
      <div className="absolute -top-1/4 -right-1/4 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Retro CRT Scanlines & Screen vignette overlays */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:100%_4px] opacity-40 z-50"></div>
      <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-transparent via-slate-950/40 to-slate-950/90 z-20"></div>

      {/* Floating UI Elements: Z-INDEX 40 to stay interactive */}
      
      {/* ==================== 2. SCREEN CORNER FLOATING INTERFACES ==================== */}

      {/* TOP LEFT: Version Control & System Secure badge */}
      <div className="absolute top-5 left-5 z-40 hidden sm:flex items-center gap-2.5 bg-slate-950/40 hover:bg-slate-950/60 border border-slate-800/80 backdrop-blur-md rounded-full px-3.5 py-1.5 transition-all">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase">
          VER 1.2.0 //
        </span>
        <span className="text-[10px] font-mono tracking-widest text-emerald-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> SECURE
        </span>
      </div>

      {/* TOP RIGHT: Language and Currency switch pills */}
      <div className="absolute top-5 right-5 z-40 flex items-center gap-3">
        {/* Compact, ultra-sleek pill toggles with interactive mouse hover styling */}
        <div className="flex items-center gap-2.5 bg-slate-950/40 backdrop-blur-md border border-slate-800/80 rounded-full p-1 shadow-lg">
          {/* LAN option selector */}
          <div className="flex items-center text-[10px] font-semibold tracking-wider font-mono px-2 text-slate-400">
            <Globe className="w-3.5 h-3.5 mr-1" /> EN
          </div>
          <div className="h-4 w-[1px] bg-slate-800/80"></div>
          {/* CURR representation */}
          <div className="flex items-center text-[10px] font-semibold tracking-wider font-mono pr-2 text-amber-400">
            <Coins className="w-3.5 h-3.5 mr-1" /> USD
          </div>
        </div>
      </div>

      {/* BOTTOM LEFT: Glassmorphic Google login widget */}
      <div className="absolute bottom-5 left-5 z-40">
        <button className="group relative flex items-center gap-2.5 bg-slate-950/40 hover:bg-slate-900/60 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 backdrop-blur-md rounded-full px-4 py-2 transition-all duration-150 cursor-pointer text-xs font-semibold tracking-wide">
          <LogIn className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="font-mono">GOOGLE_SIGN_IN</span>
        </button>
      </div>

      {/* BOTTOM RIGHT: High Resilience Ledger entry button */}
      <div className="absolute bottom-5 right-5 z-40">
        <button className="group relative flex items-center gap-2.5 bg-slate-950/40 hover:bg-slate-900/60 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 backdrop-blur-md rounded-full px-4 py-2 transition-all duration-150 cursor-pointer text-xs font-semibold tracking-wide">
          <Award className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="font-mono">LEDGER_DATABASE</span>
        </button>
      </div>


      {/* ==================== 3. CENTER STAGE (THE ABSOLUTE HERO) ==================== */}
      <div className="flex-1 flex flex-col items-center justify-center z-30 max-w-xl mx-auto text-center px-4 self-center">
        
        {/* Compact, aesthetic category tag */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3.5 py-1 text-[9px] font-pixel tracking-widest text-emerald-400 mb-6 uppercase">
          <span>★</span> STAGE 01 PRE-GAME LOBBY <span>★</span>
        </div>

        {/* Title Container with premium pixel font & drop shadow */}
        <div className="relative mb-5 title-gold-glow">
          <h1 className="font-pixel text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-amber-400 uppercase drop-shadow-[0_4px_0_rgba(180,83,9,1)]">
            DASH TO 30
          </h1>
        </div>

        {/* High-fidelity modern tagline */}
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium uppercase tracking-widest border-y border-slate-800/50 py-4 w-full mb-10">
          The Financial Survival Challenge. Let&apos;s make life choices, earn compound interest, & retire resiliently.
        </p>

        {/* MASSIVE, JUICY, RE-DESIGNED "PLAY NOW" ACTION TRIGGER */}
        <div className="w-full max-w-sm">
          <button className="group relative w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base py-5 pb-[22px] px-8 border-2 border-slate-950 border-b-8 border-b-emerald-700 active:border-b-2 active:translate-y-[6px] transition-all rounded-2xl cursor-pointer flex items-center justify-center gap-3.5 font-pixel shadow-[0_12px_24px_-8px_rgba(16,185,129,0.4)] hover:shadow-[0_16px_32px_-6px_rgba(16,185,129,0.5)]">
            <Play className="w-5 h-5 fill-slate-950 stroke-slate-950 group-hover:scale-110 transition-transform duration-100 ease-out" />
            <span className="tracking-wider">START MISSION</span>
          </button>
        </div>

        {/* Quick, crisp tips below the play button */}
        <p className="text-[10px] text-slate-500 font-medium font-mono mt-5 uppercase tracking-wide">
          INPUT COINS NOT REQUIRED // MOUSE / KEYBOARD / TOUCH READY
        </p>
      </div>

    </div>
  );
}

