'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Play, 
  HelpCircle, 
  User as UserIcon, 
  Award, 
  LogIn, 
  LogOut 
} from 'lucide-react';
import { 
  User, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import LeaderboardModal from './LeaderboardModal';

export default function MenuActions() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authErrorDetails, setAuthErrorDetails] = useState<{ code?: string; message?: string; hostname?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  useEffect(() => {
    // Listen to current authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    // Configure default parameters to prompt for accounts
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      setAuthError(null);
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      const errCode = error?.code || '';
      const errMsg = error?.message || '';
      
      if (errCode === 'auth/unauthorized-domain' || errMsg.includes('unauthorized-domain')) {
        setAuthError('unauthorized-domain');
        setAuthErrorDetails({
          code: errCode,
          message: errMsg,
          hostname: typeof window !== 'undefined' ? window.location.hostname : 'your-app-domain.run.app'
        });
      } else if (errCode !== 'auth/popup-closed-by-user') {
        setAuthError('other');
        setAuthErrorDetails({
          code: errCode || 'UNKNOWN',
          message: errMsg || String(error)
        });
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  const handleCopy = () => {
    if (authErrorDetails?.hostname) {
      navigator.clipboard.writeText(authErrorDetails.hostname);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-3.5">
      {/* Dynamic Instruction / Error Setup Modal */}
      {authError && (
        <div className="fixed inset-0 bg-[#4A3A2A]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#FFF6E8] border-4 border-[#8B5E3C] rounded-3xl p-6 shadow-[0_16px_32px_rgba(139,94,60,0.3)] anim-menu-box text-left font-mono">
            {/* Header */}
            <div className="flex items-center gap-2 text-[#FF6B6B] mb-2">
              <span className="text-xl">⚠️</span>
              <h3 className="font-pixel text-sm sm:text-base font-bold uppercase tracking-wider drop-shadow-sm">
                FIREBASE SETUP NEEDED
              </h3>
            </div>

            {authError === 'unauthorized-domain' ? (
              <div className="space-y-3 text-[10px] sm:text-xs">
                <p className="text-[#4A3A2A]/85 leading-relaxed font-semibold">
                  This domain is not allowed to sign in with your Firebase Project yet. Let&apos;s authorize it in your Firebase Console!
                </p>

                {/* Display Current Domain Box */}
                <div className="bg-[#FFF1C7] border-2 border-[#8B5E3C] rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-[8px] text-[#4A3A2A]/50 font-bold uppercase tracking-widest">
                    YOUR CURRENT DOMAIN:
                  </span>
                  <div className="flex items-center justify-between gap-2 bg-white px-2 py-1.5 rounded-lg border border-[#8B5E3C]/30 font-bold text-[#FF7AA2]">
                    <span className="truncate select-all">{authErrorDetails?.hostname}</span>
                    <button 
                      onClick={handleCopy}
                      type="button"
                      className="px-2 py-1 bg-[#6FD08C]/15 text-[#6FD08C] border border-[#6FD08C]/40 hover:bg-[#6FD08C]/20 text-[9px] rounded font-pixel transition-all cursor-pointer font-bold shrink-0"
                    >
                      {copied ? '✓ COPIED' : 'COPY'}
                    </button>
                  </div>
                </div>

                {/* Integration Steps */}
                <div className="space-y-1 text-[9px] text-[#4A3A2A]/70 uppercase font-bold leading-normal">
                  <div className="flex gap-1.5">
                    <span className="text-[#FF9F1C]">1.</span>
                    <span>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-[#FF9F1C] hover:underline inline-flex items-center gap-0.5">Firebase Console ↗</a></span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-[#FF9F1C]">2.</span>
                    <span>Go to <b className="text-[#4A3A2A]">Authentication &gt; Settings</b></span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-[#FF9F1C]">3.</span>
                    <span>Under <b className="text-[#4A3A2A]">Authorized Domains</b> click &quot;Add domain&quot;</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-[#FF9F1C]">4.</span>
                    <span>Paste your domain from above and click Add!</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-[#4A3A2A]/85 font-mono">
                <p className="font-semibold text-rose-500">Firebase sign-in failed with an unexpected response:</p>
                <div className="bg-[#FFF1C7] border border-[#8B5E3C]/30 rounded-lg p-2.5 text-[9px] overflow-auto max-h-32 text-orange-700">
                  <p><b>CODE:</b> {authErrorDetails?.code}</p>
                  <p className="mt-1"><b>MESSAGE:</b> {authErrorDetails?.message}</p>
                </div>
              </div>
            )}

            {/* Actions Footer */}
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

      {/* Primary Action Button: PLAY (Sunny Yellow #FFC857 & shadow alignment) */}
      <button 
        type="button"
        className="group relative w-full bg-[#FFC857] hover:bg-[#FF9F1C] text-[#4A3A2A] font-black py-4.5 px-6 uppercase rounded-2xl transition-all duration-75 border-2 border-[#FFF6E8] border-b-6 border-b-[#8B5E3C] active:border-b-2 active:translate-y-[4px] cursor-pointer flex items-center justify-center gap-3 font-pixel select-none shadow-[0_8px_16px_rgba(139,94,60,0.12)] btn-shimmer overflow-hidden focus-visible:outline-4 focus-visible:outline-[#FF9F1C]"
      >
        <Play className="w-4 h-4 fill-[#4A3A2A] stroke-[#4A3A2A]" />
        <span className="text-xs sm:text-sm tracking-widest">PLAY GAME</span>
      </button>

      {/* Minor grid-aligned options */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          type="button"
          className="group relative bg-[#FFF6E8] hover:bg-white text-[#4A3A2A] border-2 border-[#8B5E3C] border-b-4 border-b-[#8B5E3C] active:border-b-2 active:translate-y-[2px] cursor-pointer text-[9px] sm:text-[10px] font-pixel py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF9F1C]"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#6FD08C]" />
          <span>HOW TO PLAY</span>
        </button>

        <button 
          type="button"
          className="group relative bg-[#FFF6E8] hover:bg-white text-[#4A3A2A] border-2 border-[#8B5E3C] border-b-4 border-b-[#8B5E3C] active:border-b-2 active:translate-y-[2px] cursor-pointer text-[9px] sm:text-[10px] font-pixel py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF9F1C]"
        >
          <UserIcon className="w-3.5 h-3.5 text-[#9B8CFF]" />
          <span>CHOOSE ROLE</span>
        </button>
      </div>

      {/* Leaderboard stats trigger */}
      <button 
        onClick={() => setIsLeaderboardOpen(true)}
        type="button"
        className="group relative w-full bg-[#FFF6E8] hover:bg-white text-[#4A3A2A] border-2 border-[#8B5E3C] border-b-4 border-b-[#8B5E3C] active:border-b-2 active:translate-y-[2px] cursor-pointer text-[9px] sm:text-[10px] font-pixel py-3.5 rounded-xl transition-all flex items-center justify-center gap-2.5 uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF9F1C]"
      >
        <Award className="w-4 h-4 text-[#FF9F1C]" />
        <span>LEADERBOARD STATS</span>
      </button>

      {/* Clean line separation */}
      <div className="h-[2px] bg-[#8B5E3C]/20 my-2"></div>

      {/* Auth state loader or dynamic buttons */}
      {loading ? (
        <div className="w-full bg-[#FFF1C7]/50 border-2 border-[#8B5E3C] border-dashed text-[10px] text-[#4A3A2A]/40 font-mono py-3.5 rounded-xl text-center uppercase tracking-wider">
          LOADING STATUS...
        </div>
      ) : user ? (
        /* Logged-In State Card */
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
                {user.displayName ? user.displayName[0].toUpperCase() : 'P'}
              </div>
            )}
            
            <div className="flex flex-col text-left">
              <span className="text-[7px] font-mono font-bold tracking-widest text-[#4A3A2A]/50 uppercase">
                LOGGED IN AS
              </span>
              <span className="text-[10px] sm:text-xs font-pixel font-bold text-[#4A3A2A] leading-tight text-shadow-sm truncate max-w-[140px] sm:max-w-[180px]">
                {user.displayName ? user.displayName.split(' ')[0] : 'PLAYER'}
              </span>
            </div>
          </div>

          {/* Clean Log Out button aligned to retro elements */}
          <button
            onClick={handleLogout}
            type="button"
            title="Log Out"
            className="w-8 h-8 rounded-lg bg-[#FF7AA2]/10 hover:bg-[#FF7AA2]/20 border-2 border-[#8B5E3C] text-[#FF7AA2] flex items-center justify-center transition-all active:translate-y-[1px] hover:text-[#FF6B6B] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF9F1C]"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Logged-Out / Guest State Button card */
        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="group w-full bg-[#FFF1C7] hover:bg-white text-[10px] sm:text-xs text-[#4A3A2A] font-bold py-3.5 rounded-xl border-2 border-[#8B5E3C] shadow-[0_3px_0_#8B5E3C] active:translate-y-[2px] active:shadow-[0_1px_0_#8B5E3C] transition-all uppercase font-mono tracking-wider flex items-center justify-center gap-2.5 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF9F1C]"
        >
          <LogIn className="w-3.5 h-3.5 text-[#FF7AA2]" />
          <span>LOGIN TO SAVE SCORE</span>
        </button>
      )}

      {/* Global Leaderboard Modal Overlay */}
      <LeaderboardModal 
        isOpen={isLeaderboardOpen} 
        onClose={() => setIsLeaderboardOpen(false)} 
      />
    </div>
  );
}
