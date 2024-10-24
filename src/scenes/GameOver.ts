import { Scene } from 'phaser';
import { SceneHelper } from '../helpers/SceneHelper';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text : Phaser.GameObjects.Text;

    canContinue = false;

    space: Phaser.Input.Keyboard.Key | null;

    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        const { width, height } = SceneHelper.GetScreenSize(this);

        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0xff0000);

        this.gameover_text = this.add.text(width/2, height/2, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.gameover_text.setOrigin(0.5);

        this.space = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE) ?? null;

        this.time.delayedCall(5_000, () => this.canContinue = true);
    }

    update(time: number, delta: number): void {
        super.update(time, delta);

        if (this.canContinue && this.space?.isDown) {
            this.scene.start("MainMenu");
        }
    }
}
