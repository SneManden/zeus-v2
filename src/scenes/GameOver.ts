import { Scene } from 'phaser';
import { SceneHelper } from '../helpers/SceneHelper';
import { Preloader } from './Preloader';

export class GameOver extends Scene
{
    private canContinue = false;

    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        const { width, height } = SceneHelper.GetScreenSize(this);

        const camera = this.cameras.main;

        // Background
        const back = this.add.image(width / 2, height / 2, Preloader.images.background);
        back.displayWidth = width;
        back.displayHeight = height;

        // Add Zeus flying towards screen
        this.addZeusFlyingTowardsScreen(width, height);

        // Exit / go to main menu
        this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on("up", () => {
            if (this.canContinue) {
                camera.fade(1_000, 0, 0, 0, undefined);
                this.time.delayedCall(1_000, () => this.scene.start('GameOver'));
            }
        });
    }

    private addZeusFlyingTowardsScreen(width: number, height: number): void {
        const flyingTime = 4_000;
        
        const zeus = this.add.image(width / 2, 0, Preloader.images.zeus);
        zeus.setScale(0.1, 0.1);
        this.tweens.chain({
            targets: zeus,
            tweens: [
                {
                    y: height / 2,
                    scale: 3,
                    duration: flyingTime,
                    ease: "Expo.easeIn",
                },
                {
                    y: 0,
                    scale: 10,
                    alpha: 0,
                    duration: 500,
                    ease: "Expo.easeOut",
                    onComplete: () => {
                        zeus.destroy();
                        this.canContinue = true;
                        this.displayGameOver(width/2, height/2);
                    },
                }
            ],
        });
        const zeusLaughSound = this.sound.add(Preloader.sounds.evilLaugh, { volume: 0.2 });
        zeusLaughSound.play();
        this.tweens.add({
            targets: zeusLaughSound,
            volume: 1,
            duration: flyingTime,
            ease: "Expo.easeIn",
        });
    }

    private displayGameOver(x: number, y: number): void {
        const commonTextConfig: Phaser.Types.GameObjects.Text.TextStyle = {
            fontFamily: 'Droid Sans',
            color: '#ffffff',
            stroke: '#000000',
            align: 'center'
        };

        this.add.text(x, y, 'Game Over', { ...commonTextConfig, fontSize: 30, strokeThickness: 8 }).setOrigin(0.5);
    }
}
