import { Preloader } from "../scenes/Preloader";
import { Explodable } from "../mixins/Explodable";
import { SceneHelper } from "../helpers/SceneHelper";
import { Bull } from "./bulls";

type PlayerConfig = {
    scene: Phaser.Scene,
    x: number;
    y: number;
}

enum Animations {
    left = "left",
    right = "right",
};

export class Player extends Explodable(Phaser.Physics.Arcade.Sprite) {

    declare body: Phaser.Physics.Arcade.Body;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    parameters = {
        hSpeed: 250,
        jumpPower: 500,
        maxLives: 3,
    } as const;

    dead = false;
    lives: number = this.parameters.maxLives;
    lifeIcons: Phaser.GameObjects.Group;

    target: { x: number, y: number } | null;

    constructor({ scene, x, y }: PlayerConfig){
        super(scene, x, y, Preloader.assets.player, 0);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);

        // this.body.maxVelocity.y = params.vMaxY;
        // this.setBodySize(20, 32, true);
        // this.body.setSize(20, 32, 5, 16);
        
        this.anims.create({
            key: Animations.right, 
            frames: this.anims.generateFrameNumbers(Preloader.assets.player, { frames: [0, 1, 2, 3] }), 
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: Animations.left, 
            frames: this.anims.generateFrameNumbers(Preloader.assets.player, { frames: [4, 5, 6, 7] }), 
            frameRate: 10,
            repeat: -1,
        });
        this.anims.play(Animations.left);

        this.cursors = this.scene.input.keyboard!.createCursorKeys();

        this.lifeIcons = this.scene.add.group({
            key: Preloader.assets.player,
            frameQuantity: this.lives,
            frame: 0,
            setXY: {
                x: 10,
                y: 10,
                stepX: 20,
            },
            setScale: {
                x: 0.5,
                y: 0.5,
            },
        });
    }

    get idleFrame(): number {
        if (this.cursors.space.isDown) {
            return 9;
        }
        return this.anims.currentAnim?.key === Animations.left ? 5 : 2;
    }

    canThrow(bull: Bull): void {
        if (!this.cursors.space.isDown) {
            return;
        }

        const throwPower = { min: -500, max: -900 };
        const accurracy = 100; // if target dir is X, then aim will be in range [X-accurracy; X+accurracy]

        const xDirection = this.target ? this.target.x - this.x : this.x;
        bull.explode({ x: { min: xDirection - accurracy, max: xDirection + accurracy }, y: throwPower, rotate: true });
        this.setFrame(9);
    }

	preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        if (this.dead) {
            return;
        }

        if (!this.scene.physics.world.bounds.contains(this.x, this.y)) {
            this.tryRespawn();
        }

        if (this.exploding) {
            this.anims.stop();
            this.setFrame(8);
            return;
        }

        const { left, right, up } = this.cursors;
        
        const currentlyPlaying = this.anims.isPlaying ? this.anims.currentAnim?.key : null;
        
        // Moving
        if (left.isDown) {
            this.setVelocityX(-this.parameters.hSpeed);
            if (currentlyPlaying !== Animations.left) {
                this.anims.play(Animations.left);
            }
        } else if (right.isDown) {
            this.setVelocityX(this.parameters.hSpeed);
            if (currentlyPlaying !== Animations.right) {
                this.anims.play(Animations.right);
            }
        } else {
            this.setVelocityX(0);
            this.anims.stop();
            this.setFrame(this.idleFrame);
        }

        // Jumping
        if (up.isDown && this.body.touching.down) {
            this.setVelocityY(-this.parameters.jumpPower);
        }
	}

    tryRespawn(): void {
        if (this.lives === 0) {
            this.die();
            return;
        }

        this.lives -= 1;
        this.lifeIcons.killAndHide(this.lifeIcons.getLast(true));
        
        this.setVelocity(0, 0);
        this.setAngularVelocity(0);
        this.setAngle(0);
        this.setCollideWorldBounds(true);
        this.setFrame(0);

        this.exploding = false;

        const { width, height } = SceneHelper.GetScreenSize(this.scene);
        this.setPosition(width / 2, height / 2);
    }

    die(): void {
        this.dead = true;

        const scenes = this.scene.scene;
        this.scene.time.delayedCall(2_000, () => scenes.start("GameOver"));
    }
}
