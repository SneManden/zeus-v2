import { Scene } from "phaser";
import { Preloader } from "../scenes/Preloader";

export class BullsManager {

    bullBufferSize = 20;
    bulls: Phaser.Physics.Arcade.Group;

    bullParameters = {
        hSpeed: { min: 100, max: 300 },
    } as const;

    constructor(private scene: Scene) {
        this.createBulls();
    }

	spawnBull({ target }: { target: { x: number, y: number }}) {
        const { width, height } = this.scene.renderer;
        
        const spawnX = Phaser.Math.RND.pick([50, width - 50]);
        const spawnY = height - 70;
        const bull = this.bulls.getFirstDead(false, spawnX, spawnY) as Phaser.Physics.Arcade.Sprite | null;
        if (!bull) {
            console.warn("No bull available to spawn");
            return;
        }

        bull.active = true;
        bull.visible = true;

        const { min: vMin, max: vMax } = this.bullParameters.hSpeed;
        const vx = Phaser.Math.RND.between(vMin, vMax);
        const direction = Math.sign(target.x - bull.x);
        
        bull.setVelocity(direction * vx, 0);

        if (direction < 0) {
            bull.anims.play("left");
        } else {
            bull.anims.play("right");
        }
        bull.anims.currentAnim!.msPerFrame = vx / 25;

		// let xpos = this.game.rnd.pick([-50,this.game.world.width+50])
		// let bull = this.bulls.getFirstDead(false, xpos, this.game.world.height-100);
		// if (bull != null) {

		// 	bull.body.collideWorldBounds = true;
		// 	bull.dying = false;
		// 	bull.body.velocity.y = 0;
		// 	bull.body.velocity.x = this.game.rnd.integerInRange(100, 300);
		// 	if (xpos < 0) {
		// 		bull.animations.play('right');
		// 		bull.animations.getAnimation('right').speed = bull.body.velocity.x / 25;
		// 	} else {
		// 		bull.animations.play('left');
		// 		bull.animations.getAnimation('left').speed = bull.body.velocity.x / 25;
		// 		bull.body.velocity.x *= -1;
		// 	}
		// }
		// this.game.time.events.add(this.game.rnd.integerInRange(1000,3000), this.addBull, this);
	}
    
    private createBulls() {
		this.bulls = this.scene.physics.add.group();

		for (var i=0; i<this.bullBufferSize; i++) {
            const bull = this.createBull(`bull_${i + 1}`, 0, 0);
            this.bulls.add(bull, true);
            this.bulls.killAndHide(bull);
		}

		// g.time.events.add(500, this.addBull, this);
	}

    private createBull(name: string, x: number, y: number, ): Phaser.Physics.Arcade.Sprite {
        const bull = new Phaser.Physics.Arcade.Sprite(this.scene, x, y, Preloader.assets.bull);

        bull.name = name;

        bull.anims.create({
            key: "right", 
            frames: bull.anims.generateFrameNumbers(Preloader.assets.bull, { frames: [0, 1] }), 
            frameRate: 10,
            repeat: -1,
        });
        bull.anims.create({
            key: "left", 
            frames: bull.anims.generateFrameNumbers(Preloader.assets.bull, { frames: [3, 4] }), 
            frameRate: 10,
            repeat: -1,
        });

        // bull.body.setSize(32, 24, 8, 6);
        // bull.body.collideWorldBounds = true;
        // bull.body.gravity.y = 1000;
        // bull.body.maxVelocity.y = 1600;
        // bull.dying = false;
        // bull.explode = function(xmin=-500,xmax=500,ymin=-1200,ymax=-600) {
        // 	this.body.collideWorldBounds = false;
        // 	this.body.velocity.x = this.game.rnd.integerInRange(xmin,xmax);
        // 	this.body.velocity.y = this.game.rnd.integerInRange(ymin,ymax);
        // 	this.dying = true;
        // }
        // bull.die = function() {
        // 	this.dying = true;
        // 	this.body.velocity.x = 0;
        // 	this.animations.stop('right');
        // 	this.animations.stop('left');
        // 	this.frame = 2;
        // }
        
        return bull;
    }

	// update() {
	// 	let g = this.game;
	// 	this.bulls.forEachAlive(function(bull) {
	// 		if (bull.body.x > g.world.width+100) {
	// 			bull.kill();
	// 		}
	// 		if (bull.dying && bull.body.y > 3*g.world.height/2) {
	// 			bull.kill();
	// 		}
	// 	});
	// }
}
