type ExplodeOptions = { xmin: number; xmax: number; ymin: number; ymax: number; frame?: number; };
type GConstructor<T = {}> = new (...args: any[]) => T;
export function Explodable<TBase extends GConstructor<Phaser.Physics.Arcade.Sprite>>(Base: TBase) {
    return class extends Base {
        exploding = false;

        defaultConfig: ExplodeOptions = { xmin: -500, xmax: 500, ymin: -600, ymax: -1200 };

        explode(config?: ExplodeOptions) {
            const { xmin, xmax, ymin, ymax, frame } = { ...this.defaultConfig, ...config };

            this.exploding = true;

            this.setCollideWorldBounds(false);

            if (frame !== undefined) {
                this.setFrame(frame);
            }

            const { vx, vy } = { vx: Phaser.Math.RND.between(xmin, xmax), vy: Phaser.Math.RND.between(ymin, ymax) };
            this.setVelocity(vx, vy);
        }
    };
}
