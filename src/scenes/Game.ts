import { Scene } from 'phaser';
import { Player } from '../objects/player';
import { Preloader } from './Preloader';
import { Zeus } from '../objects/zeus';
import { Bulls } from '../objects/bulls';

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

        // Bulls
        const bulls = new Bulls(this);

        // Setup collisions
        this.physics.add.collider(this.player, statics);
        this.physics.add.collider(bulls, statics);

        this.time.addEvent({
            delay: 1500,
            callback: () => {
                bulls.spawnBull();
            },
            loop: true,
        });
    }
}
