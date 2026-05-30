"use client";

import { useEffect, useState } from "react";
import { Music, Volume2, VolumeX } from "lucide-react";
import {
  getAudioSettings,
  getAudioSettingsEventName,
  toggleMusicEnabled,
  toggleSoundEnabled,
  unlockExternalAudio,
  type AudioSettingsState,
} from "@/lib/audio/externalSoundManager";

export default function AudioSettingsControls() {
  const [settings, setSettings] = useState<AudioSettingsState>({
    soundEnabled: true,
    musicEnabled: true,
  });

  useEffect(() => {
    setSettings(getAudioSettings());

    const handleChange = (event: Event) => {
      const customEvent = event as CustomEvent<AudioSettingsState>;
      setSettings(customEvent.detail);
    };

    window.addEventListener(getAudioSettingsEventName(), handleChange);

    return () => {
      window.removeEventListener(getAudioSettingsEventName(), handleChange);
    };
  }, []);

  const handleToggleSound = () => {
    void unlockExternalAudio();

    const soundEnabled = toggleSoundEnabled();

    setSettings((current) => ({
      ...current,
      soundEnabled,
    }));
  };

  const handleToggleMusic = () => {
    void unlockExternalAudio();

    const musicEnabled = toggleMusicEnabled();

    setSettings((current) => ({
      ...current,
      musicEnabled,
    }));
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleToggleSound}
        data-sound-muted="true"
        aria-pressed={settings.soundEnabled}
        className="flex w-full items-center justify-between rounded-2xl border-2 border-[#8B5E3C] bg-[#FFF1C7] px-4 py-3 text-left shadow-[0_3px_0_#8B5E3C] transition active:translate-y-[2px] active:shadow-[0_1px_0_#8B5E3C]"
      >
        <span className="flex items-center gap-3">
          {settings.soundEnabled ? (
            <Volume2 className="h-4 w-4 text-[#6FD08C]" />
          ) : (
            <VolumeX className="h-4 w-4 text-[#FF6B6B]" />
          )}

          <span>
            <span className="block font-pixel text-[10px] uppercase text-[#4A3A2A]">
              Sound Effects
            </span>
            <span className="block font-mono text-[9px] font-bold text-[#8B5E3C]">
              Klik, jump, hit, pickup, pause
            </span>
          </span>
        </span>

        <span
          className={`rounded-xl border-2 border-[#8B5E3C] px-3 py-1 font-pixel text-[9px] ${
            settings.soundEnabled
              ? "bg-[#6FD08C] text-[#4A3A2A]"
              : "bg-[#FF6B6B] text-[#FFF6E8]"
          }`}
        >
          {settings.soundEnabled ? "ON" : "OFF"}
        </span>
      </button>

      <button
        type="button"
        onClick={handleToggleMusic}
        data-sound-muted="true"
        aria-pressed={settings.musicEnabled}
        className="flex w-full items-center justify-between rounded-2xl border-2 border-[#8B5E3C] bg-[#FFF1C7] px-4 py-3 text-left shadow-[0_3px_0_#8B5E3C] transition active:translate-y-[2px] active:shadow-[0_1px_0_#8B5E3C]"
      >
        <span className="flex items-center gap-3">
          <Music
            className={`h-4 w-4 ${
              settings.musicEnabled ? "text-[#9B8CFF]" : "text-[#FF6B6B]"
            }`}
          />

          <span>
            <span className="block font-pixel text-[10px] uppercase text-[#4A3A2A]">
              Backsound Music
            </span>
            <span className="block font-mono text-[9px] font-bold text-[#8B5E3C]">
              Music home dan in-game
            </span>
          </span>
        </span>

        <span
          className={`rounded-xl border-2 border-[#8B5E3C] px-3 py-1 font-pixel text-[9px] ${
            settings.musicEnabled
              ? "bg-[#9B8CFF] text-[#FFF6E8]"
              : "bg-[#FF6B6B] text-[#FFF6E8]"
          }`}
        >
          {settings.musicEnabled ? "ON" : "OFF"}
        </span>
      </button>
    </div>
  );
}
