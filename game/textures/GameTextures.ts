import Phaser from 'phaser';

import { GAME_RGB } from '../theme/gameTheme';

type DrawTexture = (graphics: Phaser.GameObjects.Graphics) => void;

function createTextureOnce(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  draw: DrawTexture,
) {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);

  draw(graphics);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

function shine(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number) {
  graphics.fillStyle(0xffffff, 0.22);
  graphics.fillRoundedRect(x, y, width, 4, 2);
}

function drawShoe(graphics: Phaser.GameObjects.Graphics, x: number, y: number) {
  graphics.fillStyle(GAME_RGB.brown, 1);
  graphics.fillRoundedRect(x, y, 10, 5, 2);
}

function drawFace(graphics: Phaser.GameObjects.Graphics, eyeY: number) {
  graphics.fillStyle(0xffffff, 0.95);
  graphics.fillRect(18, eyeY, 4, 4);
  graphics.fillRect(28, eyeY, 4, 4);

  graphics.fillStyle(GAME_RGB.text, 1);
  graphics.fillRect(19, eyeY + 1, 2, 2);
  graphics.fillRect(29, eyeY + 1, 2, 2);

  graphics.fillStyle(GAME_RGB.text, 0.75);
  graphics.fillRect(22, eyeY + 10, 8, 2);
}

function drawPlayerBase(
  graphics: Phaser.GameObjects.Graphics,
  legPose: 'left' | 'right' | 'jump' | 'slide',
) {
  // Shadow
  graphics.fillStyle(GAME_RGB.text, 0.16);
  graphics.fillEllipse(24, 48, 30, 8);

  if (legPose === 'slide') {
    graphics.fillStyle(GAME_RGB.green, 1);
    graphics.fillRoundedRect(8, 23, 34, 17, 8);

    graphics.fillStyle(GAME_RGB.cream, 1);
    graphics.fillRoundedRect(25, 18, 14, 14, 5);

    graphics.fillStyle(0xffffff, 0.95);
    graphics.fillRect(31, 22, 4, 4);

    graphics.fillStyle(GAME_RGB.brown, 1);
    graphics.fillRoundedRect(7, 38, 16, 5, 2);
    graphics.fillRoundedRect(30, 38, 15, 5, 2);

    shine(graphics, 12, 25, 18);
    return;
  }

  // Head
  graphics.fillStyle(GAME_RGB.cream, 1);
  graphics.fillRoundedRect(14, 4, 20, 18, 7);

  // Hair / cap
  graphics.fillStyle(GAME_RGB.brown, 1);
  graphics.fillRoundedRect(13, 3, 22, 7, 4);

  drawFace(graphics, 11);

  // Body
  graphics.fillStyle(GAME_RGB.green, 1);
  graphics.fillRoundedRect(11, 22, 26, 18, 7);

  graphics.fillStyle(GAME_RGB.gold, 1);
  graphics.fillRoundedRect(18, 25, 12, 4, 2);

  // Bag / wallet detail
  graphics.fillStyle(GAME_RGB.pink, 0.92);
  graphics.fillRoundedRect(32, 27, 7, 10, 3);

  if (legPose === 'left') {
    drawShoe(graphics, 10, 44);
    drawShoe(graphics, 28, 43);
    graphics.fillStyle(GAME_RGB.brown, 1);
    graphics.fillRect(15, 39, 5, 7);
    graphics.fillRect(29, 38, 5, 7);
  }

  if (legPose === 'right') {
    drawShoe(graphics, 13, 43);
    drawShoe(graphics, 31, 44);
    graphics.fillStyle(GAME_RGB.brown, 1);
    graphics.fillRect(16, 38, 5, 7);
    graphics.fillRect(31, 39, 5, 7);
  }

  if (legPose === 'jump') {
    graphics.fillStyle(GAME_RGB.brown, 1);
    graphics.fillRect(15, 38, 5, 7);
    graphics.fillRect(30, 38, 5, 7);
    drawShoe(graphics, 10, 42);
    drawShoe(graphics, 29, 42);

    graphics.fillStyle(GAME_RGB.gold, 0.72);
    graphics.fillCircle(39, 14, 4);
  }

  shine(graphics, 15, 24, 16);
}

