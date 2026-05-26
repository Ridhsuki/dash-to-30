import Phaser from 'phaser';

import { EventBus } from '../EventBus';
import { FinancialParallaxBackground } from '../background/FinancialParallaxBackground';
import { GAMEPLAY, LANES } from '../config/gameplay';
import { DEPTH } from '../constants/layers';
import { createCoreGameTextures } from '../textures/GameTextures';
import { EntityLabel } from '../ui/EntityLabel';
import { EventFeed } from '../ui/EventFeed';
import { IncomingNotice } from '../ui/IncomingNotice';
import { ProgressBar } from '../ui/ProgressBar';
import {
    compactEntityLabel,
    normalizeAiConfig,
    pickRandomLabel,
    type EntityKind,
    type GameAiConfig,
} from '../utils/gameText';

type EntityLane = 'ground' | 'duck' | 'jump';

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

    lastGroundedAt: number = 0;
    lastJumpPressedAt: number = 0;
    slideStartedAt: number = 0;

    scorePoints: number = 0;
    needsTaken: number = 0;
    wantsAvoided: number = 0;
    bossAvoided: number = 0;
    essentialLife: number = GAMEPLAY.maxEssentialLife;

    hasCollectedInitialPayday: boolean = false;
    controlsLocked: boolean = true;
    gameSpeedMultiplier: number = 1;

    constructor() {
        super('MainScene');
    }

    init() {
        this.isGameOver = false;
        this.isBossStage = false;
        this.isSliding = false;
        this.isPaused = false;
        this.pauseOverlay = undefined;

        this.balance = GAMEPLAY.startingBalance;
        this.day = 1;

        this.scorePoints = 0;
        this.needsTaken = 0;
        this.wantsAvoided = 0;
        this.bossAvoided = 0;
        this.essentialLife = GAMEPLAY.maxEssentialLife;

        this.hasCollectedInitialPayday = false;
        this.controlsLocked = true;
        this.gameSpeedMultiplier = 1;

        this.lastGroundedAt = 0;
        this.lastJumpPressedAt = 0;
        this.slideStartedAt = 0;

        let storedConfig: unknown = null;

        try {
            const stored = localStorage.getItem('dashTo30_aiConfig');

            if (stored) {
                storedConfig = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to parse aiConfig', error);
        }

        this.aiConfig = normalizeAiConfig(storedConfig);
    }

    preload() {
        createCoreGameTextures(this);
    }

    private createPlayerAnimations() {
        if (this.anims.exists('player-run')) {
            this.anims.remove('player-run');
        }

        this.anims.create({
            key: 'player-run',
            frames: [
                { key: 'player_run_1' },
                { key: 'player_run_2' },
            ],
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
        this.player.setTexture('player_jump');
        this.player.body?.setSize(27, 39);
        this.player.body?.setOffset(10, 9);
        this.player.setGravityY(1500);
    }

    private setPlayerSlideState() {
        this.isSliding = true;
        this.slideStartedAt = this.time.now;
        this.player.anims.stop();
        this.player.setTexture('player_slide');

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

    private getFinalScore() {
        const balanceBonus = Math.max(
            0,
            Math.floor(this.balance / GAMEPLAY.remainingBalanceDivisor),
        );

        return Math.max(0, this.scorePoints + balanceBonus);
    }

    private getPersonalHighScoreKey() {
        return 'dashTo30_personalHighScore';
    }

    private resolvePersonalHighScore(finalScore: number) {
        if (typeof window === 'undefined') {
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
            this.essentialLifeText.setText(`NEEDS LIFE: ${this.essentialLife}/${GAMEPLAY.maxEssentialLife}`);
            this.essentialLifeText.setColor(this.essentialLife <= 1 ? '#FF6B6B' : '#4A3A2A');
        }

        if (this.essentialLife <= 0 && this.hasCollectedInitialPayday) {
            this.eventFeed.push('Needs ignored!', 'bad');
            this.triggerGameOver(false);
        }
    }

    private createHudButton(x: number, y: number, label: string, onClick: () => void) {
        const button = this.add.text(x, y, label, {
            fontFamily: 'monospace',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#4A3A2A',
            backgroundColor: '#FFF1C7',
            padding: { x: 9, y: 6 },
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(DEPTH.hud)
            .setInteractive({ useHandCursor: true });

        button.on('pointerover', () => button.setScale(1.06));
        button.on('pointerout', () => button.setScale(1));
        button.on('pointerdown', onClick);

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
        const button = this.add.text(x, y, label, {
            fontFamily: 'monospace',
            fontSize: '18px',
            fontStyle: 'bold',
            color,
            backgroundColor,
            padding: { x: 16, y: 10 },
        })
            .setOrigin(0.5)
            .setDepth(DEPTH.overlay + 3)
            .setInteractive({ useHandCursor: true });

        button.on('pointerover', () => button.setScale(1.06));
        button.on('pointerout', () => button.setScale(1));
        button.on('pointerdown', onClick);

        return button;
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
            .rectangle(cx, cy, this.scale.width, this.scale.height, 0x4A3A2A, 0.72)
            .setDepth(DEPTH.overlay);

        const panel = this.add
            .rectangle(cx, cy, 420, 250, 0xFFF6E8, 0.98)
            .setStrokeStyle(4, 0xFFC857, 1)
            .setDepth(DEPTH.overlay + 1);

        const title = this.add.text(cx, cy - 86, 'PAUSED', {
            fontFamily: 'monospace',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#4A3A2A',
        }).setOrigin(0.5).setDepth(DEPTH.overlay + 2);

        const subtitle = this.add.text(cx, cy - 50, 'Dompet tarik napas dulu.', {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#8B5E3C',
        }).setOrigin(0.5).setDepth(DEPTH.overlay + 2);

        const resume = this.createMenuButton(cx, cy + 10, 'RESUME RUN', '#4A3A2A', '#6FD08C', () => this.hidePauseMenu());

        const restart = this.createMenuButton(cx, cy + 66, 'RESTART', '#4A3A2A', '#FFC857', () => {
            this.scene.stop('MainScene');
            this.scene.start('MainScene');
        });

        this.pauseOverlay = this.add
            .container(0, 0, [backdrop, panel, title, subtitle, resume, restart])
            .setDepth(DEPTH.overlay)
            .setAlpha(0)
            .setScale(0.94);

        this.tweens.add({
            targets: this.pauseOverlay,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 180,
            ease: 'Back.easeOut',
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
            ease: 'Sine.easeInOut',
            onComplete: resumeGame,
        });
    }

    private spawnConfetti() {
        const colors = [0xFF6B6B, 0xFFC857, 0x6FD08C, 0x9B8CFF, 0xBFEDFF];

        for (let i = 0; i < 44; i += 1) {
            const piece = this.add
                .rectangle(
                    Phaser.Math.Between(80, this.scale.width - 80),
                    Phaser.Math.Between(-40, 20),
                    Phaser.Math.Between(4, 8),
                    Phaser.Math.Between(6, 12),
                    colors[i % colors.length],
                    1,
                )
                .setDepth(DEPTH.overlay + 4)
                .setAngle(Phaser.Math.Between(0, 180));

            this.tweens.add({
                targets: piece,
                y: Phaser.Math.Between(120, this.scale.height - 40),
                x: piece.x + Phaser.Math.Between(-80, 80),
                angle: piece.angle + Phaser.Math.Between(160, 420),
                alpha: 0,
                duration: Phaser.Math.Between(1100, 1700),
                ease: 'Sine.easeOut',
                onComplete: () => piece.destroy(),
            });
        }
    }

    create() {
        this.cameras.main.setBackgroundColor('#DFF4FF');
        this.cameras.main.roundPixels = true;

        const width = this.scale.width;
        const height = this.scale.height;
        const floorY = height - 32;

        this.background = new FinancialParallaxBackground(this);
        this.background.create(width, height, floorY);

        this.createPlayerAnimations();

        this.player = this.physics.add.sprite(100, floorY - 28, 'player_run_1');
        this.player
            .setDepth(DEPTH.player)
            .setCollideWorldBounds(true)
            .setGravityY(1500)
            .setScale(1.08);

        this.player.body.setSize(27, 39);
        this.player.body.setOffset(10, 9);

        this.physics.world.setBounds(0, 0, width + 220, floorY);

        this.player.anims.play('player-run', true);

        this.emitter = this.add.particles(0, 0, 'particle', {
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
            this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
            this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
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

        this.balanceText = this.add.text(20, 20, `BALANCE: $${this.balance}`, {
            fontSize: '24px',
            color: '#4A3A2A',
            backgroundColor: '#FFF1C7',
            padding: { x: 10, y: 5 },
            fontFamily: 'monospace',
            fontStyle: 'bold',
        }).setScrollFactor(0).setDepth(DEPTH.hud);

        this.essentialLifeText = this.add.text(20, 58, `NEEDS LIFE: ${this.essentialLife}/${GAMEPLAY.maxEssentialLife}`, {
            fontSize: '16px',
            color: '#4A3A2A',
            backgroundColor: '#FFF6E8',
            padding: { x: 8, y: 4 },
            fontFamily: 'monospace',
            fontStyle: 'bold',
        }).setScrollFactor(0).setDepth(DEPTH.hud);

        this.progressBar = new ProgressBar(this, width);
        this.progressBar.update(this.day, GAMEPLAY.maxDay);

        this.createHudButton(width - 218, 31, 'Ⅱ', () => this.showPauseMenu());

        this.dayText = this.add.text(width - 20, 20, `DAY: ${this.day}/${GAMEPLAY.maxDay}`, {
            fontSize: '24px',
            color: '#FFF6E8',
            backgroundColor: '#8B5E3C',
            padding: { x: 10, y: 5 },
            fontFamily: 'monospace',
            fontStyle: 'bold',
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(DEPTH.hud);

        this.incomingNotice = new IncomingNotice(this, width);
        this.eventFeed = new EventFeed(this, width, height);

        this.eventFeed.push('Start from $0', 'warning');
        this.eventFeed.push('Grab payday first', 'info');

        this.physics.add.overlap(this.player, this.obstacleGroup, this.hitWant, undefined, this);
        this.physics.add.overlap(this.player, this.itemGroup, this.hitNeed, undefined, this);
        this.physics.add.overlap(this.player, this.paydayGroup, this.hitPayday, undefined, this);

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

        EventBus.emit('current-scene-ready', this);
    }

    private spawnInitialPayday() {
        const floorY = this.scale.height - 32;

        const sprite = this.paydayGroup.create(
            220,
            floorY - LANES.groundOffsetY,
            'tex_payday',
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

        const labelData = compactEntityLabel('Payday', 'payday');

        sprite.label = new EntityLabel(
            this,
            sprite.x,
            sprite.y - 54,
            labelData.shortLabel,
            'payday',
        );

        sprite.kind = 'payday';
        sprite.labelOffsetY = 54;
        sprite.fullLabel = labelData.fullLabel;
        sprite.isInitialPayday = true;

        this.incomingNotice.show('First Payday', 'payday', `+$${GAMEPLAY.initialPaydayAmount}`);
        this.eventFeed.push('Incoming payday', 'good');
    }

    increaseDay() {
        if (this.isGameOver) return;

        this.day += 1;
        this.dayText.setText(`DAY: ${this.day}/${GAMEPLAY.maxDay}`);
        this.progressBar?.update(this.day, GAMEPLAY.maxDay);

        this.scorePoints += GAMEPLAY.pointsPerSurvivedDay;

        if (this.day === GAMEPLAY.bossStartDay && !this.isBossStage) {
            this.isBossStage = true;
            this.gameSpeedMultiplier = 1.28;
            this.cameras.main.flash(800, 255, 180, 90);
            this.background.pulseCrisis();
            this.createSpawnTimer(GAMEPLAY.crisisSpawnDelayMs);
            this.eventFeed.push('Crisis phase!', 'warning');
        }

        if (this.day === GAMEPLAY.finalBossDay) {
            this.gameSpeedMultiplier = 1.48;
            this.createSpawnTimer(GAMEPLAY.bossSpawnDelayMs);
            this.eventFeed.push('Final boss pressure!', 'bad');
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

        let rawWord = '';
        let tex = '';
        let velocityX: number = GAMEPLAY.baseObstacleSpeed;
        let kind: EntityKind = 'want';
        let lane: EntityLane = 'ground';

        if (this.isBossStage && Math.random() < 0.35) {
            isBoss = true;
            kind = 'boss';
            rawWord = 'Tax Audit';
            tex = 'tex_boss';
            velocityX = GAMEPLAY.bossObstacleSpeed;
            lane = Math.random() < GAMEPLAY.bossDuckLaneChance ? 'duck' : 'ground';
        } else {
            const rand = Math.random();

            if (rand < 0.62) {
                isWant = true;
                kind = 'want';
                rawWord = pickRandomLabel(this.aiConfig.wants, 'Debt');
                tex = 'tex_want';
                lane = Math.random() < GAMEPLAY.wantDuckLaneChance ? 'duck' : 'ground';
            } else {
                isNeed = true;
                kind = 'need';
                rawWord = pickRandomLabel(this.aiConfig.needs, 'Bill');
                tex = 'tex_need';
                lane = Math.random() < GAMEPLAY.needJumpLaneChance ? 'jump' : 'ground';
            }
        }

        if (!isBoss && this.day >= GAMEPLAY.bossStartDay) {
            velocityX = GAMEPLAY.crisisObstacleSpeed;
        }

        velocityX = Math.round(velocityX * this.gameSpeedMultiplier);

        let spawnY = floorY - LANES.groundOffsetY;

        if (lane === 'duck') {
            spawnY = floorY - (isBoss ? LANES.bossDuckOffsetY : LANES.duckOffsetY);
        }

        if (lane === 'jump') {
            spawnY = floorY - LANES.needJumpOffsetY;
        }

        const targetGroup =
            isWant || isBoss
                ? this.obstacleGroup
                : this.itemGroup;

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

        if (isBoss && lane === 'duck') {
            sprite.body.setSize(58, 58);
            sprite.body.setOffset(10, 10);
        } else if (isBoss) {
            sprite.body.setSize(56, 56);
            sprite.body.setOffset(11, 11);
        } else if (lane === 'duck') {
            sprite.body.setSize(36, 50);
            sprite.body.setOffset(6, -2);
        } else if (lane === 'jump') {
            sprite.body.setSize(34, 34);
            sprite.body.setOffset(7, 7);
        } else {
            sprite.body.setSize(34, 34);
            sprite.body.setOffset(7, 7);
        }

        sprite.isDuckLane = lane === 'duck';
        sprite.lane = lane;

        const labelData = compactEntityLabel(rawWord, kind);
        const labelOffsetY = isBoss ? 72 : lane === 'duck' ? 62 : 54;

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
            kind === 'want'
                ? `${GAMEPLAY.wantDamage < 0 ? '-' : '+'}$${Math.abs(GAMEPLAY.wantDamage)}`
                : kind === 'need'
                    ? `${GAMEPLAY.needCost < 0 ? '-' : '+'}$${Math.abs(GAMEPLAY.needCost)}`
                    : kind === 'boss'
                        ? `${GAMEPLAY.bossDamage < 0 ? '-' : '+'}$${Math.abs(GAMEPLAY.bossDamage)}`
                        : '';

        this.incomingNotice.show(labelData.fullLabel, kind, impactText);

        const isDev =
            typeof process !== 'undefined' &&
            process.env?.NODE_ENV !== 'production';

        if (isDev) {
            console.debug('[DashTo30] Spawn entity:', {
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
        const label = want.fullLabel || (isBoss ? 'Boss' : 'Want');

        this.destroyEntity(want);

        this.updateBalance(isBoss ? GAMEPLAY.bossDamage : GAMEPLAY.wantDamage);
        this.eventFeed.push(`Hit ${label}`, 'bad');

        this.cameras.main.shake(isBoss ? 250 : 150, 0.02);
    }

    hitNeed(_playerObject: unknown, needObject: unknown) {
        const need = needObject as GameEntitySprite;
        const label = need.fullLabel || 'Need';

        need.isNeed = false;
        this.destroyEntity(need);

        this.needsTaken += 1;
        this.scorePoints += GAMEPLAY.pointsPerNeedTaken;

        if (GAMEPLAY.needLifeReward > 0) {
            this.updateEssentialLife(GAMEPLAY.needLifeReward);
        }

        this.updateBalance(GAMEPLAY.needCost);
        this.eventFeed.push(`Need ${label}`, 'good');

        this.player.setTint(0xffffff);
        this.time.delayedCall(150, () => this.player.clearTint());
    }

    hitPayday(_playerObject: unknown, paydayObject: unknown) {
        const payday = paydayObject as GameEntitySprite;

        this.destroyEntity(payday);

        const amount = payday.isInitialPayday
            ? GAMEPLAY.initialPaydayAmount
            : 500;

        this.updateBalance(amount);

        if (payday.isInitialPayday) {
            this.hasCollectedInitialPayday = true;
            this.controlsLocked = false;
            this.eventFeed.push(`Payday +$${amount}`, 'good');
        } else {
            this.eventFeed.push(`Bonus +$${amount}`, 'good');
        }

        this.player.setTint(0x6FD08C);
        this.time.delayedCall(150, () => this.player.clearTint());
    }

    updateBalance(amount: number) {
        this.balance += amount;
        this.balanceText.setText(`BALANCE: $${this.balance}`);

        if (this.balance <= 0 && this.hasCollectedInitialPayday) {
            this.balanceText.setColor('#FF6B6B');
            this.triggerGameOver(false);
            return;
        }

        this.balanceText.setColor('#4A3A2A');
    }

    destroyEntity(entity: GameEntitySprite) {
        entity.label?.destroy();
        entity.destroy();
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

        EventBus.emit('game-over', {
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

        this.add
            .rectangle(cx, cy, this.scale.width, this.scale.height, 0x4A3A2A, 0.78)
            .setDepth(DEPTH.overlay);

        const panel = this.add
            .rectangle(cx, cy, 620, 360, 0xFFF6E8, 0.98)
            .setStrokeStyle(5, isWin ? 0x6FD08C : 0xFF6B6B, 1)
            .setDepth(DEPTH.overlay + 1);

        const title = isWin ? 'MONTH SURVIVED!' : 'BANKRUPT!';
        const titleColor = isWin ? '#6FD08C' : '#FF6B6B';

        const titleText = this.add.text(cx, cy - 130, title, {
            fontSize: '42px',
            color: titleColor,
            fontFamily: 'monospace',
            fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(DEPTH.overlay + 2);

        const highScoreText = highScore.isNewHighScore
            ? `NEW PERSONAL HIGH SCORE! ${finalScore}`
            : `SCORE: ${finalScore} | BEST: ${Math.max(highScore.previousBest, finalScore)}`;

        const scoreText = this.add.text(cx, cy - 84, highScoreText, {
            fontSize: '18px',
            color: '#4A3A2A',
            backgroundColor: '#FFF1C7',
            padding: { x: 12, y: 6 },
            fontFamily: 'monospace',
            fontStyle: 'bold',
            align: 'center',
        }).setOrigin(0.5).setDepth(DEPTH.overlay + 2);

        this.add.text(cx, cy - 48, 'Login players can submit this score to Global Leaderboard.', {
            fontSize: '13px',
            color: '#8B5E3C',
            fontFamily: 'monospace',
            align: 'center',
        }).setOrigin(0.5).setDepth(DEPTH.overlay + 2);

        const roastOrCongrats = isWin
            ? `You balanced wants and needs. Wallet: $${this.balance}`
            : `AI ROAST: "${this.aiConfig.roast}"`;

        this.add.text(cx, cy - 8, roastOrCongrats, {
            fontSize: '15px',
            color: '#4A3A2A',
            fontFamily: 'monospace',
            align: 'center',
            wordWrap: { width: 520, useAdvancedWrap: true },
        }).setOrigin(0.5).setDepth(DEPTH.overlay + 2);

        this.add.text(cx, cy + 48, `NEEDS: ${this.needsTaken} | LIFE: ${this.essentialLife}/${GAMEPLAY.maxEssentialLife} | AVOIDED: ${this.wantsAvoided} | BOSS: ${this.bossAvoided}`, {
            fontSize: '15px',
            color: '#4A3A2A',
            fontFamily: 'monospace',
            align: 'center',
        }).setOrigin(0.5).setDepth(DEPTH.overlay + 2);

        const retryBtn = this.createMenuButton(cx - 120, cy + 112, 'TRY AGAIN', '#4A3A2A', '#FFC857', () => {
            this.scene.stop('MainScene');
            this.scene.start('MainScene');
        });

        const homeBtn = this.createMenuButton(cx + 120, cy + 112, 'HOME', '#FFF6E8', '#8B5E3C', () => {
            EventBus.emit('go-home');
            this.scene.stop('MainScene');

            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        });

        const endContainer = this.add
            .container(0, 0, [panel, titleText, scoreText, retryBtn, homeBtn])
            .setDepth(DEPTH.overlay + 1)
            .setAlpha(0)
            .setScale(0.94);

        this.tweens.add({
            targets: endContainer,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: 220,
            ease: 'Back.easeOut',
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
                Boolean(this.cursors.space && Phaser.Input.Keyboard.JustDown(this.cursors.space)) ||
                Boolean(this.cursors.up && Phaser.Input.Keyboard.JustDown(this.cursors.up));

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
                    this.player.anims.play('player-run', true);
                    this.emitter.start();
                }
            }
        }

        const cleanup = (group: Phaser.Physics.Arcade.Group) => {
            group.getChildren().forEach((child) => {
                const entity = child as GameEntitySprite;

                if (entity.x < -120) {
                    const label = entity.fullLabel || entity.kind || 'item';

                    if (entity.isNeed) {
                        this.updateBalance(GAMEPLAY.missedNeedPenalty);
                        this.updateEssentialLife(-GAMEPLAY.missedNeedLifePenalty);
                        this.scorePoints += GAMEPLAY.pointsPerMissedNeedPenalty;
                        this.eventFeed.push(`Missed ${label}`, 'bad');
                        this.cameras.main.shake(100, 0.01);
                    } else if (entity.kind === 'want') {
                        this.wantsAvoided += 1;
                        this.scorePoints += GAMEPLAY.pointsPerWantAvoided;
                        this.eventFeed.push(`Avoided ${label}`, 'good');
                    } else if (entity.isBoss) {
                        this.bossAvoided += 1;
                        this.scorePoints += GAMEPLAY.pointsPerBossAvoided;
                        this.eventFeed.push('Dodged boss', 'good');
                    }

                    this.destroyEntity(entity);
                    return;
                }

                entity.label?.update(
                    entity.x,
                    entity.y - (entity.labelOffsetY ?? 40),
                );
            });
        };

        cleanup(this.obstacleGroup);
        cleanup(this.itemGroup);
        cleanup(this.paydayGroup);
    }
}
