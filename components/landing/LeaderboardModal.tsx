"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Trophy,
  X,
  Medal,
  Sparkles,
  Calendar,
  AlertCircle,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
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

// Gorgeous fallback dummy data matching the theme of late-month retail item shoppers
const FALLBACK_SCORES: ScoreEntry[] = [
  { id: "mock1", username: "SuperSaver_99", score: 2840, survivalDays: 30 },
  { id: "mock2", username: "KopiAddictNoMore", score: 2450, survivalDays: 30 },
  { id: "mock3", username: "NeedsVWantMaster", score: 2100, survivalDays: 28 },
  { id: "mock4", username: "AntiPaylaterAgent", score: 1850, survivalDays: 26 },
  { id: "mock5", username: "CashKing", score: 1510, survivalDays: 24 },
  { id: "mock6", username: "BudgetHero_A", score: 1200, survivalDays: 20 },
  { id: "mock7", username: "MinimartChallenger", score: 980, survivalDays: 18 },
  { id: "mock8", username: "SalarySurviver", score: 750, survivalDays: 15 },
  { id: "mock9", username: "InstaWantRegrets", score: 320, survivalDays: 10 },
  { id: "mock10", username: "PaylaterTrapVictim", score: 50, survivalDays: 4 },
];

export default function LeaderboardModal({
  isOpen,
  onClose,
}: LeaderboardModalProps) {
  const [mounted, setMounted] = useState(false);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  // Set mounted flag to true on the client to avoid hydration mismatch
  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let unsubscribe = () => {};

    const timer = setTimeout(() => {
      setLoading(true);
      setUsingFallback(false);

      try {
        if (!db) {
          throw new Error("Firestore DB is not initialized");
        }

        const highscoresRef = collection(db, "highscores");
        const q = query(highscoresRef, orderBy("score", "desc"), limit(10));

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const snapshotScores: ScoreEntry[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              snapshotScores.push({
                id: doc.id,
                username: data.username || "Anonymous Player",
                score: Number(data.score) || 0,
                survivalDays: Number(data.survivalDays) || 0,
              });
            });

            if (snapshotScores.length > 0) {
              setScores(snapshotScores);
              setUsingFallback(false);
            } else {
              // If collection is empty, display dummy highscores as default seed values
              setScores(FALLBACK_SCORES);
              setUsingFallback(true);
            }
            setLoading(false);
          },
          (error) => {
            console.warn(
              "Firestore onSnapshot error, falling back to local demo scoring:",
              error,
            );
            setScores(FALLBACK_SCORES);
            setUsingFallback(true);
            setLoading(false);
          },
        );
      } catch (e) {
        console.warn(
          "Real-time listener setup caught error, using local demo scoring:",
          e,
        );
        setScores(FALLBACK_SCORES);
        setUsingFallback(true);
        setLoading(false);
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [isOpen]);

  // If not mounted yet or modal is closed, don't render anything
  if (!mounted || !isOpen) return null;

  // Use React Portal to attach overlay directly to document.body
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

        {/* Title Group */}
        <div className="text-center mt-3 mb-4 shrink-0">
          <h2 className="font-pixel text-2xl sm:text-3xl text-[#FF9F1C] font-bold drop-shadow-[0_2.5px_0_#8B5E3C] tracking-wide flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FFC857] animate-pulse" />
            GLOBAL RANKINGS
            <Sparkles className="w-5 h-5 text-[#FFC857] animate-pulse" />
          </h2>
          <p className="text-[9px] font-mono font-bold text-[#4A3A2A]/60 tracking-wider mt-1.5">
            DASH TO 30 BEST SURVIVAL PURSES
          </p>
        </div>

        {/* Using Demo/Temporary Mock Alert when sandbox domain isn't fully configured */}
        {usingFallback && (
          <div className="mb-3.5 bg-[#FFF2DA] border border-[#FF9F1C]/40 rounded-xl p-2 sm:p-2.5 flex items-start gap-2 text-left shrink-0">
            <AlertCircle className="w-4 h-4 text-[#FF9F1C] shrink-0 mt-0.5" />
            <div className="text-[8px] sm:text-[9px] font-mono text-[#4A3A2A]/80 leading-normal font-bold uppercase py-0.5">
              <span>
                SHOWING DEMO RANKINGS. INTEGRATE CLOUD DB TO RENDER LIVE
                SUBMISSIONS!
              </span>
            </div>
          </div>
        )}

        {/* Main Score List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[58vh] scrollbar-thin scrollbar-thumb-pink">
          {loading ? (
            <div className="py-12 text-center text-xs font-mono font-bold text-[#4A3A2A]/40 uppercase tracking-widest">
              COLLECTING SCORE RECORDS...
            </div>
          ) : scores.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono font-bold text-[#4A3A2A]/40 uppercase tracking-widest bg-[#FFF1C7]/30 border border-[#8B5E3C]/20 rounded-2xl">
              NO SUBMISSIONS YET!
            </div>
          ) : (
            scores.map((entry, index) => {
              const rank = index + 1;
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
                  className={`flex items-center justify-between border-2 border-[#8B5E3C]/30 rounded-xl p-2.5 transition-all hover:translate-x-[2px] ${rankBg}`}
                >
                  {/* Left rank label & Avatar */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg border-2 border-[#8B5E3C] flex items-center justify-center font-pixel text-xs ${rank <= 3 ? "bg-white" : "bg-[#FFF1C7]/50"} ${rankTextColor}`}
                    >
                      {rank}
                    </span>
                    <div className="flex flex-col text-left">
                      <span className="font-pixel text-[10px] sm:text-xs text-[#4A3A2A] font-bold tracking-tight">
                        {entry.username}
                      </span>
                      <span className="text-[7px] font-mono text-[#4A3A2A]/50 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                        <Calendar className="w-2.5 h-2.5" /> Survived:{" "}
                        {entry.survivalDays}/30 Days
                      </span>
                    </div>
                  </div>

                  {/* Right hand score info */}
                  <div className="flex items-center gap-1.5 font-mono text-right font-bold">
                    {rankBadge}
                    <span className="text-xs sm:text-sm text-[#4A3A2A]">
                      ${entry.score.toLocaleString()}
                    </span>
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
