import { Scene } from 'phaser';
import { Player } from '../objects/player';
import { Preloader } from './Preloader';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;

    private player: Player;

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

        this.player = new Player({ scene: this, x: w/2, y: 160, frame: 0 });

        this.physics.add.collider(this.player, statics);
    }
}
