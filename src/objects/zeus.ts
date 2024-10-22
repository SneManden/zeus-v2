import { SceneHelper } from "../helpers/SceneHelper";
import { Explodable } from "../mixins/Explodable";
import { Preloader } from "../scenes/Preloader";

type ZeusConfig = {
    scene: Phaser.Scene,
    x: number;
    y: number;
    target?: Phaser.Physics.Arcade.Sprite;
}

export class Zeus extends Explodable(Phaser.Physics.Arcade.Sprite) {

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

    dead = false;
    target: Phaser.Physics.Arcade.Sprite | null;
	canTakeHit = true;
	health: number = this.parameters.maxHealth;

    shake = this.scene.tweens.create({
        targets: this,
        angle: { from: -5, to: 5 },
        duration: 50,
        ease: Phaser.Math.Easing.Bounce.InOut,
        yoyo: true,
        repeat: -1,
    }) as Phaser.Tweens.Tween; // Fix type

    healthBar: Phaser.GameObjects.Rectangle;

	crosshair: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

	constructor({ scene, x, y, target }: ZeusConfig) {
        super(scene, x, y, Preloader.assets.zeus, 0);

        this.target = target ?? null;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.body.setAllowGravity(false);

        this.healthBar = this.createHealthbar();
        this.updateHealthbar();

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
		this.crosshair = this.scene.physics.add.sprite(this.x, this.y, Preloader.assets.crosshair);
		this.crosshair.body.setAllowGravity(false);
		this.crosshair.setScale(0.5);
		// this.crosshair.anchor.set(0.5, 0.5);
		// game.world.add(this.crosshair);
		// // Lightning effects, wooo
		// this.lightningBitmap = this.game.add.bitmapData(200, 300);
		// this.lightning = this.game.add.image(this.game.width/2, 20, this.lightningBitmap);
		// this.lightning.anchor.set(0.5, 0);

		// this.canTakeHit = true;

		// this.dead = false;
	}

	preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        if (this.exploding) {
            return;
        }

        if (this.target) {
            this.follow(this.target);
        }
		
		if (this.target) {
			this.aim(this.target);
		}
	// 	if (this.player && this.game.time.now > this.reactTimer) {
	// 		this.follow(this.player);
	// 		this.reactTimer = this.game.time.now + Math.random()*this.params.react;
	// 	}

	
	// 	if (this.enableCrosshair)
	// 		this.aim(this.player);

	// 	/*if (this.player && this.game.time.now > this.canFire) {
	// 		this.enableCrosshair = true;
	// 		this.fireTimer = this.game.time.now + (1+Math.random())*this.params.aimDelay;
	// 	}*/
	}

	bullHit(damage: number, canTakeDamageAgain: () => void): void {
		if (!this.canTakeHit) {
			return;
		}

		this.setFrame(1);
		this.canTakeHit = false;

		this.health = Math.max(0, this.health - damage);
		this.updateHealthbar();

        if (this.health <= 0) {
            this.body.setAllowGravity(true);
            this.explode({ x: { min: -50, max: 50 }, y: -100, rotate: true });
            this.die();
            return;
        }

        this.shake.restart();
		this.scene.time.delayedCall(this.parameters.damageDebounce, () => {
            this.setAngle(0);
			this.setFrame(0);
            this.shake.pause();
			this.canTakeHit = true;
			canTakeDamageAgain();
		});
	}

    die(): void {
        this.dead = true;

        const scenes = this.scene.scene;
        this.scene.time.delayedCall(2_000, () => scenes.start("GameWon"));
    }

	aim(target: Phaser.Physics.Arcade.Sprite): void {
		const distanceVector = target.body!.center.subtract(this.crosshair);
		const precision = 50;
		
		if (distanceVector.length() > precision) {
			const { x: vx, y: vy } = distanceVector.normalize().scale(100);
			this.crosshair.setVelocity(vx, vy);
		}
	}

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

    private createHealthbar(): Phaser.GameObjects.Rectangle {
        const { width } = SceneHelper.GetScreenSize(this.scene);
        
        const barWidth = this.parameters.maxHealth;
        const barHeight = 10;
        
        const x = width/2, y = 5;
        
        this.scene.add.rectangle(x, y, barWidth, barHeight, 0xffffff);
        const bar = this.scene.add.rectangle(x - barWidth/2, y, 0, barHeight, 0x00ff00);

        return bar;
    }

	private updateHealthbar(): void {
		this.healthBar.width = this.health;
	}
}
