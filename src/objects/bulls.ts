import { Scene } from "phaser";
import { Preloader } from "../scenes/Preloader";
import { Explodable } from "../mixins/Explodable";
import { SceneHelper } from "../helpers/SceneHelper";

export class Bull extends Explodable(Phaser.Physics.Arcade.Sprite) {
    declare body: Phaser.Physics.Arcade.Body;

    paralyzed = false;
    private canWakeUp = false;

    parameters = {
        hSpeed: { min: 100, max: 300 },
        paralysisTime: { min: 3_000, max: 5_000 },
    } as const;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, Preloader.images.bull);

        this.name = `Bull ${Phaser.Math.RND.integer()}`;

        this.anims.create({
            key: "right", 
            frames: this.anims.generateFrameNumbers(Preloader.images.bull, { frames: [0, 1] }), 
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "left", 
            frames: this.anims.generateFrameNumbers(Preloader.images.bull, { frames: [3, 4] }), 
            frameRate: 10,
            repeat: -1,
        });
    }

    paralyze(): void {
        this.paralyzed = true;
        this.setVelocityX(0);
        this.anims.stop();
        this.setFrame(2);

        const wakeUpIn = Phaser.Math.RND.between(this.parameters.paralysisTime.min, this.parameters.paralysisTime.max);
        this.scene.time.delayedCall(wakeUpIn, () => this.canWakeUp = true);
    }

    wakeUp(): void {
        if (!this.paralyzed || !this.canWakeUp) {
            return;
        }

        this.paralyzed = false;
        this.canWakeUp = false;

        const { min: vMin, max: vMax } = this.parameters.hSpeed;
        const vx = Phaser.Math.RND.sign() * Phaser.Math.RND.between(vMin, vMax);
        this.setVelocityX(vx);
    }

    protected preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

        const { width, height } = SceneHelper.GetScreenSize(this.scene);
        if (this.x < -150 || this.x > width + 150 || this.y > height + 150) {
            this.setActive(false);
            this.setVisible(false);
            return;
        }

        if (this.exploding || this.paralyzed) {
            return;
        }

        if (this.body.touching.down) {
            this.wakeUp();
        }

        const vx = this.body.velocity.x;

        const currentlyPlaying = this.anims.isPlaying ? this.anims.currentAnim?.key : null;
        if (vx < 0 && currentlyPlaying !== "left") {
            this.anims.play("left");
        } else if (vx > 0 && currentlyPlaying !== "right") {
            this.anims.play("right");
        }
        this.anims.currentAnim!.msPerFrame = vx / 25;
	}
}

export class Bulls extends Phaser.Physics.Arcade.Group {
    constructor(scene: Scene, quantity = 5) {
        super(scene.physics.world, scene);

        this.createMultiple({
            quantity,
            key: Preloader.images.bull,
            active: false,
            visible: false,
            classType: Bull,
        });
    }

	spawnBull() {
        const { width, height } = SceneHelper.GetScreenSize(this.scene);
        
        const spawnX = Phaser.Math.RND.pick([-50, width + 50]);
        const spawnY = height - 70;
        const bull = this.getFirstDead(false, spawnX, spawnY) as Bull | null; // fix any type
        if (!bull) {
            console.warn("No bull available to spawn");
            return;
        }

        bull.active = true;
        bull.visible = true;
        bull.exploding = false;
        bull.paralyzed = false;
        bull.setAngle(0);
        bull.setAngularVelocity(0);

        const { min: vMin, max: vMax } = bull.parameters.hSpeed;
        const vx = Phaser.Math.RND.between(vMin, vMax);
        const direction = Math.sign(width/2 - bull.x); // Run towards center of screen

        bull.setVelocity(direction * vx, 0);
    }
}
