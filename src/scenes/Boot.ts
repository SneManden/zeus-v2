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

        // this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on("up", () => {
        //     this.scene.start('Game');
        // });
    }

    private drawLigtning(graphics: Phaser.GameObjects.Graphics): void {

        const { width, height } = SceneHelper.GetScreenSize(this);
        
        Lightning.drawLightning(graphics, {
            from: { x: width/2, y: 10 },
            to: { x: width/2, y: height - 10 },
        });

        this.tweens.add({
            targets: graphics,
            alpha: 0,
            ease: "Linear",
            duration: 1000,
            repeat: 0,
            yoyo: false,
            onComplete: () => this.drawLigtning(graphics),
        })
    }
}
