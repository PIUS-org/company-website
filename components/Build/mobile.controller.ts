// @ts-nocheck — imperative animation logic ported verbatim from the original site (output must stay identical).
//   The exported init() signature is typed; internals are candidates for incremental typing.
/* Mobile — field app (front) + live delivery map (back). */
import { $, $$, adopter, Engine, E, FINE, PTR, RM, Scroller, clamp, lerp, mk, on, onceInView, range, scramble, svgEl, isMobile, toast, type SceneFn, type Styles } from '@/lib/core';
import { T, L, getLang } from '@/lib/i18n';
import { MARK, MARK_BOX } from '@/lib/logo';

export function initMobile(host: HTMLElement, st: Styles): () => void {
  void host;
  const { c: cls, S: sel } = mk(st);
  const adopt = adopter(st);
  const offs: (() => void)[] = [];
  const addScene = (el: HTMLElement, fn: SceneFn, type: 'pin' | 'pass' = 'pass', m?: () => void) => { offs.push(Engine.scene(el, fn, type, m)); };
  const addTick = (el: HTMLElement | null, fn: (t: number, dt: number) => void) => { offs.push(Engine.tick(el, fn)); };
  const listen = (n: string, fn: (e: Event) => void) => { offs.push(on(n, fn)); };
  void cls; void sel; void adopt; void addScene; void addTick; void listen;

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
    $('#appDate').textContent = new Date().toLocaleDateString(LOC[getLang()], getLang() === 'en' ? { weekday: 'short', month: 'short', day: 'numeric' } : { month: 'long', day: 'numeric', weekday: 'short' });
    $('#appSeg').innerHTML = L(UI.seg).split(',').map((x, i) => `<span class="${i ? '' : 'on'}">${x}</span>`).join(''); adopt($('#appSeg'));
    $('#appTab').innerHTML = L(UI.tab).split(',').map((x, i) => `<span class="${i === 1 ? 'on' : ''}"><svg viewBox="0 0 18 18">${ICONS[i]}</svg>${x}</span>`).join(''); adopt($('#appTab'));
    $('#notifHd').textContent = L(UI.nhd);
    $('#shTitle').textContent = L(UI.sh); $('#shStops').textContent = L(UI.stops);
    track.innerHTML = TASKS.map(t => `<div class="task"><span class="task__tag ${t[2]}">${L(TAG[t[2]])}</span><span class="task__t">${t[0]} <em>${L(t[1])}</em></span><span class="task__m"><svg viewBox="0 0 10 12"><path d="M5 11.5S9 7.8 9 4.8A4 4 0 001 4.8C1 7.8 5 11.5 5 11.5z"/></svg>${L(t[3])}<i>${t[4]}</i></span><span class="task__ck"><svg viewBox="0 0 12 12"><path d="M2 6.5l2.6 2.5L10 3.5"/></svg></span></div>`).join(''); adopt(track);
    tasks = $$(sel('.task'), track);
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
  listen('pius:lang', build);
  let last = 0, nt = 0, tilt = { x: 0, y: 0 };
  addScene(root, (p, t, dt) => {
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
    back.querySelector(sel('.sheet__bar i')).style.width = (u * 100).toFixed(1) + '%';
    if (k > .5 && t - last > 1.9) {
      last = t;
      done = done >= TASKS.length ? 1 : done + 1;
      update();
      if (++nt % 3 === 0) { $('#notifTxt').textContent = L(UI.nt[(nt / 3) % 3 | 0]); notif.classList.add('on'); setTimeout(() => notif.classList.remove('on'), 2300); }
    }
  });

  return () => offs.forEach(f => f());
}
