import { Preloader } from "../scenes/Preloader";

type PlayerConfig = {
    scene: Phaser.Scene,
    x: number;
    y: number;
    frame: number;
}

enum Animations {
    left = "left",
    right = "right",
};

export class Player extends Phaser.Physics.Arcade.Sprite {

    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    parameters = {
        hSpeed: 250,
        jumpPower: 500,
    } as const;

    constructor({ scene, x, y, frame }: PlayerConfig){
        super(scene, x, y, Preloader.assets.player, frame);

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
    }

	// constructor(game, x, y, key, frame) {
	// 	super(game, x, y, key, frame);
		// game.world.add(this);
		
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

		// game.physics.enable(this, Phaser.Physics.ARCADE);
		// // Body
		// this.body.collideWorldBounds = true;
		// this.body.gravity.y = params.gravityY;
		// this.body.maxVelocity.y = params.vMaxY;
		// this.body.setSize(20, 32, 5, 16);
		// // Animations
		// this.animations.add('right', [0, 1, 2, 3], 10, true);
		// //this.animations.add('turn', [0], 20, true);
		// this.animations.add('left', [4, 5, 6, 7], 10, true);
		// this.facing = 'right';
		// //
		// // Cursors
		// this.cursors = game.input.keyboard.createCursorKeys();
		// this.throwBtn= game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		// this.jumpTimer = 0;

	// }

	preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

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
        if (up.isDown && this.body?.touching.down) {
            this.setVelocityY(-this.parameters.jumpPower);
        }

	// 	if (this.x < -128 || this.y > this.game.height+128)
	// 		this.respawn();

	// 	if (this.dying) {
	// 		this.frame = 8;
	// 		return;
	// 	}

	// 	this.game.physics.arcade.overlap(this, this.game.state.getCurrentState().bulls, this.bullHit, null, this);
		
	// 	if (this.cursors.up.isDown && this.body.onFloor() && this.game.time.now > this.jumpTimer) {
	// 		this.body.velocity.y = -500;
	// 		this.jumpTimer = this.game.time.now + 750;
	// 	}
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

	// explode(xmin=-500, xmax=500, ymin=-600, ymax=-1200) {
	// 	console.log("player exploded!");
	// 	this.dying = true;
	// 	this.body.collideWorldBounds = false;

	// 	this.body.velocity.x = this.game.rnd.integerInRange(xmin, xmax);
	// 	this.body.velocity.y = this.game.rnd.integerInRange(ymin, ymax);
	// 	// this.body.acceleration.y = 180;
	// 	// this.body.angle = 180;
	// 	//
	// 	if (this.health.length <= 0)
	// 		return;
	// 	var p = this.health.pop();
	// 	p.destroy();
	// }

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
