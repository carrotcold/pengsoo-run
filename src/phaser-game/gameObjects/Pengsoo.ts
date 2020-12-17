import Phaser from 'phaser';
import { serviceInstance } from '~/store/middleware';

import Setting from '../consts/Setting';

enum PengsooState {
  Running,
  Jumping,
  hurt,
}

type direction = 'left' | 'right' | 'jump';

interface isPressed {
  left: boolean;
  right: boolean;
  jump: boolean;
}

export class Pengsoo extends Phaser.GameObjects.Container {
  private running: Phaser.GameObjects.Sprite;
  private shadow: Phaser.GameObjects.Ellipse;
  private jumpTimer: number = 0;
  private hurtTimer: number = 0;
  private text!: Phaser.GameObjects.BitmapText;
  private isPressed: isPressed;

  private currentState = PengsooState.Running;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.shadow = scene.add
      .ellipse(0, 10, 80, 25, 0x00000, 0.2)
      .setOrigin(0.5, 1);

    this.running = scene.add
      .sprite(0, 0, 'pengsoo_run')
      .setOrigin(0.5, 1)
      .play('pengsoo-run');

    this.add(this.shadow);
    this.add(this.running);

    this.text = this.scene.add.bitmapText(0, 0, 'font', '-1');

    this.text.setVisible(false);
    this.add(this.text);

    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.running.width * 0.5, this.running.height * 0.2);
    body.setOffset(this.running.width * -0.28, -this.running.height * 0.15);
    body.setCollideWorldBounds(true);
    scene.physics.world.setBounds(0, 180, Setting.WIDTH, Setting.HEIGHT - 200);

    this.isPressed = {
      left: false,
      right: false,
      jump: false,
    };

    serviceInstance.socket.on('buttonDown', (data: direction) => {
      this.isPressed[data] = true;
    });

    serviceInstance.socket.on('buttonUp', (data: direction) => {
      this.isPressed[data] = false;
    });
  }

  private preUpdate(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.currentState === PengsooState.Running) {
      if (this.isPressed.jump) {
        this.currentState = PengsooState.Jumping;
        this.jumpTimer = 50;
        this.running.play('pengsoo-jump');
      }
    }

    if (this.currentState === PengsooState.Jumping) {
      this.jumpTimer -= 1;
      const jumpRate = this.jumpTimer / 50;

      if (jumpRate < 0.5) {
        this.shadow.setScale(1 - jumpRate);
      } else {
        this.shadow.setScale(jumpRate);
      }

      if (this.jumpTimer < 0) {
        this.currentState = PengsooState.Running;
        this.running.play('pengsoo-run');
      }
    }

    if (this.currentState === PengsooState.hurt) {
      this.hurtTimer -= 1;
      const hurtRate = this.hurtTimer / 30;

      this.text.setY(200 * hurtRate);

      if (this.hurtTimer < 0) {
        this.text.setVisible(false);
        this.currentState = PengsooState.Running;
      }
    }

    if (this.isPressed.left) {
      body.setVelocityX(-300);
    } else if (this.isPressed.right) {
      body.setVelocityX(300);
    } else if (!this.isPressed.left || !this.isPressed.right) {
      body.setVelocityX(0);
    }
  }

  public gotHurt() {
    if (this.currentState !== PengsooState.Jumping) {
      console.log('다쳐땅');
      this.hurtTimer = 30;
      this.currentState = PengsooState.hurt;

      this.text.setY(0);
      this.text.setVisible(true);
    }
  }
}