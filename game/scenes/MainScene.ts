import Phaser, { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class MainScene extends Scene {
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  spaceKey!: Phaser.Input.Keyboard.Key;
  
  bgFar!: Phaser.GameObjects.TileSprite;
  bgMid!: Phaser.GameObjects.TileSprite;
  floor!: Phaser.GameObjects.TileSprite;

  emitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  gameSpeed = 6;
  isSliding = false;

  constructor() {
    super('MainScene');
  }

  preload() {
    const graphics = this.add.graphics();
    
    // 1. Procedural textures
    // Floor texture
    graphics.fillStyle(0x8B5E3C, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('floor', 32, 32);
    graphics.clear();
    
    // Player texture
    graphics.fillStyle(0x6FD08C, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.clear();

    // Particle texture
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 4, 4);
    graphics.generateTexture('particle', 4, 4);
    graphics.clear();
    
    // bg-far (dark silhouette layer)
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, 64, 128);
    graphics.fillStyle(0x16213e, 1);
    graphics.fillRect(16, 32, 32, 96);
    graphics.generateTexture('bgFar', 64, 128);
    graphics.clear();

    // bg-mid (slightly brighter shape layer)
    graphics.fillStyle(0x0f3460, 1);
    graphics.fillRect(0, 0, 64, 64);
    graphics.fillStyle(0xe94560, 1);
    graphics.fillRect(8, 16, 16, 16);
    graphics.generateTexture('bgMid', 64, 64);
    graphics.clear();
  }

  create() {
    const { width, height } = this.scale;
    const floorHeight = 64;

    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 2. Procedural Parallax Background
    this.bgFar = this.add.tileSprite(width / 2, height - floorHeight - 64, width, 128, 'bgFar');
    this.bgMid = this.add.tileSprite(width / 2, height - floorHeight - 32, width, 64, 'bgMid');
    this.floor = this.add.tileSprite(width / 2, height - floorHeight / 2, width, floorHeight, 'floor');

    const ground = this.physics.add.staticGroup();
    const groundRect = this.add.rectangle(width / 2, height - floorHeight / 2, width, floorHeight, 0x000000, 0);
    ground.add(groundRect);

    // 3. Juicy Player Setup
    this.player = this.physics.add.sprite(150, height - floorHeight - 16, 'player');
    this.player.setOrigin(0.5, 0.5);
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(1500);
    this.physics.add.collider(this.player, ground);

    this.emitter = this.add.particles(0, 0, 'particle', {
      speed: { min: -50, max: 50 },
      angle: { min: 180, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 300,
      gravityY: 100,
      quantity: 1
    });
    this.emitter.startFollow(this.player, 0, 16);

    // 4. Input & Controls
    if (this.input.keyboard) {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    
    EventBus.emit('current-scene-ready', this);
  }

  update(time: number, delta: number) {
    // 5. The Update Loop
    this.bgFar.tilePositionX += this.gameSpeed * 0.2;
    this.bgMid.tilePositionX += this.gameSpeed * 0.5;
    this.floor.tilePositionX += this.gameSpeed;

    const isGrounded = this.player.body?.touching.down;

    if (isGrounded) {
       this.emitter.start();
    } else {
       this.emitter.stop();
    }

    // Duck/Slide logic
    if (this.cursors?.down.isDown) {
        if (!this.isSliding) {
            this.isSliding = true;
            this.player.setScale(1, 0.5);
            this.player.body?.setSize(32, 16);
            this.player.body?.setOffset(0, 16);
            
            if (!isGrounded) {
                this.player.body!.gravity.y = 4000;
            }
        }
    } else {
        if (this.isSliding) {
            this.isSliding = false;
            this.player.body!.gravity.y = 1500;
        }
    }

    // Jump logic
    if ((this.cursors?.up.isDown || this.spaceKey?.isDown) && isGrounded && !this.isSliding) {
        this.player.setVelocityY(-600);
        this.player.setScale(0.8, 1.2);
    }

    // Reset Logic
    if (isGrounded && !this.isSliding && this.player.scaleY !== 1) {
        this.player.setScale(1, 1);
        this.player.body?.setSize(32, 32);
        this.player.body?.setOffset(0, 0);
    }
  }
}