function drawWarningObstacle(graphics: Phaser.GameObjects.Graphics) {
  graphics.fillStyle(GAME_RGB.red, 1);
  graphics.fillRoundedRect(5, 5, 38, 38, 9);

  graphics.lineStyle(3, GAME_RGB.cream, 1);
  graphics.strokeRoundedRect(5, 5, 38, 38, 9);

  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(22, 13, 4, 16);
  graphics.fillRect(22, 33, 4, 4);

  shine(graphics, 10, 9, 22);
}

function drawReceiptObstacle(graphics: Phaser.GameObjects.Graphics) {
  graphics.fillStyle(GAME_RGB.cream, 1);
  graphics.fillRoundedRect(9, 4, 30, 40, 5);

  graphics.fillStyle(GAME_RGB.gold, 1);
  graphics.fillRect(13, 10, 22, 4);

  graphics.fillStyle(GAME_RGB.brown, 0.68);
  graphics.fillRect(14, 18, 18, 3);
  graphics.fillRect(14, 25, 14, 3);
  graphics.fillRect(14, 32, 20, 3);

  graphics.fillStyle(GAME_RGB.pink, 0.9);
  graphics.fillCircle(34, 38, 4);

  graphics.lineStyle(2, GAME_RGB.gold, 1);
  graphics.strokeRoundedRect(9, 4, 30, 40, 5);
}

function drawPaydayObstacle(graphics: Phaser.GameObjects.Graphics) {
  graphics.fillStyle(GAME_RGB.green, 1);
  graphics.fillCircle(24, 24, 20);

  graphics.fillStyle(GAME_RGB.cream, 1);
  graphics.fillRect(22, 11, 5, 26);
  graphics.fillRect(16, 16, 17, 5);
  graphics.fillRect(16, 27, 17, 5);

  graphics.lineStyle(3, GAME_RGB.cream, 1);
  graphics.strokeCircle(24, 24, 20);

  graphics.fillStyle(GAME_RGB.gold, 0.9);
  graphics.fillCircle(37, 12, 4);

  shine(graphics, 13, 10, 18);
}

function drawBossObstacle(graphics: Phaser.GameObjects.Graphics) {
  graphics.fillStyle(GAME_RGB.text, 1);
  graphics.fillRoundedRect(6, 8, 66, 62, 12);

  graphics.fillStyle(GAME_RGB.red, 1);
  graphics.fillTriangle(39, 14, 62, 58, 16, 58);

  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(37, 28, 5, 18);
  graphics.fillRect(37, 51, 5, 5);

  graphics.fillStyle(GAME_RGB.gold, 1);
  graphics.fillRoundedRect(21, 7, 36, 10, 4);

  graphics.lineStyle(4, GAME_RGB.red, 1);
  graphics.strokeRoundedRect(6, 8, 66, 62, 12);

  shine(graphics, 13, 12, 34);
}

export function createCoreGameTextures(scene: Phaser.Scene) {
  createTextureOnce(scene, 'particle', 6, 6, (graphics) => {
    graphics.fillStyle(GAME_RGB.brown, 1);
    graphics.fillRect(0, 0, 6, 6);
  });

  createTextureOnce(scene, 'player_run_1', 48, 52, (graphics) => {
    drawPlayerBase(graphics, 'left');
  });

  createTextureOnce(scene, 'player_run_2', 48, 52, (graphics) => {
    drawPlayerBase(graphics, 'right');
  });

  createTextureOnce(scene, 'player_jump', 48, 52, (graphics) => {
    drawPlayerBase(graphics, 'jump');
  });

  createTextureOnce(scene, 'player_slide', 48, 52, (graphics) => {
    drawPlayerBase(graphics, 'slide');
  });

  // Compatibility key. Keep this so old references do not break.
  createTextureOnce(scene, 'player', 48, 52, (graphics) => {
    drawPlayerBase(graphics, 'left');
  });

  createTextureOnce(scene, 'tex_want', 48, 48, drawWarningObstacle);
  createTextureOnce(scene, 'tex_need', 48, 48, drawReceiptObstacle);
  createTextureOnce(scene, 'tex_payday', 48, 48, drawPaydayObstacle);
  createTextureOnce(scene, 'tex_boss', 78, 78, drawBossObstacle);
}
