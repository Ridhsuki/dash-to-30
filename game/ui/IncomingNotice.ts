import Phaser from 'phaser';

import { GAME_HEX, GAME_RGB } from '../theme/gameTheme';
import type { EntityKind } from '../utils/gameText';
import { getEntityLabelStyle } from './EntityLabel';

export class IncomingNotice {
  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly bg: Phaser.GameObjects.Rectangle;
  private readonly title: Phaser.GameObjects.Text;
  private readonly body: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, width: number) {
    this.scene = scene;

    this.bg = scene.add
      .rectangle(0, 0, 270, 42, GAME_RGB.cream, 0.94)
      .setStrokeStyle(2, GAME_RGB.gold, 1);

    this.title = scene.add
      .text(-122, -14, 'INCOMING', {
        fontFamily: 'monospace',
        fontSize: '9px',
        fontStyle: 'bold',
        color: GAME_HEX.brown,
      });

    this.body = scene.add
      .text(-122, 0, '', {
        fontFamily: 'monospace',
        fontSize: '13px',
        fontStyle: 'bold',
        color: GAME_HEX.text,
        wordWrap: {
          width: 244,
          useAdvancedWrap: true,
        },
        maxLines: 1,
      });

    this.container = scene.add
      .container(width / 2, 92, [this.bg, this.title, this.body])
      .setDepth(35)
      .setScrollFactor(0)
      .setAlpha(0)
      .setVisible(false);
  }

  show(label: string, kind: EntityKind) {
    const style = getEntityLabelStyle(kind);
    const prefix =
      kind === 'want'
        ? 'AVOID'
        : kind === 'need'
          ? 'TAKE'
          : kind === 'boss'
            ? 'WARNING'
            : 'BONUS';

    this.scene.tweens.killTweensOf(this.container);

    this.bg
      .setFillStyle(kind === 'boss' ? GAME_RGB.red : GAME_RGB.cream, kind === 'boss' ? 0.96 : 0.94)
      .setStrokeStyle(2, style.border, 1);

    this.title
      .setText(prefix)
      .setColor(kind === 'boss' ? '#FFFFFF' : GAME_HEX.brown);

    this.body
      .setText(label.toUpperCase())
      .setColor(kind === 'boss' ? '#FFFFFF' : GAME_HEX.text);

    this.container
      .setVisible(true)
      .setAlpha(1)
      .setY(92);

    this.scene.tweens.add({
      targets: this.container,
      y: 84,
      alpha: 0,
      delay: 900,
      duration: 260,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.container.setVisible(false);
      },
    });
  }
}
