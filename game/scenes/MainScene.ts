import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class MainScene extends Scene {
    player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    isSliding: boolean = false;
    floorLayer!: Phaser.GameObjects.TileSprite;
    midLayer!: Phaser.GameObjects.TileSprite;
    farLayer!: Phaser.GameObjects.TileSprite;
    emitter!: Phaser.GameObjects.Particles.ParticleEmitter;

    balance: number = 2000;
    day: number = 1;
    aiConfig: any = null;
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

        try {
            const stored = localStorage.getItem('dashTo30_aiConfig');
            if (stored) {
                this.aiConfig = JSON.parse(stored);
            }
        } catch (e) {
            console.error("Failed to parse aiConfig", e);
        }

        if (!this.aiConfig || !this.aiConfig.wants || !this.aiConfig.needs) {
            this.aiConfig = {
                wants: ["Coffee", "Gacha", "Paylater"],
                needs: ["Rent", "Groceries"],
                roast: "Broke!"
            };
        }
    }

    preload() {
        const graphics = this.make.graphics({ x: 0, y: 0 });

        graphics.fillStyle(0x8B5E3C, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('floor', 32, 32);

        graphics.clear();
        graphics.fillStyle(0x6FD08C, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('player', 32, 32);

        graphics.clear();
        graphics.fillStyle(0x8B5E3C, 1);
        graphics.fillRect(0, 0, 6, 6);
        graphics.generateTexture('particle', 6, 6);

        graphics.clear();
        graphics.fillStyle(0xFF6B6B, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('tex_want', 32, 32);

        graphics.clear();
        graphics.fillStyle(0xFFC857, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('tex_need', 32, 32);

        graphics.clear();
        graphics.fillStyle(0x6FD08C, 1);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('tex_payday', 32, 32);

        // Tekstur Boss Stage
        graphics.clear();
        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(0, 0, 64, 64);
        graphics.generateTexture('tex_boss', 64, 64);
    }

    create() {
        this.cameras.main.setBackgroundColor('#FFF6E8');

        const width = this.scale.width;
        const height = this.scale.height;
        const floorY = height - 32;

        this.farLayer = this.add.tileSprite(width / 2, height / 2 - 20, width, height, 'floor').setTint(0xF0E5D1);
        this.midLayer = this.add.tileSprite(width / 2, height / 2 + 30, width, height, 'floor').setTint(0xE5D3B8);
        this.floorLayer = this.add.tileSprite(width / 2, floorY + 16, width, 32, 'floor');

        this.player = this.physics.add.sprite(100, floorY - 16, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setGravityY(1500);
        this.physics.world.setBounds(0, 0, width, floorY);

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

        this.obstacleGroup = this.physics.add.group({ allowGravity: false });
        this.itemGroup = this.physics.add.group({ allowGravity: false });
        this.paydayGroup = this.physics.add.group({ allowGravity: false });

        this.balanceText = this.add.text(20, 20, `BALANCE: $${this.balance}`, {
            fontSize: '24px',
            color: '#4A3A2A',
            backgroundColor: '#FFF1C7',
            padding: { x: 10, y: 5 },
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setScrollFactor(0);

        this.dayText = this.add.text(width - 20, 20, `DAY: ${this.day}/30`, {
            fontSize: '24px',
            color: '#FFF6E8',
            backgroundColor: '#8B5E3C',
            padding: { x: 10, y: 5 },
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(1, 0).setScrollFactor(0);

        this.physics.add.overlap(this.player, this.obstacleGroup, this.hitWant, undefined, this);
        this.physics.add.overlap(this.player, this.itemGroup, this.hitNeed, undefined, this);
        this.physics.add.overlap(this.player, this.paydayGroup, this.hitPayday, undefined, this);

        this.spawnTimer = this.time.addEvent({
            delay: 1800,
            callback: this.spawnEntity,
            callbackScope: this,
            loop: true
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
            this.cameras.main.setBackgroundColor('#FFD6D6'); // Latar berubah merah muda krisis
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

        let isWant = false, isNeed = false, isPayday = false, isBoss = false;
        let word = "";
        let tex = "";
        let velocityX = -250;

        // Logika Spawning
        if (this.isBossStage) {
            // Hanya mengeluarkan Boss
            isBoss = true;
            word = "TAX AUDIT!";
            tex = 'tex_boss';
            velocityX = -350; // Lebih cepat
        } else {
            const rand = Math.random();
            if (rand < 0.5) {
                isWant = true;
                word = this.aiConfig.wants[Math.floor(Math.random() * this.aiConfig.wants.length)] || "Debt";
                tex = 'tex_want';
            } else if (rand < 0.8) {
                isNeed = true;
                word = this.aiConfig.needs[Math.floor(Math.random() * this.aiConfig.needs.length)] || "Bill";
                tex = 'tex_need';
            } else {
                isPayday = true;
                word = "PAYDAY!";
                tex = 'tex_payday';
            }
        }

        let spawnY = floorY - 16;

        // Boss atau Want bisa melayang tinggi
        if ((isWant || isBoss) && Math.random() > 0.5) {
            spawnY = isBoss ? floorY - 80 : floorY - 65;
        }

        // Pastikan Boss ada di tanah (offset karena ukurannya lebih besar 64x64)
        if (isBoss && spawnY === floorY - 16) {
            spawnY = floorY - 32;
        }

        const sprite = this.physics.add.sprite(width + 50, spawnY, tex) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

        if (isWant || isBoss) this.obstacleGroup.add(sprite);
        else if (isNeed) this.itemGroup.add(sprite);
        else this.paydayGroup.add(sprite);

        sprite.setVelocityX(velocityX);

        const textObj = this.add.text(sprite.x, sprite.y - (isBoss ? 45 : 35), word, {
            fontSize: '16px',
            color: isBoss ? '#FFFFFF' : '#4A3A2A',
            fontFamily: 'monospace',
            fontStyle: 'bold',
            backgroundColor: isBoss ? '#FF6B6B' : '#FFF1C7',
            padding: { left: 8, right: 8, top: 4, bottom: 4 }
        }).setOrigin(0.5);

        (sprite as any).label = textObj;
        (sprite as any).isNeed = isNeed;
        (sprite as any).isBoss = isBoss;
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

    destroyEntity(entity: any) {
        if (entity.label) entity.label.destroy();
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

        this.farLayer.tilePositionX += (this.isBossStage ? 1.0 : 0.5);
        this.midLayer.tilePositionX += (this.isBossStage ? 3.0 : 1.5);
        this.floorLayer.tilePositionX += (this.isBossStage ? 5 : 3);

        if (!this.cursors) return;

        const isGrounded = this.player.body?.blocked.down;

        if ((this.cursors.space.isDown || this.cursors.up.isDown) && isGrounded && !this.isSliding) {
            this.player.setVelocityY(-700);
            this.player.setScale(0.8, 1.2);
            this.emitter.stop();
        }
        else if (isGrounded && !this.isSliding) {
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
            this.player.body?.setSize(32, 32);
            this.player.body?.setOffset(0, 0);
            this.player.setGravityY(1500);
            if (isGrounded) {
                this.player.y -= 16;
            }
        }

        const cleanup = (group: Phaser.Physics.Arcade.Group) => {
            group.getChildren().forEach((child: any) => {
                if (child.x < -100) {
                    if (child.isNeed) {
                        this.updateBalance(-200);
                        this.cameras.main.shake(100, 0.01);
                    }
                    this.destroyEntity(child);
                } else if (child.label) {
                    child.label.x = child.x;
                    child.label.y = child.y - (child.isBoss ? 45 : 35);
                }
            });
        };

        cleanup(this.obstacleGroup);
        cleanup(this.itemGroup);
        cleanup(this.paydayGroup);
    }
}
