"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  LogIn,
  Trophy,
  X,
} from "lucide-react";
import type { LeaderboardSubmitState } from "@/lib/leaderboard";

type Props = {
  state: LeaderboardSubmitState;
  onDismiss: () => void;
};

const getStatusStyle = (status: LeaderboardSubmitState["status"]) => {
  switch (status) {
    case "submitting":
      return {
        icon: <Loader2 className="w-4 h-4 animate-spin text-[#9B8CFF]" />,
        border: "border-[#9B8CFF]",
        bg: "bg-[#FFF6E8]",
      };
    case "success":
      return {
        icon: <CheckCircle2 className="w-4 h-4 text-[#6FD08C]" />,
        border: "border-[#6FD08C]",
        bg: "bg-[#FFF6E8]",
      };
    case "guest":
      return {
        icon: <LogIn className="w-4 h-4 text-[#FFC857]" />,
        border: "border-[#FFC857]",
        bg: "bg-[#FFF6E8]",
      };
    case "skipped":
      return {
        icon: <Trophy className="w-4 h-4 text-[#8B5E3C]" />,
        border: "border-[#8B5E3C]",
        bg: "bg-[#FFF6E8]",
      };
    case "error":
      return {
        icon: <AlertTriangle className="w-4 h-4 text-[#FF6B6B]" />,
        border: "border-[#FF6B6B]",
        bg: "bg-[#FFF6E8]",
      };
    default:
      return null;
  }
};

export default function LeaderboardSubmitToast({ state, onDismiss }: Props) {
  const style = getStatusStyle(state.status);

  useEffect(() => {
    if (
      state.status === "idle" ||
      state.status === "submitting" ||
      state.status === "error"
    ) {
      return;
    }

    const timer = window.setTimeout(onDismiss, 6500);
    return () => window.clearTimeout(timer);
  }, [state.status, onDismiss]);

  if (!style) return null;

  return (
    <div className="fixed top-4 left-1/2 z-[150] w-[calc(100%-24px)] max-w-md -translate-x-1/2 pointer-events-auto">
      <div
        className={`${style.bg} ${style.border} border-2 border-b-4 rounded-2xl shadow-[0_10px_24px_rgba(74,58,42,0.18)] px-4 py-3 font-mono text-[#4A3A2A] animate-in fade-in slide-in-from-top-2 duration-200`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">{style.icon}</div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="font-pixel text-[10px] sm:text-xs font-bold uppercase tracking-wide">
                {state.title}
              </p>

              <button
                type="button"
                onClick={onDismiss}
                className="shrink-0 rounded-lg border border-[#8B5E3C]/30 bg-white/60 p-1 hover:bg-white transition-colors cursor-pointer"
                aria-label="Tutup status leaderboard"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <p className="mt-1 text-[10px] sm:text-xs leading-relaxed text-[#8B5E3C]">
              {state.message}
            </p>

            {typeof state.score === "number" && (
              <p className="mt-1 text-[10px] font-bold text-[#4A3A2A]">
                SCORE: {state.score.toLocaleString("id-ID")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
