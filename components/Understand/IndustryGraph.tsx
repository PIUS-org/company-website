'use client';
/* Industry → workflow graph (pinned). Graph on the left, copy on the right. */
import { useEffect } from 'react';
import { cxm } from '@/lib/core';
import { useLang } from '../LangProvider';
import { initIndustry } from './industry.controller';
import s from './IndustryGraph.module.css';

export default function IndustryGraph() {
  const c = cxm(s);
  const { t } = useLang();
  useEffect(() => initIndustry(document.body, s), []);
  return (
    <div className={c('pin-scene ind')} id="ind">
    <div className={c('pin')} data-pin="">
      <div className={c('wrap ind__grid')}>
        <div className={c('ind__side')}>
          <p className={c('ind__cap')}>{t('ind.cap')}</p>
          <div className={c('ind__name')} aria-live="polite"><span className={c('ind__en')} id="indEn">Manufacturing</span><span className={c('ind__ko')} id="indKo">제조</span></div>
          <div className={c('ind__tabs')} id="indTabs" role="tablist" aria-label="Industry">
            <button type="button" role="tab" data-i="0"><span>{t('ind.0')}</span><i></i></button>
            <button type="button" role="tab" data-i="1"><span>{t('ind.1')}</span><i></i></button>
            <button type="button" role="tab" data-i="2"><span>{t('ind.2')}</span><i></i></button>
            <button type="button" role="tab" data-i="3"><span>{t('ind.3')}</span><i></i></button>
          </div>
          <p className={c('ind__note')}>{t('ind.note')}</p>
        </div>
        <div className={c('ind__graph')} id="indGraph" aria-hidden="true">
          <div className={c('ind__bgword')} id="indBg">MANUFACTURING</div>
          <svg className={c('ind__links')} id="indLinks"></svg>
        </div>
      </div>
    </div>
  </div>
  );
}
