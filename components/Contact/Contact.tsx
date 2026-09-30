'use client';
/* CONTACT — headline lights up; glass form with validation (UI + optional API endpoint). */
import { useEffect } from 'react';
import { cxm } from '@/lib/core';
import { useLang } from '../LangProvider';
import { initContact } from './contact.controller';
import s from './Contact.module.css';

export default function Contact() {
  const c = cxm(s);
  const { t } = useLang();
  useEffect(() => initContact(document.body, s), []);
  return (
    <section className={c('sec contact')} id="contact">
  <div className={c('contact__glass')} aria-hidden="true"><div className={c('gl gl--body')}></div><div className={c('gl gl--edge')}></div><div className={c('gl gl--sweep')}></div></div>
  <div className={c('wrap contact__grid')}>
    <div>
      <div className={c('sec-idx')}>Contact</div>
      <h2 className={c('contact__title disp')} id="contactTitle" style={{ 'marginTop': '22px' }}>Build Your Growth.</h2>
      <p className={c('contact__lead')}>{t('ct.lead')}</p>
      <p className={c('contact__note')}>{t('ct.note')}</p>
    </div>
    <form className={c('form')} id="form" noValidate>
      <div className={c('form__body')}>
        <div className={c('form__row')}>
          <div className={c('fld')}><input id="f-name" name="name" type="text" autoComplete="name" placeholder=" " required /><label htmlFor="f-name"><span>{t('f.name')}</span><i>*</i></label><span className={c('bar')}></span><span className={c('err')}>{t('e.name')}</span></div>
          <div className={c('fld')}><input id="f-co" name="company" type="text" autoComplete="organization" placeholder=" " /><label htmlFor="f-co"><span>{t('f.company')}</span></label><span className={c('bar')}></span><span className={c('err')}></span></div>
        </div>
        <div className={c('form__row')}>
          <div className={c('fld')}><input id="f-tel" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder=" " required /><label htmlFor="f-tel"><span>{t('f.phone')}</span><i>*</i></label><span className={c('bar')}></span><span className={c('err')}>{t('e.phone')}</span></div>
          <div className={c('fld')}><input id="f-mail" name="email" type="email" inputMode="email" autoComplete="email" placeholder=" " required /><label htmlFor="f-mail"><span>{t('f.email')}</span><i>*</i></label><span className={c('bar')}></span><span className={c('err')}>{t('e.email')}</span></div>
        </div>
        <div className={c('fld')}><textarea id="f-msg" name="message" rows={4} placeholder=" " required></textarea><label htmlFor="f-msg"><span>{t('f.msg')}</span><i>*</i></label><span className={c('bar')}></span><span className={c('err')}>{t('e.msg')}</span></div>
        <label className={c('agree')} id="agree"><input type="checkbox" name="agree" required /><span className={c('box')}><svg viewBox="0 0 12 12"><path d="M2 6.5l2.6 2.5L10 3.5"/></svg></span><span>{t('f.agree')}</span></label>
        <button className={c('btn btn--solid form__send')} type="submit"><span className={c('lbl')}>{t('f.send')}</span><span className={c('spin')} aria-hidden="true"></span></button>
      </div>
      <div className={c('form__done')} aria-live="polite">
        <div>
          <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30"/><path d="M20 33l8 8 16-17"/></svg>
          <b>{t('f.done')}</b>
          <p>{t('f.done2')}</p>
          <button type="button" id="formReset">{t('f.reset')}</button>
        </div>
      </div>
    </form>
  </div>
</section>
  );
}
