import { Scene, GameObjects } from 'phaser';
import { Preloader } from './Preloader';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    private content = [
        { y: 90,  image: Preloader.assets.player,      text: 'This is you. Use <Arrow keys> and <Space> for movement and throwing.' },
        { y: 150, image: Preloader.assets.zeus,        text: 'This is Zeus. He will try to kill you.\nKill him.' },
        { y: 210, image: Preloader.assets.crosshair,   text: 'This indicates Zeus\' lightning strike.\nAvoid it.' },
        { y: 270, image: Preloader.assets.bull,        text: 'This is a bull. It will try to kill you.\nCan be jumped on and thrown.' },
    ] as const;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        const { w, h } = { w:Number(this.game.config.width), h:Number(this.game.config.height) };

        this.background = this.add.image(w/2, h/2, Preloader.assets.background);
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
            this.scene.start('Game');
        });
    }
}
