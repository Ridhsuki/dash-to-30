import { Scene } from 'phaser';

import { EventBus } from '../EventBus';
import { FinancialParallaxBackground } from '../background/FinancialParallaxBackground';
import { DEPTH } from '../constants/layers';
import { createCoreGameTextures } from '../textures/GameTextures';
import { EntityLabel } from '../ui/EntityLabel';
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
    kind?: EntityKind;
    labelOffsetY?: number;
    fullLabel?: string;
};

export class MainScene extends Scene {
    player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    isSliding: boolean = false;
    emitter!: Phaser.GameObjects.Particles.ParticleEmitter;
    background!: FinancialParallaxBackground;

    balance: number = 2000;
    day: number = 1;
    aiConfig: GameAiConfig = normalizeAiConfig(null);
    incomingNotice!: IncomingNotice;
    isBossStage: boolean = false;

    obstacleGroup!: Phaser.Physics.Arcade.Group;
    itemGroup!: Phaser.Physics.Arcade.Group;
    paydayGroup!: Phaser.Physics.Arcade.Group;

    balanceText!: Phaser.GameObjects.Text;
    dayText!: Phaser.GameObjects.Text;
    spawnTimer!: Phaser.Time.TimerEvent;
    dayTimer!: Phaser.Time.TimerEvent;
    isGameOver: boolean = false;

    constructor() {
        super('MainScene');
    }

