import { Scene } from 'phaser';

export class Preloader extends Scene
{
    static assets = {
        player: "Player",
        zeus: "Zeus",
        bull: "Bull",
        background: "Background",
        crosshair: "Crosshair",
    } as const;

    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        const { w, h } = { w:Number(this.game.config.width), h:Number(this.game.config.height) };
        const cw = w / 2;
        const ch = h / 2;

        //  We loaded this image in our Boot Scene, so we can display it here
        const back = this.add.image(cw, ch, 'background');
        back.displayWidth = w;
        back.displayHeight = h;

        //  A simple progress bar. This is the outline of the bar.
        const pw = w / 2,
              ph = 20;
              
        const bar = this.add.rectangle(cw - pw/2, ch - ph/2, 0, ph, 0xffffff);
        this.add.rectangle(cw, ch - ph/2, pw, ph).setStrokeStyle(1, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {
            bar.width = pw * progress;
        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        
		this.load.spritesheet(Preloader.assets.player, "player.png", { frameWidth: 32, frameHeight: 48 });
		this.load.spritesheet(Preloader.assets.zeus, "zeus.png", { frameWidth: 64, frameHeight: 64 });
		this.load.spritesheet(Preloader.assets.bull, "bull.png", { frameWidth: 48, frameHeight: 32 });
		this.load.spritesheet(Preloader.assets.crosshair, "crosshair.png", { frameWidth: 64, frameHeight: 64 });
		this.load.image("human", "human.png");
		
        // this.load.spritesheet("hp", "hp.png", { frameWidth: 0, frameHeight: 0 });//, 256, 8);
		// this.load.spritesheet("hpback", "hpback.png", { frameWidth: 0, frameHeight: 0 });//, 256, 8);
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
