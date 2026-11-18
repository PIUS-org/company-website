// @ts-nocheck — imperative animation logic ported verbatim from the original site (output must stay identical).
//   The exported init() signature is typed; internals are candidates for incremental typing.
/* Contact — headline lights up letter by letter; validated glass form (UI + optional API endpoint). */
import { $, $$, adopter, Engine, E, EV, FINE, PTR, RM, Scroller, clamp, lerp, mk, on, onceInView, range, scramble, svgEl, isMobile, toast, type SceneFn, type Styles } from '@/lib/core';
import { T, L, getLang } from '@/lib/i18n';
import { MARK, MARK_BOX } from '@/lib/logo';

export function initContact(host: HTMLElement, st: Styles): () => void {
  void host;
  const { c: cls, S: sel } = mk(st);
  const adopt = adopter(st);
  const offs: (() => void)[] = [];
  const addScene = (el: HTMLElement, fn: SceneFn, type: 'pin' | 'pass' = 'pass', m?: () => void) => { offs.push(Engine.scene(el, fn, type, m)); };
  const addTick = (el: HTMLElement | null, fn: (t: number, dt: number) => void) => { offs.push(Engine.tick(el, fn)); };
  const listen = (n: string, fn: (e: Event) => void) => { offs.push(on(n, fn)); };
  void cls; void sel; void adopt; void addScene; void addTick; void listen;

  const t = $('#contactTitle');
  t.innerHTML = t.textContent.split(' ').map(w => `<span style="display:inline-block;white-space:nowrap">${w.split('').map(c => `<span class="ch">${c}</span>`).join('')}</span>`).join(' '); adopt(t);
  const chs = $$(sel('.ch'), t);
  onceInView(t, () => chs.forEach((c, i) => setTimeout(() => c.classList.add('lit'), 60 * i)));

  const form = $('#form');
  // Portfolio context: an editable draft, never a submitted inquiry.
  // Use text inputs only; no HTML injection, no cross-origin data transfer.
  const query = new URLSearchParams(window.location.search);
  const refSlug = query.get('portfolio') || '';
  const refName = query.get('case') || '';
  if (/^[a-z0-9-]{1,90}$/.test(refSlug) && refName.length > 0 && refName.length < 180) {
    const textarea = form.querySelector('[name=message]');
    /* four lines so the draft fits the 4-row field; written in the page language, which is only known
       after <LangProvider> restores it — so it is (re)written on each language event while untouched */
    const draft = l => l === 'en'
      ? `[Portfolio inquiry] Reference: ${refName} (${refSlug})\nI would like to discuss a similar project.\nRequirements: `
      : l === 'ja'
        ? `[ポートフォリオに関するお問い合わせ] 参考事例：${refName} (${refSlug})\n同様のシステムについて相談したいです。\n要件：`
        : `[포트폴리오 관련 문의] 참고 프로젝트: ${refName} (${refSlug})\n유사한 시스템 개발을 상담하고 싶습니다.\n요청사항: `;
    let written = '';
    const fill = () => {
      if (!textarea) return;
      const v = textarea.value;
      if (v.trim() && v !== written) return; /* the visitor has started writing: never overwrite */
      written = draft(getLang()); textarea.value = written;
    };
    fill();
    offs.push(on(EV.lang, fill));
  }
  form.addEventListener('pointermove', e => { const r = form.getBoundingClientRect(); form.style.setProperty('--fx', (e.clientX - r.left) + 'px'); form.style.setProperty('--fy', (e.clientY - r.top) + 'px'); });
  const rules = {
    name: v => v.trim().length > 0,
    phone: v => v.replace(/\D/g, '').length >= 9,
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    message: v => v.trim().length > 0,
  };
  const check = el => {
    const fn = rules[el.name]; if (!fn) return true;
    const ok = fn(el.value); el.closest(sel('.fld')).classList.toggle('invalid', !ok); el.setAttribute('aria-invalid', !ok);
    return ok;
  };
  $$('input, textarea', form).forEach(el => el.addEventListener('blur', () => { if (el.value) check(el); }));
  $$('input, textarea', form).forEach(el => el.addEventListener('input', () => { if (el.closest(sel('.fld'))?.classList.contains('invalid')) check(el); }));
  const agree = form.querySelector('[name=agree]');
  agree.addEventListener('change', () => $('#agree').classList.toggle('invalid', !agree.checked));
  form.addEventListener('submit', e => {
    e.preventDefault();
    let first = null;
    $$('input:not([type=checkbox]), textarea', form).forEach(el => { if (!check(el) && !first) first = el; });
    if (!agree.checked) { $('#agree').classList.add('invalid'); first = first || agree; }
    if (first) { first.focus(); return; }
    /* Submission. Set NEXT_PUBLIC_FORM_ENDPOINT (.env) to POST JSON to a real API.
       Without an endpoint nothing is sent and the failure toast is shown (no fake success).  */
    form.classList.add('is-sending');
    const cfg = { formEndpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT || '' };
    const data = Object.fromEntries(new FormData(form).entries());
    data.agree = agree.checked; data.lang = getLang(); data.sentAt = new Date().toISOString();
    const finish = ok => {
      form.classList.remove('is-sending');
      if (ok) form.classList.add('is-done');
      else toast(T('f.fail'));
    };
    if (cfg.formEndpoint) {
      fetch(cfg.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(r => finish(r.ok)).catch(() => finish(false));
    } else finish(false); /* no endpoint: never simulate a successful inquiry */
  });
  $('#formReset').addEventListener('click', () => {
    form.reset(); $$(sel('.invalid'), form).forEach(x => x.classList.remove('invalid')); form.classList.remove('is-done');
    $('#f-name').focus();
  });

  return () => offs.forEach(f => f());
}
