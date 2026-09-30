'use client';
/* HOW WE WORK — six stages dock onto one organism (pinned). */
import { useEffect } from 'react';
import { cxm, onceInView } from '@/lib/core';
import { useLang } from '../LangProvider';
import { initProcess } from './process.controller';
import s from './Process.module.css';

/* running character index per word, so the stagger flows across the whole title */
const TITLE_OFFSETS = 'One Team. From Idea to System.'.split(' ').reduce<number[]>((acc, w, i, a) => { acc.push(i ? acc[i - 1] + a[i - 1].length : 0); return acc; }, []);

export default function Process() {
  const c = cxm(s);
  const { t } = useLang();
  useEffect(() => onceInView(document.getElementById('procTitle'), el => el.classList.add('is-in')), []);
  useEffect(() => initProcess(document.body, s), []);
  return (
    <section className={c('sec')} id="process">
  <div className={c('wrap proc__head')}>
    <div className={c('sec-idx')}>How we work</div>
    <h2 className={c('proc__title disp')} id="procTitle" style={{ marginTop: 22 }}>
      {'One Team. From Idea to System.'.split(' ').map((w, wi, arr) => (
        <span key={wi}><span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
          {w.split('').map((ch, i) => <span key={i} className={c('ch')} style={{ transitionDelay: (TITLE_OFFSETS[wi] + i) * 22 + 'ms' }}>{ch}</span>)}
        </span>{wi < arr.length - 1 ? ' ' : ''}</span>
      ))}
    </h2>
    <p className={c('proc__lead')}>{t('proc.lead')}</p>
  </div>
  <div className={c('pin-scene proc')} id="proc">
    <div className={c('pin')} data-pin="">
      <div className={c('wrap proc__grid')}>
        <div>
          <ol className={c('proc__list')} id="procList">
            <li><span className={c('n')}>01</span><span className={c('t')}>Understand<small>{t('p.s0')}</small></span><span className={c('d')}>{t('p.d0')}</span></li>
            <li><span className={c('n')}>02</span><span className={c('t')}>Plan<small>{t('p.s1')}</small></span><span className={c('d')}>{t('p.d1')}</span></li>
            <li><span className={c('n')}>03</span><span className={c('t')}>Design<small>{t('p.s2')}</small></span><span className={c('d')}>{t('p.d2')}</span></li>
            <li><span className={c('n')}>04</span><span className={c('t')}>Develop<small>{t('p.s3')}</small></span><span className={c('d')}>{t('p.d3')}</span></li>
            <li><span className={c('n')}>05</span><span className={c('t')}>Deploy<small>{t('p.s4')}</small></span><span className={c('d')}>{t('p.d4')}</span></li>
            <li><span className={c('n')}>06</span><span className={c('t')}>Stabilize<small>{t('p.s5')}</small></span><span className={c('d')}>{t('p.d5')}</span></li>
          </ol>
          <p className={c('proc__mdesc')} id="procMdesc"></p>
          <p className={c('proc__final')} id="procFinal">{t('proc.final')}</p>
        </div>
        <div className={c('org')} id="org" aria-hidden="true"></div>
      </div>
    </div>
  </div>
</section>
  );
}
