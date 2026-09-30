'use client';
/* UNDERSTAND THE BUSINESS — intro, then the industry graph and the particle morph (both pinned). */
import { useEffect, useRef } from 'react';
import { onceInView } from '@/lib/core';
import { useLang } from '../LangProvider';
import IndustryGraph from './IndustryGraph';
import Morph from './Morph';
import s from './Understand.module.css';

export default function Understand() {
  const { t } = useLang();
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => onceInView(title.current, el => el.classList.add('is-in')), []);
  return (
    <section className={`sec ${s.und}`} id="understand">
      <div className={`wrap ${s.und__intro}`} id="undIntro">
        <div>
          <div className="sec-idx">Understand the business</div>
          <h2 className={s.und__title} ref={title} style={{ marginTop: 24 }}>
            <span className={s.rv}><span>{t('und.t1')}</span></span>
            <span className={s.rv}><span className={s.dim}>{t('und.t2')}</span></span>
            <span className={s.rv}><span>{t('und.t3')}</span></span>
          </h2>
        </div>
        <p className={s.und__lead}>{t('und.lead')}</p>
      </div>
      <IndustryGraph />
      <Morph />
    </section>
  );
}
