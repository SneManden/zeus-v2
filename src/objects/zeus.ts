import { Preloader } from "../scenes/Preloader";

type ZeusConfig = {
    scene: Phaser.Scene,
    x: number;
    y: number;
    target?: Phaser.Physics.Arcade.Sprite;
}

export class Zeus extends Phaser.Physics.Arcade.Sprite {

    declare body: Phaser.Physics.Arcade.Body;

    parameters = {
        vMaxY: 500,
        hSpeed: 50,
        react: 1000,
        fireDelay: 2000,
        aimDelay: 200,
        aimhSpeed: 25,
		damageDebounce: 750,
		maxHealth: 100,
    } as const;

    target: Phaser.Physics.Arcade.Sprite | null;
	canTakeHit = true;
	health = this.parameters.maxHealth;

    shake = this.scene.tweens.create({
        targets: this,
        angle: { from: -5, to: 5 },
        duration: 50,
        ease: Phaser.Math.Easing.Bounce.InOut,
        yoyo: true,
        repeat: -1,
    }) as Phaser.Tweens.Tween; // Fix type

	constructor({ scene, x, y, target }: ZeusConfig) {
        super(scene, x, y, Preloader.assets.zeus, 0);

        this.target = target ?? null;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.body.setAllowGravity(false);

		// this.hpback = game.add.sprite(game.world.width/2 - 128, 0, 'hpback');
		// this.hp = game.add.sprite(game.world.width/2 - 128, 0, 'hp');
		// this.hp.cropEnabled = true;
		// this.hp.maxwidth = 256;

		// // firing
		// this.reactTimer = 0;
		// this.canFire = 0;
		// this.enableCrosshair = true;
		// this.fireTimer = 0;
		// // Crosshair
		// this.crosshair = new Phaser.Sprite(game, this.x, this.y, "crosshair");
		// this.crosshair.anchor.set(0.5, 0.5);
		// game.world.add(this.crosshair);
		// // Lightning effects, wooo
		// this.lightningBitmap = this.game.add.bitmapData(200, 300);
		// this.lightning = this.game.add.image(this.game.width/2, 20, this.lightningBitmap);
		// this.lightning.anchor.set(0.5, 0);

		// this.health = this.maxHealth = 100;
		// this.canTakeHit = true;

		// this.dead = false;
	}

	preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
	// 	if (this.dead) {
	// 		this.angle += 5;
	// 		this.body.velocity.x = 100;
	// 		return;
	// 	}

        if (this.target) {
            this.follow(this.target);
        }
    
	// 	if (this.player && this.game.time.now > this.reactTimer) {
	// 		this.follow(this.player);
	// 		this.reactTimer = this.game.time.now + Math.random()*this.params.react;
	// 	}

	// 	if (this.enableCrosshair)
	// 		this.aim(this.player);

	// 	this.game.physics.arcade.overlap(this, this.game.state.getCurrentState().bulls, this.bullHit, null, this);

