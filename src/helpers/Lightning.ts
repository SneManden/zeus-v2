import { v2s } from "./utils";

type Pos = { x: number; y: number };

type LightningOptions = {
    from: Pos;
    to: Pos;
    segments?: number;
    width?: number;
    minSegmentLength?: number;
    segmentZigZagPotential?: number;
};

const defaultLightningOptions: Required<Omit<LightningOptions, "from" | "to">> = {
    segments: 20,
    width: 200,
    minSegmentLength: 20,
    segmentZigZagPotential: 50,
};

export class Lightning {

    static drawLightning(g: Phaser.GameObjects.Graphics, options: LightningOptions): void {
        const { from, to, segments, width, minSegmentLength, segmentZigZagPotential } = { ...options, ...defaultLightningOptions };
        // const { width: screenWidth, height: screenHeight } = SceneHelper.GetScreenSize(g.scene);
        
        g.clearAlpha();
        g.clear();
        
        g.lineStyle(3, 0xffffff);

        let { x, y } = from;

        const distanceY = to.y - from.y;

        const v_from = new Phaser.Math.Vector2(from);
        const v_to = new Phaser.Math.Vector2(to);

        console.log("drawLightning(g, options: { from:", v2s(from), ", to:", v2s(to), " })", { segments, width, minSegmentLength, segmentZigZagPotential });

        const widthAtY = (yy: number): { min: number, max: number } => {
            const lerp = v_from.lerp(v_to, yy / distanceY);
            return { min: lerp.x - width/2, max: lerp.x + width/2 };
        };

        const isLastIteration = (i: number) => i === segments - 1;

        // Segment
        for (let i=0; i<segments; i++) {
            g.beginPath();
            g.moveTo(x, y);

            // Set new x
            const downPercentage = (y - from.y) / (distanceY - from.y);
            const lerpX = v_from.lerp(v_to, downPercentage).x; // x position on line from 'from' to 'to' at current y

            const xDist = x - lerpX; // positive if lightning is to the right of straight line

            console.log("[",i,"] at x=",x," y=", y, ": downFrac", Phaser.Math.RoundTo(downPercentage,-2), ", lerpX", lerpX, ", xDist", xDist);
            
            const zigZagPotential_i = segmentZigZagPotential * (1- downPercentage);
            const xDist_i = xDist * downPercentage;
            if (xDist > 0) {
                console.log("  x += rnd in [",-zigZagPotential_i,", ",zigZagPotential_i - xDist_i,"]")
                x += Math.round(Phaser.Math.RND.realInRange(-zigZagPotential_i, zigZagPotential_i - xDist_i));
            } else {
                console.log("  x += rnd in [",-zigZagPotential_i - xDist_i,", ",zigZagPotential_i,"]")
                x += Math.round(Phaser.Math.RND.realInRange(-zigZagPotential_i - xDist_i, zigZagPotential_i));
            }
            // const { min, max } = widthAtY(y);
            // x = Phaser.Math.Clamp(x, min, max);

            // Set new y
            y += Math.round(Phaser.Math.RND.realInRange(minSegmentLength, distanceY / segments));
            if (y >= to.y || isLastIteration(i)) {
                y = to.y;
            }

            g.lineTo(x, y);
            g.strokePath();

            if (y === to.y) {
                break;
            }
        }        
    }


	// createLightning(distance) {
	// 	console.log("Lightning!");
	// 	let ctx = this.lightningBitmap.context,
	// 		width = this.lightningBitmap.width,
	// 		height = this.lightningBitmap.height;

	// 	ctx.clearRect(0, 0, width, height);

	// 	// TODO: create from bottom

	// 	let x = width/2,
	// 		y = 0,
	// 		segments = 20;

	// 	for (var i=0; i<segments; i++) {
	// 		ctx.strokeStyle = 'rgb(255,255,255)';
	// 		ctx.lineWidth = 3;
	// 		ctx.beginPath();
	// 		ctx.moveTo(x, y);

	// 		x += this.game.rnd.between(-30, 30);
	// 		if (x < 10) x = 10;
	// 		if (x > width-10) x = width-10;

	// 		y += this.game.rnd.between(20, height/segments);
	// 		if (i == segments-1 || y > distance)
	// 			y = distance;

	// 		ctx.lineTo(x, y);
	// 		ctx.stroke();

	// 		if (y >= distance)
	// 			break;
	// 	}

	// 	this.lightningBitmap.dirty = true; // update texture cache
	// }
    
}