// @ts-nocheck — imperative animation logic ported verbatim from the original site (output must stay identical).
//   The exported init() signature is typed; internals are candidates for incremental typing.
/* Integration — legacy → hub → new system → unified data, drawn with scroll. */
import { $, $$, adopter, Engine, E, FINE, PTR, RM, Scroller, clamp, lerp, mk, on, onceInView, range, scramble, svgEl, isMobile, toast, type SceneFn, type Styles } from '@/lib/core';
import { T, L, getLang } from '@/lib/i18n';
import { MARK, MARK_BOX } from '@/lib/logo';

export function initIntegration(host: HTMLElement, st: Styles): () => void {
  void host;
  const { c: cls, S: sel } = mk(st);
  const adopt = adopter(st);
  const offs: (() => void)[] = [];
  const addScene = (el: HTMLElement, fn: SceneFn, type: 'pin' | 'pass' = 'pass', m?: () => void) => { offs.push(Engine.scene(el, fn, type, m)); };
  const addTick = (el: HTMLElement | null, fn: (t: number, dt: number) => void) => { offs.push(Engine.tick(el, fn)); };
  const listen = (n: string, fn: (e: Event) => void) => { offs.push(on(n, fn)); };
  void cls; void sel; void adopt; void addScene; void addTick; void listen;

  const root = $('#bizInt'), box = $('#intg');
  const cube = (cx, cy, s) => {
    const h = s * .577;
    const top = `M${cx} ${cy - s}L${cx + s * .866} ${cy - s / 2}L${cx} ${cy}L${cx - s * .866} ${cy - s / 2}Z`;
    const left = `M${cx - s * .866} ${cy - s / 2}L${cx} ${cy}L${cx} ${cy + s}L${cx - s * .866} ${cy + s / 2}Z`;
    const right = `M${cx + s * .866} ${cy - s / 2}L${cx} ${cy}L${cx} ${cy + s}L${cx + s * .866} ${cy + s / 2}Z`;
    return `<g class="cube"><path class="f1" d="${top}"/><path class="f3" d="${left}"/><path class="f2" d="${right}"/></g>`;
  };
  const db = (cx, cy, w, h) => `<g class="db"><path d="M${cx - w / 2} ${cy - h / 2}v${h}a${w / 2} ${w / 7} 0 0 0 ${w} 0v${-h}"/><ellipse cx="${cx}" cy="${cy - h / 2}" rx="${w / 2}" ry="${w / 7}"/><path d="M${cx - w / 2} ${cy}a${w / 2} ${w / 7} 0 0 0 ${w} 0" fill="none"/></g>`;
  const boxEl = (x, y, w, h, t, s, cls) => `<g class="hidein ${cls === 'new' ? 'nb' : 'lb'}"><rect class="box ${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="12"/><text x="${x + 18}" y="${y + h / 2 + (s ? -2 : 5)}">${t}</text>${s ? `<text class="s" x="${x + 18}" y="${y + h / 2 + 16}">${s}</text>` : ''}</g>`;
  const LEGEN = ['Legacy ERP', 'Accounting', 'External API'];
  const boxT = (x, y, w, h, main, en, cls) => boxEl(x, y, w, h, getLang() === 'en' ? en : main, getLang() === 'en' ? '' : en, cls);
  let sets = [];
  function draw() {
  const LEG = [0, 1, 2].map(i => [T('int.l' + i), LEGEN[i]]);
  /* wide */
  const wide = `<svg class="w" viewBox="0 0 1200 420">
    ${LEG.map((l, i) => boxT(20, 30 + i * 130, 220, 84, l[0], l[1], 'legacy')).join('')}
    ${[0, 1, 2].map(i => `<path class="p-base" d="M240 ${72 + i * 130}C380 ${72 + i * 130} 400 210 480 210"/><path class="p-draw" data-g="0" d="M240 ${72 + i * 130}C380 ${72 + i * 130} 400 210 480 210"/>`).join('')}
    <g class="hub">${cube(540, 210, 62)}<text class="s" x="540" y="310" text-anchor="middle">Integration</text></g>
    <path class="p-base" d="M600 210H760"/><path class="p-draw" data-g="1" d="M600 210H760"/>
    ${boxT(760, 168, 220, 84, T('int.new'), 'New System', 'new')}
    <path class="p-base" d="M980 210H1070"/><path class="p-draw" data-g="2" d="M980 210H1070"/>
    <g class="dbw">${db(1120, 214, 92, 96)}<text class="s" x="1120" y="310" text-anchor="middle">Unified Data</text></g>
  </svg>`;
  /* tall */
  const tall = `<svg class="t" viewBox="0 0 400 820">
    ${LEG.map((l, i) => boxT(20, 10 + i * 96, 200, 72, l[0], l[1], 'legacy')).join('')}
    ${[0, 1, 2].map(i => `<path class="p-base" d="M220 ${46 + i * 96}C320 ${46 + i * 96} 300 330 300 380"/><path class="p-draw" data-g="0" d="M220 ${46 + i * 96}C320 ${46 + i * 96} 300 330 300 380"/>`).join('')}
    <g class="hub">${cube(300, 440, 52)}<text class="s" x="200" y="448" text-anchor="middle">Integration</text></g>
    <path class="p-base" d="M300 500V580"/><path class="p-draw" data-g="1" d="M300 500V580"/>
    ${boxT(190, 580, 200, 72, T('int.new'), 'New System', 'new')}
    <path class="p-base" d="M300 652V700"/><path class="p-draw" data-g="2" d="M300 652V700"/>
    <g class="dbw">${db(300, 750, 84, 70)}<text class="s" x="200" y="760" text-anchor="middle">Unified Data</text></g>
  </svg>`;
  box.innerHTML = wide + tall; adopt(box);
  sets = $$('svg', box).map(svg => {
    const paths = $$(sel('.p-draw'), svg).map(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; return { p, L, g: +p.dataset.g, dots: [0, 1].map(() => svgEl('circle', { class: cls('pk'), r: 2.8 }, svg)) }; });
    return { svg, paths, lb: $$(sel('.lb'), svg), nb: $$(sel('.nb'), svg), db: $(sel('.db'), svg), hub: $(sel('.hub'), svg) };
  });
  }
  draw(); listen('pius:lang', draw);
  const G = [[.12, .38], [.44, .56], [.62, .74]];
  addScene(root, (p, t) => {
    const set = sets[isMobile() ? 1 : 0];
    set.lb.forEach((b, i) => b.classList.toggle('on', p > .06 + i * .03));
    const hubK = E.out3(range(p, .34, .46));
    set.hub.style.opacity = (.25 + hubK * .75).toFixed(3);
    set.hub.style.filter = hubK > .5 ? `drop-shadow(0 0 ${(12 * hubK).toFixed(1)}px rgba(191,214,255,.5))` : '';
    set.nb.forEach(b => b.classList.toggle('on', p > .54));
    set.db.classList.toggle('on', p > .74);
    set.paths.forEach((q, i) => {
      const k = E.io3(range(p, G[q.g][0] + (q.g === 0 ? (i % 3) * .03 : 0), G[q.g][1]));
      q.p.style.strokeDashoffset = (q.L * (1 - k)).toFixed(1);
      q.dots.forEach((d, j) => {
        if (k < 1) { d.style.opacity = 0; return; }
        const u = ((t * .45 + j * .5 + i * .17) % 1);
        const pt = q.p.getPointAtLength(u * q.L);
        d.setAttribute('cx', pt.x.toFixed(1)); d.setAttribute('cy', pt.y.toFixed(1));
        d.style.opacity = Math.sin(u * Math.PI).toFixed(3);
      });
    });
  });

  return () => offs.forEach(f => f());
}
