import { Scene } from 'phaser';
import { SceneHelper } from '../helpers/SceneHelper';

export class GameWon extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameover_text: Phaser.GameObjects.Text;

    constructor() {
        super('GameWon');
    }

    create() {
        const { width, height } = SceneHelper.GetScreenSize(this);

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(65280);

        this.gameover_text = this.add.text(width / 2, height / 2, 'Game Won', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.gameover_text.setOrigin(0.5);

        this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on("up", () => {
            this.scene.start('MainMenu');
        });
    }
}
