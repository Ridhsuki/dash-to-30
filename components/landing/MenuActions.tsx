"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import {
  Play,
  HelpCircle,
  User as UserIcon,
  Award,
  LogIn,
  LogOut,
} from "lucide-react";
import {
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import LeaderboardModal from "./LeaderboardModal";
import LeaderboardSubmitToast from "./LeaderboardSubmitToast";
import RoleSetupModal from "./RoleSetupModal";
import GameWrapper from "@/components/GameWrapper";
import { EventBus } from "@/game/EventBus";
import {
  createSubmitKey,
  submitLeaderboardScore,
  type GameOverPayload,
  type LeaderboardSubmitState,
} from "@/lib/leaderboard";

export default function MenuActions() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authErrorDetails, setAuthErrorDetails] = useState<{
    code?: string;
    message?: string;
    hostname?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [gameStarted, setGameStarted] = useState(false);
  const [aiConfig, setAiConfig] = useState<any>(null);
  const [submitStatus, setSubmitStatus] = useState<LeaderboardSubmitState>({
    status: "idle",
    title: "",
    message: "",
  });
  const lastSubmittedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!gameStarted) return;

    const handleGameOver = async (data: GameOverPayload) => {
      const submitKey = createSubmitKey(user?.uid ?? "guest", data);

      if (lastSubmittedKeyRef.current === submitKey) {
        return;
      }

      lastSubmittedKeyRef.current = submitKey;

      if (!user) {
        setSubmitStatus({
          status: "guest",
          title: "Skor tersimpan lokal",
          message: "Login untuk mengirim skor ke Global Leaderboard.",
          score: Number(data.score) || 0,
        });
        return;
      }

      setSubmitStatus({
        status: "submitting",
        title: "Mengirim skor...",
        message: "Menyimpan hasil run ke Global Leaderboard.",
        score: Number(data.score) || 0,
      });

      const result = await submitLeaderboardScore({
        db,
        user,
        payload: data,
      });

      setSubmitStatus(result);
    };

    EventBus.on("game-over", handleGameOver);

    return () => {
      EventBus.off("game-over", handleGameOver);
    };
  }, [gameStarted, user]);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (typeof window !== "undefined") {
        if (currentUser) {
          localStorage.setItem(
            "dashTo30_user",
            JSON.stringify({
              uid: currentUser.uid,
              username:
                currentUser.displayName ||
                currentUser.email?.split("@")[0] ||
                "Player",
              displayName: currentUser.displayName,
              email: currentUser.email,
            }),
          );
        } else {
          localStorage.removeItem("dashTo30_user");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRoleSubmit = async (confession: string) => {
    setIsGenerating(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confession }),
      });

      if (!res.ok) throw new Error("API Request Failed");

      const config = await res.json();

      if (typeof window !== "undefined") {
        localStorage.setItem("dashTo30_aiConfig", JSON.stringify(config));
      }

      setAiConfig(config);
      setGameStarted(true);
      setIsRoleModalOpen(false);
    } catch (error) {
      console.error("Error during financial sin generation:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) {
      setAuthError("other");
      setAuthErrorDetails({
        code: "FIREBASE_NOT_CONFIGURED",
        message: "Firebase env belum lengkap. Cek file .env.local.",
      });
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      setAuthError(null);
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      const errCode = error?.code || "";
      if (errCode === "auth/popup-closed-by-user") return;

      console.error("Google Sign In Error:", error);
      const errMsg = error?.message || "";

      if (
        errCode === "auth/unauthorized-domain" ||
        errMsg.includes("unauthorized-domain")
      ) {
        setAuthError("unauthorized-domain");
        setAuthErrorDetails({
          code: errCode,
          message: errMsg,
          hostname:
            typeof window !== "undefined"
              ? window.location.hostname
              : "your-app-domain.run.app",
        });
      } else if (errCode !== "auth/popup-closed-by-user") {
        setAuthError("other");
        setAuthErrorDetails({
          code: errCode || "UNKNOWN",
          message: errMsg || String(error),
        });
      }
    }
  };

  const handleLogout = async () => {
    if (!auth) return;

    try {
      await signOut(auth);

      if (typeof window !== "undefined") {
        localStorage.removeItem("dashTo30_user");
      }
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  };

  const handleCopy = () => {
    if (!authErrorDetails?.hostname) return;

    navigator.clipboard.writeText(authErrorDetails.hostname);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3 sm:space-y-3.5">
      <LeaderboardSubmitToast
        state={submitStatus}
        onDismiss={() =>
          setSubmitStatus({
            status: "idle",
            title: "",
            message: "",
          })
        }
      />
      {authError && (
        <div className="fixed inset-0 bg-[#4A3A2A]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#FFF6E8] border-4 border-[#8B5E3C] rounded-3xl p-6 shadow-[0_16px_32px_rgba(139,94,60,0.3)] text-left font-mono">
            <div className="flex items-center gap-2 text-[#FF6B6B] mb-2">
              <span className="text-xl">⚠️</span>
              <h3 className="font-pixel text-sm sm:text-base font-bold uppercase tracking-wider drop-shadow-sm">
                FIREBASE SETUP NEEDED
              </h3>
            </div>

            {authError === "unauthorized-domain" ? (
              <div className="space-y-3 text-[10px] sm:text-xs">
                <p className="text-[#4A3A2A]/85 leading-relaxed font-semibold">
                  This domain is not allowed to sign in with your Firebase
                  Project yet. Authorize it in Firebase Console.
                </p>

                <div className="bg-[#FFF1C7] border-2 border-[#8B5E3C] rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-[8px] text-[#4A3A2A]/50 font-bold uppercase tracking-widest">
                    YOUR CURRENT DOMAIN:
                  </span>

                  <div className="flex items-center justify-between gap-2 bg-white px-2 py-1.5 rounded-lg border border-[#8B5E3C]/30 font-bold text-[#FF7AA2]">
                    <span className="truncate select-all">
                      {authErrorDetails?.hostname}
                    </span>

                    <button
                      onClick={handleCopy}
                      type="button"
                      className="px-2 py-1 bg-[#6FD08C]/15 text-[#6FD08C] border border-[#6FD08C]/40 hover:bg-[#6FD08C]/20 text-[9px] rounded font-pixel transition-all cursor-pointer font-bold shrink-0"
                    >
                      {copied ? "✓ COPIED" : "COPY"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-[#4A3A2A]/85 font-mono">
                <p className="font-semibold text-rose-500">
                  Firebase sign-in failed:
                </p>

                <div className="bg-[#FFF1C7] border border-[#8B5E3C]/30 rounded-lg p-2.5 text-[9px] overflow-auto max-h-32 text-orange-700">
                  <p>
                    <b>CODE:</b> {authErrorDetails?.code}
                  </p>
                  <p className="mt-1">
                    <b>MESSAGE:</b> {authErrorDetails?.message}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2.5 mt-5">
              <a
                href="https://console.firebase.google.com/"
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-[#6FD08C] hover:bg-[#5bb776] text-white font-pixel text-[10px] text-center py-2.5 rounded-xl border-2 border-b-4 border-[#8B5E3C] transition-all cursor-pointer uppercase flex items-center justify-center"
              >
                OPEN CONSOLE
              </a>

              <button
                onClick={() => setAuthError(null)}
                type="button"
                className="px-4 bg-[#FFF1C7] hover:bg-white text-[#4A3A2A] font-pixel text-[10px] py-2.5 rounded-xl border-2 border-b-4 border-[#8B5E3C] active:border-b-2 active:translate-y-[1px] transition-all cursor-pointer uppercase"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {gameStarted ? (
        createPortal(
          <div className="fixed inset-0 z-[100] bg-[#1a1a1a] overflow-hidden">
            <GameWrapper aiConfig={aiConfig} />
          </div>,
          document.body,
        )
      ) : (
        <>
          <button
            type="button"
            onClick={() => setIsRoleModalOpen(true)}
            className="group relative w-full bg-[#FFC857] hover:bg-[#FF9F1C] text-[#4A3A2A] font-black py-4.5 px-6 uppercase rounded-2xl transition-all duration-75 border-2 border-[#FFF6E8] border-b-6 border-b-[#8B5E3C] active:border-b-2 active:translate-y-[4px] cursor-pointer flex items-center justify-center gap-3 font-pixel select-none shadow-[0_8px_16px_rgba(139,94,60,0.12)] btn-shimmer overflow-hidden focus-visible:outline-4 focus-visible:outline-[#FF9F1C]"
          >
            <Play className="w-4 h-4 fill-[#4A3A2A] stroke-[#4A3A2A]" />
            <span className="text-xs sm:text-sm tracking-widest">
              PLAY GAME
            </span>
          </button>

          <button
            type="button"
            className="group relative w-full bg-[#FFF6E8] hover:bg-white text-[#4A3A2A] border-2 border-[#8B5E3C] border-b-4 border-b-[#8B5E3C] active:border-b-2 active:translate-y-[2px] cursor-pointer text-[9px] sm:text-[10px] font-pixel py-3.5 rounded-xl transition-all flex items-center justify-center gap-2.5 uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF9F1C]"
          >
            <HelpCircle className="w-4 h-4 text-[#6FD08C]" />
            <span>HOW TO PLAY</span>
          </button>

          <button
            onClick={() => setIsLeaderboardOpen(true)}
            type="button"
            className="group relative w-full bg-[#FFF6E8] hover:bg-white text-[#4A3A2A] border-2 border-[#8B5E3C] border-b-4 border-b-[#8B5E3C] active:border-b-2 active:translate-y-[2px] cursor-pointer text-[9px] sm:text-[10px] font-pixel py-3.5 rounded-xl transition-all flex items-center justify-center gap-2.5 uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF9F1C]"
          >
            <Award className="w-4 h-4 text-[#FF9F1C]" />
            <span>LEADERBOARD STATS</span>
          </button>

          <div className="h-[2px] bg-[#8B5E3C]/20 my-2"></div>

          {loading ? (
            <div className="w-full bg-[#FFF1C7]/50 border-2 border-[#8B5E3C] border-dashed text-[10px] text-[#4A3A2A]/40 font-mono py-3.5 rounded-xl text-center uppercase tracking-wider">
              LOADING STATUS...
            </div>
          ) : user ? (
            <div className="w-full flex items-center justify-between bg-[#FFF1C7] border-2 border-[#8B5E3C] rounded-xl px-3 py-2.5 shadow-[0_3px_0_#8B5E3C] transition-all">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <div className="relative w-7 h-7 rounded-lg border-2 border-[#8B5E3C] overflow-hidden bg-white">
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || "Player"}
                      referrerPolicy="no-referrer"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-7 h-7 bg-[#9B8CFF]/25 border-2 border-[#8B5E3C] rounded-lg flex items-center justify-center font-bold text-xs text-[#9B8CFF]">
                    {user.displayName ? user.displayName[0].toUpperCase() : "P"}
                  </div>
                )}

                <div className="flex flex-col text-left">
                  <span className="text-[7px] font-mono font-bold tracking-widest text-[#4A3A2A]/50 uppercase">
                    LOGGED IN AS
                  </span>
                  <span className="text-[10px] sm:text-xs font-pixel font-bold text-[#4A3A2A] leading-tight text-shadow-sm truncate max-w-[140px] sm:max-w-[180px]">
                    {user.displayName
                      ? user.displayName.split(" ")[0]
                      : user.email?.split("@")[0] || "PLAYER"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                type="button"
                title="Log Out"
                className="w-8 h-8 rounded-lg bg-[#FF7AA2]/10 hover:bg-[#FF7AA2]/20 border-2 border-[#8B5E3C] text-[#FF7AA2] flex items-center justify-center transition-all active:translate-y-[1px] hover:text-[#FF6B6B] cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="group w-full bg-[#FFF1C7] hover:bg-white text-[10px] sm:text-xs text-[#4A3A2A] font-bold py-3.5 rounded-xl border-2 border-[#8B5E3C] shadow-[0_3px_0_#8B5E3C] active:translate-y-[2px] active:shadow-[0_1px_0_#8B5E3C] transition-all uppercase font-mono tracking-wider flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#FF7AA2]" />
              <span>LOGIN TO SAVE SCORE</span>
            </button>
          )}
        </>
      )}

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      <RoleSetupModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSubmit={handleRoleSubmit}
        isGenerating={isGenerating}
      />
    </div>
  );
}
