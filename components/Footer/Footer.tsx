'use client';
/* FOOTER — company info + extruded wordmark. */
import { useEffect } from 'react';
import { cxm } from '@/lib/core';
import { useLang } from '../LangProvider';
import { LOCKUP_VB } from '@/lib/logo';
import { LockupPaths, WordPaths } from '../Logo';
import { initFooter } from './footer.controller';
import s from './Footer.module.css';

const YEAR = new Date().getFullYear();

export default function Footer() {
  const c = cxm(s);
  const { t } = useLang();
  useEffect(() => initFooter(document.body, s), []);
  return (
    <footer className={c('ftr')} id="ftr">
  <div className={c('wrap')}>
    <div className={c('ftr__top')}>
      <div className={c('ftr__logo')}><svg viewBox={LOCKUP_VB} role="img" aria-label="PIUS"><LockupPaths /></svg></div>
      <dl className={c('ftr__info')}>
        <div><dt>{t('ft.ceo')}</dt><dd>{t('ft.ceo.v')}</dd></div>
        <div><dt>{t('ft.founded')}</dt><dd><time dateTime="2023-01-30">{t('ft.founded.v')}</time></dd></div>
        <div><dt>{t('ft.addr')}</dt><dd>{t('ft.addr.v')}</dd></div>
        <div><dt>{t('ft.reg')}</dt><dd>690-04-02624</dd></div>
      </dl>
    </div>
    <div className={c('ftr__big')} aria-hidden="true">
      <svg viewBox="-1 -1 212 50" id="ftrSvg">
        <defs>
          <g id="ftrW"><WordPaths /></g>
          <linearGradient id="ftrFace" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a404a"/><stop offset=".55" stopColor="#1a1d23"/><stop offset="1" stopColor="#0e1014"/>
          </linearGradient>
          <linearGradient id="ftrG" gradientUnits="userSpaceOnUse" x1="-60" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0"/>
            <stop offset=".5" stopColor="#dfeaff" stopOpacity=".6"/>
            <stop offset="1" stopColor="#fff" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <g id="ftrExt"></g>
        <use href="#ftrW" className={c('face')}/>
        <use href="#ftrW" className={c('lit')}/>
        <use href="#ftrW" className={c('o')}/>
      </svg>
    </div>
  </div>
  <div className={c('wrap')}>
    <div className={c('ftr__bot')}>
      <span>© 2023–<span id="yr">{YEAR}</span> PIUS. All rights reserved.</span>
      <a className={c('ftr__up')} href="#top">Top<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M7 12V2M3 6l4-4 4 4"/></svg></a>
    </div>
  </div>
</footer>
  );
}
