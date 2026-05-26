import Phaser from 'phaser';

import { DEPTH } from '../constants/layers';
import { GAME_HEX, GAME_RGB } from '../theme/gameTheme';

export class ProgressBar {
  private readonly container: Phaser.GameObjects.Container;
  private readonly fill: Phaser.GameObjects.Rectangle;
  private readonly label: Phaser.GameObjects.Text;
  private readonly width = 280;
  private readonly height = 14;

  constructor(scene: Phaser.Scene, gameWidth: number) {
    const bg = scene.add
      .rectangle(0, 0, this.width + 18, 34, GAME_RGB.cream, 0.92)
      .setStrokeStyle(2, GAME_RGB.gold, 1);

    const track = scene.add
      .rectangle(0, 6, this.width, this.height, GAME_RGB.brown, 0.26)
      .setStrokeStyle(1, GAME_RGB.brown, 0.34);

    this.fill = scene.add
      .rectangle(-this.width / 2, 6, 0, this.height - 4, GAME_RGB.green, 1)
      .setOrigin(0, 0.5);

    const shine = scene.add
      .rectangle(0, 2, this.width - 8, 3, 0xffffff, 0.24)
      .setOrigin(0.5);

    this.label = scene.add
      .text(0, -10, 'MONTH JOURNEY 1/30', {
        fontFamily: 'monospace',
        fontSize: '10px',
        fontStyle: 'bold',
        color: GAME_HEX.brown,
      })
      .setOrigin(0.5);

    this.container = scene.add
      .container(gameWidth / 2, 28, [bg, track, this.fill, shine, this.label])
      .setDepth(DEPTH.hud)
      .setScrollFactor(0);
  }

  update(day: number, maxDay: number) {
    const safeMaxDay = Math.max(1, maxDay);
    const safeDay = Phaser.Math.Clamp(day, 1, safeMaxDay);
    const ratio = safeDay / safeMaxDay;
    const fillWidth = Math.round(this.width * ratio);

    const color =
      ratio >= 0.9
        ? GAME_RGB.red
        : ratio >= 0.67
          ? GAME_RGB.pink
          : ratio >= 0.4
            ? GAME_RGB.gold
            : GAME_RGB.green;

    this.fill
      .setFillStyle(color, 1)
      .setSize(fillWidth, this.height - 4);

    this.label.setText(`MONTH JOURNEY ${safeDay}/${safeMaxDay}`);
  }
}
