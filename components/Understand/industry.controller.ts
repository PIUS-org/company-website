// @ts-nocheck — imperative animation logic ported verbatim from the original site (output must stay identical).
//   The exported init() signature is typed; internals are candidates for incremental typing.
/* Industry scene — the workflow graph re-arranges per industry. */
import { $, $$, adopter, Engine, E, FINE, PTR, RM, Scroller, clamp, lerp, mk, on, onceInView, range, scramble, svgEl, isMobile, toast, type SceneFn, type Styles } from '@/lib/core';
import { T, L, getLang } from '@/lib/i18n';
import { MARK, MARK_BOX } from '@/lib/logo';

export function initIndustry(host: HTMLElement, st: Styles): () => void {
  void host;
  const { c: cls, S: sel } = mk(st);
  const adopt = adopter(st);
  const offs: (() => void)[] = [];
  const addScene = (el: HTMLElement, fn: SceneFn, type: 'pin' | 'pass' = 'pass', m?: () => void) => { offs.push(Engine.scene(el, fn, type, m)); };
  const addTick = (el: HTMLElement | null, fn: (t: number, dt: number) => void) => { offs.push(Engine.tick(el, fn)); };
  const listen = (n: string, fn: (e: Event) => void) => { offs.push(on(n, fn)); };
  void cls; void sel; void adopt; void addScene; void addTick; void listen;

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
  listen('pius:resize', () => setTimeout(fitBg, 50));
  bgEl.style.transition = 'opacity .4s';
  const NODE_T = { Equipment: ['설비', '設備'], Production: ['생산', '生産'], Quality: ['품질', '品質'], Inventory: ['재고', '在庫'], Shipment: ['출하', '出荷'],
    Dispatch: ['배차', '配車'], Vehicle: ['차량', '車両'], Driver: ['기사', 'ドライバー'], Transport: ['운송', '輸送'], Operation: ['운행', '運行'], Settlement: ['정산', '精算'],
    Product: ['상품', '商品'], Order: ['주문', '注文'], Payment: ['결제', '決済'], Delivery: ['배송', '配送'], Customer: ['고객', '顧客'],
    Transaction: ['거래', '取引'], Approval: ['승인', '承認'], Data: ['데이터', 'データ'], Report: ['리포트', 'レポート'] };
  const sub = en => getLang() === 'en' ? '' : (NODE_T[en] || [])[getLang() === 'ja' ? 1 : 0] || '';
  const SLOTS = 6, LINKS = 8;
  const nodes = Array.from({ length: SLOTS }, () => {
    const d = document.createElement('div'); d.className = cls('node');
    d.innerHTML = '<b></b><span></span>'; graph.appendChild(d);
    return { el: d, b: d.querySelector('b'), s: d.querySelector('span'), x: 0, y: 0, fx: 0, fy: 0, tx: 0, ty: 0, a: 0, fa: 0, ta: 0, w: 120, h: 50, depth: .4 + Math.random() * .6 };
  });
  const links = Array.from({ length: LINKS }, () => {
    const g = svgEl('g', {}, svg);
    return { g, base: svgEl('path', {}, g), flow: svgEl('path', { class: cls('flow') }, g), dot: svgEl('circle', { r: 2.6 }, g), a: 0, b: 0, on: false, o: 0 };
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
      scramble(enEl, d.en, 650); koEl.textContent = getLang() === 'en' ? '' : T('ind.' + i);
      bgEl.style.opacity = 0;
      setTimeout(() => { bgEl.textContent = d.en.toUpperCase(); fitBg(); bgEl.style.opacity = 1; }, 300);
    } else { enEl.textContent = d.en; koEl.textContent = getLang() === 'en' ? '' : T('ind.' + i); bgEl.textContent = d.en.toUpperCase(); fitBg(); }
    tabs.forEach((b, k) => { b.classList.toggle('is-on', k === i); b.setAttribute('aria-selected', k === i); });
    nodes.forEach((n, k) => {
      const nd = d.n[k];
      n.fx = n.x; n.fy = n.y; n.fa = n.a;
      if (nd) {
        if (!instant) { if (n.b.textContent) scramble(n.b, nd[0], 600); else n.b.textContent = nd[0]; } else n.b.textContent = nd[0];
        n.s.textContent = sub(nd[0]); n.s.style.display = getLang() === 'en' ? 'none' : '';
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
  listen('pius:lang', () => { if (cur >= 0) set(cur, true); });
  tabs.forEach((b, i) => b.addEventListener('click', () => {
    const s = scene.getBoundingClientRect(), pinH = $('[data-pin]', scene).offsetHeight;
    Scroller.to(scrollY + s.top + (s.height - pinH) * ((i + .5) / 4), 900);
  }));
  const px = { x: 0, y: 0 };
  addScene(scene, (p, t, dt) => {
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

  return () => offs.forEach(f => f());
}
