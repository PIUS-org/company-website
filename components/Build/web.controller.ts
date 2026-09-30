// @ts-nocheck — imperative animation logic ported verbatim from the original site (output must stay identical).
//   The exported init() signature is typed; internals are candidates for incremental typing.
/* Web systems — browser windows shuffle; the cursor presses a real button first. */
import { $, $$, adopter, Engine, E, FINE, PTR, RM, Scroller, clamp, lerp, mk, on, onceInView, range, scramble, svgEl, isMobile, toast, type SceneFn, type Styles } from '@/lib/core';
import { T, L, getLang } from '@/lib/i18n';
import { MARK, MARK_BOX } from '@/lib/logo';

export function initWeb(host: HTMLElement, st: Styles): () => void {
  void host;
  const { c: cls, S: sel } = mk(st);
  const adopt = adopter(st);
  const offs: (() => void)[] = [];
  const addScene = (el: HTMLElement, fn: SceneFn, type: 'pin' | 'pass' = 'pass', m?: () => void) => { offs.push(Engine.scene(el, fn, type, m)); };
  const addTick = (el: HTMLElement | null, fn: (t: number, dt: number) => void) => { offs.push(Engine.tick(el, fn)); };
  const listen = (n: string, fn: (e: Event) => void) => { offs.push(on(n, fn)); };
  void cls; void sel; void adopt; void addScene; void addTick; void listen;

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
  const cursor = document.createElement('div'); cursor.className = cls('web__cursor');
  cursor.innerHTML = '<svg viewBox="0 0 18 18"><path d="M2 1l13 7-6 1.4L6.6 16z" fill="#fff" stroke="#000" stroke-width="1"/></svg>';
  function build() {
    wins.forEach(w => w.remove());
    wins = S.map(sc => {
      const w = document.createElement('div'); w.className = cls('web__win');
      w.innerHTML = `<div class="web__url"><i></i><i></i><i></i><span>${sc.url}</span></div><div class="web__ui">${sc.ui(`<span class="wb">${L(sc.btn)}</span>`)}</div><span class="web__lbl">${sc.lbl}</span>`; adopt(w);
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
    const front = wins[order[0]], btn = front && front.querySelector(sel('.wb')); if (!btn) return;
    const br = box.getBoundingClientRect(), r = btn.getBoundingClientRect();
    const x = r.left - br.left + r.width * .62, y = r.top - br.top + r.height * .55;
    cursor.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    if (click) setTimeout(() => {
      cursor.classList.remove('click'); void cursor.offsetWidth; cursor.classList.add('click');
      btn.classList.add('is-press'); setTimeout(() => btn.classList.remove('is-press'), 520);
    }, 1050);
  }
  build();
  listen('pius:lang', build);
  addScene(root, (p, t) => {
    const s = E.out3(range(p, .1, .45));
    if (Math.abs(s - spread) > .005) { spread = s; layout(); }
    if (t - last > 1.7) {
      last = t; phase = (phase + 1) % 2;
      if (phase === 1) aim(true);
      else { order.push(order.shift()); layout(); setTimeout(() => aim(false), 650); }
    }
  });

  return () => offs.forEach(f => f());
}
