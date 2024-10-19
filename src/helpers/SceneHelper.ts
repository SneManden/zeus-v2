import { Scene } from "phaser";

export class SceneHelper {
    static GetScreenSize(scene: Scene): { width: number, height: number } {
        return {
            width: scene.renderer.width,
            height: scene.renderer.height,
        };
    }
}
