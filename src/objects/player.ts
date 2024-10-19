import { Preloader } from "../scenes/Preloader";
import { Explodable } from "../mixins/Explodable";
import { SceneHelper } from "../helpers/SceneHelper";

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

    lives: number = this.parameters.maxLives;

    lifeIcons: Phaser.GameObjects.Group;

    constructor({ scene, x, y }: PlayerConfig){
        super(scene, x, y, Preloader.assets.player, 0);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);

        // this.setBodySize(20, 32, true);
        
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

        // this.health = [];
        // for (var i=0; i<3; i++) {
        // 	let p = game.add.sprite(10 + i*20,10,'player');
        // 	p.width *= 0.5;
        // 	p.height *= 0.5;
        // 	this.health.push(p);
        // }
    
        // // Body
        // this.body.collideWorldBounds = true;
        // this.body.gravity.y = params.gravityY;
        // this.body.maxVelocity.y = params.vMaxY;
        // this.body.setSize(20, 32, 5, 16);
        // //
        // this.throwBtn= game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    }


	preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        if (!this.scene.physics.world.bounds.contains(this.x, this.y)) {
            this.tryRespawn();
        }

        if (this.exploding) {
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
            this.setFrame(this.anims.currentAnim?.key === Animations.left ? 5 : 2);
        }

        // Jumping
        if (up.isDown && this.body.touching.down) {
            this.setVelocityY(-this.parameters.jumpPower);
        }
	}

	// bullHit(player, bull) {
	// 	if (!bull.dying) {
	// 		if (bull.body.touching.up)
	// 			bull.die();
	// 		else if (bull.body.velocity.x > 0 && bull.body.touching.right)
	// 			this.explode(0);
	// 		else if (bull.body.velocity.x < 0 && bull.body.touching.left)
	// 			this.explode(-500,0);
	// 	} else {
	// 		if (this.throwBtn.isDown) {
	// 			let xdir = this.zeus.x - this.x;
	// 			bull.explode(xdir-100,xdir+100,-900,-800);
	// 			this.frame = 9;
	// 		}
	// 	}
	// }

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
        const scenes = this.scene.scene;
        
        this.scene.time.addEvent({
            delay: 1_000,
            callback: () => scenes.start("GameOver"),
        })
        this.destroy();
    }
}
