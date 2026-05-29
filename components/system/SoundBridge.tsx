"use client";

import { useEffect } from "react";
import {
  getAudioSettingsEventName,
  isSoundEnabled,
  playGameSound,
  preloadAudio,
  startMusic,
  stopMusic,
  unlockExternalAudio,
  type AudioSettingsState,
} from "@/lib/audio/externalSoundManager";
import type { GameSoundKey } from "@/lib/audio/audioAssets";

type SoundBridgeProps = {
  mode: "home" | "game" | "silent";
};

function inferSoundFromControl(element: HTMLElement): GameSoundKey {
  const explicit = element.dataset.sound as GameSoundKey | undefined;

  if (explicit) return explicit;

  const text = `${element.textContent ?? ""} ${
    element.getAttribute("aria-label") ?? ""
  }`.toLowerCase();

  if (
    text.includes("currency") ||
    text.includes("rupiah") ||
    text.includes("dollar") ||
    text.includes("usd") ||
    text.includes("rp")
  ) {
    return "currency";
  }

  if (
    text.includes("sound") ||
    text.includes("audio") ||
    text.includes("music") ||
    text.includes("mute") ||
    text.includes("unmute")
  ) {
    return "settingsToggle";
  }

  if (text.includes("pause")) {
    return "pause";
  }

  return "uiClick";
}

export default function SoundBridge({ mode }: SoundBridgeProps) {
  useEffect(() => {
    preloadAudio();
  }, []);

  useEffect(() => {
    if (mode === "home") {
      startMusic("home");
      return;
    }

    if (mode === "game") {
      startMusic("game");
      return;
    }

    stopMusic();
  }, [mode]);

  useEffect(() => {
    const handleAudioSettingsChanged = (event: Event) => {
      const customEvent = event as CustomEvent<AudioSettingsState>;

      if (!customEvent.detail.musicEnabled) {
        stopMusic();
        return;
      }

      if (mode === "home") startMusic("home");
      if (mode === "game") startMusic("game");
    };

    window.addEventListener(
      getAudioSettingsEventName(),
      handleAudioSettingsChanged,
    );

    return () => {
      window.removeEventListener(
        getAudioSettingsEventName(),
        handleAudioSettingsChanged,
      );
    };
  }, [mode]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) return;

      const control = target.closest<HTMLElement>(
        "button, a, [role='button'], [data-sound]",
      );

      if (!control) return;
      if (control.getAttribute("aria-disabled") === "true") return;
      if ("disabled" in control && Boolean(control.disabled)) return;

      if (control.dataset.soundMuted === "true") {
        return;
      }

      void unlockExternalAudio().then(() => {
        if (mode === "home") startMusic("home");
        if (mode === "game") startMusic("game");
      });

      if (isSoundEnabled()) {
        playGameSound(inferSoundFromControl(control));
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopMusic();
        return;
      }

      if (mode === "home") startMusic("home");
      if (mode === "game") startMusic("game");
    };

    document.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
      capture: true,
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, {
        capture: true,
      } as EventListenerOptions);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [mode]);

  return null;
}