	// 	/*if (this.player && this.game.time.now > this.canFire) {
	// 		this.enableCrosshair = true;
	// 		this.fireTimer = this.game.time.now + (1+Math.random())*this.params.aimDelay;
	// 	}*/
	}

	bullHit(damage: number, canTakeDamageAgain: () => void): void {
		if (!this.canTakeHit) {
			return;
		}

		this.canTakeHit = false;
		this.health -= damage;
		this.setFrame(1);

		this.updateHealthbar();

        this.shake.restart();

		this.scene.time.delayedCall(this.parameters.damageDebounce, () => {
            this.setAngle(0);
			this.setFrame(0);
            this.shake.pause();
			this.canTakeHit = true;
			canTakeDamageAgain();
		});
	}

	private updateHealthbar(): void {
		
	}

	// bullHit(zeus, bull) {
	// 	if (this.canTakeHit) {
	// 		this.canTakeHit = false;
	// 		this.health -= 5;
	// 		let w = (this.health / this.maxHealth) * this.hp.maxwidth;
	// 		this.hp.crop(new Phaser.Rectangle(0,0,w,this.hp.height));
	// 		// this.hp.crop.width = (this.health / this.maxHealth) * this.hp.width;
	// 		console.log("zeus has hp:", this.health);
	// 		this.game.time.events.add(500, function() { zeus.canTakeHit = true; zeus.frame = 0; });
	// 		this.frame = 1;

	// 		if (this.health <= 0) {
	// 			this.die();
	// 		}
	// 	}
	// }

	// die() {
	// 	this.dead = true;
	// 	console.log("zeus has died.");
	// 	this.hp.destroy();
	// 	this.crosshair.destroy();
	// 	let g = this.game;
	// 	g.time.events.add(3000, function() { g.state.start('GameWon'); }, this);
	// 	// this.kill();
	// 	this.body.collideWorldBounds = false;
	// 	this.body.velocity.x = this.game.rnd.integerInRange(-300,300);
	// 	this.body.velocity.y = this.game.rnd.integerInRange(-400,-200);
	// 	this.body.allowGravity = true;
	// 	this.body.gravity.y = 300;
	// }

	// aim(object) {
	// 	if (!object || !object.alive)
	// 		return;
	// 	// Move towards object
	// 	let hDist = object.x - this.crosshair.x;
	// 	let vDist = object.y - this.crosshair.y;
	// 	let prec = 20;
	// 	if (hDist < -prec) {
	// 		this.crosshair.x -= 1; //this.params.aimhSpeed;
	// 	} else if (hDist > prec) {
	// 		this.crosshair.x += 1; //this.params.aimhSpeed;
	// 	}
	// 	if (vDist < -prec/2) {
	// 		this.crosshair.y -= 0.5;
	// 	} else if (vDist > prec/2) {
	// 		this.crosshair.y += 0.5;
	// 	}

	// 	if (this.game.time.now > this.canFire) {
	// 		// If close enough: fire
	// 		if (this.game.physics.arcade.distanceBetween(this.crosshair, object) < prec) {
	// 			this.game.time.events.add(this.params.aimDelay, this.zap, this);
	// 			this.canFire = this.game.time.now + this.params.aimDelay + (1+Math.random())*this.params.fireDelay;
	// 		}
	// 		this.crosshair.frame = 0;
	// 	} else {
	// 		this.crosshair.frame = 1;
	// 	}
	// }

	// zap() {
	// 	let dist = this.game.physics.arcade.distanceBetween(this.crosshair, this.player);

	// 	console.log("ZAP!");

	// 	// Create lightning
	// 	this.lightning.x = this.x;
	// 	//this.lightning.y = this.y;
	// 	this.lightning.rotation = this.game.math.angleBetween(
	// 		this.lightning.x, this.lightning.y, this.crosshair.x, this.crosshair.y
	// 	) - Math.PI/2;
	// 	this.createLightning(this.game.physics.arcade.distanceBetween(this, this.crosshair));
	// 	this.lightning.alpha = 1;
	// 	this.game.add.tween(this.lightning).to({alpha:0}, 1000, Phaser.Easing.Cubic.In).start();

	// 	if (dist < 64) {
	// 		// Kill player if within a distance of crosshair
	// 		this.player.explode();
	// 	}
	// 	let gpa = this.game.physics.arcade;
	// 	let ch = this.crosshair;
	// 	this.game.state.getCurrentState().bulls.forEachAlive(function(bull) {
	// 		if (gpa.distanceBetween(ch, bull) < 128) {
	// 			bull.explode();
	// 		}
	// 	});
	// }

	// createLightning(distance) {
	// 	console.log("Lightning!");
	// 	let ctx = this.lightningBitmap.context,
	// 		width = this.lightningBitmap.width,
	// 		height = this.lightningBitmap.height;

	// 	ctx.clearRect(0, 0, width, height);

	// 	// TODO: create from bottom

	// 	let x = width/2,
	// 		y = 0,
	// 		segments = 20;

	// 	for (var i=0; i<segments; i++) {
	// 		ctx.strokeStyle = 'rgb(255,255,255)';
	// 		ctx.lineWidth = 3;
	// 		ctx.beginPath();
	// 		ctx.moveTo(x, y);

	// 		x += this.game.rnd.between(-30, 30);
	// 		if (x < 10) x = 10;
	// 		if (x > width-10) x = width-10;

	// 		y += this.game.rnd.between(20, height/segments);
	// 		if (i == segments-1 || y > distance)
	// 			y = distance;

	// 		ctx.lineTo(x, y);
	// 		ctx.stroke();

	// 		if (y >= distance)
	// 			break;
	// 	}

	// 	this.lightningBitmap.dirty = true; // update texture cache
	// }

	follow(target: Phaser.Physics.Arcade.Sprite) {
		let horizontalDistance = target.x - this.x;
		let precision = 10;

		if (horizontalDistance < -precision) {
            this.setVelocityX(-this.parameters.hSpeed);
		} else if (horizontalDistance > precision) {
            this.setVelocityX(this.parameters.hSpeed);
		} else {
            this.setVelocityX(0);
		}
	}

}
