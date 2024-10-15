import { Scene } from 'phaser';
import { Preloader } from './Preloader';

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
        this.scene.start('Preloader');
    }
}
