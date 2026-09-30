'use client';
import { useEffect } from 'react';
import { cxm } from '@/lib/core';
import { initErp } from './erp.controller';
import s from './ErpMock.module.css';

export default function ErpMock() {
  const c = cxm(s);
  useEffect(() => initErp(document.body, s), []);
  return (
    <div className={c('erp')} id="erp" aria-hidden="true">
        <div className={c('erp__win')} id="erpWin">
          <div className={c('erp__bar')}><i></i><i></i><i></i><span className={c('erp__crumb')}>Business Management <em>/</em> <b id="erpCrumb"></b></span><span className={c('erp__user')}><i></i>PIUS</span></div>
          <div className={c('erp__body')}>
            <ul className={c('erp__mods')} id="erpMods"></ul>
            <div className={c('erp__main')} id="erpMain"></div>
          </div>
        </div>
      </div>
  );
}
