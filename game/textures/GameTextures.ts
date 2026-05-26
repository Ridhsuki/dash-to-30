import Phaser from 'phaser';

import { GAME_RGB } from '../theme/gameTheme';

type DrawTexture = (graphics: Phaser.GameObjects.Graphics) => void;

function recreateTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  draw: DrawTexture,
) {
  if (scene.textures.exists(key)) {
    scene.textures.remove(key);
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);

  draw(graphics);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

function drawPixelShine(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
) {
  graphics.fillStyle(0xffffff, 0.22);
  graphics.fillRoundedRect(x, y, width, 4, 2);
}

export function createCoreGameTextures(scene: Phaser.Scene) {
  recreateTexture(scene, 'particle', 6, 6, (graphics) => {
    graphics.fillStyle(GAME_RGB.brown, 1);
    graphics.fillRect(0, 0, 6, 6);
  });

  recreateTexture(scene, 'player', 36, 42, (graphics) => {
    graphics.fillStyle(GAME_RGB.green, 1);
    graphics.fillRoundedRect(7, 8, 22, 28, 6);

    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillRect(13, 15, 4, 4);
    graphics.fillRect(21, 15, 4, 4);

    graphics.fillStyle(GAME_RGB.brown, 1);
    graphics.fillRect(11, 35, 6, 5);
    graphics.fillRect(21, 35, 6, 5);

    drawPixelShine(graphics, 10, 10, 16);
  });

  recreateTexture(scene, 'tex_want', 42, 42, (graphics) => {
    graphics.fillStyle(GAME_RGB.red, 1);
    graphics.fillRoundedRect(4, 4, 34, 34, 8);

    graphics.fillStyle(0xffffff, 0.95);
    graphics.fillRect(19, 11, 4, 15);
    graphics.fillRect(19, 29, 4, 4);

    graphics.lineStyle(3, GAME_RGB.cream, 1);
    graphics.strokeRoundedRect(4, 4, 34, 34, 8);

    drawPixelShine(graphics, 9, 8, 22);
  });

  recreateTexture(scene, 'tex_need', 42, 42, (graphics) => {
    graphics.fillStyle(GAME_RGB.receipt, 1);
    graphics.fillRoundedRect(7, 4, 28, 34, 5);

    graphics.fillStyle(GAME_RGB.gold, 1);
    graphics.fillRect(11, 10, 20, 4);

    graphics.fillStyle(GAME_RGB.brown, 0.65);
    graphics.fillRect(12, 18, 16, 3);
    graphics.fillRect(12, 25, 12, 3);
    graphics.fillRect(12, 32, 18, 3);

    graphics.lineStyle(2, GAME_RGB.gold, 1);
    graphics.strokeRoundedRect(7, 4, 28, 34, 5);
  });

  recreateTexture(scene, 'tex_payday', 42, 42, (graphics) => {
    graphics.fillStyle(GAME_RGB.green, 1);
    graphics.fillCircle(21, 21, 17);

    graphics.fillStyle(GAME_RGB.cream, 1);
    graphics.fillRect(19, 10, 4, 22);
    graphics.fillRect(14, 15, 14, 4);
    graphics.fillRect(14, 24, 14, 4);

    graphics.lineStyle(3, GAME_RGB.cream, 1);
    graphics.strokeCircle(21, 21, 17);

    drawPixelShine(graphics, 12, 9, 18);
  });

  recreateTexture(scene, 'tex_boss', 72, 72, (graphics) => {
    graphics.fillStyle(GAME_RGB.text, 1);
    graphics.fillRoundedRect(4, 4, 64, 64, 10);

    graphics.fillStyle(GAME_RGB.red, 1);
    graphics.fillTriangle(36, 12, 58, 54, 14, 54);

    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(34, 26, 4, 16);
    graphics.fillRect(34, 46, 4, 5);

    graphics.lineStyle(4, GAME_RGB.red, 1);
    graphics.strokeRoundedRect(4, 4, 64, 64, 10);
  });
}
