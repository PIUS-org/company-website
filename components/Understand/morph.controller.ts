// @ts-nocheck — imperative animation logic ported verbatim from the original site (output must stay identical).
//   The exported init() signature is typed; internals are candidates for incremental typing.
/* Business → Workflow → Information → System particle morph. */
import { $, $$, adopter, Engine, E, FINE, PTR, RM, Scroller, clamp, lerp, mk, on, onceInView, range, scramble, svgEl, isMobile, toast, type SceneFn, type Styles } from '@/lib/core';
import { T, L, getLang } from '@/lib/i18n';
import { MARK, MARK_BOX } from '@/lib/logo';

export function initMorph(host: HTMLElement, st: Styles): () => void {
  void host;
  const { c: cls, S: sel } = mk(st);
  const adopt = adopter(st);
  const offs: (() => void)[] = [];
  const addScene = (el: HTMLElement, fn: SceneFn, type: 'pin' | 'pass' = 'pass', m?: () => void) => { offs.push(Engine.scene(el, fn, type, m)); };
  const addTick = (el: HTMLElement | null, fn: (t: number, dt: number) => void) => { offs.push(Engine.tick(el, fn)); };
  const listen = (n: string, fn: (e: Event) => void) => { offs.push(on(n, fn)); };
  void cls; void sel; void adopt; void addScene; void addTick; void listen;

  const scene = $('#morph'), cv = $('#morphCv'), ctx = cv.getContext('2d');
  const steps = $$('#morphSteps li'), mdesc = $('#morphMdesc'), endEl = $('#morphEnd');
  let W = 0, H = 0, dpr = 1, N = 0, P = [], F = [], box = null, cur = -1;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

  function sampleMark(n, bx) {
    const [BX, BY, BW, BH] = MARK_BOX;
    const S = 260, c = document.createElement('canvas'); c.width = c.height = S;
    const x = c.getContext('2d'); const sc = S * .9 / BH;
    x.setTransform(sc, 0, 0, sc, S / 2 - (BX + BW / 2) * sc, S / 2 - (BY + BH / 2) * sc);
    MARK.forEach(d => x.fill(new Path2D(d)));
    const data = x.getImageData(0, 0, S, S).data, inside = [], edge = [];
    for (let y = 1; y < S - 1; y++) for (let xx = 1; xx < S - 1; xx++) {
      const i = y * S + xx;
      if (data[i * 4 + 3] > 128) {
        const e = data[(i - 1) * 4 + 3] < 128 || data[(i + 1) * 4 + 3] < 128 || data[(i - S) * 4 + 3] < 128 || data[(i + S) * 4 + 3] < 128;
        (e ? edge : inside).push([xx, y]);
      }
    }
    const out = [];
    for (let i = 0; i < n; i++) {
      const src = (i % 5 < 2 ? edge : inside);
      const [px, py] = src[(Math.random() * src.length) | 0];
      out.push([bx.x + bx.w / 2 + (px - S / 2) / S * bx.s, bx.y + bx.h / 2 + (py - S / 2) / S * bx.s]);
    }
    return out;
  }
  function build() {
    const r = cv.getBoundingClientRect(); W = r.width; H = r.height;
    dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const mob = isMobile();
    box = mob ? { x: W * .06, y: H * .26, w: W * .88, h: H * .62 } : { x: W * .40, y: H * .14, w: W * .54, h: H * .74 };
    box.s = Math.min(box.w, box.h) * .92;
    N = mob ? 720 : Math.round(clamp(W * H / 900, 900, 1600));
    const mark = sampleMark(N, box);
    const cols = mob ? 3 : 4, rows = mob ? 7 : 8;
    P = Array.from({ length: N }, (_, i) => {
      const lane = i % 4;
      return {
        c0: [box.x + box.w / 2 + gauss() * box.w * .55, box.y + box.h / 2 + gauss() * box.h * .55],
        ph: Math.random() * 6.28, sp: rnd(.3, .9),
        lane, u: Math.random(), vs: rnd(.03, .07),
        cell: i % (cols * rows), k: Math.floor(i / (cols * rows)),
        m: mark[i], st: Math.random(), ice: Math.random() < .14, sz: rnd(.8, 1.7),
      };
    });
    F = [
      (q, t) => [q.c0[0] + Math.sin(t * q.sp + q.ph) * 14, q.c0[1] + Math.cos(t * q.sp * .8 + q.ph) * 12],
      (q, t) => {
        const u = (q.u + t * q.vs) % 1;
        const x = box.x + u * box.w;
        const base = box.y + box.h * (.2 + q.lane * .2);
        const y = base + Math.sin(u * 6.28 * 1.1 + q.lane * 1.3) * box.h * .07 + Math.sin(q.ph * 3) * 3;
        return [x, y];
      },
      (q, t) => {
        const cw = box.w / cols, ch = box.h / rows;
        const cx = q.cell % cols, cy = Math.floor(q.cell / cols);
        const per = Math.ceil(N / (cols * rows));
        const lineW = cw * (cx === 0 ? .45 : .72);
        const x = box.x + cx * cw + cw * .12 + (q.k / per) * lineW;
        const y = box.y + cy * ch + ch * .5 + (cy === 0 ? -2 : 0);
        return [x, y + Math.sin(t * 2 + q.ph) * .4];
      },
      (q, t) => [q.m[0] + Math.sin(t * .8 + q.ph) * .6, q.m[1] + Math.cos(t * .7 + q.ph) * .6],
    ];
  }
  listen('pius:resize', () => { W = 0; });
  listen('pius:lang', () => { if (cur >= 0) mdesc.textContent = steps[cur].querySelector(sel('.d')).textContent; });
  const KF = [.06, .32, .58, .84];
  addScene(scene, (p, t) => {
    if (!W) build();
    let seg = 0; while (seg < 2 && p > KF[seg + 1]) seg++;
    let f = clamp((p - KF[seg]) / (KF[seg + 1] - KF[seg]));
    f = clamp((f - .18) / .64);
    const step = p < .19 ? 0 : p < .45 ? 1 : p < .71 ? 2 : 3;
    if (step !== cur) {
      cur = step;
      steps.forEach((li, i) => { li.classList.toggle('is-on', i === step); li.classList.toggle('is-past', i < step); });
      mdesc.textContent = steps[step].querySelector(sel('.d')).textContent;
    }
    endEl.classList.toggle('is-on', p > .88);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const A = F[seg], B = F[seg + 1];
    const glow = seg === 2 ? E.out3(f) : 0;
    ctx.fillStyle = 'rgba(238,241,245,.78)';
    const ices = [];
    for (let i = 0; i < N; i++) {
      const q = P[i];
      const ff = RM ? (f > .5 ? 1 : 0) : E.io3(clamp(f * 1.45 - q.st * .45));
      const a = A(q, t), b = B(q, t);
      const x = a[0] + (b[0] - a[0]) * ff, y = a[1] + (b[1] - a[1]) * ff;
      if (q.ice) { ices.push(x, y, q.sz); continue; }
      ctx.fillRect(x, y, q.sz, q.sz);
    }
    ctx.fillStyle = `rgba(191,214,255,${(.8 + glow * .2).toFixed(2)})`;
    ctx.shadowColor = 'rgba(191,214,255,.9)'; ctx.shadowBlur = 6 + glow * 6;
    for (let i = 0; i < ices.length; i += 3) ctx.fillRect(ices[i], ices[i + 1], ices[i + 2] + .6, ices[i + 2] + .6);
    ctx.shadowBlur = 0;
    if (seg === 2 && f > .6) {
      const g = ctx.createRadialGradient(box.x + box.w / 2, box.y + box.h / 2, 0, box.x + box.w / 2, box.y + box.h / 2, box.s * .6);
      g.addColorStop(0, `rgba(191,214,255,${(.08 * (f - .6) / .4).toFixed(3)})`); g.addColorStop(1, 'rgba(191,214,255,0)');
      ctx.fillStyle = g; ctx.fillRect(box.x - 40, box.y - 40, box.w + 80, box.h + 80);
    }
  }, 'pin', () => { W = 0; });

  return () => offs.forEach(f => f());
}