    init() {
        this.isGameOver = false;
        this.isBossStage = false;
        this.balance = 2000;
        this.day = 1;
        this.isSliding = false;

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

    create() {
        this.cameras.main.setBackgroundColor('#DFF4FF');
        this.cameras.main.roundPixels = true;

        const width = this.scale.width;
        const height = this.scale.height;
        const floorY = height - 32;

        this.background = new FinancialParallaxBackground(this);
        this.background.create(width, height, floorY);

        this.player = this.physics.add.sprite(100, floorY - 21, 'player');
        this.player
            .setDepth(DEPTH.gameplay + 2)
            .setCollideWorldBounds(true)
            .setGravityY(1500);

        this.player.body.setSize(24, 34);
        this.player.body.setOffset(6, 6);
        this.physics.world.setBounds(0, 0, width + 220, floorY);

        this.emitter = this.add.particles(0, 0, 'particle', {
            speed: { min: -100, max: -50 },
            angle: { min: 0, max: -90 },
            scale: { start: 1, end: 0 },
            lifespan: 400,
            gravityY: 200,
            frequency: 100
        });
        this.emitter.startFollow(this.player, -14, 16);

        if (this.input.keyboard) {
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
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(30);

        this.dayText = this.add.text(width - 20, 20, `DAY: ${this.day}/30`, {
            fontSize: '24px',
            color: '#FFF6E8',
            backgroundColor: '#8B5E3C',
            padding: { x: 10, y: 5 },
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(30);

        this.incomingNotice = new IncomingNotice(this, width);
        this.physics.add.overlap(this.player, this.obstacleGroup, this.hitWant, undefined, this);
        this.physics.add.overlap(this.player, this.itemGroup, this.hitNeed, undefined, this);
        this.physics.add.overlap(this.player, this.paydayGroup, this.hitPayday, undefined, this);

        this.spawnTimer = this.time.addEvent({
            delay: 1650,
            callback: this.spawnEntity,
            callbackScope: this,
            loop: true,
        });

        this.time.delayedCall(500, () => {
            if (!this.isGameOver) {
                this.spawnEntity();
            }
        });

        this.dayTimer = this.time.addEvent({
            delay: 1500,
            callback: this.increaseDay,
            callbackScope: this,
            loop: true
        });

        EventBus.emit('current-scene-ready', this);
    }

    increaseDay() {
        if (this.isGameOver) return;
        this.day += 1;
        this.dayText.setText(`DAY: ${this.day}/30`);

        // Memicu Boss Stage di Hari 28
        if (this.day === 28 && !this.isBossStage) {
            this.isBossStage = true;
            this.cameras.main.flash(1000, 255, 100, 100);
            this.background.pulseCrisis();
            this.spawnTimer.timeScale = 1.5; // Spawn lebih cepat
        }

        if (this.day >= 30) {
            this.triggerGameOver(true);
        }
    }

    spawnEntity() {
        if (this.isGameOver) return;

        const width = this.scale.width;
        const floorY = this.scale.height - 32;

        let isWant = false;
        let isNeed = false;
        let isPayday = false;
        let isBoss = false;

        let rawWord = '';
        let tex = '';
        let velocityX = -250;
        let kind: EntityKind = 'want';

        if (this.isBossStage) {
            isBoss = true;
            kind = 'boss';
            rawWord = 'Tax Audit';
            tex = 'tex_boss';
            velocityX = -350;
        } else {
            const rand = Math.random();

            if (rand < 0.5) {
                isWant = true;
                kind = 'want';
                rawWord = pickRandomLabel(this.aiConfig.wants, 'Debt');
                tex = 'tex_want';
            } else if (rand < 0.8) {
                isNeed = true;
                kind = 'need';
                rawWord = pickRandomLabel(this.aiConfig.needs, 'Bill');
                tex = 'tex_need';
            } else {
                isPayday = true;
                kind = 'payday';
                rawWord = 'Payday';
                tex = 'tex_payday';
            }
        }

        let spawnY = floorY - 16;

        if ((isWant || isBoss) && Math.random() > 0.5) {
            spawnY = isBoss ? floorY - 80 : floorY - 65;
        }

        if (isBoss && spawnY === floorY - 16) {
            spawnY = floorY - 32;
        }

        const targetGroup =
            isWant || isBoss
                ? this.obstacleGroup
                : isNeed
                    ? this.itemGroup
                    : this.paydayGroup;

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
        sprite.body.setSize(isBoss ? 52 : 30, isBoss ? 52 : 30);
        sprite.body.setOffset(isBoss ? 10 : 6, isBoss ? 6 : 6);

        const labelData = compactEntityLabel(rawWord, kind);
        const labelOffsetY = isBoss ? 62 : 46;

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

    hitWant(player: any, want: any) {
        const isBoss = want.isBoss;
        this.destroyEntity(want);

        // Boss hit mengurangi jauh lebih besar
        this.updateBalance(isBoss ? -800 : -300);
        this.cameras.main.shake(isBoss ? 250 : 150, 0.02);
    }

    hitNeed(player: any, need: any) {
        need.isNeed = false;
        this.destroyEntity(need);
        this.updateBalance(-50);
        this.player.setTint(0xffffff);
        this.time.delayedCall(150, () => this.player.clearTint());
    }

    hitPayday(player: any, payday: any) {
        this.destroyEntity(payday);
        this.updateBalance(500);
        this.player.setTint(0x6FD08C);
        this.time.delayedCall(150, () => this.player.clearTint());
    }

    updateBalance(amount: number) {
        this.balance += amount;
        this.balanceText.setText(`BALANCE: $${this.balance}`);

        if (this.balance <= 0) {
            this.balanceText.setColor('#FF6B6B');
            this.triggerGameOver(false);
        } else {
            this.balanceText.setColor('#4A3A2A');
        }
    }

    destroyEntity(entity: GameEntitySprite) {
        entity.label?.destroy();
        entity.destroy();
    }

    triggerGameOver(isWin: boolean) {
        this.isGameOver = true;
        this.physics.pause();
        this.spawnTimer.remove();
        this.dayTimer.remove();
        this.emitter.stop();

        // MENGIRIM SKOR KE REACT & FIRESTORE
        EventBus.emit('game-over', { score: this.balance, survivalDays: this.day, isWin });

        const cx = this.scale.width / 2;
        const cy = this.scale.height / 2;

        this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x4A3A2A, 0.9);

        const title = isWin ? 'SURVIVED THE MONTH!' : 'BANKRUPT!';
        const color = isWin ? '#6FD08C' : '#FF6B6B';

        this.add.text(cx, cy - 80, title, {
            fontSize: '48px',
            color: color,
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        if (!isWin) {
            this.add.text(cx, cy - 20, `AI ROAST: "${this.aiConfig.roast}"`, {
                fontSize: '16px',
                color: '#FFF1C7',
                fontFamily: 'monospace',
                align: 'center',
                wordWrap: { width: 600, useAdvancedWrap: true }
            }).setOrigin(0.5);
        } else {
            this.add.text(cx, cy - 20, `FINAL SAVINGS: $${this.balance}`, {
                fontSize: '24px',
                color: '#FFF1C7',
                fontFamily: 'monospace'
            }).setOrigin(0.5);
        }

        // Tombol Try Again
        const retryBtn = this.add.text(cx, cy + 80, '> TRY AGAIN <', {
            fontSize: '24px',
            color: '#FFF6E8',
            backgroundColor: '#8B5E3C',
            padding: { x: 15, y: 10 },
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        retryBtn.on('pointerdown', () => {
            this.scene.restart();
        });
    }

    update() {
        if (this.isGameOver) return;

        this.background.update(this.day, this.isBossStage);

        if (this.cursors) {
            const isGrounded = this.player.body?.blocked.down;

            if ((this.cursors.space.isDown || this.cursors.up.isDown) && isGrounded && !this.isSliding) {
                this.player.setVelocityY(-700);
                this.player.setScale(0.8, 1.2);
                this.emitter.stop();
            } else if (isGrounded && !this.isSliding) {
                this.player.setScale(1, 1);
                if (!this.emitter.on) this.emitter.start();
            }

            if (this.cursors.down.isDown) {
                if (!this.isSliding) {
                    this.isSliding = true;
                    this.player.setScale(1, 0.5);
                    this.player.body?.setSize(32, 16);
                    this.player.body?.setOffset(0, 16);
                    this.player.setGravityY(3500);
                }
            } else if (this.isSliding) {
                this.isSliding = false;
                this.player.setScale(1, 1);
                this.player.body?.setSize(24, 34);
                this.player.body?.setOffset(6, 6);
                this.player.setGravityY(1500);

                if (isGrounded) {
                    this.player.y -= 16;
                }
            }
        }

        const cleanup = (group: Phaser.Physics.Arcade.Group) => {
            group.getChildren().forEach((child) => {
                const entity = child as GameEntitySprite;

                if (entity.x < -120) {
                    if (entity.isNeed) {
                        this.updateBalance(-200);
                        this.cameras.main.shake(100, 0.01);
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
