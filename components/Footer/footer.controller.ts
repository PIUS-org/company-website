// @ts-nocheck — imperative animation logic ported verbatim from the original site (output must stay identical).
//   The exported init() signature is typed; internals are candidates for incremental typing.
/* Footer — extruded wordmark; depth follows the cursor, light sweeps the face. */
import { $, $$, adopter, Engine, E, FINE, PTR, RM, Scroller, clamp, lerp, mk, on, onceInView, range, scramble, svgEl, isMobile, toast, type SceneFn, type Styles } from '@/lib/core';
import { T, L, getLang } from '@/lib/i18n';
import { MARK, MARK_BOX } from '@/lib/logo';

export function initFooter(host: HTMLElement, st: Styles): () => void {
  void host;
  const { c: cls, S: sel } = mk(st);
  const adopt = adopter(st);
  const offs: (() => void)[] = [];
  const addScene = (el: HTMLElement, fn: SceneFn, type: 'pin' | 'pass' = 'pass', m?: () => void) => { offs.push(Engine.scene(el, fn, type, m)); };
  const addTick = (el: HTMLElement | null, fn: (t: number, dt: number) => void) => { offs.push(Engine.tick(el, fn)); };
  const listen = (n: string, fn: (e: Event) => void) => { offs.push(on(n, fn)); };
  void cls; void sel; void adopt; void addScene; void addTick; void listen;

  const ftr = $('#ftr'), g = $('#ftrG'), big = $(sel('.ftr__big')), ext = $('#ftrExt');
  const N = 12, layers = [];
  for (let i = N; i >= 1; i--) {
    const u = svgEl('use', { href: '#ftrW' }, ext);
    const k = 1 - i / N;                      /* 0 = far, 1 = near */
    const c = Math.round(8 + k * 22);
    u.setAttribute('fill', `rgb(${c},${c + 2},${c + 5})`);
    layers.push([u, i]);
  }
  const d = { x: .2, y: .28 };
  addScene(ftr, (p, t, dt) => {
    const x = ((t * 38) % 330) - 70;
    g.setAttribute('x1', x.toFixed(1)); g.setAttribute('x2', (x + 60).toFixed(1));
    big.style.transform = `translate3d(0,${((1 - E.out3(clamp(p * 1.6))) * 60).toFixed(1)}px,0)`;
    /* extrusion direction: away from the cursor, like a light-facing slab */
    let tx = .2, ty = .28;
    if (FINE && PTR.active) { tx = .2 - (PTR.x / innerWidth - .5) * .34; ty = .28 - (PTR.y / innerHeight - .5) * .22; }
    else if (!RM) { tx = .2 + Math.sin(t * .4) * .08; }
    const k = 1 - Math.pow(.02, dt);
    d.x = lerp(d.x, tx, k); d.y = lerp(d.y, ty, k);
    const depth = E.out3(clamp(p * 1.4));
    layers.forEach(([u, i]) => u.setAttribute('transform', `translate(${(d.x * i * depth).toFixed(2)} ${(d.y * i * depth).toFixed(2)})`));
  });

  return () => offs.forEach(f => f());
}
