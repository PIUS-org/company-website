/* =========================================================
   PIUS — shared runtime (client only)
   utils · pointer · scroll/frame engine · scramble · smooth scroll · event bus
   ========================================================= */
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const E = {
  out3: (t: number) => 1 - Math.pow(1 - t, 3),
  out4: (t: number) => 1 - Math.pow(1 - t, 4),
  io3: (t: number) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outExpo: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};
export const isClient = typeof window !== 'undefined';
export const RM = isClient && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const FINE = isClient && matchMedia('(hover: hover) and (pointer: fine)').matches;
export const isMobile = () => innerWidth < 900;
export const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T;
export const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];
const SVGNS = 'http://www.w3.org/2000/svg';
export const svgEl = (tag: string, attrs: Record<string, string | number> = {}, parent?: Element) => {
  const el = document.createElementNS(SVGNS, tag) as SVGElement & SVGGraphicsElement;
  for (const k in attrs) el.setAttribute(k, String(attrs[k]));
  if (parent) parent.appendChild(el);
  return el;
};

/* ---- CSS Modules helpers ----
   c('a b')      → hashed module class names (unknown names, e.g. global state classes, pass through)
   S('.a > .b')  → selector with module class names substituted */
export type Styles = Readonly<Record<string, string>>;
export const mk = (s: Styles) => ({
  c: (names: string) => names.split(/\s+/).filter(Boolean).map(n => s[n] ?? n).join(' '),
  S: (sel: string) => sel.replace(/\.([A-Za-z_][\w-]*)/g, (m, n: string) => (s[n] ? '.' + s[n] : m)),
});

/* ---- event bus (window events) ---- */
export const EV = { resize: 'pius:resize', lang: 'pius:lang', intro: 'pius:intro', toast: 'pius:toast' } as const;
export const emit = (name: string, detail?: unknown) => dispatchEvent(new CustomEvent(name, { detail }));
export const on = (name: string, fn: (e: Event) => void) => { addEventListener(name, fn); return () => removeEventListener(name, fn); };
export const toast = (msg: string) => emit(EV.toast, msg);

/* ---- pointer (shared, smoothed by consumers) ---- */
export const PTR = { x: 0, y: 0, active: false, t: 0 };
let ptrBound = false;
export function bindPointer() {
  if (ptrBound) return; ptrBound = true;
  PTR.x = innerWidth * .6; PTR.y = innerHeight * .4;
  addEventListener('pointermove', e => { PTR.x = e.clientX; PTR.y = e.clientY; PTR.active = true; PTR.t = performance.now(); }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { PTR.active = false; });
}

/* ---- scroll / frame engine ----
   Scenes cache their document offsets; nothing reads layout per frame.
   'pin'  : 0..1 across the sticky travel of the element (needs a child [data-pin])
   'pass' : 0 when the top meets the viewport bottom, 1 when the bottom leaves the top */
export type SceneFn = (p: number, t: number, dt: number, rel: number) => void;
type Scene = { el: HTMLElement; fn: SceneFn; type: 'pin' | 'pass'; onMeasure?: () => void; pin: HTMLElement | null; top: number; h: number; pinH: number; vis: boolean; wasVis?: boolean; dead?: boolean };
type Ticker = { el: HTMLElement | null; fn: (t: number, dt: number) => void; s: Scene | { vis: boolean } | null; dead?: boolean };
export const Engine = (() => {
  const scenes: Scene[] = [], tickers: Ticker[] = [];
  let vh = 0, last = 0, running = false, raf = 0, rT: ReturnType<typeof setTimeout> | undefined;
  function measure() {
    vh = innerHeight;
    const y0 = scrollY;
    for (const s of scenes) {
      const r = s.el.getBoundingClientRect();
      s.top = r.top + y0; s.h = r.height;
      s.pinH = s.pin ? s.pin.getBoundingClientRect().height : vh;
    }
    scenes.forEach(s => s.onMeasure && s.onMeasure());
  }
  function scene(el: HTMLElement, fn: SceneFn, type: 'pin' | 'pass' = 'pass', onMeasure?: () => void) {
    const s: Scene = { el, fn, type, onMeasure, pin: type === 'pin' ? el.querySelector<HTMLElement>('[data-pin]') : null, top: 0, h: 0, pinH: innerHeight, vis: false };
    scenes.push(s);
    if (running) { const r = el.getBoundingClientRect(); s.top = r.top + scrollY; s.h = r.height; s.pinH = s.pin ? s.pin.getBoundingClientRect().height : innerHeight; }
    return () => { s.dead = true; scenes.splice(scenes.indexOf(s), 1); };
  }
  function tick(el: HTMLElement | null, fn: (t: number, dt: number) => void) {
    const k: Ticker = { el, fn, s: null }; tickers.push(k);
    return () => { tickers.splice(tickers.indexOf(k), 1); };
  }
  function frame(now: number) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const t = now / 1000, sy = scrollY;
    for (const s of scenes.slice()) {
      const vis = s.top < sy + vh * 1.15 && s.top + s.h > sy - vh * .15;
      s.vis = vis;
      if (!vis && s.wasVis === false) continue;
      s.wasVis = vis;
      const p = s.type === 'pin' ? clamp((sy - s.top) / Math.max(1, s.h - s.pinH)) : clamp((sy + vh - s.top) / (vh + s.h));
      s.fn(p, t, dt, sy - s.top);
    }
    for (const k of tickers.slice()) {
      if (!k.s) k.s = scenes.find(s => s.el === k.el) || { vis: true };
      if (k.s.vis) k.fn(t, dt);
    }
    raf = requestAnimationFrame(frame);
  }
  const onResize = () => { clearTimeout(rT); rT = setTimeout(() => { measure(); emit(EV.resize); }, 140); };
  let ro: ResizeObserver | null = null;
  return {
    scene, tick, measure,
    start() {
      if (running) return; running = true;
      vh = innerHeight; last = performance.now();
      addEventListener('resize', onResize);
      if ('ResizeObserver' in window) { ro = new ResizeObserver(onResize); ro.observe(document.body); }
      measure(); raf = requestAnimationFrame(frame);
    },
    stop() { running = false; cancelAnimationFrame(raf); removeEventListener('resize', onResize); ro?.disconnect(); },
    get vh() { return vh; },
  };
})();

