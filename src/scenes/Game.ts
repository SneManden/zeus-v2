import { Scene } from 'phaser';
import { Player } from '../objects/player';
import { Preloader } from './Preloader';
import { Zeus } from '../objects/zeus';
import { Bull, Bulls } from '../objects/bulls';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;

    private player: Player;
    private zeus: Zeus;

    constructor () {
        super('Game');
    }

    create () {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        const backgroundMusic = this.sound.add(Preloader.sounds.backgroundGame, { loop: true });
        this.events.once("shutdown", () => backgroundMusic.stop());
        backgroundMusic.play();

        const { w, h } = { w:Number(this.game.config.width), h:Number(this.game.config.height) };

        this.background = this.add.image(w/2, h/2, Preloader.images.background);
        this.background.displayWidth = w;
        this.background.displayHeight = h;

        const statics = this.physics.add.staticGroup();
        const ground = this.add.rectangle(w/2, h - 20, w, 20, undefined, 0);
        statics.add(ground);

        this.player = new Player({ scene: this, x: w/2, y: 160 });
        this.zeus = new Zeus({ scene: this, x: w/2, y: 32, player: this.player });

        this.player.target = this.zeus;

        // Bulls
        const bulls = new Bulls(this, 5);
        this.time.addEvent({
            delay: 4_000,
            callback: () => {
                if (!this.zeus.berserkMode) {
                    bulls.spawnBull();
                }
            },
            loop: true,
        });

        // Setup collisions
        this.physics.add.collider(this.player, statics, undefined, (oPlayer, _) => !(oPlayer as Player).exploding);
        this.physics.add.collider(bulls, statics, undefined, (oBull, _) => !(oBull as Bull).exploding);

        const bullCanCollide = (bull: Bull) => bull.active && !bull.paralyzed;
        const playerCanCollideBull = () => this.player.canTakeHit && !this.player.exploding;
        this.physics.add.collider(
            this.player,
            bulls,
            (_, oBull) => {
                const bull = oBull as Bull; // Fix wrong type, is really Bull

                const explodeVx = 2 * bull.body.velocity.x;
                
                if (bull.body.touching.left || bull.body.touching.right) {
                    this.player.explode({ x: explodeVx, y: -this.player.parameters.jumpPower, frame: 8, rotate: true });
                    bull.setVelocityX(-Math.sign(explodeVx) * bull.parameters.hSpeed.max);
                } else {
                    bull.paralyze();
                }
            },
            (_, oBull) => bullCanCollide(oBull as Bull) && playerCanCollideBull());

        this.physics.add.overlap(
            this.player,
            bulls,
            (_, oBull) => this.player.tryThrow(oBull as Bull),
            (_, oBull) => (oBull as Bull).paralyzed,
        );

        const zeusTakeDamage = this.physics.add.overlap(
            this.zeus,
            bulls,
            (_, oBull) => {
                const bull = oBull as Bull;
                zeusTakeDamage.active = false;
                this.zeus.bullHit(Math.sqrt(bull.body.velocity.length()), () => zeusTakeDamage.active = true);
            },
        );

        this.physics.add.overlap(
            this.player,
            this.zeus.crosshair,
            _ => this.zeus.zap(),
            _ => !this.zeus.lightningStriking && !this.zeus.preparingStrike && this.player.canTakeHit
        );

        this.physics.add.overlap(
            this.player,
            this.zeus.lightning.collisionGroup,
            _ => this.player.explode(),
            _ => !this.player.exploding && this.player.canTakeHit
        );

        this.physics.add.overlap(
            bulls,
            this.zeus.lightning.collisionGroup,
            (oBull, _) => (oBull as Bull).explode(),
            (oBull, _) => !(oBull as Bull).exploding
        );
    }
}
