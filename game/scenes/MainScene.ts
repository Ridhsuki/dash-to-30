import Phaser from "phaser";

import { EventBus } from "../EventBus";
import { FinancialParallaxBackground } from "../background/FinancialParallaxBackground";
import { GAMEPLAY, LANES } from "../config/gameplay";
import { DEPTH } from "../constants/layers";
import { createCoreGameTextures } from "../textures/GameTextures";
import { EntityLabel } from "../ui/EntityLabel";
import { EventFeed } from "../ui/EventFeed";
import { IncomingNotice } from "../ui/IncomingNotice";
import { ProgressBar } from "../ui/ProgressBar";
import {
  compactEntityLabel,
  normalizeAiConfig,
  pickRandomLabel,
  type EntityKind,
  type GameAiConfig,
} from "../utils/gameText";

type EntityLane = "ground" | "duck" | "jump";

type GameEntitySprite = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody & {
  label?: EntityLabel;
  isNeed?: boolean;
  isBoss?: boolean;
  isInitialPayday?: boolean;
  isDuckLane?: boolean;
  lane?: EntityLane;
  kind?: EntityKind;
  labelOffsetY?: number;
  fullLabel?: string;
};

export class MainScene extends Phaser.Scene {
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  pauseKey?: Phaser.Input.Keyboard.Key;
  escapeKey?: Phaser.Input.Keyboard.Key;

  emitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  background!: FinancialParallaxBackground;
  incomingNotice!: IncomingNotice;
  eventFeed!: EventFeed;
  progressBar!: ProgressBar;

  obstacleGroup!: Phaser.Physics.Arcade.Group;
  itemGroup!: Phaser.Physics.Arcade.Group;
  paydayGroup!: Phaser.Physics.Arcade.Group;

  balanceText!: Phaser.GameObjects.Text;
  dayText!: Phaser.GameObjects.Text;
  essentialLifeText!: Phaser.GameObjects.Text;
  scoreText!: Phaser.GameObjects.Text;

  spawnTimer!: Phaser.Time.TimerEvent;
  dayTimer!: Phaser.Time.TimerEvent;

  balance: number = GAMEPLAY.startingBalance;
  day: number = 1;
  aiConfig: GameAiConfig = normalizeAiConfig(null);

  isSliding: boolean = false;
  isBossStage: boolean = false;
  isGameOver: boolean = false;
  isPaused: boolean = false;
  pauseOverlay?: Phaser.GameObjects.Container;
  receiptOverlay?: Phaser.GameObjects.Container;

  lastGroundedAt: number = 0;
  lastJumpPressedAt: number = 0;
  slideStartedAt: number = 0;

  scorePoints: number = 0;
  needsTaken: number = 0;
  wantsAvoided: number = 0;
  bossAvoided: number = 0;
  wantsHit: number = 0;
  missedNeeds: number = 0;
  bossHits: number = 0;
  essentialLife: number = GAMEPLAY.maxEssentialLife;

  hasCollectedInitialPayday: boolean = false;
  controlsLocked: boolean = true;
  gameSpeedMultiplier: number = 1;

  constructor() {
    super("MainScene");
  }

  init() {
    this.isGameOver = false;
    this.isBossStage = false;
    this.isSliding = false;
    this.isPaused = false;
    this.pauseOverlay = undefined;
    this.receiptOverlay = undefined;

    this.balance = GAMEPLAY.startingBalance;
    this.day = 1;

    this.scorePoints = 0;
    this.needsTaken = 0;
    this.wantsAvoided = 0;
    this.bossAvoided = 0;
    this.wantsHit = 0;
    this.missedNeeds = 0;
    this.bossHits = 0;
    this.essentialLife = GAMEPLAY.maxEssentialLife;

    this.hasCollectedInitialPayday = false;
    this.controlsLocked = true;
    this.gameSpeedMultiplier = 1;

    this.lastGroundedAt = 0;
    this.lastJumpPressedAt = 0;
    this.slideStartedAt = 0;

    let storedConfig: unknown = null;

    try {
      const stored = localStorage.getItem("dashTo30_aiConfig");

      if (stored) {
        storedConfig = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to parse aiConfig", error);
    }

    this.aiConfig = normalizeAiConfig(storedConfig);
  }

  preload() {
    createCoreGameTextures(this);
  }

  private createPlayerAnimations() {
    if (this.anims.exists("player-run")) {
      this.anims.remove("player-run");
    }

    this.anims.create({
      key: "player-run",
      frames: [{ key: "player_run_1" }, { key: "player_run_2" }],
      frameRate: 8,
      repeat: -1,
    });
  }

  private isPlayerGrounded() {
    const body = this.player.body;

    return Boolean(body?.blocked.down || body?.touching.down);
  }

  private setPlayerRunState() {
    this.isSliding = false;
    this.player.body?.setSize(27, 39);
    this.player.body?.setOffset(10, 9);
    this.player.setGravityY(1500);
  }

  private setPlayerJumpState() {
    this.isSliding = false;
    this.player.anims.stop();
    this.player.setTexture("player_jump");
    this.player.body?.setSize(27, 39);
    this.player.body?.setOffset(10, 9);
    this.player.setGravityY(1500);
  }

  private setPlayerSlideState() {
    this.isSliding = true;
    this.slideStartedAt = this.time.now;
    this.player.anims.stop();
    this.player.setTexture("player_slide");

    this.player.body?.setSize(36, 16);
    this.player.body?.setOffset(6, 32);
    this.player.setGravityY(2200);
  }

  private createSpawnTimer(delay: number) {
    if (this.spawnTimer) {
      this.spawnTimer.remove(false);
    }

    this.spawnTimer = this.time.addEvent({
      delay,
      callback: this.spawnEntity,
      callbackScope: this,
      loop: true,
    });
  }

  private formatCurrency(amount: number) {
    const sign = amount < 0 ? "-" : "";
    const value = Math.abs(Math.round(amount)).toLocaleString("id-ID");

    return `${sign}Rp${value}K`;
  }

  private getCurrentScore() {
    const balanceBonus = Math.max(
      0,
      Math.floor(this.balance / GAMEPLAY.remainingBalanceDivisor),
    );

    return Math.max(0, this.scorePoints + balanceBonus);
  }

  private getFinalScore() {
    return this.getCurrentScore();
  }

  private updateScoreText() {
    if (!this.scoreText) return;

    this.scoreText.setText(`SKOR ${this.getCurrentScore()}`);
  }

  private getPersonalHighScoreKey() {
    return "dashTo30_personalHighScore";
  }

  private getPlayerIdentity() {
    if (typeof window === "undefined") {
      return {
        isLoggedIn: false,
        name: "Guest",
      };
    }

    const possibleProfileKeys = [
      "dashTo30_user",
      "dashTo30_profile",
      "user",
      "authUser",
    ];

    for (const key of possibleProfileKeys) {
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;

        const parsed = JSON.parse(raw);
        const name =
          parsed?.username ||
          parsed?.displayName ||
          parsed?.name ||
          parsed?.email?.split("@")?.[0];

        if (name) {
          return {
            isLoggedIn: true,
            name: String(name),
          };
        }
      } catch {
        // Ignore malformed localStorage values.
      }
    }

    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i) || "";

