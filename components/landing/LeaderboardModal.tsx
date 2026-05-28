"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  Calendar,
  Loader2,
  Medal,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ScoreEntry {
  id: string;
  username: string;
  score: number;
  survivalDays: number;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FALLBACK_SCORES: ScoreEntry[] = [
  { id: "mock1", username: "SuperSaver_99", score: 2840, survivalDays: 30 },
  { id: "mock2", username: "KopiAddictNoMore", score: 2450, survivalDays: 30 },
  { id: "mock3", username: "NeedsVWantMaster", score: 2100, survivalDays: 28 },
  { id: "mock4", username: "AntiPaylaterAgent", score: 1850, survivalDays: 26 },
  { id: "mock5", username: "CashKing", score: 1510, survivalDays: 24 },
];

const useDemoLeaderboard =
  process.env.NEXT_PUBLIC_USE_DEMO_LEADERBOARD === "true";

export default function LeaderboardModal({
  isOpen,
  onClose,
}: LeaderboardModalProps) {
  const [mounted, setMounted] = useState(false);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setUsingDemo(false);
    setErrorMessage("");

    if (!db) {
      setScores(useDemoLeaderboard ? FALLBACK_SCORES : []);
      setUsingDemo(useDemoLeaderboard);
      setErrorMessage(
        "Firebase belum terkonfigurasi. Cek .env.local dan restart dev server.",
      );
      setLoading(false);
      return;
    }

    const highscoresRef = collection(db, "highscores");
    const leaderboardQuery = query(
      highscoresRef,
      orderBy("score", "desc"),
      limit(10),
    );

    const unsubscribe = onSnapshot(
      leaderboardQuery,
      (snapshot) => {
        const liveScores = snapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            username: String(data.username || "Anonymous Player"),
            score: Number(data.score) || 0,
            survivalDays: Number(data.survivalDays) || 0,
          };
        });

        setScores(liveScores);
        setUsingDemo(false);
        setErrorMessage("");
        setLoading(false);
      },
      (error) => {
        console.warn("Firestore leaderboard listener failed:", error);

        setScores(useDemoLeaderboard ? FALLBACK_SCORES : []);
        setUsingDemo(useDemoLeaderboard);
        setErrorMessage(
          "Leaderboard live belum bisa dibaca. Cek Firestore Database dan Security Rules.",
        );
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      id="leaderboard-backdrop"
      className="fixed inset-0 z-50 bg-[#4A3A2A]/60 backdrop-blur-md flex items-center justify-center p-4"
      style={{ animation: "modalFadeIn 0.4s ease-out forwards" }}
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
        id="leaderboard-modal-box"
        className="relative w-full max-w-md sm:max-w-lg bg-[#FFF6E8] border-4 border-[#8B5E3C] rounded-3xl p-5 sm:p-7 shadow-[0_12px_0_#8B5E3C] transform max-h-[90vh] flex flex-col uppercase font-sans"
        style={{
          animation:
            "modalBounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        {/* Receipt-style Top Decoration */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-[70%] h-5 bg-[#FFF1C7] border-2 border-[#8B5E3C] border-b-0 rounded-t-lg flex items-center justify-between px-3 text-[8px] text-[#4A3A2A] font-mono tracking-widest font-bold">
          <span className="flex items-center gap-1">
            <Trophy className="w-2.5 h-2.5 text-[#FF9F1C]" /> LEADERBOARD
          </span>
          <span className="text-[#6FD08C]">ONLINE</span>
        </div>

        {/* Close Button ("X") with rotate-90 transition effect */}
        <button
          onClick={onClose}
          type="button"
          className="absolute -top-3.5 -right-2 w-8 h-8 rounded-xl bg-[#FF6B6B] hover:bg-[#FF7AA2] border-2 border-[#8B5E3C] text-[#FFF6E8] flex items-center justify-center font-bold transition-transform duration-300 hover:rotate-90 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_3px_0_#8B5E3C] active:translate-y-[2px] active:shadow-[0_1px_0_#8B5E3C]"
          aria-label="Close Leaderboard"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mt-3 mb-4 shrink-0">
          <h2 className="font-pixel text-2xl sm:text-3xl text-[#FF9F1C] font-bold drop-shadow-[0_2.5px_0_#8B5E3C] tracking-wide flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FFC857] animate-pulse" />
            GLOBAL RANKINGS
            <Sparkles className="w-5 h-5 text-[#FFC857] animate-pulse" />
          </h2>
          <p className="text-[9px] font-mono font-bold text-[#4A3A2A]/60 tracking-wider mt-1.5">
            BEST SURVIVAL SCORES DASH TO 30
          </p>
        </div>

        {usingDemo && (
          <div className="relative z-10 mt-5 flex gap-2 rounded-2xl border-2 border-[#FFC857] bg-[#FFF1C7] p-3 text-[10px] font-bold text-[#8B5E3C]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF9F1C]" />
            Mode demo aktif. Set NEXT_PUBLIC_USE_DEMO_LEADERBOARD=false untuk
            hanya menampilkan data Firestore.
          </div>
        )}

        {errorMessage && !usingDemo && (
          <div className="relative z-10 mt-5 flex gap-2 rounded-2xl border-2 border-[#FF6B6B] bg-white p-3 text-[10px] font-bold text-[#8B5E3C]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6B6B]" />
            {errorMessage}
          </div>
        )}

        <div className="relative z-10 mt-5 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#8B5E3C]/40 bg-white/60 p-6 text-xs font-bold text-[#8B5E3C]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Mengambil skor live...
            </div>
          ) : scores.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono font-bold text-[#4A3A2A]/40 uppercase tracking-widest bg-[#FFF1C7]/30 border border-[#8B5E3C]/20 rounded-2xl">
              <Trophy className="mx-auto mb-2 h-6 w-6 text-[#FFC857]" />
              <p className="font-pixel text-xs font-black uppercase">
                Belum ada skor live
              </p>
              <p className="mt-2 text-[10px] font-bold text-[#8B5E3C]">
                Login, mainkan run, lalu selesaikan game untuk mengirim skor.
              </p>
            </div>
          ) : (
            scores.map((entry, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;
              let rankBg = "bg-white";
              let rankTextColor = "text-[#4A3A2A]";
              let rankBadge = null;

              if (rank === 1) {
                rankBg = "bg-[#FFC857]/15 border-[#FFC857]";
                rankTextColor = "text-[#FF9F1C] font-black";
                rankBadge = <Medal className="w-4 h-4 text-[#FFC857]" />;
              } else if (rank === 2) {
                rankBg = "bg-slate-100 border-slate-350";
                rankTextColor = "text-slate-500 font-bold";
                rankBadge = <Medal className="w-4 h-4 text-slate-400" />;
              } else if (rank === 3) {
                rankBg = "bg-[#FFF6E8] border-[#8B5E3C]/40";
                rankTextColor = "text-[#8B5E3C] font-bold";
                rankBadge = <Medal className="w-4 h-4 text-[#8B5E3C]/70" />;
              }

              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between rounded-2xl border-2 bg-white px-3 py-3 shadow-[0_3px_0_rgba(139,94,60,0.35)] ${rank === 1
                    ? "border-[#FFC857] bg-[#FFF1C7]"
                    : "border-[#8B5E3C]/35"
                    }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg border-2 border-[#8B5E3C] flex items-center justify-center font-pixel text-xs ${rank <= 3 ? "bg-white" : "bg-[#FFF1C7]/50"} ${rankTextColor}`}
                    >
                      {rank}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-pixel text-[10px] sm:text-xs text-[#4A3A2A] font-bold tracking-tight">
                          {entry.username}
                        </p>
                        {isTopThree && (
                          <Medal className="h-3.5 w-3.5 text-[#FF9F1C]" />
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-[#8B5E3C]">
                        <Calendar className="h-3 w-3" />
                        Survived {entry.survivalDays}/30 days
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-pixel text-sm font-black text-[#4A3A2A]">
                      {entry.score.toLocaleString("id-ID")}
                    </p>
                    <p className="text-[8px] font-bold uppercase text-[#8B5E3C]">
                      score
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
