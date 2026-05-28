"use client";

import React, { useState } from "react";
import { LogOut, ShieldQuestion, X } from "lucide-react";
import LandingModalShell from "./LandingModalShell";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  username?: string;
};

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  username = "Player",
}: Props) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      await onConfirm();
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <LandingModalShell
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="🚪 ACCOUNT"
      rightBadge="★ LOGOUT"
      title="LOGOUT?"
      subtitle={`Yakin mau keluar dari akun ${username}?`}
      accent="red"
      maxWidthClassName="max-w-md"
    >
      <div className="space-y-4">
        <div className="rounded-2xl border-2 border-[#8B5E3C] bg-white p-4 text-center shadow-[inset_0_2px_4px_rgba(139,94,60,0.06)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#8B5E3C]/45 bg-[#FFF1C7]">
            <ShieldQuestion className="h-7 w-7 text-[#FF6B6B]" />
          </div>

          <p className="mt-3 text-[11px] font-mono font-bold leading-relaxed text-[#8B5E3C] normal-case">
            Personal best di browser tetap aman. Tapi skor global berikutnya
            hanya bisa dikirim kalau kamu login lagi.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-[#8B5E3C] bg-[#FFF1C7] py-3 font-pixel text-[10px] font-bold tracking-wider text-[#4A3A2A] transition-all hover:bg-white active:translate-y-[2px] active:border-b-2 disabled:opacity-60 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            CANCEL
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-[#8B5E3C] bg-[#FF6B6B] py-3 font-pixel text-[10px] font-bold tracking-wider text-white transition-all hover:bg-[#FF7AA2] active:translate-y-[2px] active:border-b-2 disabled:opacity-60 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            {isProcessing ? "LOGGING OUT..." : "YES, LOGOUT"}
          </button>
        </div>
      </div>
    </LandingModalShell>
  );
}
