'use client';
/* Business → Workflow → Information → System — particle morph (pinned). */
import { useEffect } from 'react';
import { cxm } from '@/lib/core';
import { useLang } from '../LangProvider';
import { initMorph } from './morph.controller';
import s from './Morph.module.css';

export default function Morph() {
  const c = cxm(s);
  const { t } = useLang();
  useEffect(() => initMorph(document.body, s), []);
  return (
    <div className={c('pin-scene morph')} id="morph">
    <div className={c('pin')} data-pin="">
      <canvas className={c('morph__cv')} id="morphCv" aria-hidden="true"></canvas>
      <div className={c('wrap morph__grid')}>
        <ol className={c('morph__steps')} id="morphSteps">
          <li><span className={c('n')}>01</span><span className={c('t')}>Business</span><span className={c('d')}>{t('mo.d0')}</span></li>
          <li><span className={c('n')}>02</span><span className={c('t')}>Workflow</span><span className={c('d')}>{t('mo.d1')}</span></li>
          <li><span className={c('n')}>03</span><span className={c('t')}>Information</span><span className={c('d')}>{t('mo.d2')}</span></li>
          <li><span className={c('n')}>04</span><span className={c('t')}>System</span><span className={c('d')}>{t('mo.d3')}</span></li>
        </ol>
        <p className={c('morph__mdesc')} id="morphMdesc">현재 업무가 어떻게 움직이는지</p>
      </div>
      <p className={c('morph__end')} id="morphEnd">{t('mo.end')}</p>
    </div>
  </div>
  );
}
