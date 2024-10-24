import { v2s } from "./utils";

type Pos = { x: number; y: number };
type SegmentType = "main" | `fork-${number}`;
type Segment = { a: Pos; b: Pos; type: SegmentType; };

const createSegment = (a: Pos, b: Pos, type: SegmentType = "main"): Segment => ({ a: { x: a.x, y: a.y }, b: { x: b.x, y: b.y }, type });
const asVector = (p: Pos): Phaser.Math.Vector2 => new Phaser.Math.Vector2(p.x, p.y);
const segmentAsVector = (s: Segment): Phaser.Math.Vector2 => asVector(s.b).subtract(asVector(s.a));
const pointAt = (s: Segment, t: number): Pos => Phaser.Math.LinearXY(asVector(s.a), asVector(s.b), t);

const pointToString = (p: Pos): string => `(${Math.round(p.x)}, ${Math.round(p.y)})`;
const segToString = (s: Segment, withType = false): string => `${pointToString(s.a)}->${pointToString(s.b)}` + (withType ? ` (${s.type})` : "");

type LightningOptions = {
    from: Pos;
    to: Pos;
    sway?: number;
    forkProb?: number;
    generations?: number;
};

const defaultLightningOptions: Required<Omit<LightningOptions, "from" | "to">> = {
    sway: 80,
    forkProb: 0.4,
    generations: 5,
};

export class Lightning {

    static drawLightning(g: Phaser.GameObjects.Graphics, options: LightningOptions): void {
        const lightningBoltSegments = this.createLightningBoltSegments({ ...options, ...defaultLightningOptions });
        
        g.clearAlpha();
        g.clear();

        const sortOrder: { [K in SegmentType]: number } = {
            main: 1,
            "fork-1": 2,
            "fork-2": 3,
            "fork-3": 4,
        }

        // Sort descending according to sortOrder
        lightningBoltSegments.sort((a, b) => sortOrder[b.type]-sortOrder[a.type]);

        for (const segment of lightningBoltSegments) {
            console.log("Drawing segment", segToString(segment, true));
            switch (segment.type) {
                case "main":
                    g.lineStyle(2, 0xffff00);
                    break;
                case "fork-1":
                    g.lineStyle(1.8, 0xffff00, 0.8);
                    break;
                case "fork-2":
                    g.lineStyle(1.6, 0xffff00, 0.6);
                    break;
                    case "fork-2":
                        g.lineStyle(1.4, 0xffff00, 0.4);
                        break;
            }
            
            g.beginPath();
            g.moveTo(segment.a.x, segment.a.y);
            g.lineTo(segment.b.x, segment.b.y);
            g.strokePath();
            g.closePath();
        }
    }

    private static createLightningBoltSegments(options: Required<LightningOptions>): Segment[] {
        const { from, to, sway, forkProb, generations } = options;

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

                console.log("Split S=", segToString(segment), "at pT=", pointToString(pT), "into s1=", segToString(s1), "and s2=", segToString(s2));
                console.log("  with S originaly divided at point sT=", pointToString(sT), " for t=", t);

                // Fork
                const forkG = segment.type === "main"
                    ? 1
                    : segment.type === "fork-1"
                    ? 2
                    : segment.type === "fork-2"
                    ? 3
                    : null;
                const doFork = Math.random() <= forkProb;
                console.log("fork?", doFork, "(forkG:", forkG, ")");
                if (forkG !== null && doFork) {
                    // Add segment from pT to X tangent to s1 with same length as s2
                    const v_s2 = segmentAsVector(s2);
                    const v_s1 = segmentAsVector(s1);
                    const length = v_s2.length();
                    const tangent = v_s1.clone().normalize();   
                    const pX = pT.clone().add(tangent.rotate(Phaser.Math.RND.realInRange(-Math.PI/8, Math.PI/8)).scale(0.7 * length));
                    const s3 = createSegment(pT, pX, `fork-${forkG}`);

                    console.log("  Fork creating segment s3=", segToString(s3), "with fork generation", forkG);
                    console.log("  where |s2|=", length, "(vector s2=",pointToString(v_s2),")");
                    
                    updatedSegments.push(s3);
                }
            }
            
            segments = [...updatedSegments];
            offset /= 2;
        }

        console.log("createLigtningBoltSegments =>", segments.map(s => segToString(s, true)));

        return segments;
    }
}