import { Scene } from 'phaser';

export class Preloader extends Scene
{
    static images = {
        player: "Player",
        zeus: "Zeus",
        bull: "Bull",
        background: "Background",
        crosshair: "Crosshair",
    } as const;

    static sounds = {
        lightning: "Lightning",
        explosion: "Explosion",
        jump: "Jump",
        throw: "Throw",
        backgroundGame: "BackgroundGame",
        mainMenu: "MainMenu",
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
        this.load.setPath('assets');

        // Images
		this.load.spritesheet(Preloader.images.player, "player.png", { frameWidth: 32, frameHeight: 48 });
		this.load.spritesheet(Preloader.images.zeus, "zeus.png", { frameWidth: 64, frameHeight: 64 });
		this.load.spritesheet(Preloader.images.bull, "bull.png", { frameWidth: 48, frameHeight: 32 });
		this.load.spritesheet(Preloader.images.crosshair, "crosshair.png", { frameWidth: 64, frameHeight: 64 });
		this.load.image("human", "human.png");

        // Sounds
        this.load.setPath('assets/sounds');
        this.load.audio(Preloader.sounds.lightning, 'lightning-strike.ogg');
        this.load.audio(Preloader.sounds.explosion, 'explosion.ogg');
        this.load.audio(Preloader.sounds.jump, 'jump.ogg');
        this.load.audio(Preloader.sounds.throw, 'throw.ogg');
        this.load.audio(Preloader.sounds.backgroundGame, 'thunderous_charge.mp3');
        this.load.audio(Preloader.sounds.mainMenu, "thunderstriker.mp3")
    }

    create ()
    {
        this.cameras.main.fade(1_000, 0, 0, 0, undefined);
        this.time.delayedCall(1_000, () => this.scene.start('MainMenu'));
    }
}
