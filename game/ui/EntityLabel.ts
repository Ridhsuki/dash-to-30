import Phaser from 'phaser';

import { GAME_HEX, GAME_RGB } from '../theme/gameTheme';
import type { EntityKind } from '../utils/gameText';
import { DEPTH } from '../constants/layers';

type EntityLabelStyle = {
  width: number;
  height: number;
  bg: number;
  border: number;
  text: string;
};

export function getEntityLabelStyle(kind: EntityKind): EntityLabelStyle {
  if (kind === 'boss') {
    return {
      width: 118,
      height: 28,
      bg: GAME_RGB.red,
      border: GAME_RGB.cream,
      text: '#FFFFFF',
    };
  }

  if (kind === 'want') {
    return {
      width: 108,
      height: 26,
      bg: GAME_RGB.pink,
      border: GAME_RGB.red,
      text: '#FFFFFF',
    };
  }

  if (kind === 'need') {
    return {
      width: 108,
      height: 26,
      bg: GAME_RGB.receipt,
      border: GAME_RGB.gold,
      text: GAME_HEX.text,
    };
  }

  return {
    width: 104,
    height: 26,
    bg: GAME_RGB.green,
    border: GAME_RGB.cream,
    text: GAME_HEX.text,
  };
}

export class EntityLabel {
  private readonly container: Phaser.GameObjects.Container;
  private readonly text: Phaser.GameObjects.Text;
  private readonly bg: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    kind: EntityKind,
  ) {
    const style = getEntityLabelStyle(kind);

    this.bg = scene.add
      .rectangle(0, 0, style.width, style.height, style.bg, 0.96)
      .setStrokeStyle(2, style.border, 1);

    this.text = scene.add
      .text(0, 1, label, {
        fontFamily: 'monospace',
        fontSize: '11px',
        fontStyle: 'bold',
        color: style.text,
        align: 'center',
        wordWrap: {
          width: style.width - 12,
          useAdvancedWrap: true,
        },
        maxLines: 2,
      })
      .setOrigin(0.5);

    this.container = scene.add
      .container(Math.round(x), Math.round(y), [this.bg, this.text])
      .setDepth(DEPTH.gameplayLabel);
  }

  update(x: number, y: number) {
    this.container.setPosition(Math.round(x), Math.round(y));
  }

  destroy() {
    this.container.destroy(true);
  }
}
