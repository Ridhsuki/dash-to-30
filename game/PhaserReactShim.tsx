"use client";

import React, { useEffect, useRef } from "react";
import Phaser from "phaser";

export interface PhaserGameProps {
  config: Phaser.Types.Core.GameConfig;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ config }) => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let gameInstance: Phaser.Game | null = null;

    const initTimer = setTimeout(() => {
      const parentElement = document.getElementById(
        (config.parent as string) || "game-container",
      );
      if (parentElement && !gameRef.current) {
        gameInstance = new Phaser.Game({
          ...config,
          parent: config.parent || "game-container",
        });
        gameRef.current = gameInstance;
      }
    }, 50);

    return () => {
      clearTimeout(initTimer);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      } else if (gameInstance) {
        gameInstance.destroy(true);
      }
    };
  }, [config]);

  return (
    <div
      id={(config.parent as string) || "game-container"}
      className="w-full h-full"
    />
  );
};
