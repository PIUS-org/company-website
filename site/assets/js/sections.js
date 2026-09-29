/* =========================================================
   Sections
   ========================================================= */

/* ---------- Hero: "We build ___" ticker ---------- */
(() => {
  const el = $('#heroNow'); if (!el) return;
  const words = ['ERP systems', 'business platforms', 'web systems', 'mobile apps', 'integrations'];
  let i = 0;
  setInterval(() => { if (scrollY < innerHeight && !document.hidden) { i = (i + 1) % words.length; scramble(el, words[i], 800); } }, 2800);
})();

/* ---------- Hero title: fit the space left of the glass mark ---------- */
const fitHero = (() => {
  const title = $('.hero__title'), lines = $$('.ln', title);
  function fit() {
    title.style.fontSize = '';
    const base = parseFloat(getComputedStyle(title).fontSize);
    const left = title.getBoundingClientRect().left;
    let avail;
    if (innerWidth >= 900) { const r = HeroMark.rect(); avail = r.cx - r.s * .5 - 36 - left; }
    else avail = document.documentElement.clientWidth - left * 2;
    /* widest visual row: inline lines share a row on desktop */
    const rows = {};
    lines.forEach(l => { const r = l.firstElementChild.getBoundingClientRect(); const k = Math.round(l.getBoundingClientRect().top); rows[k] = (rows[k] || 0) + r.width; });
    const widest = Math.max(...Object.values(rows)) + (innerWidth >= 900 ? base * .25 : 0);
    if (widest > avail) title.style.fontSize = Math.max(34, base * avail / widest) + 'px';
    HeroMark.measureTop && HeroMark.measureTop();
  }
  addEventListener('pius:resize', fit);
  return fit;
})();

/* ---------- Hero headline: letters bulge under the cursor like a convex lens ---------- */
(() => {
  const hero = $('#top'), title = $('.hero__title'), content = $('.hero__content');
  $$('.ln > span', title).forEach(w => {
    w.innerHTML = w.textContent.split('').map(c => `<span class="ch">${c}</span>`).join('');
  });
  const chs = $$('.ch', title).map(el => ({ el, x: 0, y: 0, f: 0 }));
  let fs = 100;
  const measure = () => {
    fs = parseFloat(getComputedStyle(title).fontSize);
    chs.forEach(c => {
      /* offsets ignore transforms, so the reveal/parallax animations don't disturb them */
      let x = c.el.offsetLeft + c.el.offsetWidth / 2, y = c.el.offsetTop + c.el.offsetHeight * .55;
      let n = c.el.offsetParent;
      while (n && n !== content) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      c.x = x; c.y = y;
    });
  };
  addEventListener('pius:resize', () => setTimeout(measure, 80));
  setTimeout(measure, 300);
  let on = 0;
  Engine.scene(hero, (p, t, dt) => {
    if (RM || !hero.classList.contains('is-in')) return;
    const cr = content.getBoundingClientRect();
    const px = PTR.x - cr.left, py = PTR.y - cr.top;
    const recent = FINE ? PTR.active : performance.now() - PTR.t < 1400;
    const inHero = PTR.y < hero.getBoundingClientRect().bottom;
    on = lerp(on, recent && inHero ? 1 : 0, 1 - Math.pow(.02, dt));
    const R = fs * 1.15, k = 1 - Math.pow(.0008, dt);
    chs.forEach(c => {
      const dx = c.x - px, dy = c.y - py;
      const target = on * Math.exp(-(dx * dx + dy * dy) / (R * R));
      c.f = lerp(c.f, target, k);
      if (c.f < .002 && target < .002) { if (c.el.style.transform) { c.el.style.transform = ''; c.el.style.fontVariationSettings = ''; c.el.style.textShadow = ''; } return; }
      const f = c.f, d = Math.hypot(dx, dy) || 1;
      const push = Math.min(d, R) / d * f * fs * .16;
      c.el.style.transform = `translate3d(${(dx * push / R * 1.6).toFixed(2)}px,${(dy * push / R * 1.6).toFixed(2)}px,0) scale(${(1 + .38 * f).toFixed(3)})`;
      c.el.style.fontVariationSettings = `"wght" ${Math.round(300 + 260 * f)}`;
      c.el.style.textShadow = `0 0 ${(30 * f).toFixed(1)}px rgba(191,214,255,${(.55 * f).toFixed(3)}), 0 2px 40px rgba(0,0,0,.6)`;
    });
  });
})();

/* ---------- ABOUT: words light up with scroll, glass layers separate ---------- */
(() => {
  const big = $('#aboutBig'), stack = $('#aboutStack');
  const words = big.textContent.trim().split(/\s+/);
  big.innerHTML = words.map(w => `<span class="w">${w}</span>`).join(' ');
  const ws = $$('.w', big);
  const plates = $$('.pl', stack), faces = plates.map(p => $('.pl__face', p));
  let gap = 0;
  Engine.scene($('#about'), (p) => {
    ws.forEach((w, i) => w.classList.toggle('on', p > .14 + i * .035));
    const k = E.out3(range(p, .12, .42));
    const max = isMobile() ? 38 : 58;
    const g = lerp(6, max, k);
    if (Math.abs(g - gap) > .1) { gap = g; stack.style.setProperty('--gap', g.toFixed(2) + 'px'); }
    plates.forEach((pl, i) => pl.style.setProperty('--lo', range(p, .22 + i * .025, .34 + i * .025).toFixed(3)));
  });
  Engine.tick($('#about'), t => {
    faces.forEach((f, i) => {
      const ph = ((t * .16 + (4 - i) * .07) % 1.6);
      f.style.setProperty('--sweep', (ph * 180 - 100).toFixed(1) + '%');
    });
  });
})();

/* ---------- UNDERSTAND: title reveal ---------- */
onceInView($('#undTitle'), el => el.classList.add('is-in'));

