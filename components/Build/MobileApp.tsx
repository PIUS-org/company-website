'use client';
import { useEffect } from 'react';
import { cxm } from '@/lib/core';
import { initMobile } from './mobile.controller';
import s from './MobileApp.module.css';

export default function MobileApp() {
  const c = cxm(s);
  useEffect(() => initMobile(document.body, s), []);
  return (
    <div className={c('mob')} id="mob" aria-hidden="true">
        <div className={c('phone phone--back')} id="phoneBack">
          <div className={c('phone__scr')}>
            <div className={c('route')}><svg viewBox="0 0 200 420" preserveAspectRatio="xMidYMid slice">
              <g className={c('blk')}><rect x="8" y="70" width="70" height="56" rx="4"/><rect x="92" y="70" width="100" height="56" rx="4"/><rect x="8" y="150" width="44" height="120" rx="4"/><rect x="66" y="150" width="126" height="54" rx="4"/><rect x="66" y="216" width="60" height="54" rx="4"/><rect x="140" y="216" width="52" height="120" rx="4"/><rect x="8" y="284" width="118" height="52" rx="4"/><rect x="8" y="350" width="184" height="60" rx="4"/></g>
              <path className={c('rt-base')} d="M30 390 C 40 320, 120 330, 110 260 S 40 200, 70 150 S 170 120, 160 50"/>
              <path className={c('rt')} id="routePath" d="M30 390 C 40 320, 120 330, 110 260 S 40 200, 70 150 S 170 120, 160 50"/>
              <circle cx="30" cy="390" r="5" fill="#05070a" stroke="#fff" strokeWidth="1.5"/>
              <g transform="translate(160 50)"><circle r="11" fill="rgba(191,214,255,.18)"/><circle r="5" fill="#bfd6ff"/></g>
              <g id="routeCar"><circle r="9" fill="rgba(255,255,255,.16)"/><circle r="4.5" fill="#fff"/></g>
            </svg></div>
            <div className={c('sheet')}><i className={c('sheet__grab')}></i><b id="shTitle"></b><span id="shEta"></span><div className={c('sheet__bar')}><i></i></div><small id="shStops"></small></div>
          </div>
        </div>
        <div className={c('phone')} id="phone">
          <div className={c('phone__scr')}>
            <div className={c('phone__isl')}></div>
            <div className={c('sbar')}><b>9:41</b><span><svg viewBox="0 0 18 10"><rect x="0" y="6" width="3" height="4" rx="1"/><rect x="5" y="4" width="3" height="6" rx="1"/><rect x="10" y="2" width="3" height="8" rx="1"/><rect x="15" y="0" width="3" height="10" rx="1"/></svg><svg viewBox="0 0 24 11"><rect x=".5" y=".5" width="20" height="10" rx="3" fill="none" stroke="currentColor"/><rect x="2" y="2" width="14" height="7" rx="1.5"/><rect x="21.5" y="3.5" width="1.5" height="4" rx=".7"/></svg></span></div>
            <div className={c('notif')} id="notif"><i className={c('notif__ic')}></i><div><b id="notifHd"></b><span id="notifTxt"></span></div></div>
            <div className={c('app')}>
              <div className={c('app__top')}><div><span className={c('app__date')} id="appDate"></span><b className={c('app__ttl')} id="appTtl"></b></div><i className={c('app__av')}>P</i></div>
              <div className={c('app__sum')}>
                <svg className={c('app__ring')} viewBox="0 0 44 44"><circle cx="22" cy="22" r="18"/><circle className={c('f')} id="appRing" cx="22" cy="22" r="18" transform="rotate(-90 22 22)"/></svg>
                <div><b id="appDone"></b><span id="appLeft"></span></div>
                <span className={c('app__pct')} id="appPct"></span>
              </div>
              <div className={c('app__seg')} id="appSeg"></div>
              <div className={c('app__list')}><div className={c('app__track')} id="appTrack"></div></div>
            </div>
            <nav className={c('app__tab')} id="appTab"></nav>
            <div className={c('phone__glare')}></div>
          </div>
        </div>
        <span className={c('mob__side')} style={{ 'left': 0, 'top': '22%' }}>Field</span>
        <span className={c('mob__side')} style={{ 'right': 0, 'bottom': '24%' }}>On the move</span>
      </div>
  );
}
