'use client';
/* WHAT WE BUILD — five areas, five different visual systems (see the components beside this file). */
import { useEffect } from 'react';
import { $$, cxm, onceInView, scramble } from '@/lib/core';
import { useLang } from '../LangProvider';
import ErpMock from './ErpMock';
import Platform from './Platform';
import WebDeck from './WebDeck';
import MobileApp from './MobileApp';
import Integration from './Integration';
import s from './Build.module.css';

export default function Build() {
  const c = cxm(s);
  const { t } = useLang();
  /* title letters rise in; English sub-lines decode once in view */
  useEffect(() => {
    const ti = document.getElementById('buildTitle')!;
    const chs = $$<HTMLElement>('[data-ch]', ti);
    chs.forEach(ch => { ch.style.opacity = '.12'; ch.style.transition = 'opacity .5s, transform 1s var(--e-out)'; ch.style.transform = 'translateY(.25em)'; });
    const offs = [onceInView(ti, () => chs.forEach((ch, i) => setTimeout(() => { ch.style.opacity = '1'; ch.style.transform = 'none'; }, 40 * i)))];
    $$<HTMLElement>('[data-scramble]').forEach(el => { const to = el.textContent || ''; el.textContent = ''; offs.push(onceInView(el, () => scramble(el, to, 1000))); });
    return () => offs.forEach(f => f());
  }, []);
  return (
    <section className={c('sec build')} id="business">
  <div className={c('wrap build__head')}>
    <div>
      <h2 className={c('build__title disp')} id="buildTitle">{'What we build'.split('').map((ch, i) => ch === ' ' ? ' ' : <span key={i} data-ch="" className={c('ch')}>{ch}</span>)}</h2>
    </div>
    <p className={c('build__lead')}>{t('build.lead')}</p>
  </div>

  
  <article className={c('biz biz--erp')} id="bizErp">
    <div className={c('wrap')}>
      <div className={c('biz__copy')}>
        <div className={c('biz__meta')}><b>01</b><span>ERP &amp; Business Management</span></div>
        <h3 className={c('biz__title')}>{t('erp.title')}</h3>
        <span className={c('biz__en')} data-scramble>One workspace for the whole company</span>
        <p className={c('biz__desc')}>{t('erp.desc')}</p>
        <ul className={c('biz__tags')} id="erpTags" />
      </div>
      <ErpMock />
    </div>
  </article>

  
  <article className={c('biz biz--plat')} id="bizPlat">
    <div className={c('wrap')}>
      <div className={c('biz__copy')}>
        <div className={c('biz__meta')}><b>02</b><span>Business Platform</span></div>
        <h3 className={c('biz__title')}>{t('plat.title')}</h3>
        <span className={c('biz__en')} data-scramble>Where every party works on the same ground</span>
      </div>
      <div className={c('biz__right')}>
        <p className={c('biz__desc')}>{t('plat.desc')}</p>
        <ul className={c('biz__tags')}><li>B2B Platform</li><li>Partner Platform</li><li>Industry Platform</li><li>Customer Platform</li></ul>
      </div>
      <Platform />
    </div>
  </article>

  
  <article className={c('biz biz--web')} id="bizWeb">
    <div className={c('wrap')}>
      <WebDeck />
      <div className={c('biz__copy')}>
        <div className={c('biz__meta')}><b>03</b><span>Web System</span></div>
        <h3 className={c('biz__title')}>{t('web.title')}</h3>
        <span className={c('biz__en')} data-scramble>Web applications that run the work</span>
        <p className={c('biz__desc')}>{t('web.desc')}</p>
        <ul className={c('biz__tags')}><li>Web Application</li><li>Admin System</li><li>Internal System</li><li>Customer-facing Service</li></ul>
      </div>
    </div>
  </article>

  
  <article className={c('biz biz--mob')} id="bizMob">
    <div className={c('wrap')}>
      <div className={c('biz__copy')}>
        <div className={c('biz__meta')}><b>04</b><span>Mobile Application</span></div>
        <h3 className={c('biz__title')}>{t('mob.title')}</h3>
        <span className={c('biz__en')} data-scramble>Work that moves with your people</span>
        <p className={c('biz__desc')}>{t('mob.desc')}</p>
        <ul className={c('biz__tags')}><li>{t('mob.t0')}</li><li>{t('mob.t1')}</li><li>{t('mob.t2')}</li><li>{t('mob.t3')}</li><li>{t('mob.t4')}</li></ul>
      </div>
      <MobileApp />
    </div>
  </article>

  
  <article className={c('biz biz--int')} id="bizInt">
    <div className={c('wrap')}>
      <div className={c('biz__copy')}>
        <div className={c('biz__meta')}><b>05</b><span>System Integration</span></div>
        <h3 className={c('biz__title')}>{t('int.title')}</h3>
        <span className={c('biz__en')} data-scramble>Existing systems in, unified data out</span>
      </div>
      <div className={c('biz__right')}>
        <p className={c('biz__desc')}>{t('int.desc')}</p>
        <ul className={c('biz__tags')}><li>API</li><li>Data</li><li>System Connection</li></ul>
      </div>
      <Integration />
    </div>
  </article>
</section>
  );
}
