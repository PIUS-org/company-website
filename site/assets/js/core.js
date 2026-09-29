/* =========================================================
   PIUS — core: utils, scroll engine, header, splash
   ========================================================= */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const range = (v, a, b) => clamp((v - a) / (b - a));
const E = {
  out3: t => 1 - Math.pow(1 - t, 3),
  out4: t => 1 - Math.pow(1 - t, 4),
  io3: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outExpo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const isMobile = () => innerWidth < 900;
const SVGNS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}, parent) => {
  const el = document.createElementNS(SVGNS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(el);
  return el;
};
const LOGO = window.__PIUS; // { mark:[d,d,d,d], box:[x,y,w,h] }

/* ---------- pointer (shared, smoothed by consumers) ---------- */
const PTR = { x: innerWidth * .6, y: innerHeight * .4, active: false, t: 0 };
addEventListener('pointermove', e => {
  PTR.x = e.clientX; PTR.y = e.clientY; PTR.active = true; PTR.t = performance.now();
}, { passive: true });
addEventListener('pointerleave', () => { PTR.active = false; });

/* ---------- scroll / frame engine ----------
   Every scene caches its document offset; nothing reads layout per frame. */
const Engine = (() => {
  const scenes = [];
  const tickers = [];
  let sy = scrollY, vh = innerHeight, vw = innerWidth, last = performance.now();
  function measure() {
    vh = innerHeight; vw = innerWidth;
    const y0 = scrollY;
    for (const s of scenes) {
      const r = s.el.getBoundingClientRect();
      s.top = r.top + y0; s.h = r.height;
      s.pinH = s.pin ? s.pin.getBoundingClientRect().height : vh;
    }
    scenes.forEach(s => s.onMeasure && s.onMeasure());
  }
  /** type 'pin': 0..1 across sticky travel. type 'pass': 0 when top hits viewport bottom, 1 when bottom leaves top. */
  function scene(el, fn, type = 'pass', onMeasure) {
    const s = { el, fn, type, onMeasure, pin: type === 'pin' ? el.querySelector('.pin') : null, top: 0, h: 0, pinH: vh, vis: false };
    scenes.push(s);
    return s;
  }
  function tick(el, fn) { tickers.push({ el, fn, s: null }); }
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const t = now / 1000;
    sy = scrollY;
    for (const s of scenes) {
      const vis = s.top < sy + vh * 1.15 && s.top + s.h > sy - vh * .15;
      s.vis = vis;
      if (!vis && s.wasVis === false) continue;
      s.wasVis = vis;
      let p;
      if (s.type === 'pin') p = clamp((sy - s.top) / Math.max(1, s.h - s.pinH));
      else p = clamp((sy + vh - s.top) / (vh + s.h));
      s.fn(p, t, dt, sy - s.top);
    }
    for (const k of tickers) {
      if (!k.s) k.s = scenes.find(s => s.el === k.el) || { vis: true };
      if (k.s.vis) k.fn(t, dt);
    }
    requestAnimationFrame(frame);
  }
  let rT;
  const onResize = () => { clearTimeout(rT); rT = setTimeout(() => { measure(); dispatchEvent(new Event('pius:resize')); }, 140); };
  addEventListener('resize', onResize);
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(document.body);
  return {
    scene, tick, measure,
    start() { measure(); requestAnimationFrame(frame); },
    get vh() { return vh; }, get vw() { return vw; }, get sy() { return sy; },
  };
})();

/* ---------- once-in-view helper ---------- */
function onceInView(el, fn, margin = '0px 0px -18% 0px') {
  if (!el) return;
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } });
  }, { rootMargin: margin });
  io.observe(el);
}

/* ---------- text scramble (decode) ---------- */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_-+=';
function scramble(el, to, dur = 700) {
  if (RM) { el.textContent = to; return; }
  const from = el.textContent;
  const len = Math.max(from.length, to.length);
  const start = performance.now();
  const q = Array.from({ length: len }, (_, i) => ({ s: Math.random() * .4, e: .4 + Math.random() * .6, i }));
  cancelAnimationFrame(el.__scr);
  const step = now => {
    const p = clamp((now - start) / dur);
    let out = '';
    for (const c of q) {
      if (p >= c.e) out += to[c.i] || '';
      else if (p >= c.s) out += (to[c.i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0]);
      else out += from[c.i] || '';
    }
    el.textContent = out;
    if (p < 1) el.__scr = requestAnimationFrame(step);
  };
  el.__scr = requestAnimationFrame(step);
}

