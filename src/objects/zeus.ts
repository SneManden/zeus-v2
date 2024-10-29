import { Lightning, defaultShadowOptions } from "../helpers/Lightning";
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
	preparingStrike = false;
	lightningStriking = false;

	berserkMode = false;

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
		this.crosshair.setAlpha(0.5);

		// Lightning
		this.lightning = new Lightning(this.scene);
	}

	preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

		this.setVelocityX(0);
		this.crosshair.setAlpha(0);
		this.crosshair.setVelocity(0, 0);

        if (this.exploding) {
            return;
        }

		if (this.berserkMode) {
			return;
		}

        if (this.player && this.player.canTakeHit && !this.player.exploding) {
            this.follow(this.player);
        }
		
		if (this.player && this.player.canTakeHit && !this.player.exploding) {
			this.crosshair.setAlpha(0.5);
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

			if (this.health <= this.parameters.maxHealth*0.25) {
				this.berserk();
			}
		});
	}

    die(): void {
        this.dead = true;

        const scenes = this.scene.scene;
        this.scene.time.delayedCall(2_000, () => scenes.start("GameWon"));
    }

	aim(target: Phaser.Physics.Arcade.Sprite): void {
		this.crosshair.setFrame(0);
		
		if (this.preparingStrike || this.lightningStriking) {
			this.crosshair.setVelocity(0, 0);
			return;
		}
		
		const distanceVector = target.body!.center.subtract(this.crosshair);
		const { x: vx, y: vy } = distanceVector.normalize().scale(100);
		this.crosshair.setVelocity(vx, vy);
	}

	zap(): void {
		if (!this.canFire || this.preparingStrike || this.dead) {
			return;
		}
		
		this.preparingStrike = true;
		this.canFire = false;
		this.crosshair.setFrame(1);

		const onStrike = () => {
			this.preparingStrike = false;
			this.lightningStriking = true;
		};
		const onComplete = () => {
			this.lightningStriking = false;
			this.crosshair.setFrame(0);
			this.scene.time.delayedCall(this.parameters.fireDelay, () => this.canFire = true);
		};
		
		this.lightning.addLightning(this, this.crosshair, { setCollisionGroup: true }, onStrike, onComplete);
	}

	berserk(): void {
		if (this.berserkMode) {
			return;
		}
		
		this.canFire = false;
		this.berserkMode = true;
		this.body.setCollideWorldBounds(false);
		
		const { width, height } = SceneHelper.GetScreenSize(this.scene);
		const roundTrips = 3;
		const thunderFreq = { min: 500, max: 1500 };

		const startThunder = (delay: number) => {
			this.scene.time.delayedCall(delay, () => {

				const target = { x: this.x, y: height };
				this.lightning.addLightning(this, target, {
					setCollisionGroup: true,
					rendering: {
						findDestinationTime: 250,
						strikeTime: 350,
					},
					shadow: { enabled: false },
				});
				
				if (this.berserkMode) {
					startThunder(Phaser.Math.Between(thunderFreq.min, thunderFreq.max));
				}
			});
		};

		this.scene.tweens.chain({
			targets: this,
			tweens: [
				{
					// Night time
					targets: null,
					key: { from: 0, to: defaultShadowOptions.shadowAlpha },
					duration: 1000,
					onUpdate: (tween) => this.lightning.shadow.setAlpha(tween.getValue()),
				},
				{
					// Pulse: get energized for thunder
					scaleX: { from: 0.9, to: 1.1 },
					scaleY: { from: 0.9, to: 1.1 },
					duration: 250,
					yoyo: true,
					repeat: 5,
				},
				{
					// Start moving to left endpoint
					x: 32,
					duration: Math.abs(this.x - 32)/(width-64)*2_000,
					onStart: () => startThunder(Phaser.Math.Between(thunderFreq.min, thunderFreq.max)),
				},
				{
					// Move between endpoints
					x: { from: 32, to: width - 32 },
					yoyo: true,
					repeat: roundTrips,
					duration: 2_000,
				},
			],
			onComplete: () => {
				// Exit berserk mode
				this.canFire = true;
				this.berserkMode = false;
				this.body.setCollideWorldBounds(true);
				this.lightning.shadow.setAlpha(0);
			},
		});
	}

	follow(target: Phaser.Physics.Arcade.Sprite) {
		let horizontalDistance = target.x - this.x;
		let precision = 10;

		if (this.preparingStrike || this.lightningStriking) {
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
