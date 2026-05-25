'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Sparkles, 
  Scroll, 
  Flame, 
  PenTool,
  Coffee,
  ShoppingBag,
  Gamepad
} from 'lucide-react';

interface RoleSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (confession: string) => void;
}

interface ConfessionTemplate {
  id: number;
  label: string;
  icon: React.ReactNode;
  text: string;
}

export default function RoleSetupModal({ isOpen, onClose, onSubmit }: RoleSetupModalProps) {
  const [mounted, setMounted] = useState(false);
  const [confession, setConfession] = useState('');

  const templates: ConfessionTemplate[] = [
    {
      id: 1,
      label: 'College Student (Iced Coffee)',
      icon: <Coffee className="w-3.5 h-3.5 text-amber-600" />,
      text: "I'm a college student living on strict pocket money, but I can't resist buying iced coffee every single day."
    },
    {
      id: 2,
      label: 'Corporate Employee (Paylater)',
      icon: <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />,
      text: "I'm a corporate employee with a decent salary, but my money instantly vanishes into online shopping and paylater bills."
    },
    {
      id: 3,
      label: 'Freelance Gamer (Gacha)',
      icon: <Gamepad className="w-3.5 h-3.5 text-blue-600" />,
      text: "I'm a freelancer with unstable income, yet I spend way too much on game top-ups and gacha banners."
    }
  ];

  // Client-safe mounting to prevent hydration errors (Portals run strictly on browser)
  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted || !isOpen) return null;

  const handleSelectTemplate = (text: string) => {
    setConfession(text);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confession.trim()) {
      onSubmit(confession);
    }
  };

  return createPortal(
    <div 
      id="rolesetup-backdrop"
      className="fixed inset-0 z-50 bg-[#4A3A2A]/60 backdrop-blur-md flex items-center justify-center p-4"
      style={{ animation: 'modalFadeIn 0.4s ease-out forwards' }}
    >
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(12px); }
        }
        @keyframes modalBounceIn {
          0% { transform: scale(0.85) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Modal Container in Cozy Indie Game Style with Easter-Egg Bouncy curve */}
      <div 
        id="rolesetup-modal-box"
        className="relative w-full max-w-md sm:max-w-lg bg-[#FFF6E8] border-4 border-[#8B5E3C] rounded-3xl p-5 sm:p-7 shadow-[0_12px_0_#8B5E3C] transform max-h-[92vh] flex flex-col uppercase font-sans animate-in"
        style={{ animation: 'modalBounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
      >
        {/* Receipt-style Top Decoration */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-[70%] h-5 bg-[#FFF1C7] border-2 border-[#8B5E3C] border-b-0 rounded-t-lg flex items-center justify-between px-3 text-[8px] text-[#4A3A2A] font-mono tracking-widest font-bold">
          <span className="flex items-center gap-1"><Scroll className="w-2.5 h-2.5 text-[#FF9F1C]" /> ROLE CONFIG</span>
          <span className="text-[#FF6B6B]">★ CONFESS</span>
        </div>

        {/* Close Button ("X") with rotate-90 transition effect */}
        <button
          onClick={onClose}
          type="button"
          className="absolute -top-3.5 -right-2 w-8 h-8 rounded-xl bg-[#FF6B6B] hover:bg-[#FF7AA2] border-2 border-[#8B5E3C] text-[#FFF6E8] flex items-center justify-center font-bold transition-transform duration-300 hover:rotate-90 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_3px_0_#8B5E3C] active:translate-y-[2px] active:shadow-[0_1px_0_#8B5E3C]"
          aria-label="Close Role Setup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Form Wrap */}
        <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Title Group */}
          <div className="text-center mt-3 mb-4 shrink-0">
            <h2 className="font-pixel text-2xl sm:text-3xl text-[#FF9F1C] font-bold drop-shadow-[0_2.5px_0_#8B5E3C] tracking-wide flex items-center justify-center gap-2">
              <Flame className="w-5 h-5 text-[#FF6B6B] animate-pulse" />
              FINANCIAL CONFESSION
              <Flame className="w-5 h-5 text-[#FF6B6B] animate-pulse" />
            </h2>
            <p className="text-[9px] font-mono font-bold text-[#4A3A2A]/60 tracking-wider mt-1.5 normal-case">
              Tell the AI your spending sins to generate custom lifestyle obstacles!
            </p>
          </div>

          {/* Quick-Select Template Pills Scrolling Wrapper */}
          <div className="mb-4 shrink-0 text-left">
            <label className="block text-[8px] font-mono font-black text-[#4A3A2A]/50 tracking-wider mb-2 uppercase">
              ✨ SELECT SPENDING STYLE TEMPLATE:
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl.text)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#FFF1C7] border-2 border-[#8B5E3C]/40 rounded-full transition-all text-[9px] font-bold font-mono tracking-tight text-[#4A3A2A] shrink-0 snap-start active:translate-y-[1px] hover:border-[#8B5E3C] cursor-pointer"
                >
                  {tpl.icon}
                  <span className="normal-case">{tpl.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Large Text Area Box */}
          <div className="flex-1 min-h-[140px] flex flex-col mb-4 text-left">
            <label htmlFor="confession-text" className="block text-[8px] font-mono font-black text-[#4A3A2A]/50 tracking-wider mb-1.5 uppercase">
              ✍️ EDIT COMPLAINT / FINANCIAL SITUATION:
            </label>
            <div className="relative flex-1 flex flex-col bg-white border-2 border-[#8B5E3C] rounded-2xl overflow-hidden shadow-[inset_0_2px_4px_rgba(139,94,60,0.06)]">
              <textarea
                id="confession-text"
                rows={5}
                className="w-full flex-1 p-3.5 text-xs text-[#4A3A2A] font-mono bg-transparent outline-none resize-none placeholder-[#4A3A2A]/40 leading-relaxed overflow-y-auto"
                placeholder="Ex: I get paid on the first, but order takeaway food every single day and end up living on cup noodles after week 2..."
                value={confession}
                onChange={(e) => setConfession(e.target.value)}
                maxLength={400}
              />
              <div className="bg-[#FFF1C7]/30 border-t border-[#8B5E3C]/20 px-3 py-1.5 flex justify-between items-center shrink-0">
                <span className="text-[8px] text-[#4A3A2A]/40 font-mono font-bold uppercase flex items-center gap-1">
                  <PenTool className="w-2.5 h-2.5" /> AI WILL RE-DESIGN ENEMIES TO MATCH SINS
                </span>
                <span className="text-[8px] text-[#4A3A2A]/50 font-mono font-bold">
                  {confession.length}/400
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions Row */}
          <div className="flex gap-3 mt-1 shrink-0">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-3 bg-[#FFF1C7] hover:bg-white text-[#4A3A2A] border-2 border-b-4 border-[#8B5E3C] rounded-2xl active:border-b-2 active:translate-y-[2px] transition-all cursor-pointer font-pixel text-[10px] tracking-wider font-bold"
            >
              CANCEL
            </button>
            <button
              disabled={!confession.trim()}
              type="submit"
              className="flex-[2] py-3 bg-[#6FD08C] hover:bg-[#5bb776] text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#6FD08C] border-2 border-b-4 border-[#8B5E3C] rounded-2xl active:border-b-2 active:translate-y-[2px] transition-all cursor-pointer font-pixel text-[10px] tracking-wider font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white stroke-none animate-pulse" />
              GENERATE MY LIFE
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
