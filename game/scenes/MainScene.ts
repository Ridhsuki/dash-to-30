import * as Phaser from 'phaser';
import { EventBus } from '../EventBus';

export class MainScene extends Phaser.Scene {
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  isSliding: boolean = false;
  floorLayer!: Phaser.GameObjects.TileSprite;
  midLayer!: Phaser.GameObjects.TileSprite;
  farLayer!: Phaser.GameObjects.TileSprite;
  emitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  // Phase 4.1 Variables
  balance: number = 1000;
  aiConfig: any = null;
  obstacleGroup!: Phaser.Physics.Arcade.Group;
  itemGroup!: Phaser.Physics.Arcade.Group;
  balanceText!: Phaser.GameObjects.Text;
  spawnTimer!: Phaser.Time.TimerEvent;
  isGameOver: boolean = false;

  constructor() {
    super('MainScene');
  }

  init() {
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
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 4, 4);
    graphics.generateTexture('particle', 4, 4);

    graphics.clear();
    graphics.fillStyle(0xFF6B6B, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('tex_want', 32, 32);

    graphics.clear();
    graphics.fillStyle(0xFFC857, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('tex_need', 32, 32);
  }

  create() {
    this.cameras.main.setBackgroundColor('#2d2d2d');

    const width = this.scale.width;
    const height = this.scale.height;
    const floorY = height - 32;

    this.farLayer = this.add.tileSprite(width / 2, height / 2 - 20, width, height, 'floor').setTint(0x1a1a1a).setAlpha(0.5);
    this.midLayer = this.add.tileSprite(width / 2, height / 2 + 30, width, height, 'floor').setTint(0x3a3a3a).setAlpha(0.7);
    this.floorLayer = this.add.tileSprite(width / 2, floorY + 16, width, 32, 'floor');

    this.player = this.physics.add.sprite(100, floorY - 16, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(1500);
    this.physics.world.setBounds(0, 0, width, floorY);

    this.emitter = this.add.particles(0, 0, 'particle', {
        speed: { min: -100, max: -50 },
        angle: { min: 0, max: -90 },
        scale: { start: 1, end: 0 },
        lifespan: 300,
        gravityY: 200,
        frequency: 100
    });
    this.emitter.startFollow(this.player, -14, 16);

    if (this.input.keyboard) {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    this.obstacleGroup = this.physics.add.group({ allowGravity: false });
    this.itemGroup = this.physics.add.group({ allowGravity: false });

    this.balanceText = this.add.text(20, 20, `BALANCE: $${this.balance}`, {
        fontSize: '24px',
        color: '#FFC857',
        fontFamily: 'monospace',
        fontStyle: 'bold'
    }).setScrollFactor(0);

    this.physics.add.overlap(this.player, this.obstacleGroup, this.hitWant, undefined, this);
    this.physics.add.overlap(this.player, this.itemGroup, this.hitNeed, undefined, this);

    this.spawnTimer = this.time.addEvent({
        delay: 1500,
        callback: this.spawnEntity,
        callbackScope: this,
        loop: true
    });

    EventBus.emit('current-scene-ready', this);
  }

  spawnEntity() {
      if (this.isGameOver) return;

      const width = this.scale.width;
      const floorY = this.scale.height - 32;
      
      const isWant = Math.random() > 0.4;
      let wordList = isWant ? this.aiConfig.wants : this.aiConfig.needs;
      
      if (!wordList || wordList.length === 0) {
          wordList = isWant ? ["Debt"] : ["Savings"];
      }

      const word = wordList[Math.floor(Math.random() * wordList.length)];
      const tex = isWant ? 'tex_want' : 'tex_need';
      
      let spawnY = floorY - 16; 
      if (isWant && Math.random() > 0.5) {
          spawnY = floorY - 60;
      }

      const sprite = this.physics.add.sprite(width + 50, spawnY, tex) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      if (isWant) {
          this.obstacleGroup.add(sprite);
      } else {
          this.itemGroup.add(sprite);
      }

      sprite.setVelocityX(-350);
      
      const textObj = this.add.text(sprite.x, sprite.y - 25, word, {
          fontSize: '12px',
          color: '#ffffff',
          fontFamily: 'monospace',
          backgroundColor: '#00000088'
      }).setOrigin(0.5);

      (sprite as any).label = textObj;
  }

  hitWant(player: any, want: any) {
      want.destroy();
      if (want.label) want.label.destroy();

      this.balance -= 300;
      this.updateBalanceText();
      this.cameras.main.shake(150, 0.015);
      
      if (this.balance <= 0) {
          this.triggerGameOver();
      }
  }

  hitNeed(player: any, need: any) {
      need.destroy();
      if (need.label) need.label.destroy();

      this.balance += 100;
      this.updateBalanceText();
      this.player.setTint(0x6FD08C);
      this.time.delayedCall(200, () => this.player.clearTint());
  }

  updateBalanceText() {
      this.balanceText.setText(`BALANCE: $${this.balance}`);
      if (this.balance <= 0) {
          this.balanceText.setColor('#FF6B6B');
      }
  }

  triggerGameOver() {
      this.isGameOver = true;
      this.physics.pause();
      this.spawnTimer.remove();
      this.emitter.stop();

      const cx = this.scale.width / 2;
      const cy = this.scale.height / 2;

      this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.7);
      
      this.add.text(cx, cy - 30, 'BANKRUPT!', {
          fontSize: '48px',
          color: '#FF6B6B',
          fontFamily: 'monospace',
          fontStyle: 'bold'
      }).setOrigin(0.5);

      this.add.text(cx, cy + 30, `ROAST: ${this.aiConfig.roast}`, {
          fontSize: '14px',
          color: '#ffffff',
          fontFamily: 'monospace',
          wordWrap: { width: 600, useAdvancedWrap: true }
      }).setOrigin(0.5);
  }

  update() {
    if (this.isGameOver) return;

    this.farLayer.tilePositionX += 0.5;
    this.midLayer.tilePositionX += 1.5;
    this.floorLayer.tilePositionX += 4;

    if (!this.cursors) return;

    const isGrounded = this.player.body?.touching.down;

    if (this.cursors.space && this.cursors.up) {
      if ((this.cursors.space.isDown || this.cursors.up.isDown) && isGrounded && !this.isSliding) {
          this.player.setVelocityY(-700);
          this.player.setScale(0.8, 1.2);
          this.emitter.stop(); 
      } 
      else if (isGrounded && !this.isSliding) {
          this.player.setScale(1, 1);
          if (!this.emitter.on) this.emitter.start();
      }
    }

    if (this.cursors.down) {
      if (this.cursors.down.isDown) {
          if (!this.isSliding) {
              this.isSliding = true;
              this.player.setScale(1, 0.5);
              this.player.body?.setSize(32, 16);
              this.player.body?.setOffset(0, 16);
              this.player.setGravityY(2500); 
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
    }

    const cleanup = (group: Phaser.Physics.Arcade.Group) => {
        group.getChildren().forEach((child: any) => {
            if (child.x < -50) {
                if (child.label) child.label.destroy();
                child.destroy();
            } else if (child.label) {
                child.label.x = child.x;
                child.label.y = child.y - 25;
            }
        });
    };

    cleanup(this.obstacleGroup);
    cleanup(this.itemGroup);
  }
}