/* ---------- UNDERSTAND: industry → workflow structure ---------- */
(() => {
  const scene = $('#ind'), graph = $('#indGraph'), svg = $('#indLinks');
  const enEl = $('#indEn'), koEl = $('#indKo'), bgEl = $('#indBg'), tabs = $$('#indTabs button');
  const IND = [
    { en: 'Manufacturing', ko: '제조', hub: 1,
      n: [['Equipment', '설비', .10, .20], ['Production', '생산', .36, .50], ['Quality', '품질', .62, .20], ['Inventory', '재고', .62, .80], ['Shipment', '출하', .90, .50]],
      l: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4]] },
    { en: 'Logistics', ko: '물류', hub: 0,
      n: [['Dispatch', '배차', .44, .50], ['Vehicle', '차량', .10, .22], ['Driver', '기사', .10, .78], ['Transport', '운송', .78, .20], ['Operation', '운행', .90, .60], ['Settlement', '정산', .56, .90]],
      l: [[1, 2], [1, 0], [2, 0], [0, 3], [3, 4], [4, 5], [0, 5]] },
    { en: 'Commerce', ko: '커머스', hub: 2,
      n: [['Product', '상품', .10, .28], ['Inventory', '재고', .10, .76], ['Order', '주문', .40, .52], ['Payment', '결제', .68, .18], ['Delivery', '배송', .90, .56], ['Customer', '고객', .60, .88]],
      l: [[0, 1], [0, 2], [1, 2], [2, 3], [3, 4], [4, 5], [5, 2]] },
    { en: 'Finance', ko: '금융', hub: 2,
      n: [['Transaction', '거래', .10, .50], ['Approval', '승인', .36, .18], ['Settlement', '정산', .62, .50], ['Data', '데이터', .36, .84], ['Report', '리포트', .90, .50]],
      l: [[0, 1], [1, 2], [0, 3], [3, 2], [2, 4], [3, 4]] },
  ];
  const fitBg = () => {
    const gw = graph.clientWidth; if (!gw) return;
    let sp = bgEl.firstElementChild;
    if (!sp || sp.textContent !== bgEl.textContent) { sp = document.createElement('span'); sp.textContent = bgEl.textContent; bgEl.textContent = ''; bgEl.appendChild(sp); }
    bgEl.style.fontSize = '100px';
    const w = sp.offsetWidth || 1;
    bgEl.style.fontSize = Math.min(220, 100 * gw * .96 / w).toFixed(1) + 'px';
  };
  addEventListener('pius:resize', () => setTimeout(fitBg, 50));
  bgEl.style.transition = 'opacity .4s';
  const NODE_T = { Equipment: ['설비', '設備'], Production: ['생산', '生産'], Quality: ['품질', '品質'], Inventory: ['재고', '在庫'], Shipment: ['출하', '出荷'],
    Dispatch: ['배차', '配車'], Vehicle: ['차량', '車両'], Driver: ['기사', 'ドライバー'], Transport: ['운송', '輸送'], Operation: ['운행', '運行'], Settlement: ['정산', '精算'],
    Product: ['상품', '商品'], Order: ['주문', '注文'], Payment: ['결제', '決済'], Delivery: ['배송', '配送'], Customer: ['고객', '顧客'],
    Transaction: ['거래', '取引'], Approval: ['승인', '承認'], Data: ['데이터', 'データ'], Report: ['리포트', 'レポート'] };
  const sub = en => LANG === 'en' ? '' : (NODE_T[en] || [])[LANG === 'ja' ? 1 : 0] || '';
  const SLOTS = 6, LINKS = 8;
  const nodes = Array.from({ length: SLOTS }, () => {
    const d = document.createElement('div'); d.className = 'node';
    d.innerHTML = '<b></b><span></span>'; graph.appendChild(d);
    return { el: d, b: d.querySelector('b'), s: d.querySelector('span'), x: 0, y: 0, fx: 0, fy: 0, tx: 0, ty: 0, a: 0, fa: 0, ta: 0, w: 120, h: 50, depth: .4 + Math.random() * .6 };
  });
  const links = Array.from({ length: LINKS }, () => {
    const g = svgEl('g', {}, svg);
    return { g, base: svgEl('path', {}, g), flow: svgEl('path', { class: 'flow' }, g), dot: svgEl('circle', { r: 2.6 }, g), a: 0, b: 0, on: false, o: 0 };
  });
  let W = 0, H = 0, cur = -1, t0 = 0, portrait = false;
  const measure = () => {
    W = graph.clientWidth; H = graph.clientHeight; fitBg(); portrait = W < 600 || H > W * 1.05;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    nodes.forEach(n => { n.w = n.el.offsetWidth || 110; n.h = n.el.offsetHeight || 48; });
    if (cur >= 0) set(cur, true);
  };
  const posOf = (x, y, n) => {
    let px = portrait ? y : x, py = portrait ? x : y;
    const padX = n.w / 2 + 6, padY = n.h / 2 + 6;
    return [clamp(px * W, padX, W - padX), clamp(py * H, padY, H - padY)];
  };
  function set(i, instant) {
    const d = IND[i];
    if (!instant) {
      scramble(enEl, d.en, 650); koEl.textContent = LANG === 'en' ? '' : T('ind.' + i);
      bgEl.style.opacity = 0;
      setTimeout(() => { bgEl.textContent = d.en.toUpperCase(); fitBg(); bgEl.style.opacity = 1; }, 300);
    } else { enEl.textContent = d.en; koEl.textContent = LANG === 'en' ? '' : T('ind.' + i); bgEl.textContent = d.en.toUpperCase(); fitBg(); }
    tabs.forEach((b, k) => { b.classList.toggle('is-on', k === i); b.setAttribute('aria-selected', k === i); });
    nodes.forEach((n, k) => {
      const nd = d.n[k];
      n.fx = n.x; n.fy = n.y; n.fa = n.a;
      if (nd) {
        if (!instant) { if (n.b.textContent) scramble(n.b, nd[0], 600); else n.b.textContent = nd[0]; } else n.b.textContent = nd[0];
        n.s.textContent = sub(nd[0]); n.s.style.display = LANG === 'en' ? 'none' : '';
        n.el.classList.toggle('is-hub', k === d.hub);
      }
    });
    requestAnimationFrame(() => {
      nodes.forEach((n, k) => {
        n.w = n.el.offsetWidth || n.w; n.h = n.el.offsetHeight || n.h;
        const nd = d.n[k];
        if (nd) { [n.tx, n.ty] = posOf(nd[2], nd[3], n); n.ta = 1; }
        else { n.tx = W / 2; n.ty = H / 2; n.ta = 0; }
        if (instant || (n.x === 0 && n.y === 0)) { n.x = n.fx = n.tx; n.y = n.fy = n.ty; }
      });
    });
    links.forEach((L, k) => { const pr = d.l[k]; L.on = !!pr; if (pr) { L.a = pr[0]; L.b = pr[1]; } L.o = 0; });
    t0 = performance.now(); cur = i;
  }
  const bez = (a, b, t) => {
    const [ax, ay] = a, [bx, by] = b;
    let c1, c2;
    if (portrait) { const dy = (by - ay) * .5; c1 = [ax, ay + dy]; c2 = [bx, by - dy]; }
    else { const dx = (bx - ax) * .5; c1 = [ax + dx, ay]; c2 = [bx - dx, by]; }
    if (t === undefined) return `M${ax.toFixed(1)} ${ay.toFixed(1)}C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
    const u = 1 - t;
    return [u * u * u * ax + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * bx, u * u * u * ay + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * by];
  };
  addEventListener('pius:lang', () => { if (cur >= 0) set(cur, true); });
  tabs.forEach((b, i) => b.addEventListener('click', () => {
    const s = scene.getBoundingClientRect(), pinH = $('.pin', scene).offsetHeight;
    Scroller.to(scrollY + s.top + (s.height - pinH) * ((i + .5) / 4), 900);
  }));
  const px = { x: 0, y: 0 };
  Engine.scene(scene, (p, t, dt) => {
    if (!W) measure();
    const i = Math.min(3, Math.floor(p * 4));
    if (i !== cur) set(i, cur < 0);
    tabs.forEach((b, k) => b.querySelector('i').style.setProperty('--f', clamp(p * 4 - k).toFixed(3)));
    const k = E.out4(clamp((performance.now() - t0) / 1000));
    const r = graph.getBoundingClientRect();
    const kx = FINE && PTR.active ? (PTR.x - r.left - W / 2) / W : 0, ky = FINE && PTR.active ? (PTR.y - r.top - H / 2) / H : 0;
    px.x = lerp(px.x, kx, 1 - Math.pow(.05, dt)); px.y = lerp(px.y, ky, 1 - Math.pow(.05, dt));
    nodes.forEach(n => {
      n.x = lerp(n.fx, n.tx, k); n.y = lerp(n.fy, n.ty, k); n.a = lerp(n.fa, n.ta, k);
      const ox = px.x * 14 * n.depth, oy = px.y * 10 * n.depth;
      n.cx = n.x + ox; n.cy = n.y + oy;
      n.el.style.transform = `translate3d(${(n.cx - n.w / 2).toFixed(1)}px,${(n.cy - n.h / 2).toFixed(1)}px,0) scale(${(.6 + .4 * n.a).toFixed(3)})`;
      n.el.style.opacity = n.a.toFixed(3);
    });
    const lk = clamp((performance.now() - t0 - 250) / 700);
    links.forEach((L, j) => {
      const o = L.on ? E.out3(lk) : 0;
      L.g.style.opacity = o.toFixed(3);
      if (!L.on && o === 0) return;
      const A = nodes[L.a], B = nodes[L.b];
      const d = bez([A.cx, A.cy], [B.cx, B.cy]);
      L.base.setAttribute('d', d); L.flow.setAttribute('d', d);
      const u = ((t * .32 + j * .27) % 1);
      const [x, y] = bez([A.cx, A.cy], [B.cx, B.cy], u);
      L.dot.setAttribute('cx', x.toFixed(1)); L.dot.setAttribute('cy', y.toFixed(1));
      L.dot.style.opacity = Math.sin(u * Math.PI).toFixed(3);
    });
  }, 'pin', () => { W = 0; });
})();

/* ---------- UNDERSTAND: Business → Workflow → Information → System (particles) ---------- */
(() => {
  const scene = $('#morph'), cv = $('#morphCv'), ctx = cv.getContext('2d');
  const steps = $$('#morphSteps li'), mdesc = $('#morphMdesc'), endEl = $('#morphEnd');
  let W = 0, H = 0, dpr = 1, N = 0, P = [], F = [], box = null, cur = -1;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

  function sampleMark(n, bx) {
    const [BX, BY, BW, BH] = LOGO.box;
    const S = 260, c = document.createElement('canvas'); c.width = c.height = S;
    const x = c.getContext('2d'); const sc = S * .9 / BH;
    x.setTransform(sc, 0, 0, sc, S / 2 - (BX + BW / 2) * sc, S / 2 - (BY + BH / 2) * sc);
    LOGO.mark.forEach(d => x.fill(new Path2D(d)));
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
  addEventListener('pius:resize', () => { W = 0; });
  addEventListener('pius:lang', () => { if (cur >= 0) mdesc.textContent = steps[cur].querySelector('.d').textContent; });
  const KF = [.06, .32, .58, .84];
  Engine.scene(scene, (p, t) => {
    if (!W) build();
    let seg = 0; while (seg < 2 && p > KF[seg + 1]) seg++;
    let f = clamp((p - KF[seg]) / (KF[seg + 1] - KF[seg]));
    f = clamp((f - .18) / .64);
    const step = p < .19 ? 0 : p < .45 ? 1 : p < .71 ? 2 : 3;
    if (step !== cur) {
      cur = step;
      steps.forEach((li, i) => { li.classList.toggle('is-on', i === step); li.classList.toggle('is-past', i < step); });
      mdesc.textContent = steps[step].querySelector('.d').textContent;
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
})();

/* ---------- WHAT WE BUILD: title + scramble lines ---------- */
(() => {
  const t = $('#buildTitle');
  const txt = t.textContent;
  t.innerHTML = txt.split('').map(c => c === ' ' ? ' ' : `<span class="ch">${c}</span>`).join('');
  const chs = $$('.ch', t);
  chs.forEach(c => { c.style.opacity = .12; c.style.transition = 'opacity .5s, transform 1s var(--e-out)'; c.style.transform = 'translateY(.25em)'; });
  onceInView(t, () => chs.forEach((c, i) => setTimeout(() => { c.style.opacity = 1; c.style.transform = 'none'; }, 40 * i)));
  $$('[data-scramble]').forEach(el => { const to = el.textContent; el.textContent = ''; onceInView(el, () => scramble(el, to, 1000)); });
})();

/* ---------- 01 ERP — every module shows its own screen ---------- */
(() => {
  const root = $('#bizErp'), win = $('#erpWin'), modsEl = $('#erpMods'), main = $('#erpMain'), crumb = $('#erpCrumb'), tags = $('#erpTags');
  const W3 = (ko, en, ja) => ({ ko, en, ja });
  const ST = {
    ok: W3('승인', 'Approved', '承認'), mid: W3('진행', 'In progress', '進行中'), wait: W3('대기', 'Pending', '保留'),
    work: W3('근무', 'At work', '勤務'), field: W3('외근', 'Field', '外勤'), leave: W3('휴가', 'On leave', '休暇'),
    fine: W3('정상', 'OK', '正常'), low: W3('부족', 'Low', '不足'),
    ship: W3('배송 중', 'In transit', '配送中'), done: W3('완료', 'Delivered', '完了'), out: W3('출고 대기', 'Awaiting', '出荷待ち'),
    won: W3('수주', 'Won', '受注'),
  };
  const CLS = { ok: 'ok', work: 'ok', fine: 'ok', done: 'ok', won: 'ok', mid: 'mid', field: 'mid', ship: 'mid', wait: 'wait', leave: 'wait', out: 'wait', low: 'low' };
  const IC = {
    hr: '<circle cx="7" cy="5" r="2.6"/><path d="M2.5 12.5c.6-2.6 2.4-4 4.5-4s3.9 1.4 4.5 4"/>',
    acc: '<path d="M3 1.5h8v11l-2-1.2-2 1.2-2-1.2-2 1.2z"/><path d="M5 5h4M5 7.5h4"/>',
    sales: '<path d="M1.5 11l3.5-4 3 2.5 4-6"/><path d="M9 3.5h3v3"/>',
    inv: '<path d="M7 1.5l5.5 3v5L7 12.5l-5.5-3v-5z"/><path d="M1.5 4.5L7 7.5l5.5-3M7 7.5v5"/>',
    prod: '<circle cx="7" cy="7" r="2.2"/><path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.8 2.8l1.4 1.4M9.8 9.8l1.4 1.4M2.8 11.2l1.4-1.4M9.8 4.2l1.4-1.4"/>',
    log: '<path d="M1 3.5h7.5v6H1zM8.5 5.5h2.7l1.8 2.2v1.8H8.5"/><circle cx="3.5" cy="10.5" r="1.2"/><circle cx="10.5" cy="10.5" r="1.2"/>',
    work: '<rect x="1.5" y="1.5" width="11" height="11" rx="2"/><path d="M4.3 7.2l1.9 1.9 3.6-4"/>',
  };
  const MODS = [
    { k: 'hr', name: W3('인사', 'HR', '人事'), sub: W3('근태 현황', 'Attendance', '勤怠状況'),
      kpi: [[W3('재직 인원', 'Headcount', '在籍人数'), 128], [W3('금일 출근', 'Present today', '本日出勤'), 121], [W3('휴가 신청', 'Leave requests', '休暇申請'), 7]],
      chart: { type: 'bars', title: W3('주간 출근율', 'Weekly attendance', '週間出勤率'), labels: W3('월,화,수,목,금', 'Mon,Tue,Wed,Thu,Fri', '月,火,水,木,金'), v: [94, 97, 92, 98, 95], unit: '%' },
      cols: [W3('사번', 'ID', '社員番号'), W3('부서', 'Dept.', '部署'), W3('근태', 'Status', '勤怠')],
      rows: [['E-1024', W3('영업팀', 'Sales', '営業部'), 'work'], ['E-1107', W3('개발팀', 'Dev', '開発部'), 'field'], ['E-0931', W3('재무팀', 'Finance', '財務部'), 'leave'], ['E-1210', W3('생산팀', 'Production', '生産部'), 'work']] },
    { k: 'acc', name: W3('회계', 'Accounting', '会計'), sub: W3('손익 추이', 'P&L trend', '損益推移'),
      kpi: [[W3('이번 달 매출', 'Revenue (MTD)', '今月の売上'), 384, 0, W3('백만원', 'M KRW', '百万ウォン')], [W3('미수금', 'A/R', '売掛金'), 42, 0, W3('백만원', 'M KRW', '百万ウォン')], [W3('미결 전표', 'Open vouchers', '未処理伝票'), 12]],
      chart: { type: 'line', title: W3('매출 · 비용', 'Revenue vs. cost', '売上・費用'), legend: [W3('매출', 'Revenue', '売上'), W3('비용', 'Cost', '費用')] },
      cols: [W3('전표번호', 'Voucher', '伝票番号'), W3('계정', 'Account', '勘定科目'), W3('상태', 'Status', '状態')],
      rows: [['AC-5520', W3('매출', 'Sales', '売上'), 'ok'], ['AC-5521', W3('매입', 'Purchases', '仕入'), 'wait'], ['AC-5522', W3('급여', 'Payroll', '給与'), 'ok'], ['AC-5523', W3('경비', 'Expenses', '経費'), 'mid']] },
    { k: 'sales', name: W3('영업', 'Sales', '営業'), sub: W3('영업 파이프라인', 'Sales pipeline', '営業パイプライン'),
      kpi: [[W3('신규 리드', 'New leads', '新規リード'), 64], [W3('견적 진행', 'Open quotes', '見積中'), 18], [W3('이번 달 수주', 'Won this month', '今月の受注'), 9]],
      chart: { type: 'funnel', title: W3('단계별 건수', 'Deals by stage', '段階別件数'), labels: W3('리드,제안,견적,협상,수주', 'Lead,Proposal,Quote,Negotiation,Won', 'リード,提案,見積,交渉,受注'), v: [64, 38, 18, 11, 9] },
      cols: [W3('고객사', 'Account', '顧客'), W3('단계', 'Stage', '段階'), W3('상태', 'Status', '状態')],
      rows: [[W3('A사', 'Alpha Co.', 'A社'), W3('견적', 'Quote', '見積'), 'mid'], [W3('B사', 'Beta Co.', 'B社'), W3('협상', 'Negotiation', '交渉'), 'wait'], [W3('C사', 'Core Co.', 'C社'), W3('계약', 'Contract', '契約'), 'won'], [W3('D사', 'Delta Co.', 'D社'), W3('제안', 'Proposal', '提案'), 'mid']] },
    { k: 'inv', name: W3('재고', 'Inventory', '在庫'), sub: W3('품목별 재고', 'Stock by item', '品目別在庫'),
      kpi: [[W3('관리 품목', 'Items', '管理品目'), 1240], [W3('안전재고 미달', 'Below safety stock', '安全在庫割れ'), 6], [W3('재고 회전일', 'Turnover days', '在庫回転日数'), 18.4, 1]],
      chart: { type: 'thresh', title: W3('현재고 · 안전재고', 'On hand vs. safety stock', '現在庫・安全在庫'), labels: W3('01,02,03,04,05,06', '01,02,03,04,05,06', '01,02,03,04,05,06'), v: [72, 34, 88, 26, 61, 45], th: 40 },
      cols: [W3('품목코드', 'SKU', '品目コード'), W3('품목', 'Item', '品目'), W3('상태', 'Status', '状態')],
      rows: [['SKU-1042', W3('볼트 M8', 'Bolt M8', 'ボルト M8'), 'fine'], ['SKU-2210', W3('베어링', 'Bearing', 'ベアリング'), 'low'], ['SKU-0930', W3('패킹', 'Gasket', 'パッキン'), 'fine'], ['SKU-3301', W3('모터', 'Motor', 'モーター'), 'low']] },
    { k: 'prod', name: W3('생산', 'Production', '生産'), sub: W3('라인별 가동 현황', 'Line status', 'ライン別稼働状況'),
      kpi: [[W3('가동률', 'Utilization', '稼働率'), 87, 0, W3('%', '%', '%')], [W3('금일 생산량', 'Output today', '本日の生産量'), 2480], [W3('불량률', 'Defect rate', '不良率'), .8, 1, W3('%', '%', '%')]],
      chart: { type: 'gauge', title: W3('라인 가동률', 'Line utilization', 'ライン稼働率'), labels: W3('A 라인,B 라인,C 라인', 'Line A,Line B,Line C', 'Aライン,Bライン,Cライン'), v: [92, 81, 88] },
      cols: [W3('작업지시', 'Work order', '作業指示'), W3('라인', 'Line', 'ライン'), W3('진행률', 'Progress', '進捗')],
      rows: [['WO-2381', 'A', 76], ['WO-2382', 'B', 42], ['WO-2383', 'C', 100], ['WO-2384', 'A', 12]] },
    { k: 'log', name: W3('물류', 'Logistics', '物流'), sub: W3('출고 · 배송 현황', 'Shipments', '出荷・配送状況'),
      kpi: [[W3('출고 대기', 'Awaiting dispatch', '出荷待ち'), 23], [W3('배송 중', 'In transit', '配送中'), 41], [W3('오늘 완료', 'Delivered today', '本日完了'), 118]],
      chart: { type: 'track', title: W3('배송 단계', 'Shipment stages', '配送ステップ'), labels: W3('출고,간선,터미널,배송', 'Picked,Line haul,Hub,Delivery', '出荷,幹線,拠点,配送'), v: [3, 1, 2], ids: ['LG-7781', 'LG-7783', 'LG-7784'] },
      cols: [W3('운송장', 'Waybill', '送り状'), W3('지역', 'Region', '地域'), W3('상태', 'Status', '状態')],
      rows: [['LG-7781', W3('수원', 'Suwon', '水原'), 'ship'], ['LG-7782', W3('용인', 'Yongin', '龍仁'), 'done'], ['LG-7783', W3('화성', 'Hwaseong', '華城'), 'out'], ['LG-7784', W3('평택', 'Pyeongtaek', '平沢'), 'ship']] },
    { k: 'work', name: W3('업무 관리', 'Work management', '業務管理'), sub: W3('이번 주 일정', 'This week', '今週の予定'),
      kpi: [[W3('진행 중 업무', 'Active tasks', '進行中の業務'), 32], [W3('결재 대기', 'Awaiting approval', '承認待ち'), 5], [W3('마감 임박', 'Due soon', '期限間近'), 3]],
      chart: { type: 'gantt', title: W3('주간 일정', 'Weekly schedule', '週間スケジュール'), labels: W3('요구사항 정리,화면 설계,API 개발,테스트,배포 준비', 'Requirements,Screen design,API dev,Testing,Release prep', '要件整理,画面設計,API開発,テスト,リリース準備'), v: [[0, 2], [1, 2.5], [2.2, 3], [4.4, 1.8], [5.6, 1.4]], today: 3.4 },
      cols: [W3('업무', 'Task', '業務'), W3('담당', 'Owner', '担当'), W3('기한', 'Due', '期限')],
      rows: [['WK-0412', W3('기획팀', 'Planning', '企画部'), '09.30'], ['WK-0413', W3('개발팀', 'Dev', '開発部'), '10.02'], ['WK-0414', W3('QA팀', 'QA', 'QA'), '10.04'], ['WK-0415', W3('운영팀', 'Ops', '運用部'), '10.07']] },
  ];
  const UI = { month: W3('이번 달', 'This month', '今月'), add: W3('신규 등록', 'New', '新規登録') };
  const lab = c => L(c.labels).split(',');

  function chart(c) {
    const V = c.v;
    if (c.type === 'bars') {
      const n = V.length, w = 400 / n, max = 100, lb = lab(c), hi = V.indexOf(Math.max(...V));
      return `<svg class="ec" viewBox="0 0 400 124">${[30, 60, 90].map(y => `<line class="g" x1="0" x2="400" y1="${y}" y2="${y}"/>`).join('')}
        ${V.map((v, i) => { const h = (v - 70) / (max - 70) * 90; return `<rect class="b ${i === hi ? 'hi' : ''}" style="animation-delay:${i * 60}ms" x="${i * w + w * .28}" y="${104 - h}" width="${w * .44}" height="${h}" rx="4"/><text class="t" x="${i * w + w / 2}" y="119">${lb[i]}</text><text class="v" x="${i * w + w / 2}" y="${98 - h}">${v}${c.unit}</text>`; }).join('')}</svg>`;
    }
    if (c.type === 'line') {
      const lg = c.legend.map((l, i) => `<span class="lg lg${i}">${L(l)}</span>`).join('');
      return `<div class="ec-lg">${lg}</div><svg class="ec" viewBox="0 0 400 124" preserveAspectRatio="none"><defs><linearGradient id="erpA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfd6ff" stop-opacity=".28"/><stop offset="1" stop-color="#bfd6ff" stop-opacity="0"/></linearGradient></defs>
        ${[32, 64, 96].map(y => `<line class="g" x1="0" x2="400" y1="${y}" y2="${y}"/>`).join('')}<path id="erpArea" fill="url(#erpA)"/><path class="l2" id="erpL2"/><path class="l1" id="erpL1"/><circle id="erpDot" r="3.5" fill="#fff"/></svg>`;
    }
    if (c.type === 'funnel') {
      const lb = lab(c), max = V[0];
      return `<svg class="ec" viewBox="0 0 400 124">${V.map((v, i) => { const w = v / max * 270; return `<text class="t l" x="0" y="${i * 24 + 16}">${lb[i]}</text><rect class="h ${i === V.length - 1 ? 'hi' : ''}" style="animation-delay:${i * 70}ms" x="100" y="${i * 24 + 5}" width="${w}" height="15" rx="4"/><text class="v l" x="${108 + w}" y="${i * 24 + 16}">${v}</text>`; }).join('')}</svg>`;
    }
    if (c.type === 'thresh') {
      const n = V.length, w = 400 / n, lb = lab(c), ty = 104 - c.th / 100 * 94;
      return `<svg class="ec" viewBox="0 0 400 124">${V.map((v, i) => { const h = v / 100 * 94; return `<rect class="b ${v < c.th ? 'warn' : ''}" style="animation-delay:${i * 60}ms" x="${i * w + w * .3}" y="${104 - h}" width="${w * .4}" height="${h}" rx="4"/><text class="t" x="${i * w + w / 2}" y="119">${lb[i]}</text>`; }).join('')}
        <line class="th" x1="0" x2="400" y1="${ty}" y2="${ty}"/><text class="tht" x="398" y="${ty - 5}">${L(W3('안전재고', 'Safety stock', '安全在庫'))}</text></svg>`;
    }
    if (c.type === 'gauge') {
      const lb = lab(c), R = 30, C = 2 * Math.PI * R;
      return `<svg class="ec" viewBox="0 0 400 124">${V.map((v, i) => { const cx = 70 + i * 130; return `<circle class="gb" cx="${cx}" cy="54" r="${R}"/><circle class="gf" style="--c:${C};--o:${C * (1 - v / 100)};animation-delay:${i * 90}ms" cx="${cx}" cy="54" r="${R}" transform="rotate(-90 ${cx} 54)"/><text class="gv" x="${cx}" y="59">${v}%</text><text class="t" x="${cx}" y="112">${lb[i]}</text>`; }).join('')}</svg>`;
    }
    if (c.type === 'track') {
      const lb = lab(c), xs = [70, 180, 290, 390];
      return `<svg class="ec" viewBox="0 0 400 124">${lb.map((l, i) => `<text class="t" x="${xs[i] - (i === 3 ? 18 : 0)}" y="12">${l}</text>`).join('')}
        ${V.map((st, r) => { const y = 36 + r * 32; return `<text class="t l" x="0" y="${y + 4}">${c.ids[r]}</text><line class="tr" x1="${xs[0]}" x2="${xs[3] - 10}" y1="${y}" y2="${y}"/><line class="tf" style="--len:${xs[st] - xs[0]};animation-delay:${r * 90}ms" x1="${xs[0]}" x2="${xs[st]}" y1="${y}" y2="${y}"/>${xs.map((x, k) => `<circle class="td ${k <= st ? 'on' : ''} ${k === st ? 'cur' : ''}" cx="${k === 3 ? x - 10 : x}" cy="${y}" r="${k === st ? 5 : 3.5}"/>`).join('')}`; }).join('')}</svg>`;
    }
    if (c.type === 'gantt') {
      const lb = lab(c), dx = 280 / 7;
      return `<svg class="ec" viewBox="0 0 400 124">${Array.from({ length: 8 }, (_, i) => `<line class="g" x1="${120 + i * dx}" x2="${120 + i * dx}" y1="0" y2="120"/>`).join('')}
        ${V.map(([st, len], i) => `<text class="t l" x="0" y="${i * 23 + 17}">${lb[i]}</text><rect class="gt ${st <= c.today && st + len >= c.today ? 'hi' : ''}" style="animation-delay:${i * 70}ms" x="${120 + st * dx}" y="${i * 23 + 6}" width="${len * dx}" height="14" rx="4"/>`).join('')}
        <line class="today" x1="${120 + c.today * dx}" x2="${120 + c.today * dx}" y1="0" y2="120"/></svg>`;
    }
    return '';
  }
  function cell(v) {
    if (typeof v === 'string' && ST[v]) return `<em class="st ${CLS[v]}">${L(ST[v])}</em>`;
    if (typeof v === 'number') return `<span class="pg"><i style="--p:${v}%"></i></span><small>${v}%</small>`;
    return `<span>${L(v)}</span>`;
  }
  let mi = 0, last = 0;
  function render(i, animate = true) {
    const m = MODS[i];
    $$('li', modsEl).forEach((li, k) => li.classList.toggle('is-on', k === i));
    crumb.textContent = L(m.name);
    const html = `<div class="erp__head"><div><b>${L(m.name)}</b><span>${L(m.sub)}</span></div><div class="erp__tools"><span class="erp__pill">${L(UI.month)}</span><span class="erp__add">+ ${L(UI.add)}</span></div></div>
      <div class="erp__kpis">${m.kpi.map(([l, v, dec = 0, u]) => `<div><span>${L(l)}</span><b data-to="${v}" data-dec="${dec}">0</b>${u ? `<small>${L(u)}</small>` : ''}</div>`).join('')}</div>
      <div class="erp__panel ec--${m.chart.type}"><div class="erp__ptitle">${L(m.chart.title)}</div>${chart(m.chart)}</div>
      <div class="erp__table"><div class="erp__row erp__row--h">${m.cols.map(c => `<span>${L(c)}</span>`).join('')}</div>${m.rows.map((r, k) => `<div class="erp__row" style="animation-delay:${200 + k * 70}ms">${r.map(cell).join('')}</div>`).join('')}</div>`;
    const swap = () => {
      main.innerHTML = html; main.classList.remove('is-out');
      $$('[data-to]', main).forEach(b => {
        const to = +b.dataset.to, dec = +b.dataset.dec, t0 = performance.now();
        const st = now => { const p = E.out4(clamp((now - t0) / 700)); b.textContent = (to * p).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); if (p < 1) requestAnimationFrame(st); };
        requestAnimationFrame(st);
      });
    };
    if (animate && !RM) { main.classList.add('is-out'); setTimeout(swap, 240); } else swap();
  }
  function build() {
    modsEl.innerHTML = MODS.map(m => `<li><svg viewBox="0 0 14 14">${IC[m.k]}</svg><span>${L(m.name)}</span></li>`).join('');
    tags.innerHTML = MODS.map(m => `<li>${L(m.name)}</li>`).join('');
    render(mi, false);
  }
  build();
  addEventListener('pius:lang', build);
  let tilt = { x: 0, y: 0 };
  Engine.scene(root, (p, t, dt) => {
    const k = E.out3(range(p, .08, .42));
    let tx = 0, ty = 0;
    if (FINE && PTR.active) {
      const r = win.getBoundingClientRect();
      if (PTR.x > r.left - 60 && PTR.x < r.right + 60 && PTR.y > r.top - 60 && PTR.y < r.bottom + 60) { tx = ((PTR.y - r.top) / r.height - .5) * -5; ty = ((PTR.x - r.left) / r.width - .5) * 6; }
    }
    tilt.x = lerp(tilt.x, tx, 1 - Math.pow(.02, dt)); tilt.y = lerp(tilt.y, ty, 1 - Math.pow(.02, dt));
    win.style.setProperty('--rx', (lerp(22, 0, k) + tilt.x).toFixed(2) + 'deg');
    win.style.setProperty('--ry', (lerp(-10, 0, k) + tilt.y).toFixed(2) + 'deg');
    win.style.setProperty('--gl', (lerp(-60, 140, p)).toFixed(1) + '%');
    /* live line for accounting */
    const L1 = $('#erpL1', main);
    if (L1) {
      const n = 28, pts = [], pts2 = [];
      for (let i = 0; i < n; i++) {
        const x = i / (n - 1) * 400;
        pts.push([x, 80 - Math.sin(i * .45 + t * .6) * 16 - Math.sin(i * .17 + t * .23) * 12 - i * .9]);
        pts2.push([x, 96 - Math.sin(i * .3 + t * .4 + 1) * 10 - i * .45]);
      }
      const d = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('');
      L1.setAttribute('d', d);
      $('#erpL2', main).setAttribute('d', pts2.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(''));
      $('#erpArea', main).setAttribute('d', d + 'L400 124L0 124Z');
      const lp = pts[n - 1]; const dot = $('#erpDot', main); dot.setAttribute('cx', lp[0]); dot.setAttribute('cy', lp[1].toFixed(1));
    }
    if (k > .6 && t - last > 2.8) { last = t; mi = (mi + 1) % MODS.length; render(mi); }
  });
})();

/* ---------- 02 PLATFORM: participants orbit a shared core ---------- */
(() => {
  const root = $('#bizPlat'), box = $('#plat'), svg = $('#platSvg');
  const A = [[{ ko: '고객', ja: '顧客' }, 'Customer', 0], [{ ko: '파트너', ja: 'パートナー' }, 'Partner', 0], [{ ko: '공급사', ja: 'サプライヤー' }, 'Supplier', 1], [{ ko: '사용자', ja: 'ユーザー' }, 'User', 1], [{ ko: '운영사', ja: '運営会社' }, 'Operator', 0], [{ ko: '관리자', ja: '管理者' }, 'Admin', 1]];
  const rings = [svgEl('ellipse', { class: 'plat__ring' }, svg), svgEl('ellipse', { class: 'plat__ring dash' }, svg), svgEl('ellipse', { class: 'plat__ring' }, svg)];
  const beams = svgEl('g', {}, svg);
  const actors = A.map((a, i) => {
    const el = document.createElement('div'); el.className = 'actor';
    box.appendChild(el);
    const line = svgEl('line', {}, beams), dot = svgEl('circle', { r: 3 }, beams);
    return { el, line, dot, ring: a[2], base: i / A.length * Math.PI * 2 + a[2] * .5, w: 0, h: 0, x: 0, y: 0, pulse: -1, dir: 1 };
  });
  const label = () => { actors.forEach((a, i) => { a.el.innerHTML = LANG === 'en' ? A[i][1] : `${A[i][0][LANG] || A[i][0].ko}<small>${A[i][1]}</small>`; }); W = 0; };
  let W = 0, H = 0, tiltY = .44, nextPulse = 0;
  label(); addEventListener('pius:lang', label);
  const measure = () => { W = box.clientWidth; H = box.clientHeight; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); actors.forEach(a => { a.w = a.el.offsetWidth; a.h = a.el.offsetHeight; }); };
  addEventListener('pius:resize', () => { W = 0; });
  Engine.scene(root, (p, t, dt) => {
    if (!W) measure();
    const cx = W / 2, cy = H / 2;
    const k = E.out3(range(p, .1, .45));
    let ty = W < 600 ? .92 : .44;
    if (FINE && PTR.active) { const r = box.getBoundingClientRect(); if (PTR.y > r.top && PTR.y < r.bottom) ty += ((PTR.y - r.top) / r.height - .5) * .16; }
    tiltY = lerp(tiltY, ty, 1 - Math.pow(.05, dt));
    const mob = W < 600;
    const R = [Math.min(W * (mob ? .27 : .25), H * .75, 360) * (.7 + .3 * k), Math.min(W * (mob ? .45 : .42), H * 1.05, 560) * (.7 + .3 * k)];
    rings[0].setAttribute('cx', cx); rings[0].setAttribute('cy', cy); rings[0].setAttribute('rx', R[0]); rings[0].setAttribute('ry', R[0] * tiltY);
    rings[1].setAttribute('cx', cx); rings[1].setAttribute('cy', cy); rings[1].setAttribute('rx', (R[0] + R[1]) / 2); rings[1].setAttribute('ry', (R[0] + R[1]) / 2 * tiltY);
    rings[2].setAttribute('cx', cx); rings[2].setAttribute('cy', cy); rings[2].setAttribute('rx', R[1]); rings[2].setAttribute('ry', R[1] * tiltY);
    svg.style.opacity = k;
    actors.forEach((a, i) => {
      const ang = a.base + t * (a.ring ? -.07 : .1);
      const r = R[a.ring];
      a.x = cx + Math.cos(ang) * r; a.y = cy + Math.sin(ang) * r * tiltY;
      const depth = (Math.sin(ang) + 1) / 2;
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
})();

/* ---------- 03 WEB: a deck of browser windows; the cursor presses a real button, then the next screen comes forward ---------- */
(() => {
  const root = $('#bizWeb'), box = $('#web');
  const W3 = (ko, en, ja) => ({ ko, en, ja });
  const S = [
    { url: 'app.company.co.kr/dashboard', lbl: 'Web Application', btn: W3('보고서 생성', 'Create report', 'レポート作成'),
      ui: b => `<div class="wu-nav"><i class="sk ln" style="width:22%"></i><span class="wu-links"><i class="sk ln"></i><i class="sk ln"></i><i class="sk ln"></i></span></div>
        <div class="wu-hero"><div><i class="sk ln hi" style="width:70%"></i><i class="sk ln" style="width:52%;margin-top:7px"></i></div>${b}</div>
        <div class="wu-cards"><div class="sk"><i class="sk ln hi" style="width:40%"></i></div><div class="sk"><i class="sk ln" style="width:55%"></i></div><div class="sk"><i class="sk ln" style="width:35%"></i></div></div>` },
    { url: 'admin.company.co.kr/orders', lbl: 'Admin System', btn: W3('일괄 승인', 'Approve all', '一括承認'),
      ui: b => `<div class="wu-admin"><div class="wu-side"><i class="sk ln hi"></i><i class="sk ln"></i><i class="sk ln"></i><i class="sk ln"></i><i class="sk ln"></i></div>
        <div class="wu-tbl"><div class="wu-bar"><i class="sk ln" style="width:30%"></i>${b}</div>${'<div class="wu-tr"><i class="ck"></i><i class="sk ln"></i><i class="sk ln"></i><i class="sk ln"></i></div>'.repeat(5)}</div></div>` },
    { url: 'intra.company.co.kr/board', lbl: 'Internal System', btn: W3('+ 업무 등록', '+ Add task', '+ 業務登録'),
      ui: b => `<div class="wu-bar"><i class="sk ln" style="width:26%"></i>${b}</div><div class="wu-kan">${[3, 2, 4].map((n, c) => `<div class="wu-col"><i class="sk ln ${c === 1 ? 'hi' : ''}" style="width:44%"></i>${'<div class="wu-card"><i class="sk ln"></i><i class="sk ln" style="width:60%"></i></div>'.repeat(n)}</div>`).join('')}</div>` },
    { url: 'service.company.co.kr/request', lbl: 'Customer Service', btn: W3('접수하기', 'Submit', '送信する'),
      ui: b => `<div class="wu-form"><i class="sk ln" style="width:46%;margin:0 auto 4px"></i><div class="wu-in"></div><div class="wu-in"></div><div class="wu-in wu-ta"></div><div class="wu-right">${b}</div></div>` },
  ];
  let wins = [];
  const cursor = document.createElement('div'); cursor.className = 'web__cursor';
  cursor.innerHTML = '<svg viewBox="0 0 18 18"><path d="M2 1l13 7-6 1.4L6.6 16z" fill="#fff" stroke="#000" stroke-width="1"/></svg>';
  function build() {
    wins.forEach(w => w.remove());
    wins = S.map(sc => {
      const w = document.createElement('div'); w.className = 'web__win';
      w.innerHTML = `<div class="web__url"><i></i><i></i><i></i><span>${sc.url}</span></div><div class="web__ui">${sc.ui(`<span class="wb">${L(sc.btn)}</span>`)}</div><span class="web__lbl">${sc.lbl}</span>`;
      box.insertBefore(w, cursor.parentNode ? cursor : null); return w;
    });
    if (!cursor.parentNode) box.appendChild(cursor);
    layout();
  }
  let order = [0, 1, 2, 3], spread = 0, last = 0, phase = 0;
  function layout() {
    const mob = isMobile();
    order.forEach((wi, r) => {
      const w = wins[wi]; if (!w) return;
      const x = r * (mob ? 4 : 6) * (.4 + spread), y = -r * (mob ? 5 : 7) * (.4 + spread), z = -r * 110 * (.4 + spread);
      w.style.transform = `translate3d(${x}%,${y}%,${z}px) rotateY(${lerp(-26, -14, spread)}deg) rotateX(${lerp(12, 5, spread)}deg)`;
      w.style.opacity = (1 - r * .2).toFixed(2);
      w.style.filter = `brightness(${(1 - r * .18).toFixed(2)})`;
      w.style.zIndex = 10 - r;
      w.classList.toggle('is-front', r === 0);
    });
  }
  /* aim at the front window's button (screen space → box space) */
  function aim(click) {
    const front = wins[order[0]], btn = front && front.querySelector('.wb'); if (!btn) return;
    const br = box.getBoundingClientRect(), r = btn.getBoundingClientRect();
    const x = r.left - br.left + r.width * .62, y = r.top - br.top + r.height * .55;
    cursor.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    if (click) setTimeout(() => {
      cursor.classList.remove('click'); void cursor.offsetWidth; cursor.classList.add('click');
      btn.classList.add('is-press'); setTimeout(() => btn.classList.remove('is-press'), 520);
    }, 1050);
  }
  build();
  addEventListener('pius:lang', build);
  Engine.scene(root, (p, t) => {
    const s = E.out3(range(p, .1, .45));
    if (Math.abs(s - spread) > .005) { spread = s; layout(); }
    if (t - last > 1.7) {
      last = t; phase = (phase + 1) % 2;
      if (phase === 1) aim(true);
      else { order.push(order.shift()); layout(); setTimeout(() => aim(false), 650); }
    }
  });
})();

/* ---------- 04 MOBILE: field app (front) + live delivery map (back) ---------- */
(() => {
  const root = $('#bizMob'), mob = $('#mob'), phone = $('#phone'), back = $('#phoneBack');
  const track = $('#appTrack'), notif = $('#notif');
  const route = $('#routePath'), car = $('#routeCar'); const RL = route.getTotalLength();
  route.style.strokeDasharray = RL; route.style.strokeDashoffset = RL;
  const W3 = (ko, en, ja) => ({ ko, en, ja });
  const TAG = { dlv: W3('배송', 'Delivery', '配送'), insp: W3('검수', 'Inspect', '検品'), chk: W3('점검', 'Check', '点検'), rep: W3('보고', 'Report', '報告') };
  const TASKS = [
    ['A-1024', W3('입고 검수', 'Inbound inspection', '入荷検品'), 'insp', W3('물류센터 2동', 'DC building 2', '物流センター2棟'), '09:30'],
    ['B-2211', W3('배송 출발', 'Delivery departed', '配送出発'), 'dlv', W3('용인 → 수원', 'Yongin → Suwon', '龍仁 → 水原'), '10:10'],
    ['M-0310', W3('설비 점검 보고', 'Equipment check', '設備点検報告'), 'chk', W3('생산 3라인', 'Line 3', '生産3ライン'), '11:00'],
    ['C-0932', W3('배송 완료 확인', 'Proof of delivery', '配送完了確認'), 'dlv', W3('고객 서명', 'Customer signature', '顧客サイン'), '11:40'],
    ['S-0415', W3('재고 실사', 'Stock count', '在庫棚卸'), 'insp', W3('창고 B구역', 'Warehouse B', '倉庫Bエリア'), '13:20'],
    ['D-1180', W3('회수 요청', 'Pickup request', '回収依頼'), 'dlv', W3('반품 접수', 'Return', '返品受付'), '14:00'],
    ['V-0077', W3('차량 운행 일지', 'Vehicle log', '車両運行日誌'), 'rep', W3('운행 거리 입력', 'Enter mileage', '走行距離入力'), '15:30'],
    ['R-0929', W3('일일 업무 보고', 'Daily report', '日報提出'), 'rep', W3('팀장 결재 요청', 'Send for approval', '上長承認依頼'), '17:30'],
  ];
  const UI = {
    title: W3('오늘의 업무', 'Today', '今日の業務'), done: W3('완료 {n}건', '{n} done', '完了 {n}件'), left: W3('남은 업무 {n}건', '{n} remaining', '残り {n}件'),
    seg: W3('전체,진행,완료', 'All,Active,Done', 'すべて,進行中,完了'), tab: W3('홈,업무,지도,내 정보', 'Home,Tasks,Map,Me', 'ホーム,業務,マップ,マイページ'),
    nhd: W3('업무 알림', 'Task alert', '業務通知'),
    nt: [W3('새 배송 요청이 배정되었습니다.', 'A new delivery has been assigned.', '新しい配送依頼が割り当てられました。'), W3('결재 요청이 승인되었습니다.', 'Your approval request was approved.', '承認依頼が承認されました。'), W3('현장 점검 일정이 변경되었습니다.', 'An on-site check was rescheduled.', '現場点検の日程が変更されました。')],
    sh: W3('B-2211 배송 중', 'B-2211 · In transit', 'B-2211 配送中'), eta: W3('도착 예정 {n}분', 'ETA {n} min', '到着予定 {n}分'), stops: W3('경유지 3곳 중 2곳 완료', '2 of 3 stops done', '経由地3か所中2か所完了'),
  };
  const LOC = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP' };
  const ICONS = ['<path d="M3 9l6-5 6 5v6H3z"/>', '<rect x="3" y="3" width="12" height="12" rx="3"/><path d="M6 9l2 2 4-4"/>', '<path d="M9 16s5-4.6 5-8.5A5 5 0 004 7.5C4 11.4 9 16 9 16z"/><circle cx="9" cy="7.5" r="1.8"/>', '<circle cx="9" cy="6.5" r="3"/><path d="M3.5 15.5c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5"/>'];
  let done = 3, tasks = [];
  const fmt = (o, n) => L(o).replace('{n}', n);
  function build() {
    $('#appTtl').textContent = L(UI.title);
    $('#appDate').textContent = new Date().toLocaleDateString(LOC[LANG], LANG === 'en' ? { weekday: 'short', month: 'short', day: 'numeric' } : { month: 'long', day: 'numeric', weekday: 'short' });
    $('#appSeg').innerHTML = L(UI.seg).split(',').map((x, i) => `<span class="${i ? '' : 'on'}">${x}</span>`).join('');
    $('#appTab').innerHTML = L(UI.tab).split(',').map((x, i) => `<span class="${i === 1 ? 'on' : ''}"><svg viewBox="0 0 18 18">${ICONS[i]}</svg>${x}</span>`).join('');
    $('#notifHd').textContent = L(UI.nhd);
    $('#shTitle').textContent = L(UI.sh); $('#shStops').textContent = L(UI.stops);
    track.innerHTML = TASKS.map(t => `<div class="task"><span class="task__tag ${t[2]}">${L(TAG[t[2]])}</span><span class="task__t">${t[0]} <em>${L(t[1])}</em></span><span class="task__m"><svg viewBox="0 0 10 12"><path d="M5 11.5S9 7.8 9 4.8A4 4 0 001 4.8C1 7.8 5 11.5 5 11.5z"/></svg>${L(t[3])}<i>${t[4]}</i></span><span class="task__ck"><svg viewBox="0 0 12 12"><path d="M2 6.5l2.6 2.5L10 3.5"/></svg></span></div>`).join('');
    tasks = $$('.task', track);
    update();
  }
  function update() {
    const n = TASKS.length;
    tasks.forEach((el, i) => { el.classList.toggle('done', i < done); el.classList.toggle('next', i === done); });
    $('#appDone').textContent = fmt(UI.done, done); $('#appLeft').textContent = fmt(UI.left, n - done);
    $('#appPct').textContent = Math.round(done / n * 100) + '%';
    const C = 2 * Math.PI * 18; const ring = $('#appRing'); ring.style.strokeDasharray = C; ring.style.strokeDashoffset = C * (1 - done / n);
    const rowH = (tasks[0] ? tasks[0].offsetHeight : 60) + 7;
    track.style.transform = `translateY(${-Math.max(0, done - 2) * rowH}px)`;
  }
  build();
  addEventListener('pius:lang', build);
  let last = 0, nt = 0, tilt = { x: 0, y: 0 };
  Engine.scene(root, (p, t, dt) => {
    const k = E.out3(range(p, .08, .42));
    let tx = 0, ty = 0;
    if (FINE && PTR.active) {
      const r = mob.getBoundingClientRect();
      if (PTR.x > r.left && PTR.x < r.right && PTR.y > r.top && PTR.y < r.bottom) { ty = ((PTR.x - r.left) / r.width - .5) * 16; tx = ((PTR.y - r.top) / r.height - .5) * -10; }
    }
    tilt.x = lerp(tilt.x, tx, 1 - Math.pow(.03, dt)); tilt.y = lerp(tilt.y, ty, 1 - Math.pow(.03, dt));
    phone.style.setProperty('--prx', (lerp(28, 0, k) + tilt.x).toFixed(2) + 'deg');
    phone.style.setProperty('--pry', (lerp(-18, 0, k) + tilt.y).toFixed(2) + 'deg');
    phone.style.setProperty('--pty', lerp(90, 0, k).toFixed(1) + 'px');
    phone.style.setProperty('--pg', (-40 + tilt.y * 6 + p * 60).toFixed(1) + '%');
    back.style.setProperty('--pbo', E.out3(range(p, .22, .5)).toFixed(3));
    const dr = E.io3(range(p, .28, .62));
    route.style.strokeDashoffset = (RL * (1 - dr)).toFixed(1);
    /* vehicle travels the drawn route; ETA counts down with it */
    const u = dr >= 1 ? .55 + .35 * ((Math.sin(t * .35) + 1) / 2) : dr * .55;
    const pt = route.getPointAtLength(u * RL);
    car.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
    $('#shEta').textContent = fmt(UI.eta, Math.max(2, Math.round(24 * (1 - u))));
    back.querySelector('.sheet__bar i').style.width = (u * 100).toFixed(1) + '%';
    if (k > .5 && t - last > 1.9) {
      last = t;
      done = done >= TASKS.length ? 1 : done + 1;
      update();
      if (++nt % 3 === 0) { $('#notifTxt').textContent = L(UI.nt[(nt / 3) % 3 | 0]); notif.classList.add('on'); setTimeout(() => notif.classList.remove('on'), 2300); }
    }
  });
})();

/* ---------- 05 INTEGRATION: legacy → hub → new system → unified data ---------- */
(() => {
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
  const boxT = (x, y, w, h, main, en, cls) => boxEl(x, y, w, h, LANG === 'en' ? en : main, LANG === 'en' ? '' : en, cls);
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
  box.innerHTML = wide + tall;
  sets = $$('svg', box).map(svg => {
    const paths = $$('.p-draw', svg).map(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; return { p, L, g: +p.dataset.g, dots: [0, 1].map(() => svgEl('circle', { class: 'pk', r: 2.8 }, svg)) }; });
    return { svg, paths, lb: $$('.lb', svg), nb: $$('.nb', svg), db: $('.db', svg), hub: $('.hub', svg) };
  });
  }
  draw(); addEventListener('pius:lang', draw);
  const G = [[.12, .38], [.44, .56], [.62, .74]];
  Engine.scene(root, (p, t) => {
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
})();

/* ---------- HOW WE WORK: one organism assembling ---------- */
onceInView($('#procTitle'), el => el.classList.add('is-in'));
(() => {
  const t = $('#procTitle');
  t.innerHTML = t.textContent.split(' ').map(w => `<span style="display:inline-block;white-space:nowrap">${w.split('').map(c => `<span class="ch">${c}</span>`).join('')}</span>`).join(' ');
  $$('.ch', t).forEach((c, i) => c.style.transitionDelay = (i * 22) + 'ms');
})();
(() => {
  const root = $('#proc'), box = $('#org'), list = $$('#procList li'), mdesc = $('#procMdesc'), fin = $('#procFinal');
  const STG = [['Understand', '요구사항'], ['Plan', '기획·설계'], ['Design', 'UI/UX'], ['Develop', '개발'], ['Deploy', '배포'], ['Stabilize', '안정화']];
  const ROLES = ['기획', '디자인', '개발', '인프라', 'QA', '운영'];
  const C = 300, R = 214;
  const svg = svgEl('svg', { viewBox: '0 0 600 600' }, box);
  svg.innerHTML = `<defs><radialGradient id="coreG"><stop offset="0" stop-color="#bfd6ff" stop-opacity=".35"/><stop offset="1" stop-color="#bfd6ff" stop-opacity="0"/></radialGradient></defs>`;
  const mem2 = svgEl('path', { class: 'mem2' }, svg);
  const mem = svgEl('path', { class: 'mem' }, svg);
  const orbit = svgEl('circle', { class: 'orbit', cx: C, cy: C, r: R }, svg);
  const mesh = svgEl('g', { class: 'mesh' }, svg);
  const spokes = svgEl('g', {}, svg);
  const arc = svgEl('circle', { class: 'arc', cx: C, cy: C, r: R, transform: `rotate(-90 ${C} ${C})` }, svg);
  const CIRC = 2 * Math.PI * R; arc.style.strokeDasharray = `0 ${CIRC}`;
  const glow = svgEl('circle', { class: 'core-glow', cx: C, cy: C, r: 120 }, svg);
  const [BX, BY, BW, BH] = LOGO.box; const ms = 86 / BH;
  const core = svgEl('g', { transform: `translate(${C - BW * ms / 2} ${C - BH * ms / 2}) scale(${ms}) translate(${-BX} ${-BY})` }, svg);
  LOGO.mark.forEach(d => svgEl('path', { d, fill: 'rgba(255,255,255,.10)', stroke: 'rgba(191,214,255,.85)', 'stroke-width': 1 / ms * 1.1 }, core));
  const roleEls = ROLES.map(r => { const e = svgEl('text', { class: 'role' }, svg); e.textContent = r; return e; });
  const pairs = [];
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) pairs.push([i, j, svgEl('line', {}, mesh)]);
  const sp = STG.map(() => svgEl('line', { class: 'spoke', x1: C, y1: C }, spokes));
  const nodes = STG.map((s, i) => {
    const g = svgEl('g', { class: 'nd' }, svg);
    svgEl('circle', { class: 'h', r: 44 }, g);
    svgEl('circle', { class: 'b', r: 38 }, g);
    const a = svgEl('text', { y: -2, class: 'e' }, g); a.textContent = s[0];
    const b = svgEl('text', { class: 'k', y: 15 }, g); b.textContent = s[1];
    g.__k = b; g.__i = i;
    return { g, ang: -Math.PI / 2 + i * Math.PI / 3, x: C, y: C };
  });
  const pulse = svgEl('circle', { class: 'pulse', r: 3.5 }, svg);
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
  addEventListener('pius:lang', () => { if (cur >= 0) mdesc.textContent = list[cur].querySelector('.d').textContent; });
  const setM = () => {
    const m = isMobile(); box.classList.toggle('is-m', m);
    nodes.forEach(n => { const [h, b] = n.g.querySelectorAll('circle'); h.setAttribute('r', m ? 56 : 44); b.setAttribute('r', m ? 50 : 38); n.g.querySelector('.e').setAttribute('y', m ? 7 : -2); });
  };
  setM(); addEventListener('pius:resize', setM);
  const relabel = () => {
    nodes.forEach((n, i) => { n.g.__k.textContent = T('p.n' + i); });
    const rs = T('p.roles').split(','); roleEls.forEach((e, i) => { e.textContent = rs[i]; });
    box.classList.toggle('no-k', LANG === 'en');
  };
  relabel(); addEventListener('pius:lang', relabel);
  Engine.scene(root, (p, t) => {
    const s = clamp((p - .04) / .78) * 6;
    const act = Math.min(5, Math.floor(s));
    if (act !== cur) {
      cur = act;
      list.forEach((li, i) => { li.classList.toggle('is-on', i === act); li.classList.toggle('is-past', i < act); });
      mdesc.textContent = list[act].querySelector('.d').textContent;
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
})();

/* ---------- CONTACT ---------- */
(() => {
  const t = $('#contactTitle');
  t.innerHTML = t.textContent.split(' ').map(w => `<span style="display:inline-block;white-space:nowrap">${w.split('').map(c => `<span class="ch">${c}</span>`).join('')}</span>`).join(' ');
  const chs = $$('.ch', t);
  onceInView(t, () => chs.forEach((c, i) => setTimeout(() => c.classList.add('lit'), 60 * i)));

  const form = $('#form');
  form.addEventListener('pointermove', e => { const r = form.getBoundingClientRect(); form.style.setProperty('--fx', (e.clientX - r.left) + 'px'); form.style.setProperty('--fy', (e.clientY - r.top) + 'px'); });
  const rules = {
    name: v => v.trim().length > 0,
    phone: v => v.replace(/\D/g, '').length >= 9,
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    message: v => v.trim().length > 0,
  };
  const check = el => {
    const fn = rules[el.name]; if (!fn) return true;
    const ok = fn(el.value); el.closest('.fld').classList.toggle('invalid', !ok); el.setAttribute('aria-invalid', !ok);
    return ok;
  };
  $$('input, textarea', form).forEach(el => el.addEventListener('blur', () => { if (el.value) check(el); }));
  $$('input, textarea', form).forEach(el => el.addEventListener('input', () => { if (el.closest('.fld')?.classList.contains('invalid')) check(el); }));
  const agree = form.querySelector('[name=agree]');
  agree.addEventListener('change', () => $('#agree').classList.toggle('invalid', !agree.checked));
  form.addEventListener('submit', e => {
    e.preventDefault();
    let first = null;
    $$('input:not([type=checkbox]), textarea', form).forEach(el => { if (!check(el) && !first) first = el; });
    if (!agree.checked) { $('#agree').classList.add('invalid'); first = first || agree; }
    if (first) { first.focus(); return; }
    /* Submission. Set window.PIUS_CONFIG.formEndpoint to POST JSON to a real API.
       Without an endpoint the form only simulates sending (UI preview). */
    form.classList.add('is-sending');
    const cfg = window.PIUS_CONFIG || {};
    const data = Object.fromEntries(new FormData(form).entries());
    data.agree = agree.checked; data.lang = LANG; data.sentAt = new Date().toISOString();
    const finish = ok => {
      form.classList.remove('is-sending');
      if (ok) form.classList.add('is-done');
      else toast(T('f.fail'));
    };
    if (cfg.formEndpoint) {
      fetch(cfg.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(r => finish(r.ok)).catch(() => finish(false));
    } else setTimeout(() => finish(true), 1300);
  });
  $('#formReset').addEventListener('click', () => {
    form.reset(); $$('.invalid', form).forEach(x => x.classList.remove('invalid')); form.classList.remove('is-done');
    $('#f-name').focus();
  });
})();

/* ---------- FOOTER: extruded wordmark — depth follows the cursor, light sweeps the face ---------- */
(() => {
  const ftr = $('#ftr'), g = $('#ftrG'), big = $('.ftr__big'), ext = $('#ftrExt');
  const N = 12, layers = [];
  for (let i = N; i >= 1; i--) {
    const u = svgEl('use', { href: '#ftrW' }, ext);
    const k = 1 - i / N;                      /* 0 = far, 1 = near */
    const c = Math.round(8 + k * 22);
    u.setAttribute('fill', `rgb(${c},${c + 2},${c + 5})`);
    layers.push([u, i]);
  }
  const d = { x: .2, y: .28 };
  Engine.scene(ftr, (p, t, dt) => {
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
  $('#yr').textContent = new Date().getFullYear();
})();

/* =========================================================
   BOOT — always start at the hero
   ========================================================= */
(() => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  Lang.apply(LANG);
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  scrollTo(0, 0);
  const hero = $('#top');
  Engine.tick(document.body, (t, dt) => { const sy = scrollY; Header.update(sy); Atmos.update(sy, dt); HeroBG.update(t, dt); HeroMark.update(t, dt); });
  const go = () => {
    fitHero(); Engine.start(); Header.measure();
    HeroMark.start();
    Splash.play(() => {
      HeroMark.intro(); HeroBG.start();
      setTimeout(() => { hero.classList.add('is-in'); Header.show(); }, 450);
      setTimeout(() => hero.classList.add('is-revealed'), 2000);
      setTimeout(() => { document.documentElement.classList.remove('is-locked'); scrollTo(0, 0); }, 700);
    });
  };
  const ready = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))]) : Promise.resolve();
  ready.then(() => requestAnimationFrame(go));
  addEventListener('load', () => { Engine.measure(); Header.measure(); });
})();
