type Pos = { x: number; y: number };
type SegmentType = number;
type Segment = { a: Pos; b: Pos; type: SegmentType; };

const createSegment = (a: Pos, b: Pos, type: SegmentType = 0): Segment => ({ a: { x: a.x, y: a.y }, b: { x: b.x, y: b.y }, type });
const asVector = (p: Pos): Phaser.Math.Vector2 => new Phaser.Math.Vector2(p.x, p.y);
const segmentAsVector = (s: Segment): Phaser.Math.Vector2 => asVector(s.b).subtract(asVector(s.a));
const pointAt = (s: Segment, t: number): Pos => Phaser.Math.LinearXY(asVector(s.a), asVector(s.b), t);

const pointToString = (p: Pos): string => `(${Math.round(p.x)}, ${Math.round(p.y)})`;
const segToString = (s: Segment, withType = false): string => `${pointToString(s.a)}->${pointToString(s.b)}` + (withType ? ` (${s.type})` : "");

type LightningOptions = {
    from: Pos;
    to: Pos;
    sway?: number;
    maxFork?: number;
    forkProb?: number;
    generations?: number;
};

const defaultLightningOptions: Required<Omit<LightningOptions, "from" | "to">> = {
    sway: 35,
    maxFork: 3,
    forkProb: 0.9,
    generations: 5,
};

type LightningTree = {
    segment: Segment;
    next: LightningTree | null;
    fork: LightningTree | null;
}

export class Lightning {
    private g: Phaser.GameObjects.Graphics;

    constructor(private scene: Phaser.Scene) {
        this.g = this.scene.add.graphics();
    }

    createLightning(options: LightningOptions): void {
        const optionValues = options = { ...defaultLightningOptions, ...options };
        const segments = this.createLightningBoltSegments(optionValues);

        const { from, to } = options;
        const perp = asVector(from).subtract(asVector(to)).normalizeLeftHand().normalize();
        const radius = 100;
        const center = asVector(to).add(asVector(from).subtract(asVector(to)).normalize().scale(radius));
        
        // Major branch 1
        const mb1_start = segments[0].b;
        const mb1_end = center.clone().add(perp.clone().scale(radius));
        const mb1 = this.createLightningBoltSegments({ ...optionValues, from: mb1_start, to: mb1_end });
        mb1.forEach(segment => segment.type++);
        segments.push(...mb1);

        // Major branch 1
        const mb2_start = segments[1].b;
        const mb2_end = center.clone().add(perp.clone().scale(-radius));
        const mb2 = this.createLightningBoltSegments({ ...optionValues, from: mb2_start, to: mb2_end });
        mb2.forEach(segment => segment.type++);
        segments.push(...mb2);

        // TODO: Fix drawing order of segments...
        this.drawLightning(segments);

        // helper 
        // this.g.lineStyle(1, 0xff0000, 1);
        // this.g.strokeCircle(center.x, center.y, radius);
        // this.g.fillStyle(0x00ff00);
        // this.g.fillCircle(mb1_end.x, mb1_end.y, 3);
        // this.g.fillStyle(0x0000ff);
        // this.g.fillCircle(mb2_end.x, mb2_end.y, 3);
    }

    private drawLightning(lightningBoltSegments: Segment[]): void {
        const g = this.g;
        
        g.clearAlpha();
        g.clear();
        g.postFX.clear();

        const lightningColor = 0xffffdd;

        const drawSegment = (segment: Segment): void => {
            const width = 2 - 0.2*(segment.type);
            const alpha = 1 - 0.2*(segment.type);
            g.lineStyle(width, lightningColor, alpha);
            
            g.beginPath();
            g.moveTo(segment.a.x, segment.a.y);
            g.lineTo(segment.b.x, segment.b.y);
            g.strokePath();
        };

        const drawAllSegments = (predicate: (segment: Segment) => boolean): void => {
            for (const segment of lightningBoltSegments.filter(predicate)) {
                drawSegment(segment);
            }
        }

        drawAllSegments(_ => true);

        // const findDestinationTime = 1_500;
        // const maxGlow = 50;

        // let segmentsDrawnIndex = 0;
        // this.scene.tweens.addCounter({
        //     from: 0,
        //     to: lightningBoltSegments.length - 1,
        //     duration: findDestinationTime,
        //     yoyo: false,
        //     repeat: 0,
        //     onUpdate: (tween) => {
        //         const value = Math.round(tween.getValue());
        //         for (let index=segmentsDrawnIndex; index<value; index++) {
        //             const segment = lightningBoltSegments[index];
        //             drawSegment(segment);
        //         }
        //         segmentsDrawnIndex = value;
        //     },
        //     onComplete: () => {
        //         g.clear();
        //         drawAllSegments(s => s.type === 0);

        //         const glow = g.postFX.addGlow(lightningColor, maxGlow, undefined, undefined, undefined, 20);
        //         this.scene.tweens.addCounter({
        //             from: maxGlow,
        //             to: 0,
        //             duration: 1_500,
        //             repeat: 0,
        //             onUpdate: (tween) => {
        //                 glow.outerStrength = tween.getValue();
        //             },
        //         });
        //     }
        // });
    }

    private createLightningBoltSegments(options: Required<LightningOptions>): Segment[] {
        const { from, to, sway, maxFork, forkProb, generations } = options;

        console.log("createLightningBoltSegments(from:", pointToString(from), ", to:", pointToString(to), ")");
        
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

                // console.log("Split S=", segToString(segment), "at pT=", pointToString(pT), "into s1=", segToString(s1), "and s2=", segToString(s2));
                // console.log("  with S originaly divided at point sT=", pointToString(sT), " for t=", t);

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

                    // console.log("  Fork creating segment s3=", segToString(s3), "with fork generation", fork);
                    // console.log("  where |s2|=", length, "(vector s2=",pointToString(v_s2),")");
                    
                    updatedSegments.push(s3);
                }
            }
            
            segments = [...updatedSegments];
            offset /= 2;
        }

        // const treeRoot: LightningTree = { segment: segments[0], next: null, fork: null };
        // for (const segment of segments.slice(1)) {
        // }

        console.log("createLigtningBoltSegments =>", segments.map(s => segToString(s, true)));

        return segments;
    }
}