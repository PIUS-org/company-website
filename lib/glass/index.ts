import { create } from './renderer';

export type Mat3 = number[];
export type PieceXform = { off: [number, number, number] | number[]; m: Mat3 };
export type GlassState = {
  x: number; y: number; size: number;
  yaw: number; pitch: number; roll: number;
  dim: number; grid: number; lens: number;
  mouse: [number, number]; sweep: number; scroll: number;
  pieces: PieceXform[] | null;
  thick?: number;
};
export type GlassPiece = { c: number[]; n: number[]; o: number[]; k: number; w: number; h: number; sx: number; sy: number };
export type GlassAPI = {
  render(time: number, st: GlassState): void;
  resize(w: number, h: number): void;
  viewHalf(): { h: number; w: number };
  pieces: GlassPiece[];
  center: number[];
  dir: number[];
  proj(p: number[]): number[];
  unproj(l: number[]): number[];
  axisAngle(ax: number[], ang: number): Mat3;
  mul(a: Mat3, b: Mat3): Mat3;
  viewToObj(v: number[]): number[];
  logoCenter(): number[];
  resetTiming(): void;
};
export type GlassLogo = { bbox: number[]; pieces: Record<'P' | 'I' | 'U' | 'S', string> };
export type GlassOptions = { mobile?: boolean; accent?: [number, number, number]; quality?: number };

/** Creates the renderer on a canvas. Returns null when WebGL2 is unavailable. */
export function createGlass(canvas: HTMLCanvasElement, logo: GlassLogo, opts: GlassOptions = {}): GlassAPI | null {
  return create(canvas, logo, opts) as GlassAPI | null;
}
