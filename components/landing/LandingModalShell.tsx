"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type LandingModalShellProps = {
  isOpen: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  subtitle?: string;
  accent?: "yellow" | "green" | "purple" | "red";
  children: ReactNode;
  maxWidthClassName?: string;
  rightBadge?: string;
};

const accentTextClass = {
  yellow: "text-[#FF9F1C]",
  green: "text-[#6FD08C]",
  purple: "text-[#9B8CFF]",
  red: "text-[#FF6B6B]",
};

const rightBadgeClass = {
  yellow: "text-[#FF9F1C]",
  green: "text-[#6FD08C]",
  purple: "text-[#9B8CFF]",
  red: "text-[#FF6B6B]",
};

export default function LandingModalShell({
  isOpen,
  onClose,
  eyebrow,
  title,
  subtitle,
  accent = "yellow",
  children,
  maxWidthClassName = "max-w-lg",
  rightBadge = "★ READY",
}: LandingModalShellProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-[#4A3A2A]/60 p-6 backdrop-blur-md sm:p-8"
      style={{ animation: "modalFadeIn 0.35s ease-out forwards" }}
    >
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(12px); }
        }
        @keyframes modalBounceIn {
          0% { transform: scale(0.86) translateY(18px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>

      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidthClassName} max-h-[90vh] overflow-visible rounded-3xl border-4 border-[#8B5E3C] bg-[#FFF6E8] p-5 font-sans text-[#4A3A2A] shadow-[0_12px_0_#8B5E3C] sm:p-7`}
        style={{
          animation:
            "modalBounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        <div className="absolute -top-3.5 left-1/2 z-30 flex h-5 w-[70%] -translate-x-1/2 items-center justify-between rounded-t-lg border-2 border-b-0 border-[#8B5E3C] bg-[#FFF1C7] px-3 font-mono text-[8px] font-bold tracking-widest text-[#4A3A2A] shadow-[0_-1px_0_rgba(139,94,60,0.2)]">
          <span className="flex items-center gap-1 uppercase">{eyebrow}</span>
          <span className={`${rightBadgeClass[accent]} uppercase`}>
            {rightBadge}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute -right-2 -top-3.5 z-40 flex h-8 w-8 items-center justify-center rounded-xl border-2 border-[#8B5E3C] bg-[#FF6B6B] text-[#FFF6E8] shadow-[0_3px_0_#8B5E3C] transition-transform duration-300 hover:rotate-90 hover:scale-105 hover:bg-[#FF7AA2] active:translate-y-[2px] active:scale-95 active:shadow-[0_1px_0_#8B5E3C] cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex max-h-[calc(90vh-56px)] min-h-0 flex-col overflow-hidden">
          <div className="mt-3 mb-4 shrink-0 text-center">
            <h2
              className={`font-pixel text-2xl font-bold tracking-wide drop-shadow-[0_2.5px_0_#8B5E3C] sm:text-3xl ${accentTextClass[accent]}`}
            >
              {title}
            </h2>

            {subtitle && (
              <p className="mx-auto mt-1.5 max-w-md text-[9px] font-mono font-bold leading-relaxed tracking-wider text-[#4A3A2A]/60 normal-case">
                {subtitle}
              </p>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#8B5E3C]/35">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
