import { Lightning } from "../helpers/Lightning";
import { SceneHelper } from "../helpers/SceneHelper";
import { Explodable } from "../mixins/Explodable";
import { Preloader } from "../scenes/Preloader";
import { Player } from "./player";

type ZeusConfig = {
    scene: Phaser.Scene,
    x: number;
    y: number;
    player?: Player;
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
    player: Player | null;
	canTakeHit = true;
	canFire = true;
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

	lightning: Lightning;
	lightningStriking = false;

	constructor({ scene, x, y, player }: ZeusConfig) {
        super(scene, x, y, Preloader.images.zeus, 0);

        this.player = player ?? null;

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.body.setAllowGravity(false);

        this.healthBar = this.createHealthbar();
        this.updateHealthbar();
		
		// Crosshair
		this.crosshair = this.scene.physics.add.sprite(this.x, this.y, Preloader.images.crosshair);
		this.crosshair.body.setAllowGravity(false);
		this.crosshair.setScale(0.5);
		this.crosshair.setAlpha(0);

		// Lightning
		this.lightning = new Lightning(this.scene);
	}

	preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        if (this.exploding) {
            return;
        }

        if (this.player) {
            this.follow(this.player);
        }
		
		if (this.player) {
			this.aim(this.player);
		}
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
		
		this.crosshair.setFrame(0);

		if (!this.canFire) {
			this.crosshair.setVelocity(0, 0);
			return;
		}
		
		if (distanceVector.length() > precision) {
			const { x: vx, y: vy } = distanceVector.normalize().scale(100);
			this.crosshair.setVelocity(vx, vy);
		} else if (this.canFire) {
			this.scene.time.delayedCall(500, () => this.zap());
		}
	}

	zap(): void {
		if (!this.canFire) {
			return;
		}
		
		this.canFire = false;
		this.crosshair.setFrame(1);

		const onStrike = () => this.lightningStriking = true;
		const onComplete = () => {
			this.lightningStriking = false;
			this.crosshair.setFrame(0)
		};
		
		this.lightning.addLightning(this, this.crosshair, undefined, onStrike, onComplete);

		this.scene.time.delayedCall(this.parameters.fireDelay, () => this.canFire = true);
	}

	follow(target: Phaser.Physics.Arcade.Sprite) {
		let horizontalDistance = target.x - this.x;
		let precision = 10;

		if (!this.canFire) {
			this.setVelocityX(0);
			return;
		}

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
