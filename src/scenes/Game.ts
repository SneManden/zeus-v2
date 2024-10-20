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

        const { w, h } = { w:Number(this.game.config.width), h:Number(this.game.config.height) };

        this.background = this.add.image(w/2, h/2, Preloader.assets.background);
        this.background.displayWidth = w;
        this.background.displayHeight = h;

        const statics = this.physics.add.staticGroup();
        const ground = this.add.rectangle(w/2, h - 20, w, 20, undefined, 0);
        statics.add(ground);

        this.player = new Player({ scene: this, x: w/2, y: 160 });
        this.zeus = new Zeus({ scene: this, x: w/2, y: 32, target: this.player });

        this.player.target = this.zeus;

        // Bulls
        const bulls = new Bulls(this);
        this.time.addEvent({
            delay: 1500,
            callback: () => {
                bulls.spawnBull();
            },
            loop: true,
        });

        // Setup collisions
        this.physics.add.collider(this.player, statics, undefined, (oPlayer, _) => !(oPlayer as Player).exploding);
        this.physics.add.collider(bulls, statics, undefined, (oBull, _) => !(oBull as Bull).exploding);

        this.physics.add.collider(
            this.player,
            bulls,
            (oPlayer, oBull) => {
                const bull = oBull as Bull;
                const player = oPlayer as Player;

                const explodeVx = 2 * bull.body.velocity.x;
                
                if (bull.body.touching.left || bull.body.touching.right) {
                    player.explode({ x: explodeVx, y: -player.parameters.jumpPower, frame: 8, rotate: true });
                    bull.setVelocityX(-Math.sign(explodeVx) * bull.parameters.hSpeed.max);
                } else {
                    bull.paralyze(); // Fix wrong type, is really Bull
                }
            },
            (oPlayer, oBull) => !(oBull as Bull).paralyzed && !(oPlayer as Player).exploding);

        this.physics.add.overlap(
            this.player,
            bulls,
            (_, oBull) => this.player.canThrow(oBull as Bull),
            (_, oBull) => (oBull as Bull).paralyzed,
        );

        const zeusTakeDamage = this.physics.add.overlap(
            this.zeus,
            bulls,
            (_z, oBull) => {
                const bull = oBull as Bull;

                zeusTakeDamage.active = false;
                this.zeus.bullHit(bull.body.velocity.length(), () => zeusTakeDamage.active = true);
            },
        );
    }
}
