import Phaser from 'phaser';

import { EventBus } from '../EventBus';
import { FinancialParallaxBackground } from '../background/FinancialParallaxBackground';
import { GAMEPLAY, LANES } from '../config/gameplay';
import { DEPTH } from '../constants/layers';
import { createCoreGameTextures } from '../textures/GameTextures';
import { EntityLabel } from '../ui/EntityLabel';
import { EventFeed } from '../ui/EventFeed';
import { IncomingNotice } from '../ui/IncomingNotice';
import {
    compactEntityLabel,
    normalizeAiConfig,
    pickRandomLabel,
    type EntityKind,
    type GameAiConfig,
} from '../utils/gameText';

type GameEntitySprite = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody & {
    label?: EntityLabel;
    isNeed?: boolean;
    isBoss?: boolean;
    isInitialPayday?: boolean;
    isDuckLane?: boolean;
    kind?: EntityKind;
    labelOffsetY?: number;
    fullLabel?: string;
};

export class MainScene extends Phaser.Scene {
    player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    emitter!: Phaser.GameObjects.Particles.ParticleEmitter;
    background!: FinancialParallaxBackground;
    incomingNotice!: IncomingNotice;
    eventFeed!: EventFeed;

    obstacleGroup!: Phaser.Physics.Arcade.Group;
    itemGroup!: Phaser.Physics.Arcade.Group;
    paydayGroup!: Phaser.Physics.Arcade.Group;

    balanceText!: Phaser.GameObjects.Text;
    dayText!: Phaser.GameObjects.Text;

    spawnTimer!: Phaser.Time.TimerEvent;
    dayTimer!: Phaser.Time.TimerEvent;

    balance: number = GAMEPLAY.startingBalance;
    day: number = 1;
    aiConfig: GameAiConfig = normalizeAiConfig(null);

    isSliding: boolean = false;
    isBossStage: boolean = false;
    isGameOver: boolean = false;

    lastGroundedAt: number = 0;
    lastJumpPressedAt: number = 0;
    slideStartedAt: number = 0;

    scorePoints: number = 0;
    needsTaken: number = 0;
    wantsAvoided: number = 0;
    bossAvoided: number = 0;

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

        this.balance = GAMEPLAY.startingBalance;
        this.day = 1;

        this.scorePoints = 0;
        this.needsTaken = 0;
        this.wantsAvoided = 0;
        this.bossAvoided = 0;

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

