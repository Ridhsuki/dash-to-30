"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import LandingModalShell from "./LandingModalShell";

const SESSION_KEY = "dashTo30_mobileWelcomeSeen:v1";

function isMobileViewport() {
  if (typeof window === "undefined") return false;

  const hasTouch = navigator.maxTouchPoints > 0 || "ontouchstart" in window;
  const coarsePointer =
    window.matchMedia?.("(pointer: coarse), (hover: none)").matches ?? false;
  const smallScreen =
    window.matchMedia?.("(max-width: 900px)").matches ?? false;

  return hasTouch && (coarsePointer || smallScreen);
}

type MobileWelcomeModalProps = {
  disabled?: boolean;
};

export default function MobileWelcomeModal({
  disabled = false,
}: MobileWelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (disabled) return;
    if (typeof window === "undefined") return;
    if (!isMobileViewport()) return;

    const hasSeen = window.sessionStorage.getItem(SESSION_KEY);

    if (!hasSeen) {
      setIsOpen(true);
    }
  }, [disabled]);

  const closeModal = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SESSION_KEY, "true");
    }

    setIsOpen(false);
  };

  return (
    <LandingModalShell
      isOpen={isOpen && !disabled}
      onClose={closeModal}
      eyebrow="MOBILE NOTICE"
      title="Desktop Recommended"
      subtitle="Dash to 30 bisa dimainkan di mobile, tetapi pengalaman terbaik saat ini masih di laptop atau desktop."
      maxWidthClassName="max-w-sm"
      accent="red"
    >
      <div className="mb-4 flex justify-center">
        <div className="relative flex items-end">
          {/* Monitor */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#8B5E3C]/15 bg-gradient-to-br from-[#FFF8ED] to-[#FFE7C2] shadow-md">
            <Monitor className="h-8 w-8 text-[#5C4033] stroke-[2.2]" />
          </div>

          {/* Smartphone */}
          <div className="absolute -right-2 bottom-0 flex h-9 w-9 animate-bounce items-center justify-center rounded-xl border border-white/70 bg-[#FF6B6B] shadow-sm">
            <Smartphone className="h-4 w-4 text-white stroke-[2.5]" />
          </div>
        </div>
      </div>
      <div className="rounded-2xl border-2 border-dashed border-[#8B5E3C]/50 bg-[#FFF1C7] px-3 py-3 text-center font-mono text-[10px] font-bold leading-relaxed text-[#8B5E3C]">
        Kontrol mobile dan tampilan landscape masih dalam tahap penyempurnaan.
        Jika tetap memakai mobile, gunakan mode landscape secara manual.
      </div>
      <button
        type="button"
        onClick={closeModal}
        className="mt-5 w-full rounded-2xl border-2 border-[#8B5E3C] bg-[#FF6B6B] px-4 py-3 font-pixel text-sm tracking-wide text-[#FFF6E8] shadow-[0_4px_0_#8B5E3C] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FF7B7B] hover:shadow-[0_6px_0_#8B5E3C] active:translate-y-[2px] active:shadow-[0_2px_0_#8B5E3C]"
      >
        Mengerti
      </button>
    </LandingModalShell>
  );
}
