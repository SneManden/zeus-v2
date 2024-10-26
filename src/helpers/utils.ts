export type Pos = { x: number; y: number };
export type SegmentType = number;
export type Segment = { a: Pos; b: Pos; type: SegmentType; };

export const createSegment = (a: Pos, b: Pos, type: SegmentType = 0): Segment => ({ a: { x: a.x, y: a.y }, b: { x: b.x, y: b.y }, type });
export const asVector = (p: Pos): Phaser.Math.Vector2 => new Phaser.Math.Vector2(p.x, p.y);
export const segmentAsVector = (s: Segment): Phaser.Math.Vector2 => asVector(s.b).subtract(asVector(s.a));
export const pointAt = (s: Segment, t: number): Pos => Phaser.Math.LinearXY(asVector(s.a), asVector(s.b), t);

export const pointToString = (p: Pos): string => `(${Math.round(p.x)}, ${Math.round(p.y)})`;
export const segToString = (s: Segment, withType = false): string => `${pointToString(s.a)}->${pointToString(s.b)}` + (withType ? ` (${s.type})` : "");