/* ---------- smooth anchor scrolling ---------- */
const Scroller = (() => {
  let raf = 0, cancel = null;
  function to(y, dur) {
    cancelAnimationFrame(raf);
    const y0 = scrollY, dy = y - y0;
    if (RM || Math.abs(dy) < 2) { scrollTo(0, y); return; }
    dur = dur || clamp(Math.abs(dy) / 2.6, 650, 1500);
    const t0 = performance.now();
    const stop = () => { cancelAnimationFrame(raf); off(); };
    const off = () => { removeEventListener('wheel', stop); removeEventListener('touchstart', stop); };
    addEventListener('wheel', stop, { passive: true }); addEventListener('touchstart', stop, { passive: true });
    const step = now => {
      const p = clamp((now - t0) / dur);
      scrollTo(0, y0 + dy * E.io3(p));
      if (p < 1) raf = requestAnimationFrame(step); else off();
    };
    raf = requestAnimationFrame(step);
  }
  function toEl(el) {
    const hdr = $('#hdr').offsetHeight;
    const y = el.getBoundingClientRect().top + scrollY - (el.id === 'top' ? 0 : hdr - 1);
    to(Math.max(0, el.id === 'top' ? 0 : y));
  }
  return { to, toEl };
})();

document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const el = id ? document.getElementById(id) : null;
  if (!el) return;
  e.preventDefault();
  Menu.close();
  Scroller.toEl(el);
  if (id === 'contact') setTimeout(() => $('#f-name')?.focus({ preventScroll: true }), 1300);
});