/* ---- once-in-view ---- */
export function onceInView(el: Element | null, fn: (el: Element) => void, margin = '0px 0px -18% 0px') {
  if (!el) return () => {};
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } }), { rootMargin: margin });
  io.observe(el);
  return () => io.disconnect();
}

/* ---- text scramble (decode) ---- */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_-+=';
const scrRaf = new WeakMap<Element, number>();
export function scramble(el: HTMLElement, to: string, dur = 700) {
  if (RM) { el.textContent = to; return; }
  const from = el.textContent || '';
  const len = Math.max(from.length, to.length);
  const start = performance.now();
  const q = Array.from({ length: len }, (_, i) => ({ s: Math.random() * .4, e: .4 + Math.random() * .6, i }));
  cancelAnimationFrame(scrRaf.get(el) || 0);
  const step = (now: number) => {
    const p = clamp((now - start) / dur);
    let out = '';
    for (const c of q) {
      if (p >= c.e) out += to[c.i] || '';
      else if (p >= c.s) out += to[c.i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      else out += from[c.i] || '';
    }
    el.textContent = out;
    if (p < 1) scrRaf.set(el, requestAnimationFrame(step));
  };
  scrRaf.set(el, requestAnimationFrame(step));
}

/* ---- smooth anchor scrolling ---- */
export const Scroller = (() => {
  let raf = 0;
  function to(y: number, dur?: number) {
    cancelAnimationFrame(raf);
    const y0 = scrollY, dy = y - y0;
    if (RM || Math.abs(dy) < 2) { scrollTo(0, y); return; }
    const d = dur || clamp(Math.abs(dy) / 2.6, 650, 1500);
    const t0 = performance.now();
    const off = () => { removeEventListener('wheel', stop); removeEventListener('touchstart', stop); };
    const stop = () => { cancelAnimationFrame(raf); off(); };
    addEventListener('wheel', stop, { passive: true }); addEventListener('touchstart', stop, { passive: true });
    const step = (now: number) => {
      const p = clamp((now - t0) / d);
      scrollTo(0, y0 + dy * E.io3(p));
      if (p < 1) raf = requestAnimationFrame(step); else off();
    };
    raf = requestAnimationFrame(step);
  }
  function toEl(el: HTMLElement) {
    const hdr = document.getElementById('hdr')?.offsetHeight || 0;
    const y = el.getBoundingClientRect().top + scrollY - (el.id === 'top' ? 0 : hdr - 1);
    to(Math.max(0, el.id === 'top' ? 0 : y));
  }
  return { to, toEl };
})();

/* ---- cross-component registry (hero mark placement, shared by splash / stage / headline) ---- */
export type Rect = { cx: number; cy: number; s: number };
export const Registry: { heroRect: (() => Rect) | null; measureHeroTop: (() => void) | null } = { heroRect: null, measureHeroTop: null };

/** Map class names inside markup built from strings (innerHTML) to CSS-Module names.
    Unknown names (global state classes like is-on / on / done) are kept as they are. */
export const adopter = (s: Styles) => <T extends Element>(root: T): T => {
  const map = (el: Element) => {
    const cl = el.getAttribute('class');
    if (cl) el.setAttribute('class', cl.split(/\s+/).filter(Boolean).map(n => s[n] ?? n).join(' '));
  };
  map(root); root.querySelectorAll('[class]').forEach(map);
  return root;
};

/** className mapper over several CSS Modules (first module that defines the name wins). */
export const cxm = (...mods: Styles[]) => (names: string) =>
  names.split(/\s+/).filter(Boolean).map(n => { for (const m of mods) if (m[n]) return m[n]; return n; }).join(' ');
