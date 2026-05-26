import Phaser from "phaser";

import { DEPTH } from "../constants/layers";
import {
  GAME_HEX,
  GAME_RGB,
  PHASE_THEME,
  getMonthPhase,
  MonthPhase,
} from "../theme/gameTheme";

type ScrollKey = "cloudA" | "cloudB" | "farCity" | "midCity" | "road";

type Floater = {
  object: Phaser.GameObjects.Image;
  x: number;
  speed: number;
  baseY: number;
  waveOffset: number;
};

export class FinancialParallaxBackground {
  private readonly scene: Phaser.Scene;

  private width = 800;
  private height = 450;
  private floorY = 418;

  private currentPhase: MonthPhase = "young";

  private skyBack!: Phaser.GameObjects.Image;
  private skyFront!: Phaser.GameObjects.Image;
  private glow!: Phaser.GameObjects.Ellipse;
  private currentSkyKey = PHASE_THEME.young.skyKey;
  private skyTween?: Phaser.Tweens.Tween;
  private farCity!: Phaser.GameObjects.TileSprite;
  private midCity!: Phaser.GameObjects.TileSprite;
  private road!: Phaser.GameObjects.TileSprite;
  private cloudA!: Phaser.GameObjects.TileSprite;
  private cloudB!: Phaser.GameObjects.TileSprite;
  private phaseLabel!: Phaser.GameObjects.Text;

  private readonly scroll: Record<ScrollKey, number> = {
    cloudA: 0,
    cloudB: 0,
    farCity: 0,
    midCity: 0,
    road: 0,
  };

