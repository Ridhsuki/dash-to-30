import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class MainScene extends Scene {
  constructor() {
    super('MainScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#2d2d2d');
    
    this.add.text(
      this.scale.width / 2, 
      this.scale.height / 2, 
      'DASH TO 30: ENGINE READY', 
      { 
        fontSize: '24px', 
        color: '#ffffff', 
        fontFamily: 'monospace' 
      }
    ).setOrigin(0.5);

    EventBus.emit('current-scene-ready', this);
  }
}
