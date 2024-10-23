import { Scene } from 'phaser';
import { Preloader } from './Preloader';
import { Lightning } from '../helpers/Lightning';
import { SceneHelper } from '../helpers/SceneHelper';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image(Preloader.assets.background, 'assets/back1.png');
    }

    create ()
    {
        // this.scene.start('Preloader');

        const graphics = this.add.graphics();
        console.log(graphics);
        this.drawLigtning(graphics);

        this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on("up", () => {
            this.drawLigtning(graphics);
            // this.scene.start('Game');
        });
    }

    private drawLigtning(graphics: Phaser.GameObjects.Graphics): void {
        const { width, height } = SceneHelper.GetScreenSize(this);

        const from = { x: Phaser.Math.RND.between(25, width-25), y: 10 };
        const to = { x: Phaser.Math.RND.between(25, width-25), y: height - 10 };
        
        Lightning.drawLightning(graphics, { from, to });

        graphics.fillStyle(0xff0000);
        graphics.fillCircle(from.x, from.y, 3);
        graphics.fillCircle(to.x, to.y, 3);
    }
}
