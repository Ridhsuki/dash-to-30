"use client";

import React from "react";
import {
  ArrowDown,
  ArrowUp,
  Banknote,
  HeartPulse,
  ReceiptText,
  ShieldAlert,
  ShoppingBag,
  Trophy,
} from "lucide-react";
import LandingModalShell from "./LandingModalShell";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const guideCards = [
  {
    icon: <Banknote className="h-4 w-4 text-[#FF9F1C]" />,
    title: "SALDO MASUK",
    text: "Ambil dulu di awal. Setelah itu kamu baru bisa bergerak.",
  },
  {
    icon: <HeartPulse className="h-4 w-4 text-[#6FD08C]" />,
    title: "NEEDS",
    text: "Ambil kebutuhan. Kalau dilewatkan, Needs Life berkurang.",
  },
  {
    icon: <ShoppingBag className="h-4 w-4 text-[#FF7AA2]" />,
    title: "WANTS",
    text: "Hindari godaan belanja. Kalau kena, saldo turun besar.",
  },
  {
    icon: <ShieldAlert className="h-4 w-4 text-[#FF6B6B]" />,
    title: "BOSS",
    text: "Tagihan besar. Bisa muncul di atas atau bawah.",
  },
];

export default function HowToPlayHomeModal({ isOpen, onClose }: Props) {
  return (
    <LandingModalShell
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="🎮 GUIDE"
      rightBadge="★ SURVIVE"
      title="CARA MAIN"
      subtitle="Bertahan sampai Day 30. Ambil kebutuhan, hindari godaan, dan jangan biarkan dompet menyerah duluan."
      accent="purple"
      maxWidthClassName="max-w-md sm:max-w-lg"
    >
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {guideCards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border-2 border-[#8B5E3C]/45 bg-white p-3 shadow-[0_3px_0_rgba(139,94,60,0.25)]"
            >
              <div className="flex gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-[#8B5E3C]/40 bg-[#FFF1C7]">
                  {card.icon}
                </div>

                <div className="min-w-0">
                  <h3 className="font-pixel text-[9px] font-bold tracking-wider text-[#4A3A2A]">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-[10px] font-mono font-bold leading-relaxed text-[#8B5E3C] normal-case">
                    {card.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border-2 border-[#8B5E3C] bg-[#FFF1C7]/80 p-3 shadow-[inset_0_2px_4px_rgba(139,94,60,0.07)]">
          <p className="mb-2 font-mono text-[8px] font-black uppercase tracking-wider text-[#4A3A2A]/55">
            Control Manual:
          </p>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-xl border border-[#8B5E3C]/25 bg-white px-2.5 py-2 text-[9px] font-mono font-bold text-[#4A3A2A]">
              <ArrowUp className="h-3.5 w-3.5 text-[#6FD08C]" />
              Space / ↑
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[#8B5E3C]/25 bg-white px-2.5 py-2 text-[9px] font-mono font-bold text-[#4A3A2A]">
              <ArrowDown className="h-3.5 w-3.5 text-[#9B8CFF]" />
              Tunduk / ↓
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[#8B5E3C]/25 bg-white px-2.5 py-2 text-[9px] font-mono font-bold text-[#4A3A2A]">
              <Trophy className="h-3.5 w-3.5 text-[#FFC857]" />
              Day 30
            </div>
          </div>

          <div className="mt-3 flex gap-2 rounded-xl bg-white/70 p-2 text-[9px] font-mono font-bold leading-relaxed text-[#8B5E3C] normal-case">
            <ReceiptText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8B5E3C]" />
            Skor bukan saldo. Skor naik dari hari bertahan, Needs yang diambil,
            Wants/Boss yang dihindari, dan sisa saldo.
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-2xl border-2 border-b-4 border-[#8B5E3C] bg-[#6FD08C] py-3 font-pixel text-[10px] font-bold tracking-wider text-white transition-all hover:bg-[#5bb776] active:translate-y-[2px] active:border-b-2 cursor-pointer"
        >
          MENGERTI, SIAP SURVIVE
        </button>
      </div>
    </LandingModalShell>
  );
}
