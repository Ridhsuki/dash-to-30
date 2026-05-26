'use client';

import { useMemo, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';
import { PhaserGame as PhaserReact } from '@phaserjs/react';

export default function PhaserGame({ aiConfig }: { aiConfig: any }) {
  const config = useMemo<Phaser.Types.Core.GameConfig>(() => ({
    type: Phaser.AUTO,
    parent: 'game-container',
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.FIT,
      width: 800,
      height: 450,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0, x: 0 }
      }
    },
    scene: [MainScene]
  }), []);

  return <PhaserReact config={config} />;
}
