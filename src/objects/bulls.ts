import { Scene } from "phaser";
import { Preloader } from "../scenes/Preloader";
import { Explodable } from "../mixins/Explodable";

export class Bull extends Explodable(Phaser.Physics.Arcade.Sprite) {
    declare body: Phaser.Physics.Arcade.Body;

    paralyzed = false;

    parameters = {
        hSpeed: { min: 100, max: 300 },
    } as const;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, Preloader.assets.bull);

        this.name = `Bull ${Phaser.Math.RND.integer()}`;

        this.anims.create({
            key: "right", 
            frames: this.anims.generateFrameNumbers(Preloader.assets.bull, { frames: [0, 1] }), 
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "left", 
            frames: this.anims.generateFrameNumbers(Preloader.assets.bull, { frames: [3, 4] }), 
            frameRate: 10,
            repeat: -1,
        });
    }

    paralyze(): void {
        this.paralyzed = true;
        this.setVelocityX(0);
        this.anims.stop();
        this.setFrame(2);
    }

    protected preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

        const { width } = this.scene.renderer;

        if (this.x < -150 || this.x > width + 150) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

export class Bulls extends Phaser.Physics.Arcade.Group {
    constructor(scene: Scene) {
        super(scene.physics.world, scene);

        this.createMultiple({
            quantity: 5,
            key: Preloader.assets.bull,
            active: false,
            visible: false,
            classType: Bull,
        })
    }

	spawnBull() {
        const { width, height } = this.scene.renderer;
        
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

        if (direction < 0) {
            bull.anims.play("left");
        } else {
            bull.anims.play("right");
        }
        bull.anims.currentAnim!.msPerFrame = vx / 25;
	}
}
