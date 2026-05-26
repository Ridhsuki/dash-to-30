import Phaser from 'phaser';

import { DEPTH } from '../constants/layers';
import { GAME_HEX, GAME_RGB } from '../theme/gameTheme';
import { GAMEPLAY } from '../config/gameplay';

type FeedTone = 'info' | 'good' | 'bad' | 'warning';

type FeedItem = {
  text: string;
  tone: FeedTone;
};

const TONE_COLOR: Record<FeedTone, string> = {
  info: GAME_HEX.text,
  good: GAME_HEX.green,
  bad: GAME_HEX.red,
  warning: GAME_HEX.orange,
};

export class EventFeed {
  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly bg: Phaser.GameObjects.Rectangle;
  private readonly title: Phaser.GameObjects.Text;
  private readonly rows: Phaser.GameObjects.Text[] = [];
  private readonly items: FeedItem[] = [];

  constructor(scene: Phaser.Scene, width: number, _height: number) {
    this.scene = scene;

    this.bg = scene.add
      .rectangle(0, 0, 210, 106, GAME_RGB.cream, 0.9)
      .setStrokeStyle(2, GAME_RGB.gold, 0.9);

    this.title = scene.add
      .text(-94, -46, 'RECENT CASHFLOW', {
        fontFamily: 'monospace',
        fontSize: '9px',
        fontStyle: 'bold',
        color: GAME_HEX.brown,
      });

    this.container = scene.add
      .container(width - 122, 123, [this.bg, this.title])
      .setDepth(DEPTH.hud)
      .setScrollFactor(0)
      .setAlpha(0.94);

    for (let i = 0; i < GAMEPLAY.eventFeedLimit; i += 1) {
      const row = scene.add
        .text(-94, -28 + i * 16, '', {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: GAME_HEX.text,
          fixedWidth: 188,
        })
        .setAlpha(0.84);

      this.rows.push(row);
      this.container.add(row);
    }
  }

  push(text: string, tone: FeedTone = 'info') {
    const safeText = text.replace(/\s+/g, ' ').trim().slice(0, 28);

    if (!safeText) return;

    this.items.unshift({
      text: safeText,
      tone,
    });

    this.items.splice(GAMEPLAY.eventFeedLimit);
    this.render();

    this.scene.tweens.add({
      targets: this.container,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 100,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });
  }

  private render() {
    this.rows.forEach((row, index) => {
      const item = this.items[index];

      if (!item) {
        row.setText('');
        return;
      }

      row
        .setText(`• ${item.text}`)
        .setColor(TONE_COLOR[item.tone]);
    });
  }
}
