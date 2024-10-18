import { Scene } from "phaser";
import { Preloader } from "../scenes/Preloader";

export class Bull extends Phaser.Physics.Arcade.Sprite {

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, Preloader.assets.bull);

        this.name = `Bull ${Phaser.Math.RND.integer()}`;

        this.anims.create({
            key: "right", 
            frames: this.anims.generateFrameNumbers(Preloader.assets.bull, { frames: [0, 1] }), 
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "left", 
            frames: this.anims.generateFrameNumbers(Preloader.assets.bull, { frames: [3, 4] }), 
            frameRate: 10,
            repeat: -1,
        });
    }

    protected preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

        const { width } = this.scene.renderer;

        if (this.x < -150 || this.x > width + 150) {
            console.log(this.name, "outside bounds.");
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

export class Bulls extends Phaser.Physics.Arcade.Group {
    bullParameters = {
        hSpeed: { min: 100, max: 300 },
    } as const;

    constructor(scene: Scene) {
        super(scene.physics.world, scene);

        this.createMultiple({
            quantity: 5,
            key: Preloader.assets.bull,
            active: false,
            visible: false,
            classType: Bull,
        })
    }

	spawnBull() {
        const { width, height } = this.scene.renderer;
        
        const spawnX = Phaser.Math.RND.pick([-50, width + 50]);
        const spawnY = height - 70;
        const bull = this.getFirstDead(false, spawnX, spawnY) as Phaser.Physics.Arcade.Sprite | null;
        if (!bull) {
            console.warn("No bull available to spawn");
            return;
        }


        bull.active = true;
        bull.visible = true;

        const { min: vMin, max: vMax } = this.bullParameters.hSpeed;
        const vx = Phaser.Math.RND.between(vMin, vMax);
        const direction = Math.sign(width/2 - bull.x); // Run towards center of screen

        bull.setVelocity(direction * vx, 0);
        
        console.log("Spawned bull", bull.name, "at", { x:bull.x, y:bull.y }, "with vx", vx);

        if (direction < 0) {
            bull.anims.play("left");
        } else {
            bull.anims.play("right");
        }
        bull.anims.currentAnim!.msPerFrame = vx / 25;

		// this.game.time.events.add(this.game.rnd.integerInRange(1000,3000), this.addBull, this);
	}

    private createBull(name: string, x: number, y: number, ): Phaser.Physics.Arcade.Sprite {
        const bull = new Phaser.Physics.Arcade.Sprite(this.scene, x, y, Preloader.assets.bull);

        bull.name = name;

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
}
