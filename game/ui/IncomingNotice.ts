import Phaser from 'phaser';

import { DEPTH } from '../constants/layers';
import { GAME_HEX, GAME_RGB } from '../theme/gameTheme';
import type { EntityKind } from '../utils/gameText';
import { getEntityLabelStyle } from './EntityLabel';

export class IncomingNotice {
  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly bg: Phaser.GameObjects.Rectangle;
  private readonly title: Phaser.GameObjects.Text;
  private readonly body: Phaser.GameObjects.Text;
  private readonly detail: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, width: number) {
    this.scene = scene;

    this.bg = scene.add
      .rectangle(0, 0, 320, 54, GAME_RGB.cream, 0.94)
      .setStrokeStyle(2, GAME_RGB.gold, 1);

    this.title = scene.add
      .text(-146, -20, 'INCOMING', {
        fontFamily: 'monospace',
        fontSize: '9px',
        fontStyle: 'bold',
        color: GAME_HEX.brown,
      });

    this.body = scene.add
      .text(-146, -4, '', {
        fontFamily: 'monospace',
        fontSize: '13px',
        fontStyle: 'bold',
        color: GAME_HEX.text,
        wordWrap: {
          width: 210,
          useAdvancedWrap: true,
        },
        maxLines: 1,
      });

    this.detail = scene.add
      .text(72, -4, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: GAME_HEX.red,
        align: 'right',
        fixedWidth: 72,
      });

    this.container = scene.add
      .container(width / 2, 78, [this.bg, this.title, this.body, this.detail])
      .setDepth(DEPTH.hud)
      .setScrollFactor(0)
      .setAlpha(0)
      .setVisible(false);
  }

  show(label: string, kind: EntityKind, impactText = '') {
    const style = getEntityLabelStyle(kind);
    const prefix =
      kind === 'want'
        ? 'AVOID'
        : kind === 'need'
          ? 'TAKE'
          : kind === 'boss'
            ? 'WARNING'
            : 'BONUS';

    const impactColor =
      impactText.includes('+')
        ? GAME_HEX.green
        : impactText.includes('-')
          ? GAME_HEX.red
          : GAME_HEX.brown;

    this.scene.tweens.killTweensOf(this.container);

    this.bg
      .setFillStyle(GAME_RGB.cream, 0.94)
      .setStrokeStyle(2, style.border, 1);

    this.title
      .setText(prefix)
      .setColor(GAME_HEX.brown);

    this.body
      .setText(label.toUpperCase())
      .setColor(GAME_HEX.text);

    this.detail
      .setText(impactText)
      .setColor(impactColor);

    this.container
      .setVisible(true)
      .setAlpha(1)
      .setY(78)
      .setScale(0.98);

    this.scene.tweens.add({
      targets: this.container,
      y: 72,
      scaleX: 1,
      scaleY: 1,
      alpha: 0,
      delay: 1050,
      duration: 280,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.container.setVisible(false);
      },
    });
  }
}