  private floaters: Floater[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(width: number, height: number, floorY: number) {
    this.width = width;
    this.height = height;
    this.floorY = floorY;

    this.scene.cameras.main.roundPixels = true;
    this.ensureTextures();

    this.currentSkyKey = PHASE_THEME.young.skyKey;

    this.skyBack = this.scene.add
      .image(width / 2, height / 2, this.currentSkyKey)
      .setDisplaySize(width, height)
      .setDepth(DEPTH.skyBack);

    this.skyFront = this.scene.add
      .image(width / 2, height / 2, this.currentSkyKey)
      .setDisplaySize(width, height)
      .setAlpha(0)
      .setDepth(DEPTH.skyFront);

    this.glow = this.scene.add
      .ellipse(width * 0.74, height * 0.24, 260, 260, GAME_RGB.gold, 0.2)
      .setDepth(DEPTH.glow);

    this.cloudA = this.scene.add
      .tileSprite(width / 2, 70, width, 96, "dt30_cloud_soft")
      .setAlpha(0.64)
      .setDepth(DEPTH.cloudsBack);

    this.cloudB = this.scene.add
      .tileSprite(width / 2, 124, width, 96, "dt30_cloud_soft")
      .setAlpha(0.34)
      .setDepth(DEPTH.cloudsFront);

    this.farCity = this.scene.add
      .tileSprite(width / 2, floorY - 112, width, 180, "dt30_far_city")
      .setAlpha(0.78)
      .setDepth(DEPTH.cityBack);

    this.midCity = this.scene.add
      .tileSprite(width / 2, floorY - 70, width, 160, "dt30_mid_city")
      .setAlpha(0.94)
      .setDepth(DEPTH.cityFront);

    this.road = this.scene.add
      .tileSprite(width / 2, floorY + 16, width, 96, "dt30_road")
      .setDepth(DEPTH.road);

    this.phaseLabel = this.scene.add
      .text(width / 2, 58, PHASE_THEME.young.label, {
        fontFamily: "monospace",
        fontSize: "12px",
        fontStyle: "bold",
        color: PHASE_THEME.young.labelColor,
        backgroundColor: GAME_HEX.cream,
        padding: { left: 12, right: 12, top: 6, bottom: 6 },
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(32)
      .setScrollFactor(0);

    this.createFloaters();
  }

  update(day: number, isBossStage: boolean) {
    const phase = getMonthPhase(day, isBossStage);

    if (phase !== this.currentPhase) {
      this.transitionTo(phase);
    }

    const speedMultiplier = isBossStage
      ? 1.75
      : day >= 21
        ? 1.28
        : day >= 11
          ? 1.08
          : 1;

    this.moveTile("cloudA", this.cloudA, 0.12 * speedMultiplier);
    this.moveTile("cloudB", this.cloudB, 0.18 * speedMultiplier);
    this.moveTile("farCity", this.farCity, 0.32 * speedMultiplier);
    this.moveTile("midCity", this.midCity, 0.82 * speedMultiplier);
    this.moveTile("road", this.road, 3 * speedMultiplier);

    const now = this.scene.time.now;

    this.floaters.forEach((floater) => {
      floater.x -= floater.speed * speedMultiplier;

      floater.object.x = Math.round(floater.x);
      floater.object.y = Math.round(
        floater.baseY + Math.sin((now + floater.waveOffset) / 720) * 4,
      );

      if (floater.x < -48) {
        floater.x = this.width + Phaser.Math.Between(48, 260);
        floater.baseY = Phaser.Math.Between(
          58,
          Math.max(92, this.floorY - 180),
        );
      }
    });
  }

  pulseCrisis() {
    this.scene.tweens.add({
      targets: this.glow,
      scaleX: 1.18,
      scaleY: 1.18,
      alpha: 0.56,
      duration: 340,
      yoyo: true,
      ease: "Sine.easeInOut",
    });
  }

  private moveTile(
    key: ScrollKey,
    sprite: Phaser.GameObjects.TileSprite,
    amount: number,
  ) {
    this.scroll[key] += amount;
    sprite.tilePositionX = Math.round(this.scroll[key]);
  }

  private crossfadeSky(nextSkyKey: string) {
    if (nextSkyKey === this.currentSkyKey) return;

    this.skyTween?.stop();

    this.skyFront.setTexture(nextSkyKey).setAlpha(0).setVisible(true);

    this.skyTween = this.scene.tweens.add({
      targets: this.skyFront,
      alpha: 1,
      duration: 1200,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.skyBack.setTexture(nextSkyKey);
        this.skyFront.setAlpha(0);
        this.currentSkyKey = nextSkyKey;
      },
    });
  }

  private transitionTo(phase: MonthPhase) {
    this.currentPhase = phase;

    const theme = PHASE_THEME[phase];

    this.crossfadeSky(theme.skyKey);

    this.scene.tweens.killTweensOf(this.phaseLabel);

    this.phaseLabel
      .setText(theme.label)
      .setColor(theme.labelColor)
      .setAlpha(1)
      .setY(58);

    const glowColor =
      phase === "boss"
        ? GAME_RGB.red
        : phase === "old"
          ? GAME_RGB.pink
          : phase === "middle"
            ? GAME_RGB.gold
            : GAME_RGB.green;

    this.glow.setFillStyle(glowColor, phase === "boss" ? 0.32 : 0.2);

    this.scene.tweens.add({
      targets: this.phaseLabel,
      y: 50,
      alpha: 0,
      duration: 1000,
      delay: 760,
      ease: "Sine.easeInOut",
    });
  }

  private createFloaters() {
    this.floaters.forEach((floater) => floater.object.destroy());
    this.floaters = [];

    const keys = ["dt30_coin", "dt30_receipt", "dt30_bill"];

    for (let i = 0; i < 7; i += 1) {
      const key = keys[i % keys.length];
      const x = Phaser.Math.Between(0, this.width);
      const baseY = Phaser.Math.Between(58, Math.max(92, this.floorY - 180));

      const object = this.scene.add
        .image(x, baseY, key)
        .setScale(Phaser.Math.FloatBetween(0.62, 0.88))
        .setAlpha(Phaser.Math.FloatBetween(0.28, 0.48))
        .setAngle(Phaser.Math.Between(-8, 8))
        .setDepth(-16);

      this.floaters.push({
        object,
        x,
        speed: Phaser.Math.FloatBetween(0.12, 0.32),
        baseY,
        waveOffset: Phaser.Math.Between(0, 1200),
      });
    }
  }

  private ensureTextures() {
    this.createSkyTexture("dt30_sky_young", 0xdff4ff, 0xfff6e8, GAME_RGB.green);
    this.createSkyTexture("dt30_sky_middle", 0xfff1c7, 0xdff4ff, GAME_RGB.gold);
    this.createSkyTexture("dt30_sky_old", 0xf7d7ff, 0xfff1c7, GAME_RGB.pink);
    this.createSkyTexture("dt30_sky_boss", 0xffd6d6, 0xfff1c7, GAME_RGB.red);

    this.createCloudTexture();
    this.createFarCityTexture();
    this.createMidCityTexture();
    this.createRoadTexture();
    this.createIconTextures();
  }

  private createSkyTexture(
    key: string,
    top: number,
    bottom: number,
    accent: number,
  ) {
    if (this.scene.textures.exists(key)) return;

    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    const bands = 12;
    const bandHeight = 450 / bands;

    for (let i = 0; i < bands; i += 1) {
      const ratio = i / Math.max(1, bands - 1);
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.IntegerToColor(top),
        Phaser.Display.Color.IntegerToColor(bottom),
        bands - 1,
        i,
      );

      const blended = Phaser.Display.Color.GetColor(color.r, color.g, color.b);

      graphics.fillStyle(blended, 1);
      graphics.fillRect(
        0,
        Math.round(i * bandHeight),
        800,
        Math.ceil(bandHeight) + 1,
      );
    }

    graphics.fillStyle(accent, 0.08);
    graphics.fillCircle(630, 92, 140);

    graphics.fillStyle(0xffffff, 0.16);
    graphics.fillCircle(138, 72, 44);
    graphics.fillCircle(170, 72, 58);
    graphics.fillCircle(214, 78, 38);
    graphics.fillRect(116, 76, 132, 28);

    graphics.generateTexture(key, 800, 450);
    graphics.destroy();
  }

  private createCloudTexture() {
    if (this.scene.textures.exists("dt30_cloud_soft")) return;

    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    graphics.fillStyle(0xffffff, 0.7);
    graphics.fillCircle(42, 52, 24);
    graphics.fillCircle(76, 40, 34);
    graphics.fillCircle(118, 52, 24);
    graphics.fillRoundedRect(34, 52, 114, 24, 12);

    graphics.fillStyle(GAME_RGB.paleBlue, 0.32);
    graphics.fillCircle(240, 36, 18);
    graphics.fillCircle(270, 34, 22);
    graphics.fillCircle(302, 40, 16);
    graphics.fillRoundedRect(228, 42, 92, 18, 9);

    graphics.generateTexture("dt30_cloud_soft", 512, 96);
    graphics.destroy();
  }

  private createFarCityTexture() {
    if (this.scene.textures.exists("dt30_far_city")) return;

    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    const buildings = [
      { x: 24, y: 76, w: 70, h: 104 },
      { x: 124, y: 56, w: 86, h: 124 },
      { x: 250, y: 88, w: 96, h: 92 },
      { x: 390, y: 44, w: 80, h: 136 },
      { x: 520, y: 72, w: 120, h: 108 },
      { x: 700, y: 58, w: 92, h: 122 },
      { x: 846, y: 90, w: 126, h: 90 },
    ];

    buildings.forEach((building, index) => {
      graphics.fillStyle(
        index % 2 === 0 ? GAME_RGB.paleBlue : GAME_RGB.aqua,
        0.72,
      );
      graphics.fillRoundedRect(
        building.x,
        building.y,
        building.w,
        building.h,
        8,
      );

      graphics.fillStyle(0xffffff, 0.2);
      for (let x = building.x + 16; x < building.x + building.w - 10; x += 24) {
        for (let y = building.y + 18; y < 160; y += 28) {
          graphics.fillRect(x, y, 9, 8);
        }
      }
    });

    graphics.generateTexture("dt30_far_city", 1024, 180);
    graphics.destroy();
  }

  private createMidCityTexture() {
    if (this.scene.textures.exists("dt30_mid_city")) return;

    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    const shops = [
      { x: 20, y: 62, w: 150, h: 98, sign: GAME_RGB.gold },
      { x: 210, y: 40, w: 170, h: 120, sign: GAME_RGB.green },
      { x: 430, y: 72, w: 150, h: 88, sign: GAME_RGB.pink },
      { x: 630, y: 52, w: 170, h: 108, sign: GAME_RGB.purple },
      { x: 846, y: 70, w: 142, h: 90, sign: GAME_RGB.orange },
    ];

    shops.forEach((shop) => {
      graphics.fillStyle(GAME_RGB.cream, 0.96);
      graphics.fillRoundedRect(shop.x, shop.y, shop.w, shop.h, 10);

      graphics.fillStyle(GAME_RGB.brown, 0.85);
      graphics.fillRect(shop.x, shop.y + 34, shop.w, 10);

      graphics.fillStyle(shop.sign, 0.96);
      graphics.fillRoundedRect(shop.x + 20, shop.y - 16, shop.w - 40, 28, 8);

      graphics.fillStyle(GAME_RGB.aqua, 0.74);
      graphics.fillRect(shop.x + 24, shop.y + 58, 38, shop.h - 58);
      graphics.fillRect(shop.x + shop.w - 62, shop.y + 58, 38, shop.h - 58);
    });

    graphics.generateTexture("dt30_mid_city", 1024, 160);
    graphics.destroy();
  }

  private createRoadTexture() {
    if (this.scene.textures.exists("dt30_road")) return;

    const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);

    // Sidewalk / curb area
    graphics.fillStyle(GAME_RGB.cream, 1);
    graphics.fillRect(0, 0, 512, 20);

    graphics.fillStyle(GAME_RGB.gold, 1);
    graphics.fillRect(0, 18, 512, 5);

    // Main road
    graphics.fillStyle(0x6f4b35, 1);
    graphics.fillRect(0, 23, 512, 73);

    // Road shadow
    graphics.fillStyle(GAME_RGB.text, 0.2);
    graphics.fillRect(0, 23, 512, 6);

    // Lane markers
    graphics.fillStyle(GAME_RGB.receipt, 0.95);
    for (let x = 24; x < 512; x += 104) {
      graphics.fillRoundedRect(x, 56, 56, 6, 3);
    }

    // Small pixel texture so road does not look flat
    graphics.fillStyle(0xffffff, 0.08);
    for (let x = 12; x < 512; x += 48) {
      graphics.fillRect(x, 36, 8, 3);
      graphics.fillRect(x + 24, 76, 10, 3);
    }

    graphics.generateTexture("dt30_road", 512, 96);
    graphics.destroy();
  }

