"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Code2,
  DollarSign,
  Github,
  Info,
  Volume2,
  VolumeX,
} from "lucide-react";
import LandingModalShell from "./LandingModalShell";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SettingsModal({ isOpen, onClose }: Props) {
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedSound = window.localStorage.getItem("dashTo30_soundEnabled");

    if (storedSound !== null) {
      setSoundEnabled(storedSound === "true");
    }
  }, [isOpen]);

  const toggleSound = () => {
    const nextValue = !soundEnabled;
    setSoundEnabled(nextValue);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("dashTo30_soundEnabled", String(nextValue));
    }
  };

  const showCurrencyToast = () => {
    toast.error("Dollar naik? Santai, nasi padang masih nerima rupiah", {
      id: "currency-no-dollar",
    });
  };

  return (
    <LandingModalShell
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="⚙️ SETTINGS"
      rightBadge="★ CONFIG"
      title="GAME SETTINGS"
      subtitle="Atur preferensi ringan sebelum masuk ke arena tanggal tua."
      accent="yellow"
      maxWidthClassName="max-w-md sm:max-w-lg"
    >
      <div className="space-y-3">
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundEnabled}
          className="group w-full rounded-2xl border-2 border-b-4 border-[#8B5E3C] bg-white p-3 text-left shadow-[inset_0_2px_4px_rgba(139,94,60,0.05)] transition-all hover:bg-[#FFFDF6] active:translate-y-[2px] active:border-b-2 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-[#8B5E3C]/45 bg-[#FFF1C7]">
                {soundEnabled ? (
                  <Volume2 className="h-5 w-5 text-[#6FD08C]" />
                ) : (
                  <VolumeX className="h-5 w-5 text-[#FF6B6B]" />
                )}
              </div>

              <div className="min-w-0">
                <p className="font-pixel text-[10px] font-bold tracking-wider text-[#4A3A2A]">
                  SOUND SETTINGS
                </p>
                <p className="mt-1 text-[10px] font-mono font-bold text-[#8B5E3C] normal-case">
                  {soundEnabled ? "Efek suara aktif." : "Efek suara dimatikan."}
                </p>
              </div>
            </div>

            <div
              className={`relative h-7 w-14 shrink-0 rounded-full border-2 border-[#8B5E3C] transition-colors ${
                soundEnabled ? "bg-[#6FD08C]" : "bg-[#FF6B6B]/70"
              }`}
            >
              <span
                className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-[#8B5E3C] bg-[#FFF6E8] shadow-[0_2px_0_#8B5E3C] transition-transform ${
                  soundEnabled ? "translate-x-[27px]" : "translate-x-[3px]"
                }`}
              />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={showCurrencyToast}
          className="group w-full rounded-2xl border-2 border-b-4 border-[#8B5E3C] bg-white p-3 text-left shadow-[inset_0_2px_4px_rgba(139,94,60,0.05)] transition-all hover:bg-[#FFFDF6] active:translate-y-[2px] active:border-b-2 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-[#8B5E3C]/45 bg-[#FFF1C7]">
                <DollarSign className="h-5 w-5 text-[#FF9F1C]" />
              </div>

              <div className="min-w-0">
                <p className="font-pixel text-[10px] font-bold tracking-wider text-[#4A3A2A]">
                  CURRENCY DISPLAY
                </p>
                <p className="mt-1 text-[10px] font-mono font-bold text-[#8B5E3C] normal-case">
                  IDR
                </p>
              </div>
            </div>

            <div className="rounded-full border-2 border-[#8B5E3C] bg-[#FFF1C7] px-3 py-1.5 font-pixel text-[9px] font-bold tracking-wider text-[#4A3A2A] shadow-[0_2px_0_#8B5E3C] transition-transform group-active:translate-y-[1px]">
              IDR / USD
            </div>
          </div>
        </button>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-[#8B5E3C]/40 bg-[#FFF1C7]/70 p-3">
            <div className="flex items-center gap-2 font-pixel text-[9px] font-bold tracking-wider text-[#4A3A2A]">
              <Code2 className="h-4 w-4 text-[#6FD08C]" />
              DEV INFO
            </div>
            <p className="mt-2 text-[10px] font-mono font-bold leading-relaxed text-[#8B5E3C] normal-case">
              Dash to 30 MVP Polish Build.
            </p>
          </div>

          <div className="rounded-2xl border-2 border-[#8B5E3C]/40 bg-[#FFF1C7]/70 p-3">
            <div className="flex items-center gap-2 font-pixel text-[9px] font-bold tracking-wider text-[#4A3A2A]">
              <Github className="h-4 w-4 text-[#4A3A2A]" />
              STACK
            </div>
            <p className="mt-2 text-[10px] font-mono font-bold leading-relaxed text-[#8B5E3C] normal-case">
              Next.js + Phaser + Firebase.
            </p>
          </div>
        </div>

        <div className="flex gap-2 rounded-2xl border-2 border-[#8B5E3C]/35 bg-white px-3 py-2 text-[9px] font-mono font-bold leading-relaxed text-[#8B5E3C] normal-case">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9B8CFF]" />
          Sound toggle sudah disimpan di browser dan siap dipakai saat sound
          system dihubungkan.
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-2xl border-2 border-b-4 border-[#8B5E3C] bg-[#FFC857] py-3 font-pixel text-[10px] font-bold tracking-wider text-[#4A3A2A] transition-all hover:bg-[#FF9F1C] active:translate-y-[2px] active:border-b-2 cursor-pointer"
        >
          SAVE & CLOSE
        </button>
      </div>
    </LandingModalShell>
  );
}
