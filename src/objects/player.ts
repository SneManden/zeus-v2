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

    private debugText: Phaser.GameObjects.Text;

    parameters = {
        hSpeed: 250,
        jumpPower: 500,
        maxLives: 1,
		deadDebounce: 750,
    } as const;

    dead = false;
    lives: number = this.parameters.maxLives;
    lifeIcons: Phaser.GameObjects.Group;

    canTakeHit = true;

    target: { x: number, y: number } | null;

    private jumpSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
    private throwSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;

    constructor({ scene, x, y }: PlayerConfig){
        super(scene, x, y, Preloader.images.player, 0);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);

        this.setBodySize(20, 42, true);
        
        this.anims.create({
            key: Animations.right, 
            frames: this.anims.generateFrameNumbers(Preloader.images.player, { frames: [0, 1, 2, 3] }), 
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: Animations.left, 
            frames: this.anims.generateFrameNumbers(Preloader.images.player, { frames: [4, 5, 6, 7] }), 
            frameRate: 10,
            repeat: -1,
        });
        this.anims.play(Animations.left);

        this.jumpSound = this.scene.sound.add(Preloader.sounds.jump);
        this.throwSound = this.scene.sound.add(Preloader.sounds.throw);

        this.cursors = this.scene.input.keyboard!.createCursorKeys();

        this.lifeIcons = this.scene.add.group({
            key: Preloader.images.player,
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

        const { height } = SceneHelper.GetScreenSize(this.scene);
        this.debugText = this.scene.add.text(5, height-10, "", { align: "left", fontSize: 8 });
    }

    get idleFrame(): number {
        if (this.cursors.space.isDown) {
            return 9;
        }
        return this.anims.currentAnim?.key === Animations.left ? 5 : 2;
    }

    tryThrow(bull: Bull): void {
        if (!this.cursors.space.isDown) {
            return;
        }

        if (bull.exploding && bull.body.velocity.y < 0) {
            // Cannot throw bull when going up
            return;
        }

        this.throwSound.play();

        const throwPower = { min: -400, max: -600 };
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
            this.jumpSound.play();
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
        this.canTakeHit = false;

        const { width, height } = SceneHelper.GetScreenSize(this.scene);
        this.setPosition(width / 2, height / 2);

        this.scene.time.delayedCall(this.parameters.deadDebounce, () => this.canTakeHit = true);
    }

    die(): void {
        this.dead = true;

        const scenes = this.scene.scene;
        this.scene.time.delayedCall(2_000, () => scenes.start("GameOver"));
    }
}
