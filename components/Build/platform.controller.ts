// @ts-nocheck — imperative animation logic ported verbatim from the original site (output must stay identical).
//   The exported init() signature is typed; internals are candidates for incremental typing.
/* Platform — participants orbit a shared core on a 3D disc that tilts toward the cursor. */
import { $, $$, adopter, Engine, E, FINE, PTR, RM, Scroller, clamp, lerp, mk, on, onceInView, range, scramble, svgEl, isMobile, toast, type SceneFn, type Styles } from '@/lib/core';
import { T, L, getLang } from '@/lib/i18n';
import { MARK, MARK_BOX } from '@/lib/logo';

export function initPlatform(host: HTMLElement, st: Styles): () => void {
  void host;
  const { c: cls, S: sel } = mk(st);
  const adopt = adopter(st);
  const offs: (() => void)[] = [];
  const addScene = (el: HTMLElement, fn: SceneFn, type: 'pin' | 'pass' = 'pass', m?: () => void) => { offs.push(Engine.scene(el, fn, type, m)); };
  const addTick = (el: HTMLElement | null, fn: (t: number, dt: number) => void) => { offs.push(Engine.tick(el, fn)); };
  const listen = (n: string, fn: (e: Event) => void) => { offs.push(on(n, fn)); };
  void cls; void sel; void adopt; void addScene; void addTick; void listen;

  const root = $('#bizPlat'), box = $('#plat'), svg = $('#platSvg');
  const A = [[{ ko: '고객', ja: '顧客' }, 'Customer', 0], [{ ko: '파트너', ja: 'パートナー' }, 'Partner', 0], [{ ko: '공급사', ja: 'サプライヤー' }, 'Supplier', 1], [{ ko: '사용자', ja: 'ユーザー' }, 'User', 1], [{ ko: '운영사', ja: '運営会社' }, 'Operator', 0], [{ ko: '관리자', ja: '管理者' }, 'Admin', 1]];
  const rings = [svgEl('path', { class: cls('plat__ring') }, svg), svgEl('path', { class: cls('plat__ring dash') }, svg), svgEl('path', { class: cls('plat__ring') }, svg)];
  const beams = svgEl('g', {}, svg);
  const actors = A.map((a, i) => {
    const el = document.createElement('div'); el.className = cls('actor');
    box.appendChild(el);
    const line = svgEl('line', {}, beams), dot = svgEl('circle', { r: 3 }, beams);
    return { el, line, dot, ring: a[2], base: i / A.length * Math.PI * 2 + a[2] * .5, w: 0, h: 0, x: 0, y: 0, pulse: -1, dir: 1 };
  });
  const label = () => { actors.forEach((a, i) => { a.el.innerHTML = getLang() === 'en' ? A[i][1] : `${A[i][0][getLang()] || A[i][0].ko}<small>${A[i][1]}</small>`; }); W = 0; };
  let W = 0, H = 0, nextPulse = 0;
  const tilt = { yaw: 0, el: 0 };
  label(); listen('pius:lang', label);
  const measure = () => { W = box.clientWidth; H = box.clientHeight; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); actors.forEach(a => { a.w = a.el.offsetWidth; a.h = a.el.offsetHeight; }); };
  listen('pius:resize', () => { W = 0; });
  addScene(root, (p, t, dt) => {
    if (!W) measure();
    const cx = W / 2, cy = H / 2;
    const k = E.out3(range(p, .1, .45));
    const mob = W < 600;
    /* disc orientation: elevation (how open the orbit looks) + yaw (sideways tilt), both follow the cursor */
    const baseEl = mob ? 1.02 : .46, D = Math.PI / 180;
    let ty = Math.sin(t * .35) * 8 * D * (RM ? 0 : 1), te = baseEl;
    if (FINE && PTR.active) {
      const r = box.getBoundingClientRect();
      const mx = clamp((PTR.x - (r.left + r.width / 2)) / (r.width / 2), -1, 1);
      const my = clamp((PTR.y - (r.top + r.height / 2)) / (r.height / 2), -1, 1);
      ty = mx * 22 * D; te = baseEl + my * 12 * D;
    }
    const kk = 1 - Math.pow(.03, dt);
    tilt.yaw = lerp(tilt.yaw, ty, kk); tilt.el = lerp(tilt.el, te, kk);
    const sE = Math.sin(tilt.el), cE = Math.cos(tilt.el), sY = Math.sin(tilt.yaw), cY = Math.cos(tilt.yaw);
    /* point on the orbit (angle a, radius r) → screen x/y + depth (-1 back … 1 front) */
    const P = (a, r) => {
      const x = Math.cos(a) * r, z0 = Math.sin(a) * r;
      const y = z0 * sE, z = z0 * cE;
      return [cx + x * cY + z * sY, cy + y, (-x * sY + z * cY) / r];
    };
    const R = [Math.min(W * (mob ? .27 : .25), H * .75, 360) * (.7 + .3 * k), Math.min(W * (mob ? .45 : .42), H * 1.05, 560) * (.7 + .3 * k)];
    [R[0], (R[0] + R[1]) / 2, R[1]].forEach((r, j) => {
      let d = '';
      for (let i = 0; i <= 72; i++) { const q = P(i / 72 * Math.PI * 2, r); d += (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }
      rings[j].setAttribute('d', d + 'Z');
    });
    svg.style.opacity = k;
    actors.forEach((a, i) => {
      const ang = a.base + t * (a.ring ? -.07 : .1);
      const q = P(ang, R[a.ring]);
      a.x = q[0]; a.y = q[1];
      const depth = (q[2] + 1) / 2;
      const sc = .82 + depth * .26;
      a.el.style.transform = `translate3d(${(a.x - a.w / 2).toFixed(1)}px,${(a.y - a.h / 2).toFixed(1)}px,0) scale(${sc.toFixed(3)})`;
      a.el.style.opacity = (k * (.4 + depth * .6)).toFixed(3);
      a.el.style.zIndex = depth > .5 ? 3 : 1;
      a.line.setAttribute('x1', a.x.toFixed(1)); a.line.setAttribute('y1', a.y.toFixed(1));
      a.line.setAttribute('x2', cx); a.line.setAttribute('y2', cy);
      if (a.pulse >= 0) {
        a.pulse += dt / .9;
        const u = a.dir > 0 ? a.pulse : 1 - a.pulse;
        a.dot.setAttribute('cx', lerp(a.x, cx, u).toFixed(1)); a.dot.setAttribute('cy', lerp(a.y, cy, u).toFixed(1));
        a.dot.style.opacity = Math.sin(clamp(a.pulse) * Math.PI).toFixed(3);
        a.line.style.stroke = `rgba(191,214,255,${(Math.sin(clamp(a.pulse) * Math.PI) * .5).toFixed(3)})`;
        if (a.pulse >= 1) { a.pulse = -1; a.dot.style.opacity = 0; a.line.style.stroke = ''; }
      }
    });
    if (t > nextPulse && k > .5) {
      nextPulse = t + .55 + Math.random() * .5;
      const a = actors[(Math.random() * actors.length) | 0];
      if (a.pulse < 0) { a.pulse = 0; a.dir = Math.random() > .5 ? 1 : -1; }
    }
  });

  return () => offs.forEach(f => f());
}