      if (!key.startsWith("firebase:authUser")) continue;

      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;

        const parsed = JSON.parse(raw);
        const name =
          parsed?.displayName || parsed?.email?.split("@")?.[0] || parsed?.uid;

        if (name) {
          return {
            isLoggedIn: true,
            name: String(name),
          };
        }
      } catch {
        // Ignore malformed firebase auth cache.
      }
    }

    return {
      isLoggedIn: false,
      name: "Guest",
    };
  }

  private getRoastMessage() {
    const roasts = this.aiConfig.roasts;
    const legacyRoast =
      this.aiConfig?.roast?.trim() ||
      "Dompet kamu sudah berjuang, tapi keputusan belanjamu terlalu barbar.";

    const needsNeglected =
      this.missedNeeds >= 2 ||
      this.essentialLife <= 1 ||
      this.missedNeeds > this.needsTaken;

    const wantsProblem =
      this.wantsHit >= 2 || this.wantsHit > this.needsTaken + 1;

    const bossProblem = this.bossHits > 0;

    if (needsNeglected && this.missedNeeds >= this.wantsHit) {
      return roasts.missedNeeds || legacyRoast;
    }

    if (wantsProblem) {
      return roasts.tooManyWants || legacyRoast;
    }

    if (bossProblem) {
      return roasts.bossHit || legacyRoast;
    }

    if (this.balance <= 0) {
      return roasts.lowBalance || legacyRoast;
    }

    return roasts.default || legacyRoast;
  }

  private getWinMessage() {
    return (
      this.aiConfig.roasts?.win ||
      "Mantap, kamu berhasil menahan godaan dan tetap ngurus kebutuhan."
    );
  }

  private resolvePersonalHighScore(finalScore: number) {
    if (typeof window === "undefined") {
      return {
        previousBest: 0,
        isNewHighScore: false,
      };
    }

    const key = this.getPersonalHighScoreKey();
    const previousBest = Number(window.localStorage.getItem(key) || 0);
    const isNewHighScore = finalScore > previousBest;

    if (isNewHighScore) {
      window.localStorage.setItem(key, String(finalScore));
    }

    return {
      previousBest,
      isNewHighScore,
    };
  }

  private updateEssentialLife(amount: number) {
    this.essentialLife = Phaser.Math.Clamp(
      this.essentialLife + amount,
      0,
      GAMEPLAY.maxEssentialLife,
    );

    if (this.essentialLifeText) {
      this.essentialLifeText.setText(
        `NEEDS LIFE: ${this.essentialLife}/${GAMEPLAY.maxEssentialLife}`,
      );
      this.essentialLifeText.setColor(
        this.essentialLife <= 1 ? "#FF6B6B" : "#4A3A2A",
      );
    }

    if (this.essentialLife <= 0 && this.hasCollectedInitialPayday) {
      this.eventFeed.push("Kebutuhan diabaikan!", "bad");
      this.triggerGameOver(false);
    }
  }

  private createHudButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ) {
    const button = this.add
      .text(x, y, label, {
        fontFamily: "monospace",
        fontSize: "18px",
        fontStyle: "bold",
        color: "#4A3A2A",
        backgroundColor: "#FFF1C7",
        padding: { x: 8, y: 5 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(DEPTH.hud + 6)
      .setInteractive({ useHandCursor: true });

    button.on("pointerover", () => button.setScale(1.08));
    button.on("pointerout", () => button.setScale(1));
    button.on("pointerdown", onClick);

    return button;
  }

  private createMenuButton(
    x: number,
    y: number,
    label: string,
    color: string,
    backgroundColor: string,
    onClick: () => void,
  ) {
    const button = this.add
      .text(x, y, label, {
        fontFamily: "monospace",
        fontSize: "16px",
        fontStyle: "bold",
        color,
        backgroundColor,
        padding: { x: 16, y: 9 },
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.overlay + 6)
      .setInteractive({ useHandCursor: true });

    button.on("pointerover", () => {
      button.setScale(1.06);
      button.setAlpha(0.96);
    });

    button.on("pointerout", () => {
      button.setScale(1);
      button.setAlpha(1);
    });

    button.on("pointerdown", onClick);

    return button;
  }

  private createModalCard(
    cx: number,
    cy: number,
    width: number,
    height: number,
    borderColor: number,
  ) {
    const shadow = this.add.graphics();
    shadow.fillStyle(0x4a3a2a, 0.24);
    shadow.fillRoundedRect(
      -width / 2 + 10,
      -height / 2 + 12,
      width,
      height,
      28,
    );

    const card = this.add.graphics();
    card.fillStyle(0xfff6e8, 0.98);
    card.fillRoundedRect(-width / 2, -height / 2, width, height, 28);
    card.lineStyle(5, borderColor, 1);
    card.strokeRoundedRect(-width / 2, -height / 2, width, height, 28);

    const header = this.add.graphics();
    header.fillStyle(0xfff1c7, 1);
    header.fillRoundedRect(
      -width / 2 + 20,
      -height / 2 + 18,
      width - 40,
      62,
      22,
    );
    header.lineStyle(2, 0x8b5e3c, 0.35);
    header.strokeRoundedRect(
      -width / 2 + 20,
      -height / 2 + 18,
      width - 40,
      62,
      22,
    );

    const dotLeft = this.add.circle(
      -width / 2 + 34,
      -height / 2 + 34,
      6,
      0xff7aa2,
      1,
    );
    const dotRight = this.add.circle(
      width / 2 - 34,
      -height / 2 + 34,
      6,
      0x6fd08c,
      1,
    );

    return this.add
      .container(cx, cy, [shadow, card, header, dotLeft, dotRight])
      .setDepth(DEPTH.overlay + 1)
      .setScrollFactor(0);
  }

  private createModalText(
    x: number,
    y: number,
    value: string,
    options: Phaser.Types.GameObjects.Text.TextStyle,
  ) {
    return this.add
      .text(x, y, value, {
        fontFamily: "monospace",
        align: "center",
        ...options,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH.overlay + 5)
      .setScrollFactor(0);
  }

  private showPauseMenu() {
    if (this.isPaused || this.isGameOver) return;

    this.isPaused = true;
    this.physics.pause();

    if (this.spawnTimer) this.spawnTimer.paused = true;
    if (this.dayTimer) this.dayTimer.paused = true;

    this.emitter.stop();

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    const backdrop = this.add
      .rectangle(cx, cy, this.scale.width, this.scale.height, 0x4a3a2a, 0.68)
      .setDepth(DEPTH.overlay)
      .setScrollFactor(0);

    const card = this.createModalCard(cx, cy, 470, 318, 0xffc857);


    const title = this.createModalText(cx, cy - 111, "PAUSED", {
      fontSize: "38px",
      fontStyle: "bold",
      color: "#4A3A2A",
    });

    const subtitle = this.createModalText(
      cx,
      cy - 52,
      "Dompet tarik napas dulu.",
      {
        fontSize: "14px",
        color: "#8B5E3C",
        wordWrap: { width: 380, useAdvancedWrap: true },
      },
    );

    const resume = this.createMenuButton(
      cx,
      cy + 8,
      "RESUME RUN",
      "#4A3A2A",
      "#6FD08C",
      () => this.hidePauseMenu(),
    );

    const restart = this.createMenuButton(
      cx - 96,
      cy + 76,
      "RESTART",
      "#4A3A2A",
      "#FFC857",
      () => {
        this.scene.stop("MainScene");
        this.scene.start("MainScene");
      },
    );

    const quit = this.createMenuButton(
      cx + 96,
      cy + 76,
      "HOME",
      "#FFF6E8",
      "#FF6B6B",
      () => {
        EventBus.emit("go-home");
        this.scene.stop("MainScene");

        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      },
    );

    this.pauseOverlay = this.add
      .container(0, 0, [
        backdrop,
        card,
        title,
        subtitle,
        resume,
        restart,
        quit,
      ])
      .setDepth(DEPTH.overlay)
      .setAlpha(0)
      .setScale(0.94);

    this.tweens.add({
      targets: this.pauseOverlay,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 210,
      ease: "Back.easeOut",
    });
  }

  private hidePauseMenu() {
    if (!this.isPaused) return;

    const overlay = this.pauseOverlay;

    const resumeGame = () => {
      this.isPaused = false;
      this.physics.resume();

      if (this.spawnTimer) this.spawnTimer.paused = false;
      if (this.dayTimer) this.dayTimer.paused = false;

      if (this.isPlayerGrounded()) {
        this.emitter.start();
      }

      overlay?.destroy(true);
      this.pauseOverlay = undefined;
    };

    if (!overlay) {
      resumeGame();
      return;
    }

    this.tweens.add({
      targets: overlay,
      alpha: 0,
      scaleX: 0.94,
      scaleY: 0.94,
      duration: 140,
      ease: "Sine.easeInOut",
      onComplete: resumeGame,
    });
  }

  private spawnConfetti() {
    const colors = [
      0xff6b6b, 0xffc857, 0x6fd08c, 0x9b8cff, 0xbfedff, 0xff7aa2, 0xffffff,
    ];

    const totalPieces = 96;
    const centerX = this.scale.width / 2;

    for (let i = 0; i < totalPieces; i += 1) {
      const fromLeft = i % 2 === 0;
      const startX = fromLeft
        ? Phaser.Math.Between(36, Math.floor(centerX - 80))
        : Phaser.Math.Between(Math.floor(centerX + 80), this.scale.width - 36);

      const startY = Phaser.Math.Between(-80, 24);
      const width = Phaser.Math.Between(4, 9);
      const height = Phaser.Math.Between(7, 15);

      const piece = this.add
        .rectangle(startX, startY, width, height, colors[i % colors.length], 1)
        .setDepth(DEPTH.overlay + 4)
        .setAngle(Phaser.Math.Between(0, 180));

      const fallDistance = Phaser.Math.Between(
        Math.floor(this.scale.height * 0.52),
        this.scale.height - 22,
      );

      this.tweens.add({
        targets: piece,
        y: fallDistance,
        x: piece.x + Phaser.Math.Between(-120, 120),
        angle: piece.angle + Phaser.Math.Between(220, 620),
        alpha: 0,
        delay: Math.floor(i / 16) * 70,
        duration: Phaser.Math.Between(1200, 2100),
        ease: "Sine.easeOut",
        onComplete: () => piece.destroy(),
      });
    }

    // Burst kecil di sekitar panel agar efek kemenangan terasa lebih meriah.
    for (let i = 0; i < 24; i += 1) {
      const burst = this.add
        .circle(
          centerX,
          this.scale.height / 2 - 110,
          Phaser.Math.Between(2, 4),
          colors[i % colors.length],
          1,
        )
        .setDepth(DEPTH.overlay + 5);

      this.tweens.add({
        targets: burst,
        x: burst.x + Phaser.Math.Between(-210, 210),
        y: burst.y + Phaser.Math.Between(-80, 120),
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(620, 980),
        ease: "Cubic.easeOut",
        onComplete: () => burst.destroy(),
      });
    }
  }

  create() {
    this.cameras.main.setBackgroundColor("#DFF4FF");
    this.cameras.main.roundPixels = true;

    const width = this.scale.width;
    const height = this.scale.height;
    const floorY = height - 32;

    this.background = new FinancialParallaxBackground(this);
    this.background.create(width, height, floorY);

    this.createPlayerAnimations();

    this.player = this.physics.add.sprite(100, floorY - 28, "player_run_1");
    this.player
      .setDepth(DEPTH.player)
      .setCollideWorldBounds(true)
      .setGravityY(1500)
      .setScale(1.08);

    this.player.body.setSize(27, 39);
    this.player.body.setOffset(10, 9);

    this.physics.world.setBounds(0, 0, width + 220, floorY);

    this.player.anims.play("player-run", true);

    this.emitter = this.add.particles(0, 0, "particle", {
      speed: { min: -100, max: -50 },
      angle: { min: 0, max: -90 },
      scale: { start: 1, end: 0 },
      lifespan: 400,
      gravityY: 200,
      frequency: 100,
    });

    this.emitter.startFollow(this.player, -18, 20);

    if (this.input.keyboard) {
      this.input.keyboard.addCapture([
        Phaser.Input.Keyboard.KeyCodes.SPACE,
        Phaser.Input.Keyboard.KeyCodes.UP,
        Phaser.Input.Keyboard.KeyCodes.DOWN,
        Phaser.Input.Keyboard.KeyCodes.P,
        Phaser.Input.Keyboard.KeyCodes.ESC,
      ]);

      this.cursors = this.input.keyboard.createCursorKeys();
      this.pauseKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.P,
      );
      this.escapeKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.ESC,
      );
    }

    this.obstacleGroup = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    this.itemGroup = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    this.paydayGroup = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    this.balanceText = this.add
      .text(20, 20, `SALDO: ${this.formatCurrency(this.balance)}`, {
        fontSize: "24px",
        color: "#4A3A2A",
        backgroundColor: "#FFF1C7",
        padding: { x: 7, y: 5 },
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(DEPTH.hud);

    this.essentialLifeText = this.add
      .text(
        20,
        58,
        `NEEDS LIFE: ${this.essentialLife}/${GAMEPLAY.maxEssentialLife}`,
        {
          fontSize: "16px",
          color: "#4A3A2A",
          backgroundColor: "#FFF6E8",
          padding: { x: 8, y: 4 },
          fontFamily: "monospace",
          fontStyle: "bold",
        },
      )
      .setScrollFactor(0)
      .setDepth(DEPTH.hud);

    this.progressBar = new ProgressBar(this, width);
    this.progressBar.update(this.day, GAMEPLAY.maxDay);

    this.scoreText = this.add
      .text(width - 18, height - 24, `SKOR ${this.getCurrentScore()}`, {
        fontFamily: "monospace",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#FFC857",
        stroke: "#4A3A2A",
        strokeThickness: 3,
      })
      .setOrigin(1, 1)
      .setScrollFactor(0)
      .setDepth(DEPTH.hud);

    this.dayText = this.add
      .text(width - 20, 20, `DAY: ${this.day}/${GAMEPLAY.maxDay}`, {
        fontSize: "24px",
        color: "#FFF6E8",
        backgroundColor: "#8B5E3C",
        padding: { x: 10, y: 5 },
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.hud);

    this.dayText.setOrigin(1, 0);
    this.dayText.setPosition(width - 45, 17);
    this.dayText.setDepth(DEPTH.hud);

    this.createHudButton(width - 24, 37, "⏸", () => this.showPauseMenu());

    this.incomingNotice = new IncomingNotice(this, width);
    this.eventFeed = new EventFeed(this, width, height);

    this.eventFeed.push("Mulai dari Rp0", "warning");
    this.eventFeed.push("Ambil saldo dulu", "info");

    this.physics.add.overlap(
      this.player,
      this.obstacleGroup,
      this.hitWant,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.itemGroup,
      this.hitNeed,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.paydayGroup,
      this.hitPayday,
      undefined,
      this,
    );

    this.createSpawnTimer(GAMEPLAY.baseSpawnDelayMs);

    this.time.delayedCall(450, () => {
      if (!this.isGameOver) {
        this.spawnInitialPayday();
      }
    });

    this.dayTimer = this.time.addEvent({
      delay: GAMEPLAY.dayDurationMs,
      callback: this.increaseDay,
      callbackScope: this,
      loop: true,
    });

    EventBus.emit("current-scene-ready", this);
  }

  private spawnInitialPayday() {
    const floorY = this.scale.height - 32;

    const sprite = this.paydayGroup.create(
      220,
      floorY - LANES.groundOffsetY,
      "tex_payday",
    ) as GameEntitySprite;

    sprite
      .setDepth(DEPTH.gameplay)
      .setActive(true)
      .setVisible(true)
      .setOrigin(0.5, 0.5);

    sprite.body.setAllowGravity(false);
    sprite.body.setImmovable(true);
    sprite.body.setVelocityX(-90);
    sprite.body.setSize(34, 34);
    sprite.body.setOffset(7, 7);

    const labelData = compactEntityLabel("Saldo masuk", "payday");

    sprite.label = new EntityLabel(
      this,
      sprite.x,
      sprite.y - 54,
      labelData.shortLabel,
      "payday",
    );

    sprite.kind = "payday";
    sprite.labelOffsetY = 54;
    sprite.fullLabel = labelData.fullLabel;
    sprite.isInitialPayday = true;

    this.incomingNotice.show(
      "Saldo masuk",
      "payday",
      `${this.formatCurrency(GAMEPLAY.initialPaydayAmount)}`,
    );
    this.eventFeed.push("Saldo masuk", "good");
  }

  increaseDay() {
    if (this.isGameOver) return;

    this.day += 1;
    this.dayText.setText(`DAY: ${this.day}/${GAMEPLAY.maxDay}`);
    this.progressBar?.update(this.day, GAMEPLAY.maxDay);

    this.scorePoints += GAMEPLAY.pointsPerSurvivedDay;
    this.updateScoreText();

    if (this.day === GAMEPLAY.bossStartDay && !this.isBossStage) {
      this.isBossStage = true;
      this.gameSpeedMultiplier = 1.28;
      this.cameras.main.flash(800, 255, 180, 90);
      this.background.pulseCrisis();
      this.createSpawnTimer(GAMEPLAY.crisisSpawnDelayMs);
      this.eventFeed.push("Fase krisis!", "warning");
    }

    if (this.day === GAMEPLAY.finalBossDay) {
      this.gameSpeedMultiplier = 1.48;
      this.createSpawnTimer(GAMEPLAY.bossSpawnDelayMs);
      this.eventFeed.push("Tekanan akhir bulan!", "bad");
    }

    if (this.day >= GAMEPLAY.maxDay) {
      this.triggerGameOver(true);
    }
  }

  spawnEntity() {
    if (this.isGameOver || !this.hasCollectedInitialPayday) return;

    const width = this.scale.width;
    const floorY = this.scale.height - 32;

    let isWant = false;
    let isNeed = false;
    let isBoss = false;

    let rawWord = "";
    let tex = "";
    let velocityX: number = GAMEPLAY.baseObstacleSpeed;
    let kind: EntityKind = "want";
    let lane: EntityLane = "ground";

    if (this.isBossStage && Math.random() < 0.35) {
      isBoss = true;
      kind = "boss";
      rawWord = "Tagihan Besar";
      tex = "tex_boss";
      velocityX = GAMEPLAY.bossObstacleSpeed;
      lane = Math.random() < GAMEPLAY.bossDuckLaneChance ? "duck" : "ground";
    } else {
      const rand = Math.random();

      if (rand < 0.62) {
        isWant = true;
        kind = "want";
        rawWord = pickRandomLabel(this.aiConfig.wants, "Godaan");
        tex = "tex_want";
        lane = Math.random() < GAMEPLAY.wantDuckLaneChance ? "duck" : "ground";
      } else {
        isNeed = true;
        kind = "need";
        rawWord = pickRandomLabel(this.aiConfig.needs, "Kebutuhan");
        tex = "tex_need";
        lane = Math.random() < GAMEPLAY.needJumpLaneChance ? "jump" : "ground";
      }
    }

    if (!isBoss && this.day >= GAMEPLAY.bossStartDay) {
      velocityX = GAMEPLAY.crisisObstacleSpeed;
    }

    velocityX = Math.round(velocityX * this.gameSpeedMultiplier);

    let spawnY = floorY - LANES.groundOffsetY;

    if (lane === "duck") {
      spawnY = floorY - (isBoss ? LANES.bossDuckOffsetY : LANES.duckOffsetY);
    }

    if (lane === "jump") {
      spawnY = floorY - LANES.needJumpOffsetY;
    }

    const targetGroup = isWant || isBoss ? this.obstacleGroup : this.itemGroup;

    const sprite = targetGroup.create(
      width + 44,
      Math.round(spawnY),
      tex,
    ) as GameEntitySprite;

    sprite
      .setDepth(DEPTH.gameplay)
      .setActive(true)
      .setVisible(true)
      .setOrigin(0.5, 0.5);

    sprite.body.setAllowGravity(false);
    sprite.body.setImmovable(true);
    sprite.body.setVelocityX(velocityX);

    if (isBoss && lane === "duck") {
      sprite.body.setSize(58, 58);
      sprite.body.setOffset(10, 10);
    } else if (isBoss) {
      sprite.body.setSize(56, 56);
      sprite.body.setOffset(11, 11);
    } else if (lane === "duck") {
      sprite.body.setSize(36, 50);
      sprite.body.setOffset(6, -2);
    } else if (lane === "jump") {
      sprite.body.setSize(34, 34);
      sprite.body.setOffset(7, 7);
    } else {
      sprite.body.setSize(34, 34);
      sprite.body.setOffset(7, 7);
    }

    sprite.isDuckLane = lane === "duck";
    sprite.lane = lane;

    const labelData = compactEntityLabel(rawWord, kind);
    const labelOffsetY = isBoss ? 72 : lane === "duck" ? 62 : 54;

    sprite.label = new EntityLabel(
      this,
      sprite.x,
      sprite.y - labelOffsetY,
      labelData.shortLabel,
      kind,
    );

    sprite.isNeed = isNeed;
    sprite.isBoss = isBoss;
    sprite.kind = kind;
    sprite.labelOffsetY = labelOffsetY;
    sprite.fullLabel = labelData.fullLabel;

    const impactText =
      kind === "want"
        ? this.formatCurrency(GAMEPLAY.wantDamage)
        : kind === "need"
          ? this.formatCurrency(GAMEPLAY.needCost)
          : kind === "boss"
            ? this.formatCurrency(GAMEPLAY.bossDamage)
            : "";

    this.incomingNotice.show(labelData.fullLabel, kind, impactText);

    const isDev =
      typeof process !== "undefined" && process.env?.NODE_ENV !== "production";

    if (isDev) {
      console.debug("[DashTo30] Spawn entity:", {
        kind,
        lane,
        texture: tex,
        x: sprite.x,
        y: sprite.y,
        visible: sprite.visible,
        active: sprite.active,
        velocityX: sprite.body.velocity.x,
      });
    }
  }

  hitWant(_playerObject: unknown, wantObject: unknown) {
    const want = wantObject as GameEntitySprite;
    const isBoss = Boolean(want.isBoss);
    const label = want.fullLabel || (isBoss ? "Boss" : "Want");

    this.destroyEntity(want);

    if (isBoss) {
      this.bossHits += 1;
    } else {
      this.wantsHit += 1;
    }

    this.updateBalance(isBoss ? GAMEPLAY.bossDamage : GAMEPLAY.wantDamage);
    this.eventFeed.push(`Hit ${label}`, "bad");

    this.cameras.main.shake(isBoss ? 250 : 150, 0.02);
  }

  hitNeed(_playerObject: unknown, needObject: unknown) {
    const need = needObject as GameEntitySprite;
    const label = need.fullLabel || "Need";

    need.isNeed = false;
    this.destroyEntity(need);

    this.needsTaken += 1;
    this.scorePoints += GAMEPLAY.pointsPerNeedTaken;
    this.updateScoreText();

    if (GAMEPLAY.needLifeReward > 0) {
      this.updateEssentialLife(GAMEPLAY.needLifeReward);
    }

    this.updateBalance(GAMEPLAY.needCost);
    this.eventFeed.push(`Need ${label}`, "good");

    this.player.setTint(0xffffff);
    this.time.delayedCall(150, () => this.player.clearTint());
  }

  hitPayday(_playerObject: unknown, paydayObject: unknown) {
    const payday = paydayObject as GameEntitySprite;

    this.destroyEntity(payday);

    const amount = payday.isInitialPayday ? GAMEPLAY.initialPaydayAmount : 500;

    this.updateBalance(amount);

    if (payday.isInitialPayday) {
      this.hasCollectedInitialPayday = true;
      this.controlsLocked = false;
      this.eventFeed.push(`Saldo ${this.formatCurrency(amount)}`, "good");
    } else {
      this.eventFeed.push(`Bonus ${this.formatCurrency(amount)}`, "good");
    }

    this.player.setTint(0x6fd08c);
    this.time.delayedCall(150, () => this.player.clearTint());
  }

  updateBalance(amount: number) {
    this.balance += amount;
    this.balanceText.setText(`SALDO: ${this.formatCurrency(this.balance)}`);

    if (this.balance <= 0 && this.hasCollectedInitialPayday) {
      this.balanceText.setColor("#FF6B6B");
      this.triggerGameOver(false);
      return;
    }

    this.balanceText.setColor("#4A3A2A");
  }

  destroyEntity(entity: GameEntitySprite) {
    entity.label?.destroy();
    entity.destroy();
  }

  private buildReceiptText(
    isWin: boolean,
    finalScore: number,
    personalBest: number,
  ) {
    const playerIdentity = this.getPlayerIdentity();
    const status = isWin ? "MONTH SURVIVED" : "BANKRUPT";
    const advice = isWin ? this.getWinMessage() : this.getRoastMessage();

    return [
      "====== DASH TO 30 RECEIPT ======",
      `PLAYER      : ${playerIdentity.name}`,
      `STATUS      : ${status}`,
      `DAY         : ${this.day}/${GAMEPLAY.maxDay}`,
      `RUN SCORE   : ${finalScore}`,
      `BEST SCORE  : ${personalBest}`,
      `SALDO AKHIR : ${this.formatCurrency(this.balance)}`,
      "-------------------------------",
      `NEEDS TAKEN : ${this.needsTaken}`,
      `MISSED NEED : ${this.missedNeeds}`,
      `WANTS HIT   : ${this.wantsHit}`,
      `WANTS DODGE : ${this.wantsAvoided}`,
      `BOSS HIT    : ${this.bossHits}`,
      `BOSS DODGE  : ${this.bossAvoided}`,
      "-------------------------------",
      isWin ? `ADVICE: ${advice}` : `AI ROAST: ${advice}`,
      "===============================",
      "Play Dash to 30 and survive your wallet.",
    ].join("\n");
  }

  private async shareReceiptText(
    isWin: boolean,
    finalScore: number,
    personalBest: number,
  ) {
    const receiptText = this.buildReceiptText(isWin, finalScore, personalBest);

    if (typeof window === "undefined") return;

    try {
      const nav = window.navigator as Navigator & {
        share?: (data: { title?: string; text?: string }) => Promise<void>;
      };

      if (nav.share) {
        await nav.share({
          title: "Dash to 30 Receipt",
          text: receiptText,
        });

        this.eventFeed?.push("Receipt shared", "good");
        return;
      }

      if (window.navigator.clipboard?.writeText) {
        await window.navigator.clipboard.writeText(receiptText);
        this.eventFeed?.push("Receipt copied", "good");
      }
    } catch (error) {
      console.error("Failed to share receipt", error);
      this.eventFeed?.push("Share failed", "bad");
    }
  }

  private hideReceiptModal() {
    this.receiptOverlay?.destroy(true);
    this.receiptOverlay = undefined;
  }

  private showReceiptModal(
    isWin: boolean,
    finalScore: number,
    personalBest: number,
  ) {
    this.hideReceiptModal();

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const receiptWidth = Math.min(430, this.scale.width - 64);
    const receiptHeight = Math.min(392, this.scale.height - 36);
    const x0 = cx - receiptWidth / 2;
    const y0 = cy - receiptHeight / 2;

    const backdrop = this.add
      .rectangle(cx, cy, this.scale.width, this.scale.height, 0x4a3a2a, 0.52)
      .setDepth(DEPTH.overlay + 10)
      .setScrollFactor(0);

    const paper = this.add.graphics();
    paper.fillStyle(0xfffdf2, 1);
    paper.fillRoundedRect(x0, y0, receiptWidth, receiptHeight, 18);
    paper.lineStyle(3, 0x8b5e3c, 1);
    paper.strokeRoundedRect(x0, y0, receiptWidth, receiptHeight, 18);

    paper.lineStyle(1, 0x8b5e3c, 0.35);
    for (let x = x0 + 18; x < x0 + receiptWidth - 18; x += 18) {
      paper.lineBetween(x, y0 + 46, x + 9, y0 + 46);
      paper.lineBetween(
        x,
        y0 + receiptHeight - 58,
        x + 9,
        y0 + receiptHeight - 58,
      );
    }

    const children: Phaser.GameObjects.GameObject[] = [backdrop, paper];

    const addText = (
      x: number,
      y: number,
      value: string,
      size = "12px",
      color = "#4A3A2A",
      originX = 0.5,
    ) => {
      const textObject = this.add
        .text(x, y, value, {
          fontFamily: "monospace",
          fontSize: size,
          fontStyle: "bold",
          color,
          align: originX === 0.5 ? "center" : "left",
          wordWrap: { width: receiptWidth - 54, useAdvancedWrap: true },
        })
        .setOrigin(originX, 0.5)
        .setDepth(DEPTH.overlay + 12)
        .setScrollFactor(0);

      children.push(textObject);
      return textObject;
    };

    const addRow = (label: string, value: string, y: number) => {
      const left = this.add
        .text(x0 + 28, y, label, {
          fontFamily: "monospace",
          fontSize: "11px",
          color: "#8B5E3C",
        })
        .setOrigin(0, 0.5)
        .setDepth(DEPTH.overlay + 12)
        .setScrollFactor(0);

      const right = this.add
        .text(x0 + receiptWidth - 28, y, value, {
          fontFamily: "monospace",
          fontSize: "11px",
          fontStyle: "bold",
          color: "#4A3A2A",
          align: "right",
        })
        .setOrigin(1, 0.5)
        .setDepth(DEPTH.overlay + 12)
        .setScrollFactor(0);

      children.push(left, right);
    };

    const playerIdentity = this.getPlayerIdentity();
    const status = isWin ? "SURVIVED" : "BANKRUPT";
    const advice = isWin ? this.getWinMessage() : this.getRoastMessage();

    addText(cx, y0 + 25, "DASH TO 30 RECEIPT", "16px", "#4A3A2A");
    addText(
      cx,
      y0 + 56,
      "MINIMARKET OF QUESTIONABLE CHOICES",
      "9px",
      "#8B5E3C",
    );

    let rowY = y0 + 76;
    addRow("PLAYER", playerIdentity.name, rowY);
    rowY += 20;
    addRow("STATUS", status, rowY);
    rowY += 20;
    addRow("DAY", `${this.day}/${GAMEPLAY.maxDay}`, rowY);
    rowY += 20;
    addRow("RUN SCORE", String(finalScore), rowY);
    rowY += 20;
    addRow("PERSONAL BEST", String(personalBest), rowY);
    rowY += 20;
    addRow("SALDO", this.formatCurrency(this.balance), rowY);
    rowY += 26;
    addRow("NEEDS TAKEN", String(this.needsTaken), rowY);
    rowY += 20;
    addRow("MISSED NEED", String(this.missedNeeds), rowY);
    rowY += 20;
    addRow("WANTS DODGED", String(this.wantsAvoided), rowY);
    rowY += 20;
    addRow("WANTS HIT", String(this.wantsHit), rowY);
    rowY += 20;
    addRow("BOSS DODGED", String(this.bossAvoided), rowY);

    addText(
      cx,
      y0 + receiptHeight - 84,
      isWin ? `CATATAN: ${advice}` : `AI ROAST: ${advice}`,
      "11px",
      "#4A3A2A",
    );

    const shareBtn = this.createMenuButton(
      cx - 88,
      y0 + receiptHeight - 28,
      "COPY",
      "#4A3A2A",
      "#6FD08C",
      () => {
        void this.shareReceiptText(isWin, finalScore, personalBest);
      },
    );

    const closeBtn = this.createMenuButton(
      cx + 88,
      y0 + receiptHeight - 28,
      "CLOSE",
      "#FFF6E8",
      "#8B5E3C",
      () => this.hideReceiptModal(),
    );

    children.push(shareBtn, closeBtn);

    this.receiptOverlay = this.add
      .container(0, 0, children)
      .setDepth(DEPTH.overlay + 10)
      .setAlpha(0)
      .setScale(0.96);

    this.tweens.add({
      targets: this.receiptOverlay,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 220,
      ease: "Back.easeOut",
    });
  }

  triggerGameOver(isWin: boolean) {
    if (this.isGameOver) return;

    this.isGameOver = true;
    this.physics.pause();

    if (this.spawnTimer) {
      this.spawnTimer.remove(false);
    }

    if (this.dayTimer) {
      this.dayTimer.remove(false);
    }

    this.emitter.stop();

    const finalScore = this.getFinalScore();
    const highScore = this.resolvePersonalHighScore(finalScore);
    const personalBest = Math.max(highScore.previousBest, finalScore);
    const playerIdentity = this.getPlayerIdentity();

    EventBus.emit("game-over", {
      score: finalScore,
      balance: this.balance,
      survivalDays: this.day,
      isWin,
      needsTaken: this.needsTaken,
      wantsAvoided: this.wantsAvoided,
      bossAvoided: this.bossAvoided,
      essentialLife: this.essentialLife,
      isNewPersonalHighScore: highScore.isNewHighScore,
      previousPersonalBest: highScore.previousBest,
    });

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    const borderColor = isWin ? 0x6fd08c : 0xff6b6b;
    const titleColor = isWin ? "#6FD08C" : "#FF6B6B";

    this.add
      .rectangle(cx, cy, this.scale.width, this.scale.height, 0x4a3a2a, 0.74)
      .setDepth(DEPTH.overlay)
      .setScrollFactor(0);

    const card = this.createModalCard(cx, cy, 650, 404, borderColor);

    const icon = this.createModalText(cx - 270, cy - 153, isWin ? "🎉" : "🧾", {
      fontSize: "23px",
      color: "#4A3A2A",
    });

    const titleText = this.createModalText(
      cx,
      cy - 153,
      isWin ? "MENYALA, WIR! 👑" : "BONCOS PARAH! 💀",
      {
        fontSize: "38px",
        fontStyle: "bold",
        color: titleColor,
      },
    );

    const scoreLabel = highScore.isNewHighScore
      ? "NEW PERSONAL BEST!"
      : `RUN SCORE: ${finalScore}`;

    const scoreText = this.createModalText(cx, cy - 82, scoreLabel, {
      fontSize: "18px",
      fontStyle: "bold",
      color: "#4A3A2A",
      backgroundColor: "#FFF1C7",
      padding: { x: 14, y: 7 },
    });

    const bestText = this.createModalText(
      cx,
      cy - 48,
      highScore.isNewHighScore
        ? `Previous Best: ${highScore.previousBest} • Current: ${finalScore}`
        : `Personal Best: ${personalBest}`,
      {
        fontSize: "12px",
        color: "#8B5E3C",
        wordWrap: { width: 540, useAdvancedWrap: true },
      },
    );

    const identityText = this.createModalText(
      cx,
      cy - 24,
      playerIdentity.isLoggedIn
        ? `Player: ${playerIdentity.name}`
        : "Guest run: login to submit score to Global Leaderboard.",
      {
        fontSize: "12px",
        color: "#8B5E3C",
        wordWrap: { width: 540, useAdvancedWrap: true },
      },
    );

    const mainMessage = isWin
      ? this.getWinMessage()
      : `AI ROAST: "${this.getRoastMessage()}"`;

    const messageText = this.createModalText(cx, cy + 22, mainMessage, {
      fontSize: "15px",
      color: "#4A3A2A",
      wordWrap: { width: 540, useAdvancedWrap: true },
    });

    const statsText = this.createModalText(
      cx,
      cy + 76,
      `Needs: ${this.needsTaken}   Life: ${this.essentialLife}/${GAMEPLAY.maxEssentialLife}   Avoided: ${this.wantsAvoided}   Boss: ${this.bossAvoided}`,
      {
        fontSize: "13px",
        fontStyle: "bold",
        color: "#4A3A2A",
        backgroundColor: "#FFF6E8",
        padding: { x: 10, y: 5 },
        wordWrap: { width: 560, useAdvancedWrap: true },
      },
    );

    const retryBtn = this.createMenuButton(
      cx - 178,
      cy + 142,
      "TRY AGAIN",
      "#4A3A2A",
      "#FFC857",
      () => {
        this.scene.stop("MainScene");
        this.scene.start("MainScene");
      },
    );

    const receiptBtn = this.createMenuButton(
      cx,
      cy + 142,
      "VIEW RECEIPT",
      "#4A3A2A",
      "#6FD08C",
      () => this.showReceiptModal(isWin, finalScore, personalBest),
    );

    const homeBtn = this.createMenuButton(
      cx + 178,
      cy + 142,
      "HOME",
      "#FFF6E8",
      "#8B5E3C",
      () => {
        EventBus.emit("go-home");
        this.scene.stop("MainScene");

        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      },
    );

    const endContainer = this.add
      .container(0, 0, [
        card,
        icon,
        titleText,
        scoreText,
        bestText,
        identityText,
        messageText,
        statsText,
        retryBtn,
        receiptBtn,
        homeBtn,
      ])
      .setDepth(DEPTH.overlay + 1)
      .setAlpha(0)
      .setScale(0.92);

    this.tweens.add({
      targets: endContainer,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 240,
      ease: "Back.easeOut",
    });

    if (isWin) {
      this.spawnConfetti();
    }
  }

  update() {
    if (this.isGameOver) return;

    const pausePressed =
      Boolean(this.pauseKey && Phaser.Input.Keyboard.JustDown(this.pauseKey)) ||
      Boolean(this.escapeKey && Phaser.Input.Keyboard.JustDown(this.escapeKey));

    if (pausePressed) {
      if (this.isPaused) {
        this.hidePauseMenu();
      } else {
        this.showPauseMenu();
      }
    }

    if (this.isPaused) return;

    this.background.update(this.day, this.isBossStage);

    if (this.cursors && !this.controlsLocked) {
      const now = this.time.now;
      const isGrounded = this.isPlayerGrounded();

      if (isGrounded) {
        this.lastGroundedAt = now;
      }

      const wantsToSlide = Boolean(this.cursors.down?.isDown);
      const jumpJustPressed =
        Boolean(
          this.cursors.space &&
          Phaser.Input.Keyboard.JustDown(this.cursors.space),
        ) ||
        Boolean(
          this.cursors.up && Phaser.Input.Keyboard.JustDown(this.cursors.up),
        );

      if (jumpJustPressed && !this.isSliding) {
        this.lastJumpPressedAt = now;
      }

      const slideMinDurationPassed =
        now - this.slideStartedAt >= GAMEPLAY.slideMinDurationMs;

      const canUseBufferedJump =
        now - this.lastJumpPressedAt <= 140 &&
        now - this.lastGroundedAt <= 120 &&
        !this.isSliding;

      if (wantsToSlide && (isGrounded || this.isSliding)) {
        if (!this.isSliding) {
          this.setPlayerSlideState();
        }

        this.emitter.stop();
      } else if (this.isSliding && slideMinDurationPassed) {
        this.setPlayerRunState();

        if (isGrounded) {
          this.player.y -= 4;
        }
      } else if (canUseBufferedJump) {
        this.player.setVelocityY(-720);
        this.setPlayerJumpState();
        this.lastJumpPressedAt = 0;
        this.lastGroundedAt = 0;
        this.emitter.stop();
      }

      if (!this.isSliding) {
        if (!isGrounded) {
          this.setPlayerJumpState();
          this.emitter.stop();
        } else {
          this.player.anims.play("player-run", true);
          this.emitter.start();
        }
      }
    }

    const cleanup = (group: Phaser.Physics.Arcade.Group) => {
      group.getChildren().forEach((child) => {
        const entity = child as GameEntitySprite;

        if (entity.x < -120) {
          const label = entity.fullLabel || entity.kind || "item";

          if (entity.isNeed) {
            this.missedNeeds += 1;
            this.updateBalance(GAMEPLAY.missedNeedPenalty);
            this.updateEssentialLife(-GAMEPLAY.missedNeedLifePenalty);
            this.scorePoints += GAMEPLAY.pointsPerMissedNeedPenalty;
            this.updateScoreText();
            this.eventFeed.push(`Missed ${label}`, "bad");
            this.cameras.main.shake(100, 0.01);
          } else if (entity.kind === "want") {
            this.wantsAvoided += 1;
            this.scorePoints += GAMEPLAY.pointsPerWantAvoided;
            this.updateScoreText();
            this.eventFeed.push(`Avoided ${label}`, "good");
          } else if (entity.isBoss) {
            this.bossAvoided += 1;
            this.scorePoints += GAMEPLAY.pointsPerBossAvoided;
            this.updateScoreText();
            this.eventFeed.push("Boss escaped", "good");
          }

          this.destroyEntity(entity);
          return;
        }

        entity.label?.update(entity.x, entity.y - (entity.labelOffsetY ?? 40));
      });
    };

    cleanup(this.obstacleGroup);
    cleanup(this.itemGroup);
    cleanup(this.paydayGroup);
  }
}
