'use client';

import { useMemo, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';
import { PhaserGame as PhaserReact } from '@phaserjs/react';

export default function PhaserGame({ aiConfig }: { aiConfig: any }) {
  const config = useMemo<Phaser.Types.Core.GameConfig>(() => ({
    type: Phaser.AUTO,
    parent: 'game-container',
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: '100%',
      height: '100%'
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
