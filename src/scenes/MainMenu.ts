import { Scene, GameObjects } from 'phaser';
import { Preloader } from './Preloader';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    private content = [
        { y: 90,  image: Preloader.images.player,      text: 'This is you. Use <Arrow keys> and <Space> for movement and throwing.' },
        { y: 150, image: Preloader.images.zeus,        text: 'This is Zeus. He will try to kill you.\nKill him.' },
        { y: 210, image: Preloader.images.crosshair,   text: 'This indicates Zeus\' lightning strike.\nAvoid it.' },
        { y: 270, image: Preloader.images.bull,        text: 'This is a bull. It will try to kill you.\nCan be jumped on and thrown.' },
    ] as const;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const backgroundMusic = this.sound.add(Preloader.sounds.mainMenu, { loop: true });
        this.events.once("shutdown", () => backgroundMusic.stop());
        backgroundMusic.play();

        const { w, h } = { w:Number(this.game.config.width), h:Number(this.game.config.height) };

        this.background = this.add.image(w/2, h/2, Preloader.images.background);
        this.background.displayWidth = w;
        this.background.displayHeight = h;

        const commonTextConfig: Phaser.Types.GameObjects.Text.TextStyle = { fontFamily: 'Droid Sans', color: '#ffffff', stroke: '#000000', align: 'center' };

        this.title = this.add
            .text(w/2, 25, 'The Wrath of Zeus', { ...commonTextConfig, fontSize: 30, strokeThickness: 8 })
            .setOrigin(0.5);

		this.add.text(w/2, 50, 'Press <Space> to play again.', { ...commonTextConfig, fontSize: 12, color: '#eeeeee' })
            .setOrigin(0.5);

        const textMarginLeft = 100;
        const entitiesCenterX = textMarginLeft / 2;
        const remainingTextConfig: Phaser.Types.GameObjects.Text.TextStyle = {
            ...commonTextConfig,
            fontSize: 16,
            align: "left",
            wordWrap: { width: w-textMarginLeft },
        };

        for (const { y, image, text } of this.content) {
            this.add.text(textMarginLeft, y, text, remainingTextConfig).setOrigin(0, 0.5);
            const sprite = this.add.sprite(entitiesCenterX, y, image);

            if (image === 'Crosshair') {
                sprite.setScale(0.5);
            }
        }

        this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on("up", () => {
            this.cameras.main.fade(1_000, 0, 0, 0, undefined);
            this.time.delayedCall(1_000, () => this.scene.start('Game'));
        });
    }
}
