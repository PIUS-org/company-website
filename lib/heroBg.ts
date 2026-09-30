/* =========================================================
   HERO BACKGROUND — cool light fields, isometric grid centred on the mark,
   cursor light, periodic beam. Drawn behind the transparent 3D glass pieces.
   ========================================================= */
import { clamp, lerp, isMobile, RM, FINE, PTR, Rect } from './core';

export type HeroBG = { start(): void; update(t: number, dt: number): void };
export function createHeroBG(rect: () => Rect): HeroBG {
  const hero = document.getElementById('top') as HTMLElement, canvas = document.getElementById('heroGL') as HTMLCanvasElement;
  const gl0 = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, premultipliedAlpha: false });
  if (!gl0) return { update() {}, start() {} };
  const gl: WebGLRenderingContext = gl0;
  const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const FS = `
precision highp float;
uniform vec2 R; uniform float T; uniform vec2 M; uniform vec2 C; uniform float G; uniform float BP; uniform float DPR; uniform float S; uniform float LS; uniform float LR;
const vec3 ICE = vec3(.75,.84,1.);
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
float lineF(float x, float w){ float f = abs(fract(x) - .5); return smoothstep(.5 - w, .5, f); }
float iso(vec2 q, float w){
  return max(lineF(q.x, w), max(lineF(dot(q, vec2(.8660254, .5)), w), lineF(dot(q, vec2(-.8660254, .5)), w)));
}
void main(){
  vec2 p0 = vec2(gl_FragCoord.x, R.y - gl_FragCoord.y);
  /* convex lens under the cursor: content inside is magnified, the surface catches light */
  vec2 dv = p0 - M; float r = length(dv) / LR;
  float inside = LS * (1. - step(1., r));
  vec2 p = M + dv * mix(1., .46 + .54 * r * r, inside);
  vec2 q = p / R.y; float asp = R.x / R.y;
  vec3 c = vec3(.004, .006, .009);
  vec2 a1 = vec2(asp * .74 + .09 * sin(T * .11), .30 + .07 * cos(T * .09));
  vec2 a2 = vec2(asp * .40 + .16 * cos(T * .07), .98 + .05 * sin(T * .13));
  vec2 a3 = vec2(asp * .95 + .05 * sin(T * .05), .80 + .06 * cos(T * .08));
  c += ICE * .13 * exp(-dot(q - a1, q - a1) * 6.5);
  c += vec3(1.) * .025 * exp(-dot(q - a2, q - a2) * 3.2);
  c += ICE * .05 * exp(-dot(q - a3, q - a3) * 9.);
  vec2 m = M / R.y;
  c += ICE * .09 * exp(-dot(q - m, q - m) * 12.);
  vec2 gq = (p - C) / G;
  float fall = exp(-dot((p - C) / R.y, (p - C) / R.y) * 2.6);
  c += vec3(.8, .88, 1.) * iso(gq, 1.1 / G * DPR) * (.09 * fall + .16 * inside);
  vec2 dir = normalize(vec2(.82, .57));
  float d = dot(q, dir) - (BP * (asp + 1.6) - .7);
  c += ICE * (exp(-d * d * 90.) + .35 * exp(-d * d * 7.)) * .07;
  if (inside > 0.) {
    float z = sqrt(max(0., 1. - r * r));
    vec3 n = normalize(vec3(dv / LR, z + .001));
    float sp = pow(max(dot(n, normalize(vec3(-.45, -.55, .7))), 0.), 24.);
    c *= 1. - .3 * smoothstep(.55, 1., r) * inside;
    c += ICE * .05 * z * inside;
    c += vec3(1.) * sp * .22 * inside;
  }
  float ring = LS * exp(-pow((r - 1.) * 26., 2.));
  c += ICE * ring * .2;
  c *= 1. - S * .55;
  c += (hash(p + fract(T)) - .5) / 255.;
  gl_FragColor = vec4(c, 1.);
}`;
  const sh = (t: number, src: string): WebGLShader | null => { const s = gl.createShader(t); if (!s) return null; gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; };
  const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return { update() {}, start() {} };
  const prog = gl.createProgram() as WebGLProgram; gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aL = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(aL); gl.vertexAttribPointer(aL, 2, gl.FLOAT, false, 0, 0);
  const U: Record<string, WebGLUniformLocation | null> = {}; ['R', 'T', 'M', 'C', 'G', 'BP', 'DPR', 'S', 'LS', 'LR'].forEach(k => U[k] = gl.getUniformLocation(prog, k));
  let dpr = Math.min(devicePixelRatio || 1, isMobile() ? 1.5 : 1.5), W = 0, H = 0, started = false, t0 = 0;
  const m = { x: 0, y: 0 }; let ls = 0;
  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    dpr = Math.min(dpr, Math.sqrt(2.4e6 / Math.max(1, w * h)));
    const nw = Math.round(w * dpr), nh = Math.round(h * dpr);
    if (nw === W && nh === H) return;
    W = nw; H = nh; canvas.width = W; canvas.height = H; gl.viewport(0, 0, W, H);
  }
  return {
    start() { started = true; t0 = performance.now() / 1000; canvas.classList.add('is-on'); },
    update(t: number, dt: number) {
      if (!started || document.hidden) return;
      const sy = scrollY, vh = hero.clientHeight || innerHeight;
      if (sy > vh * 1.05) return;
      resize();
      const r = rect();
      const idle = !PTR.active || performance.now() - PTR.t > 4000;
      const tx = idle ? r.cx + Math.cos(t * .23) * r.s * .6 : PTR.x, ty = idle ? r.cy + Math.sin(t * .31) * r.s * .45 : PTR.y;
      const k = 1 - Math.pow(.02, dt);
      m.x = lerp(m.x || tx, tx, k); m.y = lerp(m.y || ty, ty, k);
      const tt = RM ? 20 : t;
      gl.uniform2f(U.R, W, H); gl.uniform1f(U.T, tt);
      gl.uniform2f(U.M, m.x * dpr, m.y * dpr);
      gl.uniform2f(U.C, r.cx * dpr, (r.cy - sy * .35) * dpr);
      gl.uniform1f(U.G, Math.max(34, r.s * .17) * dpr);
      gl.uniform1f(U.BP, RM ? .5 : (((t - t0 + 1) / 13) % 1));
      gl.uniform1f(U.DPR, dpr);
      gl.uniform1f(U.S, clamp(sy / vh));
      /* lens: on while the pointer is over the hero (touch: briefly after a touch) */
      const over = PTR.active && !idle && PTR.y + sy < vh && (FINE || performance.now() - PTR.t < 1500);
      ls = 0; void over; /* lens now lives on the headline, not the background */
      gl.uniform1f(U.LS, ls);
      gl.uniform1f(U.LR, Math.min(210, Math.max(120, hero.clientWidth * .12)) * dpr);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}
