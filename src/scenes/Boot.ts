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
        this.load.image(Preloader.images.background, 'assets/back1.png');

        this.load.audio(Preloader.sounds.evilLaugh, 'assets/sounds/evil-laugh.mp3');
		this.load.spritesheet(Preloader.images.zeus, "assets/zeus.png", { frameWidth: 64, frameHeight: 64 });
    }

    create ()
    {
        this.scene.start('GameOver');

        // this.debugLightning();
    }

    private debugLightning(): void {
        const graphics = this.add.graphics();
        const lightning = new Lightning(this);
        this.addNewLightning(lightning, graphics);

        this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on("up", () => {
            this.addNewLightning(lightning, graphics);
        });
    }

    private addNewLightning(lightning: Lightning, graphics: Phaser.GameObjects.Graphics): void {
        const { width, height } = SceneHelper.GetScreenSize(this);

        const from = { x: Phaser.Math.RND.between(25, width-25), y: 10 };
        const to = { x: Phaser.Math.RND.between(25, width-25), y: height - 10 };
        
        graphics.clear();
        graphics.fillStyle(0xff0000);
        graphics.fillCircle(from.x, from.y, 3);
        graphics.fillCircle(to.x, to.y, 3);

        lightning.addLightning(from, to);
    }
}
