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

export default function MenuActions() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google Sign In Error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-3.5">
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
    </div>
  );
}