  private createIconTextures() {
    if (!this.scene.textures.exists("dt30_coin")) {
      const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
      graphics.fillStyle(GAME_RGB.gold, 1);
      graphics.fillCircle(16, 16, 13);
      graphics.lineStyle(3, GAME_RGB.orange, 1);
      graphics.strokeCircle(16, 16, 10);
      graphics.generateTexture("dt30_coin", 32, 32);
      graphics.destroy();
    }

    if (!this.scene.textures.exists("dt30_receipt")) {
      const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
      graphics.fillStyle(GAME_RGB.cream, 1);
      graphics.fillRoundedRect(4, 2, 24, 32, 4);
      graphics.fillStyle(GAME_RGB.brown, 0.32);
      graphics.fillRect(9, 10, 14, 2);
      graphics.fillRect(9, 17, 11, 2);
      graphics.fillRect(9, 24, 15, 2);
      graphics.generateTexture("dt30_receipt", 32, 36);
      graphics.destroy();
    }

    if (!this.scene.textures.exists("dt30_bill")) {
      const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
      graphics.fillStyle(GAME_RGB.pink, 1);
      graphics.fillRoundedRect(3, 8, 30, 18, 5);
      graphics.fillStyle(0xffffff, 0.55);
      graphics.fillCircle(18, 17, 5);
      graphics.generateTexture("dt30_bill", 36, 36);
      graphics.destroy();
    }
  }
}
