// @ts-nocheck — imperative animation logic ported verbatim from the original site (output must stay identical).
//   The exported init() signature is typed; internals are candidates for incremental typing.
/* ERP mock — every module renders its own screen; the window height is locked to the tallest. */
import { $, $$, adopter, Engine, E, FINE, PTR, RM, Scroller, clamp, lerp, mk, on, onceInView, range, scramble, svgEl, isMobile, toast, type SceneFn, type Styles } from '@/lib/core';
import { T, L, getLang } from '@/lib/i18n';
import { MARK, MARK_BOX } from '@/lib/logo';

export function initErp(host: HTMLElement, st: Styles): () => void {
  void host;
  const { c: cls, S: sel } = mk(st);
  const adopt = adopter(st);
  const offs: (() => void)[] = [];
  const addScene = (el: HTMLElement, fn: SceneFn, type: 'pin' | 'pass' = 'pass', m?: () => void) => { offs.push(Engine.scene(el, fn, type, m)); };
  const addTick = (el: HTMLElement | null, fn: (t: number, dt: number) => void) => { offs.push(Engine.tick(el, fn)); };
  const listen = (n: string, fn: (e: Event) => void) => { offs.push(on(n, fn)); };
  void cls; void sel; void adopt; void addScene; void addTick; void listen;

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
  const htmlFor = i => {
    const m = MODS[i];
    return `<div class="erp__head"><div><b>${L(m.name)}</b><span>${L(m.sub)}</span></div><div class="erp__tools"><span class="erp__pill">${L(UI.month)}</span><span class="erp__add">+ ${L(UI.add)}</span></div></div>
      <div class="erp__kpis">${m.kpi.map(([l, v, dec = 0, u]) => `<div><span>${L(l)}</span><b data-to="${v}" data-dec="${dec}">0</b>${u ? `<small>${L(u)}</small>` : ''}</div>`).join('')}</div>
      <div class="erp__panel ec--${m.chart.type}"><div class="erp__ptitle">${L(m.chart.title)}</div>${chart(m.chart)}</div>
      <div class="erp__table"><div class="erp__row erp__row--h">${m.cols.map(c => `<span>${L(c)}</span>`).join('')}</div>${m.rows.map((r, k) => `<div class="erp__row" style="animation-delay:${200 + k * 70}ms">${r.map(cell).join('')}</div>`).join('')}</div>`;
  };
  /* lock the screen height to the tallest module so the copy beside it never moves */
  function lockHeight() {
    main.style.minHeight = '';
    let max = 0;
    MODS.forEach((m, i) => { main.innerHTML = htmlFor(i); adopt(main); max = Math.max(max, main.offsetHeight); });
    main.style.minHeight = Math.ceil(max) + 'px';
  }
  function render(i, animate = true) {
    const m = MODS[i];
    $$('li', modsEl).forEach((li, k) => li.classList.toggle('is-on', k === i));
    crumb.textContent = L(m.name);
    const html = htmlFor(i);
    const swap = () => {
      main.innerHTML = html; adopt(main); main.classList.remove('is-out');
      $$('[data-to]', main).forEach(b => {
        const to = +b.dataset.to, dec = +b.dataset.dec, t0 = performance.now();
        const st = now => { const p = E.out4(clamp((now - t0) / 700)); b.textContent = (to * p).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); if (p < 1) requestAnimationFrame(st); };
        requestAnimationFrame(st);
      });
    };
    if (animate && !RM) { main.classList.add('is-out'); setTimeout(swap, 240); } else swap();
  }
  function build() {
    modsEl.innerHTML = MODS.map(m => `<li><svg viewBox="0 0 14 14">${IC[m.k]}</svg><span>${L(m.name)}</span></li>`).join(''); adopt(modsEl);
    tags.innerHTML = MODS.map(m => `<li>${L(m.name)}</li>`).join(''); adopt(tags);
    lockHeight();
    render(mi, false);
  }
  build();
  listen('pius:lang', build);
  let rw = innerWidth;
  listen('pius:resize', () => { if (innerWidth !== rw) { rw = innerWidth; lockHeight(); render(mi, false); } });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { lockHeight(); render(mi, false); });
  let tilt = { x: 0, y: 0 };
  addScene(root, (p, t, dt) => {
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

  return () => offs.forEach(f => f());
}
