// @ts-nocheck — imperative animation logic ported verbatim from the original site (output must stay identical).
//   The exported init() signature is typed; internals are candidates for incremental typing.
/* How we work — six stages dock onto one organism. */
import { $, $$, adopter, Engine, E, FINE, PTR, RM, Scroller, clamp, lerp, mk, on, onceInView, range, scramble, svgEl, isMobile, toast, type SceneFn, type Styles } from '@/lib/core';
import { T, L, getLang } from '@/lib/i18n';
import { MARK, MARK_BOX } from '@/lib/logo';

export function initProcess(host: HTMLElement, st: Styles): () => void {
  void host;
  const { c: cls, S: sel } = mk(st);
  const adopt = adopter(st);
  const offs: (() => void)[] = [];
  const addScene = (el: HTMLElement, fn: SceneFn, type: 'pin' | 'pass' = 'pass', m?: () => void) => { offs.push(Engine.scene(el, fn, type, m)); };
  const addTick = (el: HTMLElement | null, fn: (t: number, dt: number) => void) => { offs.push(Engine.tick(el, fn)); };
  const listen = (n: string, fn: (e: Event) => void) => { offs.push(on(n, fn)); };
  void cls; void sel; void adopt; void addScene; void addTick; void listen;

  const root = $('#proc'), box = $('#org'), list = $$('#procList li'), mdesc = $('#procMdesc'), fin = $('#procFinal');
  const STG = [['Understand', '요구사항'], ['Plan', '기획·설계'], ['Design', 'UI/UX'], ['Develop', '개발'], ['Deploy', '배포'], ['Stabilize', '안정화']];
  const ROLES = ['기획', '디자인', '개발', '인프라', 'QA', '운영'];
  const C = 300, R = 214;
  const svg = svgEl('svg', { viewBox: '0 0 600 600' }, box);
  svg.innerHTML = `<defs><radialGradient id="coreG"><stop offset="0" stop-color="#bfd6ff" stop-opacity=".35"/><stop offset="1" stop-color="#bfd6ff" stop-opacity="0"/></radialGradient></defs>`;
  const mem2 = svgEl('path', { class: cls('mem2') }, svg);
  const mem = svgEl('path', { class: cls('mem') }, svg);
  const orbit = svgEl('circle', { class: cls('orbit'), cx: C, cy: C, r: R }, svg);
  const mesh = svgEl('g', { class: cls('mesh') }, svg);
  const spokes = svgEl('g', {}, svg);
  const arc = svgEl('circle', { class: cls('arc'), cx: C, cy: C, r: R, transform: `rotate(-90 ${C} ${C})` }, svg);
  const CIRC = 2 * Math.PI * R; arc.style.strokeDasharray = `0 ${CIRC}`;
  const glow = svgEl('circle', { class: cls('core-glow'), cx: C, cy: C, r: 120 }, svg);
  const [BX, BY, BW, BH] = MARK_BOX; const ms = 86 / BH;
  const core = svgEl('g', { transform: `translate(${C - BW * ms / 2} ${C - BH * ms / 2}) scale(${ms}) translate(${-BX} ${-BY})` }, svg);
  MARK.forEach(d => svgEl('path', { d, fill: 'rgba(255,255,255,.10)', stroke: 'rgba(191,214,255,.85)', 'stroke-width': 1 / ms * 1.1 }, core));
  const roleEls = ROLES.map(r => { const e = svgEl('text', { class: cls('role') }, svg); e.textContent = r; return e; });
  const pairs = [];
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) pairs.push([i, j, svgEl('line', {}, mesh)]);
  const sp = STG.map(() => svgEl('line', { class: cls('spoke'), x1: C, y1: C }, spokes));
  const nodes = STG.map((s, i) => {
    const g = svgEl('g', { class: cls('nd') }, svg);
    svgEl('circle', { class: cls('h'), r: 44 }, g);
    svgEl('circle', { class: cls('b'), r: 38 }, g);
    const a = svgEl('text', { y: -2, class: 'e' }, g); a.textContent = s[0];
    const b = svgEl('text', { class: cls('k'), y: 15 }, g); b.textContent = s[1];
    g.__k = b; g.__i = i;
    return { g, ang: -Math.PI / 2 + i * Math.PI / 3, x: C, y: C };
  });
  const pulse = svgEl('circle', { class: cls('pulse'), r: 3.5 }, svg);
  const blob = (r, t, amp) => {
    let d = '';
    for (let i = 0; i <= 64; i++) {
      const a = i / 64 * Math.PI * 2;
      const rr = r * (1 + amp * Math.sin(3 * a + t * .9) + amp * .7 * Math.sin(5 * a - t * 1.3) + amp * .4 * Math.sin(2 * a + t * .5));
      d += (i ? 'L' : 'M') + (C + Math.cos(a) * rr).toFixed(1) + ' ' + (C + Math.sin(a) * rr).toFixed(1);
    }
    return d + 'Z';
  };
  let cur = -1;
  listen('pius:lang', () => { if (cur >= 0) mdesc.textContent = list[cur].querySelector(sel('.d')).textContent; });
  const setM = () => {
    const m = isMobile(); box.classList.toggle('is-m', m);
    nodes.forEach(n => { const [h, b] = n.g.querySelectorAll('circle'); h.setAttribute('r', m ? 56 : 44); b.setAttribute('r', m ? 50 : 38); n.g.querySelector(sel('.e')).setAttribute('y', m ? 7 : -2); });
  };
  setM(); listen('pius:resize', setM);
  const relabel = () => {
    nodes.forEach((n, i) => { n.g.__k.textContent = T('p.n' + i); });
    const rs = T('p.roles').split(','); roleEls.forEach((e, i) => { e.textContent = rs[i]; });
    box.classList.toggle('no-k', getLang() === 'en');
  };
  relabel(); listen('pius:lang', relabel);
  addScene(root, (p, t) => {
    const s = clamp((p - .04) / .78) * 6;
    const act = Math.min(5, Math.floor(s));
    if (act !== cur) {
      cur = act;
      list.forEach((li, i) => { li.classList.toggle('is-on', i === act); li.classList.toggle('is-past', i < act); });
      mdesc.textContent = list[act].querySelector(sel('.d')).textContent;
    }
    const final = p > .86;
    fin.classList.toggle('on', final);
    const docked = nodes.map((n, i) => E.out3(clamp(s - i)));
    const total = docked.reduce((a, b) => a + b, 0) / 6;
    mem.setAttribute('d', blob(lerp(70, R + 58, E.out3(total)), t, final ? .018 : .026));
    mem2.setAttribute('d', blob(lerp(90, R + 84, E.out3(total)), t * .7 + 2, .02));
    glow.setAttribute('r', (110 + total * 70 + (final ? Math.sin(t * 2) * 8 : 0)).toFixed(1));
    glow.style.opacity = (.5 + total * .5).toFixed(3);
    arc.style.strokeDasharray = `${(CIRC * clamp(s / 6)).toFixed(1)} ${CIRC}`;
    nodes.forEach((n, i) => {
      const k = docked[i];
      const rr = lerp(R + 200, R, k), a = n.ang - (1 - k) * .6;
      n.x = C + Math.cos(a) * rr; n.y = C + Math.sin(a) * rr;
      n.g.setAttribute('transform', `translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`);
      n.g.style.opacity = clamp(k * 1.4).toFixed(3);
      n.g.classList.toggle('on', i === act || final);
      sp[i].setAttribute('x2', n.x.toFixed(1)); sp[i].setAttribute('y2', n.y.toFixed(1));
      sp[i].style.opacity = (k * (final ? .9 : .5)).toFixed(3);
      const ra = n.ang + Math.PI / 6 + t * .08, rr2 = 118 + Math.sin(t * .6 + i) * 6;
      roleEls[i].setAttribute('x', (C + Math.cos(ra) * rr2).toFixed(1));
      roleEls[i].setAttribute('y', (C + Math.sin(ra) * rr2 + 4).toFixed(1));
      roleEls[i].style.opacity = (k * .9).toFixed(3);
    });
    pairs.forEach(([i, j, l]) => {
      const k = Math.min(docked[i], docked[j]);
      l.setAttribute('x1', nodes[i].x.toFixed(1)); l.setAttribute('y1', nodes[i].y.toFixed(1));
      l.setAttribute('x2', nodes[j].x.toFixed(1)); l.setAttribute('y2', nodes[j].y.toFixed(1));
      l.style.opacity = (k * (final ? .8 : .45)).toFixed(3);
    });
    const span = clamp(s / 6) * Math.PI * 2;
    const pa = -Math.PI / 2 + ((t * .9) % Math.max(.001, span));
    pulse.setAttribute('cx', (C + Math.cos(pa) * R).toFixed(1)); pulse.setAttribute('cy', (C + Math.sin(pa) * R).toFixed(1));
    pulse.style.opacity = s > .3 ? 1 : 0;
  }, 'pin');

  return () => offs.forEach(f => f());
}
