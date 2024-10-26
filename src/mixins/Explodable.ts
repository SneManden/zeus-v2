import { Preloader } from "../scenes/Preloader";
import { GConstructor } from "./GConstructor";

type MinMax = { min: number; max: number };

type ExplodeOptionsX = { x: number | MinMax };
type ExplodeOptionsY = { y: number | MinMax };
type ExplodeOptions = Partial<ExplodeOptionsX & ExplodeOptionsY> & { frame?: number, rotate?: boolean };

export function Explodable<TBase extends GConstructor<Phaser.Physics.Arcade.Sprite>>(Base: TBase) {
    return class extends Base {
        exploding = false;

        // satisfies ExplodeOptions; // :( esbuild fails to understand...
        defaultConfig: ExplodeOptions & ExplodeOptionsX & ExplodeOptionsY = { x: { min: -500, max: 500 }, y: { min: -600, max: -1200 } };

        explodingSound = this.scene.sound.add(Preloader.sounds.explosion);

        explode(config?: ExplodeOptions) {
            const { x, y, frame, rotate } = { ...this.defaultConfig, ...config };

            this.exploding = true;

            this.setCollideWorldBounds(false);

            if (frame !== undefined) {
                this.setFrame(frame);
            }

            if (rotate === true) {
                this.setAngularVelocity(150);
            }

            const vx = typeof x === "number" ? x : Phaser.Math.RND.between(x.min, x.max);
            const vy = typeof y === "number" ? y : Phaser.Math.RND.between(y.min, y.max);

            this.setVelocity(vx, vy);

            this.explodingSound.play();
        }
    };
}
