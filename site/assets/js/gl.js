/* =========================================================
   3D STAGE — fixed background from the hero to just before
   the industry scene.
   The PIUS mark is rebuilt as a real cube: P and I on the top
   face, U on the left, S on the right (glass slabs, raymarched).
   · hero: the assembled cube turns toward the cursor
   · about: P / I / U / S break away and drift on their own orbits
   · understand: they come back together and the cube rotates
   · industry: the stage fades out
   ========================================================= */
const HeroMark = (() => {
  const hero = $('#top'), canvas = $('#bgGL'), fb = $('#heroFallback');
  const content = $('.hero__content'), foot = $('.hero__foot');
  const title = $('.hero__title');
  let mTop = 0;
  const measureTop = () => { mTop = title.offsetTop + content.offsetTop; };
  measureTop(); addEventListener('pius:resize', measureTop);

  /* hero placement in CSS px (also the splash hand-off target) */
  function rect() {
    const w = hero.clientWidth || innerWidth, h = hero.clientHeight || innerHeight;
    if (w >= 900) { const s = Math.min(h * .6, w * .34); return { cx: w * .72, cy: h * .5 + 16, s }; }
    const hdr = 56, top = mTop || h * .5, room = top - hdr - 20;
    const s = Math.max(90, Math.min(w * .6, h * .32, room * .82));
    return { cx: w * .5, cy: hdr + 10 + room / 2, s };
  }

  let glass = null;
  try {
    const q = +(new URLSearchParams(location.search).get('glq') || 0);
    glass = window.PiusGlass ? window.PiusGlass.create(canvas, window.PIUS_LOGO, { mobile: !FINE || innerWidth < 760, accent: [.75, .84, 1.0], quality: q }) : null;
  } catch (e) { console.warn(e); glass = null; }
  if (!glass) {
    hero.classList.add('no-gl'); canvas.style.display = 'none';
    const place = () => { const r = rect(); Object.assign(fb.style, { width: r.s * .97 + 'px', height: r.s + 'px', left: r.cx - r.s * .485 + 'px', top: r.cy - r.s / 2 + 'px' }); };
    place(); addEventListener('pius:resize', place);
    return { rect, measureTop, start() {}, intro() {}, update() {} };
  }

  const PB = glass.pieces;
  const LOGO_H = (() => { const b = window.PIUS_LOGO.bbox, span = Math.max(b[2] - b[0], b[3] - b[1]) * 1.22; return (b[3] - b[1]) * 2 / span; })();
  const HALF = 1.2;

  /* ---- per-piece layout helpers (from the reference renderer) ---- */
  let TILT = [], SPIN = [], VIEW_UP = [0, 1, 0];
  (function buildLayouts() {
    const v = glass.dir.map(c => -c);
    VIEW_UP = glass.viewToObj([0, 1, 0]);
    TILT = PB.map((P, k) => {
      const n = P.n, ax = [n[1] * v[2] - n[2] * v[1], n[2] * v[0] - n[0] * v[2], n[0] * v[1] - n[1] * v[0]];
      const ang = Math.acos(clamp(n[0] * v[0] + n[1] * v[1] + n[2] * v[2], -1, 1));
      return { ax, ang: ang * (k < 2 ? .72 : .5) };
    });
    SPIN = [[1, .4, .2], [.2, 1, -.5], [-.3, .5, 1], [.8, -.6, .4]];
  })();
  const offTo = (k, tx, ty) => { const lc = glass.logoCenter(), cp = glass.proj(PB[k].c); return glass.unproj([lc[0] + tx - cp[0], lc[1] + ty - cp[1]]); };
  /* scatter anchors (logo units from the stage centre) — each piece gets its own orbit */
  const SCAT = [[-2.35, .95], [2.3, 1.05], [-2.15, -1.0], [2.35, -.9]];
  const ORB = [[.22, .14, .31], [.18, .2, .23], [.25, .12, .19], [.2, .17, .27]];
  function layoutPieces(c, ts, mx, my) {
    if (c.la > .998) return null;
    const out = [], A = innerWidth / innerHeight, ys = clamp(1.3 / A, .9, 2.6), xs = A < 1 ? clamp(A * 1.05, .52, 1) : 1;
    const AA = glass.axisAngle, M = glass.mul;
    for (let k = 0; k < 4; k++) {
      const tsc = E.io3(clamp(c.ls * 1.35 - (k % 2 ? .25 : 0) - k * .06));
      const o = ORB[k];
      const sx = SCAT[k][0] * xs * c.spread + Math.sin(ts * o[2] + k * 1.7) * o[0] * 2;
      const syy = SCAT[k][1] * ys + Math.cos(ts * o[2] * 1.3 + k) * o[1] * 2;
      const sc = offTo(k, sx, syy);
      const travel = Math.sin(Math.PI * tsc);
      const lift = glass.unproj([0, (k % 2 ? -1 : 1) * (.45 + k * .12) * travel]);
      const depth = glass.dir.map(d => d * -1.1 * travel * (k % 2 ? 1 : -1));
      const par = (k % 2 ? 1 : -1) * (.6 + k * .12), loose = 1 - c.la;
      const pm = glass.unproj([mx * .12 * par * loose, my * .09 * par * loose]);
      const off = [0, 1, 2].map(i => sc[i] * tsc + lift[i] + depth[i] + pm[i]);
      let m = AA(TILT[k].ax, TILT[k].ang * tsc);
      m = M(AA(SPIN[k], travel * 2.6 + tsc * (ts * (.22 + k * .05) + k)), m);
      m = M(AA(VIEW_UP, Math.sin(ts * .5 + k * 1.4) * .3 * tsc + mx * .3 * loose), m);
      out.push({ off, m });
    }
    return out;
  }

  /* ---- scroll choreography ---- */
  const KEYS = ['x', 'y', 'size', 'dim', 'grid', 'la', 'ls', 'spread', 'spin', 'live'];
  const S = o => Object.assign({ x: 0, y: 0, size: .5, dim: 1, grid: 1, la: 1, ls: 0, spread: 1, spin: 0, live: 1 }, o);
  let anchors = [], endY = 1e9, W = 0, H = 0;
  function toScene(cx, cy, s, extra) {
    const vw = innerWidth, vh = innerHeight, m = HALF * Math.min(vw / vh, 1);
    const scl = s * 2 * HALF / (vh * LOGO_H);
    /* the renderer positions the cube's 3D centre; shift so the visual centre lands on (cx, cy) */
    const lc = glass.logoCenter();
    return S(Object.assign({ x: (cx - vw / 2) / (vw / 2) + lc[0] * scl / (HALF * vw / vh), y: (vh / 2 - cy) / (vh / 2) + lc[1] * scl / HALF, size: scl * .82 / m }, extra));
  }
  function measure() {
    W = innerWidth; H = innerHeight;
    glass.resize(canvas.clientWidth || W, canvas.clientHeight || H);
    const top = el => el.getBoundingClientRect().top + scrollY;
    const about = top($('#about')), und = top($('#understand')), ind = top($('#ind'));
    const intro = $('.und__intro'), introB = top(intro) + intro.offsetHeight;
    const r = rect(), mob = W < 900;
    const HERO = toScene(r.cx, r.cy, r.s, {});
    const SCAT_ = toScene(W / 2, H / 2, mob ? r.s * .62 : r.s * .46, { dim: .34, grid: .32, la: 0, ls: 1, spread: mob ? 1 : 1.45, live: .6 });
    const REASM = toScene(mob ? W / 2 : W * .7, H * (mob ? .3 : .36), mob ? W * .36 : Math.min(H * .3, W * .19), { dim: .42, grid: .3, spin: 1, live: .5 });
    const OUT = Object.assign({}, REASM, { dim: 0, grid: 0, y: REASM.y + .25 });
    const r0 = und - H * .15, r1 = Math.max(r0 + 1, ind - H * 1.05);
    anchors = [
      [0, HERO],
      [Math.max(H * .55, about - H * .1), SCAT_],
      [Math.max(H * .6, und - H * .75), SCAT_],
      [r0, REASM],
      [r1, REASM],
      [r1 + H * .45, OUT],
    ];
    endY = r1 + H * .5;
  }
  addEventListener('pius:resize', () => { measureTop(); measure(); });
  function target(sy) {
    let i = 0; while (i < anchors.length - 1 && sy > anchors[i + 1][0]) i++;
    if (i >= anchors.length - 1) return Object.assign({}, anchors[anchors.length - 1][1]);
    const [y0, a] = anchors[i], [y1, b] = anchors[i + 1];
    const t = E.io3(clamp((sy - y0) / Math.max(1, y1 - y0)));
    const o = {}; KEYS.forEach(k => o[k] = lerp(a[k], b[k], t)); return o;
  }

  /* ---- state ---- */
  let started = false, cur = null, introT0 = -1, lastSy = 0, vel = 0, spinAcc = 0, sweepT0 = -100;
  const mouse = { x: 0, y: 0 };
  function render(t, dt) {
    if (!started || document.hidden) return;
    const sy = scrollY;
    const active = sy < endY;
    canvas.classList.toggle('is-off', !active);
    if (!active) return;
    const ts = RM ? 0 : t;
    vel = lerp(vel, (sy - lastSy) / Math.max(dt, .001) / 1000, .1); lastSy = sy;
    const tx = PTR.active && FINE ? PTR.x / innerWidth * 2 - 1 : Math.sin(t * .23) * .35;
    const ty = PTR.active && FINE ? -(PTR.y / innerHeight * 2 - 1) : Math.cos(t * .19) * .2;
    const km = 1 - Math.exp(-dt * 4);
    mouse.x = lerp(mouse.x, tx, km); mouse.y = lerp(mouse.y, ty, km);
    const tg = target(sy);
    if (!cur) cur = tg;
    const k = 1 - Math.exp(-dt * 11);
    KEYS.forEach(key => { cur[key] = lerp(cur[key], tg[key], k); });
    const live = RM ? 0 : cur.live;
    spinAcc += dt * .45 * cur.spin * (RM ? 0 : 1);
    /* intro: glass fades in behind the flying splash mark, a light passes */
    let dim = cur.dim, sweep = -9;
    if (introT0 >= 0) {
      const it = (t - introT0);
      dim *= E.io3(clamp(it / 1.1));
      if (it < 2.2) sweep = lerp(-2.2, 2.4, clamp((it - .7) / .9));
    } else dim = 0;
    /* idle light pass every ~9s while the cube is assembled */
    if (introT0 >= 0 && t - introT0 > 3 && !RM) {
      const ph = (t - introT0 - 3) % 9;
      if (ph < 1.1) sweep = lerp(-2.2, 2.4, ph / 1.1);
    }
    const idleYaw = Math.sin(ts * .35) * .32, idlePitch = Math.sin(ts * .27) * .08;
    const st = {
      x: cur.x, y: cur.y + Math.sin(ts * .6) * .01 * live, size: cur.size,
      yaw: (idleYaw + mouse.x * .45) * live * cur.la + spinAcc,
      pitch: (idlePitch - mouse.y * .28) * live * cur.la + clamp(vel, -3, 3) * .02 * live,
      roll: 0, dim, grid: cur.grid, lens: PTR.active && FINE ? 1 : 0,
      mouse: [mouse.x, mouse.y], sweep, scroll: sy / innerHeight * .12,
      pieces: layoutPieces(cur, ts, mouse.x, mouse.y),
    };
    glass.render(performance.now(), st);
    /* hero copy parallax */
    const sp = clamp(sy / (hero.clientHeight || innerHeight));
    content.style.transform = `translate3d(0,${(-sy * .22).toFixed(1)}px,0)`;
    content.style.opacity = (1 - sp * 1.5).toFixed(3);
    foot.style.opacity = hero.classList.contains('is-in') ? (1 - sp * 3).toFixed(3) : '';
  }
  return {
    rect, measureTop,
    start() { started = true; measure(); canvas.classList.add('is-on'); },
    intro() { introT0 = performance.now() / 1000; },
    update: (t, dt) => render(t, dt),
  };
})();
window.HeroMark = HeroMark;
