import { Preloader } from "../scenes/Preloader";
import { Pos, Segment, asVector, createSegment, pointAt, segmentAsVector } from "./utils";

type LightningBoltOptions = {
    sway?: number;
    maxFork?: number;
    forkProb?: number;
    generations?: number;
};
type LightningDrawOptions = {
    lightningColor?: number;
    findDestinationTime?: number;
    maxGlow?: number;
    glowDistance?: number;
    strikeTime?: number;
    shakeIntensity?: number;
};

const defaultLightningBoltOptions: Required<LightningBoltOptions> = {
    sway: 35,
    maxFork: 3,
    forkProb: 0.9,
    generations: 5,
};
const defaultLightningDrawOptions: Required<LightningDrawOptions> = {
    lightningColor: 0xffffdd,
    findDestinationTime: 300,
    maxGlow: 50,
    glowDistance: 20,
    strikeTime: 1_000,
    shakeIntensity: 0.005,
}

export class Lightning {
    private g: Phaser.GameObjects.Graphics;
    private strikeSound: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;

    constructor(private scene: Phaser.Scene) {
        this.g = this.scene.add.graphics();
        this.strikeSound = this.scene.sound.add(Preloader.sounds.lightning);
    }

    addLightning(from: Pos, to: Pos, options?: { creation: LightningBoltOptions; rendering: LightningDrawOptions }): void {
        // Create lightning segments
        const creationOptions = { ...defaultLightningBoltOptions, ...options?.creation };
        const segments = this.createLightningBolts(from, to, creationOptions);

        // Order by distance from source
        const distanceFromSource = (segment: Segment): number => asVector(segment.a).distance(from);
        segments.sort((a, b) => distanceFromSource(a) - distanceFromSource(b));

        // Draw
        const renderingOptions = { ...defaultLightningDrawOptions, ...options?.rendering };
        this.drawLightning(segments, renderingOptions);
    }

    private drawLightning(segments: Segment[], options: Required<LightningDrawOptions>): void {
        const { findDestinationTime, glowDistance, lightningColor, maxGlow, shakeIntensity, strikeTime } = options;
        
        this.g.clearAlpha();
        this.g.clear();
        this.g.postFX.clear();

        const drawSegment = (segment: Segment): void => {
            const width = 2 - 0.2*(segment.type);
            const alpha = 1 - 0.2*(segment.type);
            this.g.lineStyle(width, lightningColor, alpha);
            
            this.g.beginPath();
            this.g.moveTo(segment.a.x, segment.a.y);
            this.g.lineTo(segment.b.x, segment.b.y);
            this.g.strokePath();
        };

        const drawAllSegments = (predicate: (segment: Segment) => boolean): void => {
            for (const segment of segments.filter(predicate)) {
                drawSegment(segment);
            }
        }

        const lightningStrike = () => {
            this.g.clear();
            drawAllSegments(s => s.type === 0);
            this.scene.cameras.main.shake(strikeTime, shakeIntensity);
            this.strikeSound.play();
            const glow = this.g.postFX.addGlow(lightningColor, maxGlow, undefined, undefined, undefined, glowDistance);

            this.scene.tweens.addCounter({
                from: maxGlow,
                to: 0,
                duration: strikeTime,
                onUpdate: (tween) => glow.outerStrength = tween.getValue(),
                onComplete: () => this.g.clear(),
            });
        };

        // Draw lightning branches sequentially from source to destination,
        // then strike main bolt connecting source and destination.
        let segmentsDrawnIndex = 0;
        this.scene.tweens.addCounter({
            from: 0,
            to: segments.length - 1,
            duration: findDestinationTime,
            onUpdate: (tween) => {
                const value = Math.round(tween.getValue());
                for (let index=segmentsDrawnIndex; index<value; index++) {
                    const segment = segments[index];
                    drawSegment(segment);
                }
                segmentsDrawnIndex = value;
            },
            onComplete: () => lightningStrike(),
        });
    }

    private createLightningBolts(from: Pos, to: Pos, options: Required<LightningBoltOptions>): Segment[] {
        // Main bolt
        const segments = this.createLightningBolt(from, to, options);

        // Add major branches origination close to the root
        const perp = asVector(from).subtract(asVector(to)).normalizeLeftHand().normalize();
        const radius = 100;
        const center = asVector(to).add(asVector(from).subtract(asVector(to)).normalize().scale(radius));

        const createBranch = (startFrom: Pos, side: "left" | "right"): Segment[] => {
            const endAt = center.clone().add(perp.clone().scale(side === "left" ? radius : -radius));
            const mb = this.createLightningBolt(startFrom, endAt, options);
            mb.forEach(segment => segment.type++);
            return mb;
        };

        segments.push(...createBranch(segments[0].b, "left"));
        segments.push(...createBranch(segments[1].b, "right"));

        return segments;
    }

    private createLightningBolt(from: Pos, to: Pos, options: Required<LightningBoltOptions>): Segment[] {
        const { sway, maxFork, forkProb, generations } = options;

        let segments: Segment[] = [createSegment(from, to)];

        let offset = sway;
        for (let generation=0; generation<generations; generation++) {

            const updatedSegments: Segment[] = [];
            for (const segment of segments) {
                const normal = segmentAsVector(segment).normalize();
                const perp = normal.normalizeRightHand();
                
                // Split segment S from A->B at point T into S1 = A->T and S2 = T->B
                // where T is along the perpendicular vector of A->B from some point sT along S.
                const t = Phaser.Math.RND.realInRange(0.4, 0.6);
                const sT = pointAt(segment, t);

                const pT = asVector(sT).add(perp.scale(Phaser.Math.RND.realInRange(-offset, offset)));
                
                const s1 = createSegment(segment.a, pT, segment.type);
                const s2 = createSegment(pT, segment.b, segment.type);
                updatedSegments.push(s1, s2);

                // Fork
                const fork = segment.type + 1;
                if (fork < maxFork && Math.random() <= forkProb) {
                    // Add segment from pT to X tangent to s1 with same length as s2
                    const v_s2 = segmentAsVector(s2);
                    const v_s1 = segmentAsVector(s1);
                    const length = v_s2.length();
                    const tangent = v_s1.clone().normalize();   
                    const pX = pT.clone().add(tangent.rotate(Phaser.Math.RND.realInRange(-Math.PI/8, Math.PI/8)).scale(0.7 * length));
                    const s3 = createSegment(pT, pX, fork);

                    updatedSegments.push(s3);
                }
            }
            
            segments = [...updatedSegments];
            offset /= 2;
        }

        return segments;
    }
}