/* ---------- toast ---------- */
const toast = (() => {
  const el = $('#toast'); let t;
  return msg => { el.textContent = msg; el.classList.add('is-on'); clearTimeout(t); t = setTimeout(() => el.classList.remove('is-on'), 2600); };
})();
/* ---------- language: ko / en / ja — switchable at any time, remembered ---------- */
const Lang = (() => {
  const html = document.documentElement;
  function apply(l, announce) {
    if (!LANGS.includes(l)) l = 'ko';
    LANG = l;
    html.lang = l;
    $$('[data-i18n]').forEach(el => { el.textContent = T(el.dataset.i18n); });
    document.title = T('meta.title');
    const md = $('meta[name="description"]'); if (md) md.setAttribute('content', T('meta.desc'));
    $$('[data-lang]').forEach(b => { const on = b.dataset.lang === l; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
    try { localStorage.setItem('pius-lang', l); } catch (e) {}
    dispatchEvent(new Event('pius:lang'));
    setTimeout(() => dispatchEvent(new Event('pius:resize')), 60);
    if (announce) toast({ ko: '한국어', en: 'English', ja: '日本語' }[l]);
  }
  $$('[data-lang]').forEach(b => b.addEventListener('click', () => { if (b.dataset.lang !== LANG) apply(b.dataset.lang, true); Menu.close(); }));
  return { apply };
})();

/* ---------- mobile menu ---------- */
const Menu = (() => {
  const btn = $('#menuBtn'), nav = $('#mnav');
  let open = false;
  const set = v => {
    open = v;
    btn.setAttribute('aria-expanded', v);
    const sr = btn.querySelector('.sr'); sr.dataset.i18n = v ? 'menu.close' : 'menu.open'; sr.textContent = T(sr.dataset.i18n);
    nav.classList.toggle('is-open', v);
    nav.setAttribute('aria-hidden', !v);
    document.documentElement.classList.toggle('is-locked', v);
  };
  btn.addEventListener('click', () => set(!open));
  addEventListener('keydown', e => { if (e.key === 'Escape' && open) set(false); });
  return { close: () => open && set(false) };
})();

/* ---------- header: scrolled state, progress, active section pill ---------- */
const Header = (() => {
  const hdr = $('#hdr'), bar = $('#progBar'), pill = $('.hdr__pill'), links = $$('#hdrNav a');
  const map = [['about', ['#about', '#understand']], ['business', ['#business']], ['process', ['#process']], ['contact', ['#contact']]];
  let current = null, tops = [];
  const measure = () => {
    tops = map.map(([k, sels]) => [k, Math.min(...sels.map(s => $(s).getBoundingClientRect().top + scrollY))]);
    if (current) place(current);
  };
  const place = key => {
    const a = links.find(l => l.dataset.nav === key);
    if (!a) { pill.style.opacity = 0; return; }
    pill.style.opacity = 1;
    pill.style.width = a.offsetWidth + 'px';
    pill.style.transform = `translateX(${a.offsetLeft}px)`;
  };
  addEventListener('pius:resize', measure);
  return {
    measure,
    update(sy) {
      hdr.classList.toggle('is-scrolled', sy > 8);
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${clamp(sy / Math.max(1, max))})`;
      let key = null;
      const probe = sy + innerHeight * .42;
      for (const [k, top] of tops) if (probe >= top) key = k;
      if (key !== current) {
        current = key;
        links.forEach(l => l.classList.toggle('is-active', l.dataset.nav === key));
        place(key);
      }
    },
    show() { hdr.classList.add('is-in'); },
  };
})();

/* ---------- atmosphere: continuous, scroll-linked tone + light drift ---------- */
const Atmos = (() => {
  const g = $('.atmos__glow'), cl = $('.cursor-light');
  let cx = PTR.x, cy = PTR.y;
  return {
    update(sy, dt) {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const d = clamp(sy / max);
      const k = Math.sin(d * Math.PI);            // 0 at top/bottom, 1 mid-page
      const r = Math.round(7 * k), gg = Math.round(9 * k), b = Math.round(13 * k);
      g.style.setProperty('--tone', `rgb(${r},${gg},${b})`);
      const a = sy / innerHeight;
      g.style.setProperty('--ax', (58 + 28 * Math.sin(a * .55)).toFixed(1) + '%');
      g.style.setProperty('--ay', (28 + 22 * Math.cos(a * .42)).toFixed(1) + '%');
      g.style.setProperty('--bx', (30 - 18 * Math.sin(a * .33)).toFixed(1) + '%');
      g.style.setProperty('--ai', (.035 + .03 * k).toFixed(3));
      if (FINE) {
        cx = lerp(cx, PTR.x, 1 - Math.pow(.001, dt)); cy = lerp(cy, PTR.y, 1 - Math.pow(.001, dt));
        cl.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
        cl.classList.toggle('on', PTR.active && sy > innerHeight * .6);
      }
    },
  };
})();

/* ---------- button light follow ---------- */
$$('.btn').forEach(b => b.addEventListener('pointermove', e => {
  const r = b.getBoundingClientRect();
  b.style.setProperty('--mx', (e.clientX - r.left) + 'px');
  b.style.setProperty('--my', (e.clientY - r.top) + 'px');
}));

/* =========================================================
   SPLASH — the mark assembles along its isometric axes,
   a beam passes through it, then it flies into the hero
   and becomes the glass object.
   ========================================================= */
const Splash = (() => {
  const root = $('#splash'), mark = $('#splashMark'), sweep = $('#spSweepRect');
  const pieces = $$('.sp', mark);
  const wm = $('.splash__wm'), tag = $('.splash__tag'), skip = $('#splashSkip');
  const FROM = { u: [-16, 9], bar: [18, -10], s: [16, 9], p: [0, -18] };
  let done = false, exiting = false, onExit = () => {}, anims = [];

  function play(cb) {
    onExit = cb;
    document.documentElement.classList.add('is-locked');
    if (RM) {
      pieces.forEach(g => { $('.sp__fill', g).style.opacity = 1; });
      wm.style.clipPath = 'none'; tag.style.opacity = 1;
      setTimeout(exit, 700);
      return;
    }
    const opt = (d, delay, easing = 'cubic-bezier(.16,1,.3,1)') => ({ duration: d, delay, easing, fill: 'both' });
    pieces.forEach((g, i) => {
      const [x, y] = FROM[g.dataset.k] || [0, 0];
      anims.push(g.animate([{ transform: `translate(${x}px,${y}px)`, opacity: 0 }, { transform: 'translate(0,0)', opacity: 1 }], opt(900, 60 + i * 90)));
      anims.push($('.sp__line', g).animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], opt(900, 60 + i * 90, 'cubic-bezier(.65,0,.35,1)')));
      anims.push($('.sp__fill', g).animate([{ opacity: 0 }, { opacity: 1 }], opt(700, 620 + i * 70)));
    });
    anims.push(sweep.animate([{ transform: 'translateX(-60px)' }, { transform: 'translateX(300px)' }], { duration: 1100, delay: 1050, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'both' }));
    anims.push(wm.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], opt(900, 900, 'cubic-bezier(.65,0,.35,1)')));
    anims.push(tag.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], opt(800, 1300)));
    setTimeout(exit, 2250);
    skip.tabIndex = 0;
    skip.addEventListener('click', exit, { once: true });
    root.addEventListener('click', exit, { once: true });
    addEventListener('keydown', exit, { once: true });
  }

  function exit() {
    if (exiting) return; exiting = true;
    anims.forEach(a => a.finish());
    const target = window.HeroMark ? window.HeroMark.rect() : null;
    root.classList.add('is-out');
    onExit();
    if (target && !RM) {
      const r = mark.getBoundingClientRect();
      const s = target.s / r.height;
      const dx = target.cx - (r.left + r.width / 2), dy = target.cy - (r.top + r.height / 2);
      mark.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) scale(${s})`, opacity: 1, offset: .75 },
        { transform: `translate(${dx}px,${dy}px) scale(${s})`, opacity: 0 },
      ], { duration: 1500, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
      pieces.forEach(g => $('.sp__fill', g).animate([{ opacity: 1 }, { opacity: .12 }], { duration: 1100, delay: 250, easing: 'ease-in-out', fill: 'forwards' }));
    }
    setTimeout(() => { root.classList.add('is-gone'); done = true; }, 1600);
  }
  return { play, get done() { return done; } };
})();