        // Hitbox slide dibuat lebih rendah dan pendek agar duck lane bisa dilewati konsisten.
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
            ]);

            this.cursors = this.input.keyboard.createCursorKeys();
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

        this.incomingNotice.show('First Payday', 'payday');
        this.eventFeed.push('Incoming payday', 'good');
    }

    increaseDay() {
        if (this.isGameOver) return;

        this.day += 1;
        this.dayText.setText(`DAY: ${this.day}/${GAMEPLAY.maxDay}`);

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
            this.cameras.main.flash(1000, 255, 100, 100);
            this.background.pulseCrisis();
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

        if (this.isBossStage && Math.random() < 0.35) {
            isBoss = true;
            kind = 'boss';
            rawWord = 'Tax Audit';
            tex = 'tex_boss';
            velocityX = GAMEPLAY.bossObstacleSpeed;
        } else {
            const rand = Math.random();

            if (rand < 0.62) {
                isWant = true;
                kind = 'want';
                rawWord = pickRandomLabel(this.aiConfig.wants, 'Debt');
                tex = 'tex_want';
            } else {
                isNeed = true;
                kind = 'need';
                rawWord = pickRandomLabel(this.aiConfig.needs, 'Bill');
                tex = 'tex_need';
            }
        }

        if (!isBoss && this.day >= GAMEPLAY.bossStartDay) {
            velocityX = GAMEPLAY.crisisObstacleSpeed;
        }

        velocityX = Math.round(velocityX * this.gameSpeedMultiplier);

        let spawnY = floorY - LANES.groundOffsetY;

        const shouldUseDuckLane = isWant && Math.random() < 0.42;

        if (shouldUseDuckLane) {
            spawnY = floorY - LANES.duckOffsetY;
        }

        if (isBoss) {
            spawnY = floorY - LANES.bossOffsetY;
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

        if (isBoss) {
            // Boss-lane obstacle: harus kena player normal, tetapi bisa dilewati saat slide.
            sprite.body.setSize(58, 58);
            sprite.body.setOffset(10, 10);
        } else if (shouldUseDuckLane) {
            // Duck-lane obstacle: visual tetap 48x48, tetapi hitbox dibuat tinggi.
            // Player normal akan kena, player slide dengan hitbox rendah dapat lewat.
            sprite.body.setSize(36, 50);
            sprite.body.setOffset(6, -2);
        } else {
            sprite.body.setSize(34, 34);
            sprite.body.setOffset(7, 7);
        }

        sprite.isDuckLane = shouldUseDuckLane;

        const labelData = compactEntityLabel(rawWord, kind);
        const labelOffsetY = isBoss ? 72 : shouldUseDuckLane ? 62 : 54;

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

        this.incomingNotice.show(labelData.fullLabel, kind);

        const isDev =
            typeof process !== 'undefined' &&
            process.env?.NODE_ENV !== 'production';

        if (isDev) {
            console.debug('[DashTo30] Spawn entity:', {
                kind,
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

        EventBus.emit('game-over', {
            score: finalScore,
            balance: this.balance,
            survivalDays: this.day,
            isWin,
            needsTaken: this.needsTaken,
            wantsAvoided: this.wantsAvoided,
            bossAvoided: this.bossAvoided,
        });

        const cx = this.scale.width / 2;
        const cy = this.scale.height / 2;

        this.add
            .rectangle(cx, cy, this.scale.width, this.scale.height, 0x4A3A2A, 0.9)
            .setDepth(DEPTH.overlay);

        const title = isWin ? 'SURVIVED THE MONTH!' : 'BANKRUPT!';
        const color = isWin ? '#6FD08C' : '#FF6B6B';

        this.add.text(cx, cy - 90, title, {
            fontSize: '44px',
            color,
            fontFamily: 'monospace',
            fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(DEPTH.overlay + 1);

        if (!isWin) {
            this.add.text(cx, cy - 28, `AI ROAST: "${this.aiConfig.roast}"`, {
                fontSize: '16px',
                color: '#FFF1C7',
                fontFamily: 'monospace',
                align: 'center',
                wordWrap: { width: 600, useAdvancedWrap: true },
            }).setOrigin(0.5).setDepth(DEPTH.overlay + 1);
        } else {
            this.add.text(cx, cy - 28, `FINAL SCORE: ${finalScore} | SAVINGS: $${this.balance}`, {
                fontSize: '22px',
                color: '#FFF1C7',
                fontFamily: 'monospace',
                align: 'center',
                wordWrap: { width: 640, useAdvancedWrap: true },
            }).setOrigin(0.5).setDepth(DEPTH.overlay + 1);
        }

        this.add.text(cx, cy + 20, `NEEDS: ${this.needsTaken} | AVOIDED: ${this.wantsAvoided} | BOSS: ${this.bossAvoided}`, {
            fontSize: '16px',
            color: '#FFF1C7',
            fontFamily: 'monospace',
            align: 'center',
        }).setOrigin(0.5).setDepth(DEPTH.overlay + 1);

        const retryBtn = this.add.text(cx, cy + 88, '> TRY AGAIN <', {
            fontSize: '24px',
            color: '#FFF6E8',
            backgroundColor: '#8B5E3C',
            padding: { x: 15, y: 10 },
            fontFamily: 'monospace',
            fontStyle: 'bold',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(DEPTH.overlay + 1);

        retryBtn.on('pointerdown', () => {
            this.scene.stop('MainScene');
            this.scene.start('MainScene');
        });
    }

    update() {
        if (this.isGameOver) return;

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

            // Slide diprioritaskan selama tombol bawah ditahan.
            // State ini tidak boleh ditimpa run/jump sebelum tombol dilepas.
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

                    if (!this.emitter.on) {
                        this.emitter.start();
                    }
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
