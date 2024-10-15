import { Preloader } from "../scenes/Preloader";

type PlayerConfig = {
    scene: Phaser.Scene,
    x: number;
    y: number;
}

enum Animations {
    left = "left",
    right = "right",
};

export class Player extends Phaser.Physics.Arcade.Sprite {

    declare body: Phaser.Physics.Arcade.Body;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    parameters = {
        hSpeed: 250,
        jumpPower: 500,
    } as const;
    
    exploding = false;

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

        // // Parameters
        // let params = this.params = {
        // 	gravityY: 1000,
        // 	vMaxY: 500,
        // 	hSpeed: 250
        // };
    
        // this.anchor.x = 0.5;
        // this.anchor.y = 0.5;
    
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

	// 	if (this.x < -128 || this.y > this.game.height+128)
	// 		this.respawn();

	// 	this.game.physics.arcade.overlap(this, this.game.state.getCurrentState().bulls, this.bullHit, null, this);
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

	explode({ xmin, xmax, ymin, ymax }: { xmin: number, xmax: number, ymin: number, ymax: number } = { xmin:-500, xmax:500, ymin:-600, ymax:-1200 }) {
        this.exploding = true;
		// this.dying = true;
		// this.body.collideWorldBounds = false;

        this.setCollideWorldBounds(false);

        this.setFrame(8);

        const { vx, vy } = { vx: Phaser.Math.RND.between(xmin, xmax), vy: Phaser.Math.RND.between(ymin, ymax) };
        this.setVelocity(vx, vy);

		// if (this.health.length <= 0)
		// 	return;
		// var p = this.health.pop();
		// p.destroy();
	}

	// respawn() {
	// 	if (this.health.length == 0) {
	// 		console.log("player has died for good.");
	// 		this.alive = false;
	// 		let g = this.game;
	// 		g.time.events.add(2000, function() { g.state.start('GameOver'); }, this);
	// 		this.destroy();
	// 		return;
	// 	}
	// 	console.log("player has respawned.");
	// 	this.dying = false;
	// 	this.body.angle = 0;
	// 	this.body.collideWorldBounds = true;
	// 	this.x = this.game.width / 2;
	// 	this.y = this.game.height / 2;
	// 	this.body.velocity.x = 0;
	// 	this.body.velocity.y = 0;
	// 	this.body.acceleration.y = 0;
	// 	this.frame = 0;
	// }

	render() {
		// this.game.debug.body(this);
		// this.game.debug.bodyInfo(this, 16, 24);
	}

}
